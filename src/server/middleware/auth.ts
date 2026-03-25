import { Request, Response, NextFunction } from "express";

export function apiKeyAuth(req: Request, res: Response, next: NextFunction) {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return next();
  }

  const provided = req.headers["x-api-key"];
  if (provided !== apiKey) {
    res.status(401).json({ error: "Invalid or missing API key" });
    return;
  }

  next();
}
