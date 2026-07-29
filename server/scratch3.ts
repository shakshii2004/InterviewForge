import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

async function testAll() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.list();
  
  const text = JSON.stringify(response, null, 2);
  const data = JSON.parse(text);
  const models = data.models || data.data || [];
  
  for (const m of models) {
    if (!m.name) continue;
    try {
      const res = await ai.models.generateContent({
        model: m.name.replace('models/', ''),
        contents: 'hello',
      });
      console.log(`SUCCESS for ${m.name}:`, res.text);
      return;
    } catch (err: any) {
      console.log(`FAIL for ${m.name}:`, err.message);
    }
  }
}

testAll().catch(console.error);
