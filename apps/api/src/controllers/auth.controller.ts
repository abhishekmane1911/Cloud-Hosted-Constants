import { Request, Response } from 'express';
import * as AuthService from '../services/auth.service';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }
    const user = await AuthService.registerUser({ name, email, password });
    return res.status(201).json(user);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }
    const { user, accessToken, refreshToken } = await AuthService.loginUser({ email, password });

    return res.status(200).json({ user, accessToken, refreshToken });
  } catch (error: any) {
    return res.status(401).json({ message: error.message });
  }
};

export const getMe = async (req: Request, res: Response) => {
  // The user object is attached to the request by the `protect` middleware
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized' });
  }
  res.status(200).json(req.user);
};
