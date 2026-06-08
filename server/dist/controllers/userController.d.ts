import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const listUsers: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getUser: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const createUser: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateUser: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const toggleUserActive: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteUser: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
