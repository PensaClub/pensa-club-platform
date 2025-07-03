const { comment, user_account, user_details } = require('../sequelize/models');

const getCommentConfig = (commentableId, commentLinkConnection) => ({
    where: {
        commentable_id: commentableId,
        comment_link_connection: commentLinkConnection,
    },
    attributes: ['id', 'content', 'userId', 'createdAt', 'updatedAt', 'likes', 'parentId'],
    include: [
        {
            model: user_account,
            as: 'user',
            attributes: ['id', 'email'],
            include: [
                {
                    model: user_details,
                    as: 'details',
                    attributes: ['username', 'firstName', 'lastName', 'imageURL'],
                },
            ],
        },
        {
            model: comment,
            as: 'replies',
            attributes: ['id', 'content', 'userId', 'createdAt', 'updatedAt', 'likes', 'parentId'],
            include: [
                {
                    model: user_account,
                    as: 'user',
                    attributes: ['id', 'email'],
                    include: [
                        {
                            model: user_details,
                            as: 'details',
                            attributes: ['username', 'firstName', 'lastName', 'imageURL'],
                        },
                    ],
                },
            ],
        },
    ],
});

const transformComment = (comment) => {
    const user = comment.user;
    const userDetails = user?.details;

    const transformedComment = {
        id: comment.id,
        userId: user.id,
        userEmail: user.email,
        userName: `${userDetails.firstName} ${userDetails.lastName}`,
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
