/** Japanese display labels. Identifiers and stored values remain unchanged. */
export const finalUiText = {
    "New comment": "新しいコメント",
    "New post": "新しい投稿",
    "New reply": "新しい返信",
    "Original post": "元の投稿",
} as const;

export const finalUiDynamic = {
    newPost: (p0: unknown, p1: unknown, p2: unknown) =>
        `${p0}さんが「${p2}」に投稿「${p1}」を作成しました`,
    newComment: (p0: unknown, p1: unknown, p2: unknown, p3: unknown) =>
        `${p0}さんが「${p3}」の投稿「${p2}」にコメントしました`,
    newReply: (p0: unknown, p1: unknown, p2: unknown, p3: unknown) =>
        `${p0}さんが「${p3}」の投稿「${p2}」のコメントに返信しました`,
    postReaction: (p0: unknown, p1: unknown, p2: unknown, p3: unknown) =>
        `${p0}さんが「${p3}」の投稿「${p2}」に${p1}のリアクションをしました`,
    commentReaction: (
        p0: unknown,
        p1: unknown,
        p2: unknown,
        p3: unknown,
        p4: unknown,
    ) =>
        `${p0}さんが「${p4}」の投稿「${p3}」のコメント「${p2}」に${p1}のリアクションをしました`,
    replyReaction: (
        p0: unknown,
        p1: unknown,
        p2: unknown,
        p3: unknown,
        p4: unknown,
    ) =>
        `${p0}さんが「${p4}」の投稿「${p3}」の返信「${p2}」に${p1}のリアクションをしました`,
    joinRequest: (p0: unknown, p1: unknown) =>
        `${p0}さんが「${p1}」への参加を申請しました`,
    joinAccepted: (p0: unknown, p1: unknown) =>
        `${p0}さんが「${p1}」への参加を承認しました`,
    joined: (p0: unknown, p1: unknown) => `${p0}さんが「${p1}」に参加しました`,
    left: (p0: unknown, p1: unknown) => `${p0}さんが「${p1}」から退会しました`,
    subscribed: (p0: unknown) => `${p0}さんがメール配信に登録しました`,
    unsubscribed: (p0: unknown) => `${p0}さんがメール配信を解除しました`,
    enrolled: (p0: unknown, p1: unknown) =>
        `${p0}さんが「${p1}」に受講登録しました`,
    signedUp: (p0: unknown) => `${p0}さんが登録しました`,
    downloaded: (p0: unknown, p1: unknown) =>
        `${p0}さんが「${p1}」をダウンロードしました`,
} as const;
