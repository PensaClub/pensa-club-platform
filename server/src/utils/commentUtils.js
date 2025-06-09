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

module.exports = transformComment;
