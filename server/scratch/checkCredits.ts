import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

async function checkCredits() {
  try {
    const response = await axios.post('https://api.jdoodle.com/v1/credit-spent', {
      clientId: process.env.JDOODLE_CLIENT_ID,
      clientSecret: process.env.JDOODLE_CLIENT_SECRET
    });
    console.log("Credit Response:", response.data);
  } catch (err: any) {
    console.error("Error checking credits:", err.response?.data || err.message);
  }
}

checkCredits();
