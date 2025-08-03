import { Request, Response } from 'express';
import * as ConstantService from '../services/constants.service';

// We assume req.user is populated by the 'protect' middleware
// We assume req.params.projectId is available from the router

export const createConstant = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { key, value, environment, tags } = req.body;
    if (!key || value === undefined || !environment) {
      return res.status(400).json({ message: 'Key, value, and environment are required.' });
    }
    const constant = await ConstantService.createConstant({
      project: projectId,
      key,
      value,
      environment,
      tags,
      createdBy: req.user!._id,
    });
    res.status(201).json(constant);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getConstants = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const constants = await ConstantService.getConstants(projectId, req.query);
    res.status(200).json(constants);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getConstantById = async (req: Request, res: Response) => {
  try {
    const constant = await ConstantService.getConstantById(req.params.constantId);
    if (!constant) {
      return res.status(404).json({ message: 'Constant not found' });
    }
    res.status(200).json(constant);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateConstant = async (req: Request, res: Response) => {
  try {
    const constant = await ConstantService.updateConstant(req.params.constantId, req.body, req.user!._id);
    if (!constant) {
      return res.status(404).json({ message: 'Constant not found' });
    }
    res.status(200).json(constant);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteConstant = async (req: Request, res: Response) => {
  try {
    const constant = await ConstantService.deleteConstant(req.params.constantId);
    if (!constant) {
      return res.status(404).json({ message: 'Constant not found' });
    }
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getConstantHistory = async (req: Request, res: Response) => {
    try {
        const history = await ConstantService.getConstantHistory(req.params.constantId);
        if (history === null) {
            return res.status(404).json({ message: 'Constant not found' });
        }
        res.status(200).json(history);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const rollbackConstant = async (req: Request, res: Response) => {
    try {
        const { versionIndex } = req.body;
        if (versionIndex === undefined) {
            return res.status(400).json({ message: 'Version index is required.' });
        }
        const constant = await ConstantService.rollbackConstant(req.params.constantId, versionIndex, req.user!._id);
        if (!constant) {
            return res.status(404).json({ message: 'Constant or version not found' });
        }
        res.status(200).json(constant);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};
