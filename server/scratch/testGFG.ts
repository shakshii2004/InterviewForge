import axios from 'axios';

async function testGFG() {
  try {
    const slug = 'missing-number-in-array1416';
    const res = await axios.get(`https://practiceapi.geeksforgeeks.org/api/v1/problems/${slug}/`);
    console.log(Object.keys(res.data));
    console.log(res.data.results ? Object.keys(res.data.results) : "No results key");
  } catch(e: any) {
    console.error(e.message);
  }
}
testGFG();
