import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export const validate = (req: Request, res: Response, _next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({
            status: 400,
            message: "Validation Error",
            code: "VALIDATION_ERROR",
            details: "USER",
            errors: errors.array()
        });
        return;
    }
    _next();
};
