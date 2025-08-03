import User, { IUser } from '../models/user.model';
import { Error } from 'mongoose';

export const registerUser = async (userData: Pick<IUser, 'name' | 'email' | 'password'>): Promise<Omit<IUser, 'password'>> => {
  const { name, email, password } = userData;

  if (!password) {
    throw new Error('Password is required.');
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('User with this email already exists.');
  }

  const user = new User({ name, email, password });
  await user.save();

  // Don't return the password
  const userObject = user.toObject();
  delete userObject.password;
  return userObject;
};

import { generateAccessToken, generateRefreshToken } from '../utils/jwt';

export const loginUser = async (credentials: Pick<IUser, 'email' | 'password'>) => {
  const { email, password } = credentials;

  if (!password) {
    throw new Error('Password is required.');
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new Error('Invalid credentials.');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error('Invalid credentials.');
  }

  const tokenPayload = { userId: user._id, role: user.role };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  const userObject = user.toObject();
  delete userObject.password;

  return { user: userObject, accessToken, refreshToken };
};
