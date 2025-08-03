import Constant, { IConstant } from '../models/constant.model';
import { Types } from 'mongoose';
import { redisClient } from '../config/redis';
import { getIO } from '../socket';
import { logEvent } from './analytics.service';

const DEFAULT_CACHE_TTL = 3600; // 1 hour

interface ConstantData {
  project: string | Types.ObjectId;
  key: string;
  value: any;
  environment: 'development' | 'staging' | 'production';
  tags?: string[];
  createdBy: string | Types.ObjectId;
}

export const createConstant = async (data: ConstantData): Promise<IConstant> => {
  const constant = new Constant({
    ...data,
    updatedBy: data.createdBy, // Initially, createdBy and updatedBy are the same
  });
  await constant.save();

  const projectId = constant.project.toString();
  // Invalidate cache
  try {
    await redisClient.del(`constant:${id}`);
    console.log(`[Cache INVALIDATED] constant:${id}`);
  } catch (error) {
    console.error(`Redis DEL error: ${error}`);
  }

  // Emit WebSocket event
  const io = getIO();
  io.to(constant.project.toString()).emit('constant:updated', constant);

  // Log analytics event
  logEvent('constant:updated', {
    project: constant.project,
    user: new Types.ObjectId(userId),
    data: { constantId: constant._id, key: constant.key },
  });

  return constant;
};

export const getConstants = async (projectId: string, query: any): Promise<IConstant[]> => {
  const filter: any = { project: projectId };
  if (query.environment) {
    filter.environment = query.environment;
  }
  if (query.tags) {
    filter.tags = { $in: query.tags.split(',') };
  }
  return Constant.find(filter).populate('createdBy', 'name email').populate('updatedBy', 'name email');
};

export const getConstantById = async (id: string): Promise<IConstant | null> => {
  const cacheKey = `constant:${id}`;

  try {
    const cachedConstant = await redisClient.get(cacheKey);
    if (cachedConstant) {
      console.log(`[Cache HIT] ${cacheKey}`);
      return JSON.parse(cachedConstant);
    }
  } catch (error) {
    console.error(`Redis GET error: ${error}`);
  }

  console.log(`[Cache MISS] ${cacheKey}`);
  const constant = await Constant.findById(id).populate('history.updatedBy', 'name email');

  if (constant) {
    try {
      await redisClient.set(cacheKey, JSON.stringify(constant), {
        EX: DEFAULT_CACHE_TTL,
      });
      // Log analytics event only on cache miss to avoid spamming
      logEvent('constant:fetched', {
        project: constant.project,
        data: { constantId: id, source: 'database' },
      });
    } catch (error) {
      console.error(`Redis SET error: ${error}`);
    }
  }

  return constant;
};

export const updateConstant = async (id: string, updates: Partial<IConstant>, userId: string): Promise<IConstant | null> => {
  const constant = await Constant.findById(id);
  if (!constant) {
    return null;
  }

  // Add the current state to history before updating
  constant.history.push({
    value: constant.value,
    updatedBy: constant.updatedBy,
    updatedAt: constant.updatedAt,
  });

  // Apply updates
  constant.value = updates.value ?? constant.value;
  constant.tags = updates.tags ?? constant.tags;
  constant.updatedBy = new Types.ObjectId(userId);

  await constant.save();

  // Emit WebSocket event
  const io = getIO();
  io.to(constant.project.toString()).emit('constant:created', constant);

  // Log analytics event
  logEvent('constant:created', {
    project: constant.project,
    user: constant.createdBy,
    data: { constantId: constant._id, key: constant.key },
  });

  return constant;
};

export const deleteConstant = async (id:string): Promise<IConstant | null> => {
    const constant = await Constant.findById(id);
    if (!constant) {
        return null;
    }
    // Instead of findByIdAndDelete, we use this to trigger middleware if any
    await constant.deleteOne();

    // Invalidate cache
    try {
        await redisClient.del(`constant:${id}`);
        console.log(`[Cache INVALIDATED] constant:${id}`);
    } catch (error) {
        console.error(`Redis DEL error: ${error}`);
    }

  // Emit WebSocket event
  const io = getIO();
  io.to(projectId).emit('constant:deleted', { id });

  // Log analytics event
  // We need to know who deleted it. The user should be passed into this function.
  // For now, I'll assume we don't have it, but this should be improved.
  logEvent('constant:deleted', {
    project: projectId,
    data: { constantId: id, key: constant.key },
  });

    return constant;
};

export const getConstantHistory = async (id: string): Promise<IConstant['history'] | null> => {
    const constant = await Constant.findById(id).select('history').populate('history.updatedBy', 'name email');
    return constant ? constant.history : null;
};

export const rollbackConstant = async (id: string, versionIndex: number, userId: string): Promise<IConstant | null> => {
    const constant = await Constant.findById(id);
    if (!constant || !constant.history[versionIndex]) {
        return null;
    }

    const versionToRestore = constant.history[versionIndex];

    // Add current value to history before rollback
    constant.history.push({
        value: constant.value,
        updatedBy: constant.updatedBy,
        updatedAt: constant.updatedAt,
    });

    // Restore old values
    constant.value = versionToRestore.value;
    constant.updatedBy = new Types.ObjectId(userId);

    // Remove the restored version from history to avoid duplicates, or keep it for audit.
    // For now, we'll keep it.

    await constant.save();

    // Invalidate cache
    try {
        await redisClient.del(`constant:${id}`);
        console.log(`[Cache INVALIDATED] constant:${id}`);
    } catch (error) {
        console.error(`Redis DEL error: ${error}`);
    }

  // Emit WebSocket event
  const io = getIO();
  io.to(constant.project.toString()).emit('constant:updated', constant);

  // Log analytics event
  logEvent('constant:rolled_back', {
    project: constant.project,
    user: new Types.ObjectId(userId),
    data: { constantId: constant._id, key: constant.key, version: versionIndex },
  });

    return constant;
};
