import axios from 'axios';

async function testLeetCodeMeta() {
  const query = `
    query questionData($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        metaData
      }
    }
  `;
  try {
    const res = await axios.post('https://leetcode.com/graphql', {
      query,
      variables: { titleSlug: 'two-sum' }
    });
    console.log(res.data.data.question.metaData);
  } catch(e: any) {
    console.error(e.message);
  }
}
testLeetCodeMeta();
