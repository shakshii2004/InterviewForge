import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

async function list() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.list();
  if (Array.isArray(response)) {
    response.forEach((m: any) => console.log(m.name, m.supportedActions));
  } else if (response.models) {
    (response.models as any[]).forEach(m => console.log(m.name, m.supportedActions));
  } else {
    for (const m of response as any) {
        if (m.name) console.log(m.name, m.supportedActions);
    }
  }
}

list().catch(console.error);
