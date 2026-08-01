import axios from 'axios';

async function testLeetCodeCode() {
  const query = `
    query questionEditorData($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        codeSnippets {
          lang
          langSlug
          code
        }
      }
    }
  `;
  try {
    const res = await axios.post('https://leetcode.com/graphql', {
      query,
      variables: { titleSlug: 'two-sum' }
    });
    console.log(res.data.data.question.codeSnippets.slice(0, 3));
  } catch(e: any) {
    console.error(e.message);
  }
}

testLeetCodeCode();
