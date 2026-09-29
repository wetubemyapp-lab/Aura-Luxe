import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Permission, PlatformRole } from '../../src/types/index.ts';
import { hasPermission } from '../utils/permissions.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'aura-luxe-secret-key-2026-production';

export type PlatformRole = 'customer' | 'owner' | 'admin' | 'branch_manager' | 'staff' | 'receptionist';

export interface AuthUserPayload {
  id: number;
  email: string;
  name: string;
  role: PlatformRole;
  business_id?: number;
  branch_id?: number;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUserPayload;
}

export function generateToken(payload: AuthUserPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): AuthUserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUserPayload;
  } catch (err) {
    return null;
  }
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  let token = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired session' });
  }

  req.user = decoded;
  next();
}

export function requireRoles(roles: PlatformRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    requireAuth(req, res, () => {
      const userRole = req.user?.role;
      // 'owner' or 'admin' has super-admin permissions across all modules
      if (userRole === 'owner' || userRole === 'admin' || (userRole && roles.includes(userRole))) {
        return next();
      }
      return res.status(403).json({ error: `Forbidden: Requires one of [${roles.join(', ')}] permissions` });
    });
  };
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  requireRoles(['owner', 'admin'])(req, res, next);
}

export function requireBusinessStaff(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  requireRoles(['owner', 'admin', 'branch_manager', 'receptionist', 'staff'])(req, res, next);
}

export function authorize(permission: Permission) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    requireAuth(req, res, () => {
      const userRole = req.user?.role;
      if (userRole && hasPermission(userRole, permission)) {
        return next();
      }
      return res.status(403).json({ error: `Forbidden: Requires permission ${permission}` });
    });
  };
}
