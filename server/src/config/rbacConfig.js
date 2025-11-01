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
        draft: {
            read: ['admin', 'moderator'],
            create: ['admin', 'moderator'],
            update: ['admin', 'moderator'],
            delete: ['admin', 'moderator'],
        },
    },
    publications: {
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
    stories: {
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
    application: {
        create: ['admin', 'moderator', 'user'],
        read: ['admin', 'moderator', 'user', 'guest', 'limited'],
        update: ['admin', 'moderator', 'user'],
        delete: ['admin', 'moderator', 'user'],
        sendEmails: ['admin', 'moderator'],
    },
    club: {
        create: ['admin', 'moderator', 'user'],
        read: ['admin', 'moderator', 'user', 'guest', 'limited'],
        update: ['admin', 'moderator', 'user'],
        delete: ['admin', 'moderator', 'user'],
        approve: ['admin', 'moderator'],
        verify: ['admin', 'moderator'],
        transferOwnership: ['admin', 'moderator'],
        bulkUpdate: ['admin', 'moderator'],
        bulkDelete: ['admin', 'moderator'],
        bulkApprove: ['admin', 'moderator'],
        draft: {
            read: ['admin', 'moderator', 'user'],
            create: ['admin', 'moderator', 'user'],
            update: ['admin', 'moderator', 'user'],
            delete: ['admin', 'moderator', 'user'],
        },
        mailing: {
            sendEmails: ['admin', 'moderator'],
        },
    },
    mentorApplication: {
        create: ['user', 'admin', 'moderator'], 
        read: ['admin'],             
        update: ['admin'],           
        delete: ['admin'],  
        approve: ['admin'],
        reject: ['admin', ], 
    },

    mentor: {
        create: ['admin', ],           
        read: ['admin', 'moderator', 'user', 'guest'], 
        update: ['admin', ],
        delete: ['admin'],
    },
      notification: {
    create: ['admin', 'moderator','user'],
    read: ['admin', 'moderator'],
    update: ['admin', 'moderator'],
    delete: ['admin', 'moderator'],
  },
};

module.exports = permissions;
