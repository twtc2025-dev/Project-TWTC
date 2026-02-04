import { Request, Response, NextFunction } from "express";

export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }
  next();
}

export function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }

  const user = req.user as any;
  if (!user || user.role !== "admin") {
    return res.status(403).json({ success: false, error: "Forbidden: Admin access required" });
  }

  next();
}
