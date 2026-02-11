import { accessChecker } from "../services/access.service.js";
export const accessMiddleware = (req, res, next) => {
    try {
        if (!req.user) {
            return next();
        }
        const user = req.user;
        const userContext = {
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
    }
    catch (error) {
        console.error("Error in accessMiddleware:", error);
        next(error);
    }
};
// Helper to enforce specific access
export const requireAccess = (permission) => {
    return (req, res, next) => {
        if (!req.serviceAccess || !req.serviceAccess[permission]) {
            return res.status(403).json({ message: "Access denied: Missing required permission." });
        }
        next();
    };
};
// Helper to enforce group restrictions
export const requireGroup = (...allowedGroups) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user || !user.group) {
            return res.status(403).json({
                status: false,
                message: "Access denied: User group not found."
            });
        }
        if (!allowedGroups.includes(user.group)) {
            return res.status(403).json({
                status: false,
                message: `Access denied: This endpoint is only available for ${allowedGroups.join(", ")} users.`
            });
        }
        next();
    };
};
