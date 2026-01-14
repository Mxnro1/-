import { Request, Response, NextFunction } from "express";
import { verifyJwt } from "../utils/jwt";
import { t } from "../config/i18n";
import { prisma } from "../lib/prisma";

export type AuthUser = {
  id: string;
  companyId: string | null;
  role: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER" | null;
};

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface Request {
      authUser?: AuthUser;
    }
  }
}

export async function attachUserMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return next();
  }

  const [, token] = authHeader.split(" ");
  if (!token) {
    return next();
  }

  const payload = verifyJwt(token);
  if (!payload) {
    return res.status(401).json({ error: t().errors.unauthorized });
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  if (!user) {
    return res.status(401).json({ error: t().errors.unauthorized });
  }

  let companyId: string | null = null;
  let role: AuthUser["role"] = null;

  if (payload.companyId) {
    const membership = await prisma.companyMember.findFirst({
      where: {
        companyId: payload.companyId,
        userId: user.id,
      },
    });

    if (membership) {
      companyId = membership.companyId;
      role = membership.role;
    }
  }

  req.authUser = {
    id: user.id,
    companyId,
    role,
  };

  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.authUser) {
    return res.status(401).json({ error: t().errors.unauthorized });
  }
  return next();
}

