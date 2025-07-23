const { comment, user_account, user_details } = require('../sequelize/models');

const userDetailsAttributes = ['username', 'firstName', 'lastName', 'imageURL'];
const userAccountAttributes = ['id', 'email'];
const commentAttributes = ['id', 'content', 'userId', 'createdAt', 'updatedAt', 'likes', 'parentId'];

const replyInclude = [
    {
        model: user_account,
        as: 'user',
        attributes: userAccountAttributes,
        include: [
            {
                model: user_details,
                as: 'details',
                attributes: userDetailsAttributes,
            },
        ],
    },
];

const mainInclude = [
    {
        model: user_account,
        as: 'user',
        attributes: userAccountAttributes,
        include: [
            {
                model: user_details,
                as: 'details',
                attributes: userDetailsAttributes,
            },
        ],
    },
    {
        model: comment,
        as: 'replies',
        attributes: commentAttributes,
        include: replyInclude,
    },
];

const getCommentConfig = (commentableId, commentLinkConnection) => {
    if (commentableId && commentLinkConnection) {
        return {
            where: {
                commentable_id: commentableId,
                comment_link_connection: commentLinkConnection,
            },
            attributes: commentAttributes,
            include: mainInclude,
        };
    }

    return {
        attributes: commentAttributes,
        include: mainInclude,
    };
};

const transformComment = (comment) => {
    const user = comment.user;
    const userDetails = user?.details;

    const getEmailName = (email) => (email ? email.split('@')[0] : '');

    const userName = userDetails ? `${userDetails.firstName || ''} ${userDetails.lastName || ''}`.trim() || getEmailName(user.email) : getEmailName(user.email);

    const transformedComment = {
        id: comment.id,
        userId: user.id,
        userEmail: user.email,
        userName: userName,
        userAvatar: userDetails?.imageURL || null,
        content: comment.content,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        likes: comment.likes,
        likesCount: comment.likes.length,
        parentId: comment.parentId,
        replies: comment.replies ? comment.replies.map((reply) => transformComment(reply)) : [],
    };

    return transformedComment;
};

module.exports = { transformComment, getCommentConfig };
