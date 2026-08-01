const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function scrape() {
  try {
    const res = await axios.get('https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/');
    const $ = cheerio.load(res.data);
    const links = new Set();
    $('a[href*="leetcode.com/problems/"]').each((i, el) => {
      const href = $(el).attr('href');
      const match = href.match(/leetcode\.com\/problems\/([^/]+)/);
      if (match && match[1]) {
        links.add(match[1]);
      }
    });
    const slugs = Array.from(links);
    console.log('Found', slugs.length, 'slugs');
    fs.writeFileSync('striver_slugs.json', JSON.stringify(slugs, null, 2));
  } catch (err) {
    console.error(err);
  }
}
scrape();
