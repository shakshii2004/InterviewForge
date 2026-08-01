import axios from 'axios';

async function testLeetCode() {
  const query = `
    query questionData($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        questionId
        title
        content
        difficulty
        topicTags {
          name
        }
      }
    }
  `;
  try {
    const res = await axios.post('https://leetcode.com/graphql', {
      query,
      variables: { titleSlug: 'two-sum' }
    });
    console.log(res.data.data.question.title);
    console.log(res.data.data.question.difficulty);
    console.log(res.data.data.question.topicTags.map((t: any) => t.name).join(', '));
    // console.log(res.data.data.question.content); // HTML content
  } catch(e: any) {
    console.error(e.message);
  }
}

testLeetCode();
