const transformComment = (comment) => {
    const user = comment.user;
    const userDetails = user?.details;

    // Transform likes from user IDs to emails
    const likes = comment.likes.map((userId) => {
        // In a real app, you'd need to fetch these emails from the database
        // For now, we'll just use the current user's email as an example
        return user.email;
    });

    // Transform the comment
    const transformedComment = {
        id: comment.id,
        userId: user.id,
        userEmail: user.email,
        userName: `${userDetails.firstName} ${userDetails.lastName}`,
        userAvatar: userDetails?.imageURL || null,
        content: comment.content,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        likes: likes,
        likesCount: likes.length,
        replies: comment.replies ? comment.replies.map((reply) => transformComment(reply)) : [],
    };

    return transformedComment;
};

module.exports = {
    transformComment,
};
