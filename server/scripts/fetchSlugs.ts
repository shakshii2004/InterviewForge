import axios from 'axios';

async function fetch() {
  try {
    const res = await axios.get('https://api.github.com/search/code?q=filename:striver-a2z.json', {
      headers: { 'User-Agent': 'Node.js' }
    });
    if (res.data.items && res.data.items.length > 0) {
      console.log(res.data.items[0].html_url);
      const repo = res.data.items[0].repository.full_name;
      const path = res.data.items[0].path;
      console.log(`https://raw.githubusercontent.com/${repo}/main/${path}`);
      console.log(`https://raw.githubusercontent.com/${repo}/master/${path}`);
    } else {
      console.log('Not found');
    }
  } catch (err) {
    console.error(err);
  }
}
fetch();
