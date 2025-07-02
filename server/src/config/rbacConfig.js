const permissions = {
    ad: {
        create: ['admin', 'moderator', 'user'],
        read: ['admin', 'moderator', 'user', 'guest', 'limited'],
        update: ['admin', 'moderator', 'user'],
        delete: ['admin', 'moderator', 'user'],
        approve: ['admin', 'moderator'],
    },
    article: {
        create: ['admin', 'moderator'],
        read: ['admin', 'moderator', 'user', 'guest', 'limited'],
        update: ['admin', 'moderator'],
        delete: ['admin', 'moderator'],
    },
    initiative: {
        create: ['admin', 'moderator'],
        read: ['admin', 'moderator', 'user', 'guest', 'limited'],
        update: ['admin', 'moderator'],
        delete: ['admin', 'moderator'],
        draft: {
            read: ['admin', 'moderator'],
            create: ['admin', 'moderator'],
            update: ['admin', 'moderator'],
            delete: ['admin', 'moderator'],
        },
    },
    projects: {
        create: ['admin', 'moderator'],
        read: ['admin', 'moderator', 'user', 'guest', 'limited'],
        update: ['admin', 'moderator'],
        delete: ['admin', 'moderator'],
    },
    // For initiatives, projects, etc
    comments: {
        create: ['admin', 'moderator', 'user'],
        read: ['admin', 'moderator', 'user', 'guest', 'limited'],
        update: ['admin', 'moderator', 'user'],
        delete: ['admin', 'moderator', 'user'],
        like: ['admin', 'moderator', 'user'],
    },
    comment: {
        delete: ['admin'],
    },
    account: {
        update: ['admin'],
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
        read: ['admin', 'moderator', 'user', 'limited'],
    },
};

module.exports = permissions;
