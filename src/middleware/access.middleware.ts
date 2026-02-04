import { Request, Response, NextFunction } from 'express';
import { accessChecker } from '../services/access.service';
import { UserContext, ServiceAccess } from '../types/access';

// Extending Express Request to include serviceAccess
declare global {
    namespace Express {
        interface Request {
            serviceAccess?: ServiceAccess;
        }
    }
}

export const accessMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            return next();
        }

        const user = req.user as any;

        const userContext: UserContext = {
            id: user.id,
            age: user.age,
            role: user.role,
            group: user.group,
            isOnboarded: user.isOnboarded,
            preferences: user.preferences,
            subscriptionStatus: user.subscriptionStatus,
            certificationStatus: user.certificationStatus
        };

        const access = accessChecker.getAccessForUser(userContext);
        req.serviceAccess = access;

        next();
    } catch (error) {
        console.error("Error in accessMiddleware:", error);
        next(error);
    }
};

// Helper to enforce specific access
export const requireAccess = (permission: keyof ServiceAccess) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.serviceAccess || !req.serviceAccess[permission]) {
            return res.status(403).json({ message: "Access denied: Missing required permission." });
        }
        next();
    };
};

// Helper to enforce group restrictions
export const requireGroup = (...allowedGroups: Array<'KIDS' | 'TEENS' | 'COLLEGE_STUDENTS' | 'PROFESSIONALS' | 'SENIORS'>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = req.user as any;

        if (!user || !user.group) {
            return res.status(403).json({
                status: false,
                message: "Access denied: User group not found."
            });
        }

        if (!allowedGroups.includes(user.group)) {
            return res.status(403).json({
                status: false,
                message: `Access denied: This endpoint is only available for ${allowedGroups.join(', ')} users.`
            });
        }

        next();
    };
};
