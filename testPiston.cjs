const axios = require('axios');
async function test() {
  try {
    const res = await axios.post('https://emacsx.com/api/v2/execute', {
      language: 'javascript',
      version: '18.15.0',
      files: [{ content: 'console.log(1+1);' }]
    });
    console.log('Success:', res.data);
  } catch (err) {
    console.error('Error:', err.message);
  }
}
test();
