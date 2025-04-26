const permissions = require('../config/rbacConfig');

// Check if the user has the required permission for a route
exports.checkPermission = (resource, action) => {
    return (req, res, next) => {
        const userRole = req.user ? req.user.role : 'guest';

        if (permissions[resource]?.[action]?.includes(userRole)) {
            return next();
        }

        return res.status(403).json({ error: 'Access denied' });
    };
};
