export function generateArticle(tagsNumber) {
  return {
    title: 'Generated Article' + Date.now(),
    description: 'join the community by creating a new implementation',
    body: 'Share your knowledge and enpower the community by creating a new implementation',
    tagList: ['implementations', 'first tag', 'second tag'],
  };
}
