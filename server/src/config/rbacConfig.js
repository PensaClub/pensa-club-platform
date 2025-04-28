const permissions = {
    ad: {
        create: ['admin', 'moderator', 'user'],
        read: ['admin', 'moderator', 'user', 'guest'],
        update: ['admin', 'moderator', 'user'],
        delete: ['admin', 'moderator', 'user'],
        approve: ['admin', 'moderator'],
    },
    article: {
        create: ['admin', 'moderator'],
        read: ['admin', 'moderator', 'user', 'guest'],
        update: ['admin', 'moderator'],
        delete: ['admin', 'moderator'],
    },
    account: {
        update: ['admin'],
        delete: ['admin'],
    },
    comment: {
        delete: ['admin'],
    },
    subscription: {
        read: ['admin', 'moderator'],
    },
    suggestion: {
        read: ['admin', 'moderator'],
        delete: ['admin', 'moderator'],
        approve: ['admin', 'moderator'],
        comment: ['admin', 'moderator'],
    },
    userDetails: {
        read: ['admin', 'moderator', 'user'],
    },
};

module.exports = permissions;
