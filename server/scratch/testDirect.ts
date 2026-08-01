import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

async function testDirect() {
  try {
    const response = await axios.post('https://api.jdoodle.com/v1/execute', {
      clientId: process.env.JDOODLE_CLIENT_ID,
      clientSecret: process.env.JDOODLE_CLIENT_SECRET,
      script: 'print("hello")',
      language: 'python3',
      versionIndex: '4'
    });
    console.log("EXECUTE RESPONSE:", response.data);
  } catch (err: any) {
    console.error("EXECUTE ERROR:", err.response?.status, err.response?.data);
  }
}
testDirect();
