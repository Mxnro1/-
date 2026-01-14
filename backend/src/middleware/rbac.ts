import { Request, Response, NextFunction } from "express";
import { t } from "../config/i18n";

type CompanyRole = "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";

export function requireCompanyRole(allowed: CompanyRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.authUser;
    if (!user || !user.role || !user.companyId) {
      return res.status(403).json({ error: t().errors.forbidden });
    }

    if (!allowed.includes(user.role)) {
      return res.status(403).json({ error: t().errors.forbidden });
    }

    return next();
  };
}

