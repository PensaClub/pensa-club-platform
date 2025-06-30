const permissions = require('../config/rbacConfig');

// Check if the user has the required permission for a route
exports.checkPermission = (resource, action, subAction = null) => {
    return (req, res, next) => {
        const userRole = req.user ? req.user.role : 'guest';

        // Handle nested permissions (e.g., initiative.draft.read)
        if (subAction) {
            if (permissions[resource]?.[action]?.[subAction]?.includes(userRole)) {
                return next();
            }
        } else {
            // Handle regular permissions (e.g., article.read)
            if (permissions[resource]?.[action]?.includes(userRole)) {
                return next();
            }
        }

        return res.status(403).json({ error: 'Access denied' });
    };
};
