export function parseEvaluationResponse(responseText: string): any {
  try {
    let cleanText = responseText.trim();
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.substring(7);
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.substring(3);
    }
    
    if (cleanText.endsWith('```')) {
      cleanText = cleanText.substring(0, cleanText.length - 3);
    }
    
    return JSON.parse(cleanText.trim());
  } catch (error) {
    console.error('Failed to parse Evaluation JSON:', error);
    console.error('Raw Response:', responseText);
    throw new Error('Failed to parse AI evaluation response');
  }
}
