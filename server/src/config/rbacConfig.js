// src/config/rbacConfig.js

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
            sendEmails: ['admin', 'moderator', 'user'],
        },
    },
    mentorApplication: {
        create: ['user', 'admin', 'moderator'],
        read: ['admin'],
        update: ['admin'],
        delete: ['admin'],
        approve: ['admin'],
        reject: ['admin',],
    },

    mentor: {
        create: ['admin',],
        read: ['admin', 'moderator', 'user', 'guest'],
        readOwn: ['admin', 'mentor'],
        update: ['admin',],
        updateOwn: ['admin', 'mentor'],
        delete: ['admin'],
    },
    statistics: {
        read: ['admin'],
        readOwn: ['admin', 'mentor'],
    },
    meeting: {
        create: ['admin', 'mentor'],
        read: ['admin', 'mentor'],
        readOwn: ['admin', 'mentor'],
        update: ['admin', 'mentor'],
        delete: ['admin', 'mentor'],
    },
    notification: {
        create: ['admin', 'moderator', 'user'],
        read: ['admin', 'moderator'],
        update: ['admin', 'moderator'],
        delete: ['admin', 'moderator'],
    },
    review: {
        read: ['admin', 'moderator'],
        approve: ['admin', 'moderator'],
        reject: ['admin', 'moderator'],
        delete: ['admin']
    },

 student: {
    create: ['admin'],
    read: ['admin'],                      // /admin/students (всички)
    readOwn: ['admin', 'mentor'],         // /mentors/students (своите)
    update: ['admin'],
    updateOwn: ['admin', 'mentor'],       // Редактиране на своите
    delete: ['admin'],
    assignMentor: ['admin'],
    sendEmail: ['admin'],
},

statistics: {
    read: ['admin','mentor'],                      // Admin статистики
    readOwn: ['admin', 'mentor'],         // Mentor статистики
},

studentApplication: {
    create: ['user', 'student','admin'],
    readOwn: ['mentor', 'admin'],         // Mentor: своите заявки
    readAll: ['admin'],                   // Admin: всички заявки
    update: ['mentor', 'admin'],
    delete: ['admin'],
},

    studentApplication: {
        create: ['user', 'student'],
        readOwn: ['mentor', 'admin'],
        readAll: ['admin'],
        update: ['mentor', 'admin'],
        delete: ['admin'],
    },
    admin: {
        read: ['admin', 'moderator'],
        update: ['admin'],
        delete: ['admin'],
    },

};

module.exports = permissions;
