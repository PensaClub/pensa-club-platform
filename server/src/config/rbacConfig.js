// src/config/rbacConfig.js

// Групи роли за лесна поддръжка
const ROLES = {
    // Публичен достъп с limited (Pensa Club ресурси)
    PUBLIC_WITH_LIMITED: ['admin', 'moderator', 'user', 'guest', 'limited', 'student', 'mentor'],
    // Публичен достъп без limited (Academy ресурси)
    PUBLIC: ['admin', 'moderator', 'user', 'guest', 'student', 'mentor'],
    // Автентикирани потребители
    AUTHENTICATED: ['admin', 'moderator', 'user', 'student', 'mentor'],
    // Само staff
    STAFF: ['admin', 'moderator'],
    // Academy роли
    ACADEMY: ['admin', 'mentor', 'student'],
    // Academy creators
    ACADEMY_CREATORS: ['admin', 'mentor'],
};

const permissions = {
    ad: {
        create: ['admin', 'moderator', 'user'],
        read: ROLES.PUBLIC_WITH_LIMITED,
        update: ['admin', 'moderator', 'user'],
        delete: ['admin', 'moderator', 'user'],
        approve: ROLES.STAFF,
    },
    article: {
        create: ROLES.STAFF,
        read: ROLES.PUBLIC_WITH_LIMITED,
        update: ROLES.STAFF,
        delete: ROLES.STAFF,
    },
    initiative: {
        create: ROLES.STAFF,
        read: ROLES.PUBLIC_WITH_LIMITED,
        update: ROLES.STAFF,
        delete: ROLES.STAFF,
        draft: {
            read: ROLES.STAFF,
            create: ROLES.STAFF,
            update: ROLES.STAFF,
            delete: ROLES.STAFF,
        },
    },
    projects: {
        create: ROLES.STAFF,
        read: ROLES.PUBLIC_WITH_LIMITED,
        update: ROLES.STAFF,
        delete: ROLES.STAFF,
        draft: {
            read: ROLES.STAFF,
            create: ROLES.STAFF,
            update: ROLES.STAFF,
            delete: ROLES.STAFF,
        },
    },
    publications: {
        create: ROLES.STAFF,
        read: ROLES.PUBLIC_WITH_LIMITED,
        update: ROLES.STAFF,
        delete: ROLES.STAFF,
        draft: {
            read: ROLES.STAFF,
            create: ROLES.STAFF,
            update: ROLES.STAFF,
            delete: ROLES.STAFF,
        },
    },
    stories: {
        create: ROLES.STAFF,
        read: ROLES.PUBLIC_WITH_LIMITED,
        update: ROLES.STAFF,
        delete: ROLES.STAFF,
        draft: {
            read: ROLES.STAFF,
            create: ROLES.STAFF,
            update: ROLES.STAFF,
            delete: ROLES.STAFF,
        },
    },
    comments: {
        create: ['admin', 'moderator', 'user'],
        read: ROLES.PUBLIC_WITH_LIMITED,
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
        read: ROLES.STAFF,
    },
    newsletter: {
        read: ROLES.STAFF,
        create: ROLES.STAFF,
        update: ROLES.STAFF,
        delete: ROLES.STAFF,
        send: ROLES.STAFF,
    },
    suggestion: {
        read: ROLES.STAFF,
        delete: ROLES.STAFF,
        approve: ROLES.STAFF,
        comment: ROLES.STAFF,
    },
    userDetails: {
        read: ['admin', 'moderator', 'user', 'limited'],
    },
    application: {
        create: ['admin', 'moderator', 'user'],
        read: ROLES.PUBLIC_WITH_LIMITED,
        update: ['admin', 'moderator', 'user'],
        delete: ['admin', 'moderator', 'user'],
        sendEmails: ROLES.STAFF,
    },
    club: {
        create: ['admin', 'moderator', 'user'],
        read: ROLES.PUBLIC_WITH_LIMITED,
        update: ['admin', 'moderator', 'user'],
        delete: ['admin', 'moderator', 'user'],
        approve: ROLES.STAFF,
        verify: ROLES.STAFF,
        transferOwnership: ROLES.STAFF,
        bulkUpdate: ROLES.STAFF,
        bulkDelete: ROLES.STAFF,
        bulkApprove: ROLES.STAFF,
        draft: {
            read: ['admin', 'moderator', 'user'],
            create: ['admin', 'moderator', 'user'],
            update: ['admin', 'moderator', 'user'],
            delete: ['admin', 'moderator', 'user'],
        },
        mailing: {
            sendEmails: ['admin', 'moderator', 'user', 'student', 'mentor'],
        },
    },
    mentorApplication: {
        create: ['user', 'admin', 'moderator'],
        read: ['admin'],
        update: ['admin'],
        delete: ['admin'],
        approve: ['admin'],
        reject: ['admin'],
    },
    mentor: {
        create: ['admin'],
        read: ROLES.PUBLIC,
        readOwn: ['admin', 'mentor'],
        update: ['admin'],
        updateOwn: ['admin', 'mentor'],
        delete: ['admin'],
    },
    statistics: {
        read: ['admin', 'mentor'],
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
        read: ROLES.STAFF,
        update: ROLES.STAFF,
        delete: ROLES.STAFF,
    },
    review: {
        read: ROLES.STAFF,
        approve: ROLES.STAFF,
        reject: ROLES.STAFF,
        delete: ['admin'],
    },
    student: {
        create: ['admin'],
        read: ['admin'],
        readOwn: ['admin', 'mentor'],
        update: ['admin'],
        updateOwn: ['admin', 'mentor'],
        delete: ['admin'],
        assignMentor: ['admin'],
        sendEmail: ['admin'],
    },
    studentApplication: {
        create: ['user', 'student', 'admin'],
        readOwn: ['mentor', 'admin'],
        readAll: ['admin'],
        update: ['mentor', 'admin'],
        delete: ['admin'],
    },
    admin: {
        read: ROLES.STAFF,
        update: ['admin'],
        delete: ['admin'],
    },

    // Academy permissions
    course: {
        create: ROLES.ACADEMY_CREATORS,
        read: ROLES.PUBLIC,
        update: ROLES.ACADEMY_CREATORS,
        delete: ['admin'],
        publish: ROLES.ACADEMY_CREATORS,
    },
    lesson: {
        create: ROLES.ACADEMY_CREATORS,
        read: ROLES.ACADEMY,
        update: ROLES.ACADEMY_CREATORS,
        delete: ROLES.ACADEMY_CREATORS,
    },
    lecture: {
        create: ROLES.ACADEMY_CREATORS,
        read: ROLES.PUBLIC,
        update: ROLES.ACADEMY_CREATORS,
        delete: ['admin'],
        publish: ROLES.ACADEMY_CREATORS,
        cancel: ROLES.ACADEMY_CREATORS,
    },
    seminar: {
        create: ROLES.ACADEMY_CREATORS,
        read: ROLES.PUBLIC,
        update: ROLES.ACADEMY_CREATORS,
        delete: ['admin'],
        publish: ROLES.ACADEMY_CREATORS,
        cancel: ROLES.ACADEMY_CREATORS,
    },
    enrollment: {
        create: ROLES.PUBLIC,
        read: ROLES.ACADEMY_CREATORS,
        readOwn: ROLES.PUBLIC,
        update: ROLES.ACADEMY_CREATORS,
        delete: ['admin'],
    },
    test: {
        create: ROLES.ACADEMY_CREATORS,
        read: ROLES.ACADEMY_CREATORS,
        readOwn: ROLES.ACADEMY,
        update: ROLES.ACADEMY_CREATORS,
        delete: ROLES.ACADEMY_CREATORS,
        attempt: ['student'],
    },
    certificate: {
        create: ['admin'],
        read: ROLES.ACADEMY_CREATORS,
        readOwn: ROLES.ACADEMY,
        verify: ROLES.PUBLIC,
        revoke: ['admin'],
    },
    material: {
        create: ROLES.ACADEMY_CREATORS,
        read: ROLES.ACADEMY,
        update: ROLES.ACADEMY_CREATORS,
        delete: ROLES.ACADEMY_CREATORS,
        download: ROLES.ACADEMY,
    },
    // Fact-check permissions
    factCheckModule: {
        read: ROLES.PUBLIC,
        create: ROLES.STAFF,
        update: ROLES.STAFF,
        delete: ROLES.STAFF,
        publish: ROLES.STAFF,
    },
    factCheckSignal: {
        create: ROLES.PUBLIC,
        read: ROLES.STAFF,
        update: ROLES.STAFF,
        delete: ROLES.STAFF,
    },
    // ReAction permissions
    reactionRequest: {
        create: ['admin', 'mentor', 'user'],
        read: ['admin'],
        update: ['admin'],
        delete: ['admin'],
        export: ['admin'],
    },
    reactionMentor: {
        readOwn: ['admin', 'mentor'],
        updateOwn: ['admin', 'mentor'],
    },
    reactionTestimonial: {
        read: ['admin', 'mentor', 'user'],
        create: ['admin'],
        update: ['admin'],
        delete: ['admin'],
    },
    siteSettings: {
        read: ROLES.PUBLIC_WITH_LIMITED,
        update: ['admin'],
    },
    usefulLink: {
        create: ROLES.STAFF,
        read: ROLES.PUBLIC_WITH_LIMITED,
        readAll: ROLES.STAFF,
        update: ROLES.STAFF,
        delete: ['admin'],
    },
    sharedLink: {
        create: ['admin'],
        readAll: ['admin'],
        delete: ['admin'],
    },
};

module.exports = permissions;