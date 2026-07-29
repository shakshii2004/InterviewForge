import dotenv from 'dotenv';
dotenv.config();

async function testFetch() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  
  if (!data.models) {
    console.log("No models returned:", data);
    return;
  }
  
  for (const m of data.models) {
    if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
      const modelName = m.name.replace('models/', '');
      console.log('Trying REST generateContent for:', modelName);
      
      const genUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${process.env.GEMINI_API_KEY}`;
      const genRes = await fetch(genUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: "test" }] }] })
      });
      const genData = await genRes.json();
      
      if (!genData.error) {
        console.log(`SUCCESS REST for ${modelName}`);
        return;
      } else {
        console.log(`FAIL REST for ${modelName}:`, genData.error.message);
      }
    }
  }
}

testFetch().catch(console.error);
