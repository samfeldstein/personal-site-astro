export function sortPostsByDate(posts) {
    posts.sort((a, b) => new Date(b.data.pubDate) - new Date(a.data.pubDate));
    return posts;
}
