export const parseCodeReviewResponse = (rawResponse: string): any => {
  let jsonString = rawResponse.trim();

  // Strip markdown formatting if the AI ignores instructions
  if (jsonString.startsWith('\`\`\`json')) {
    jsonString = jsonString.replace(/^\`\`\`json\n/, '');
  } else if (jsonString.startsWith('\`\`\`')) {
    jsonString = jsonString.replace(/^\`\`\`\n/, '');
  }
  
  if (jsonString.endsWith('\`\`\`')) {
    jsonString = jsonString.replace(/\n\`\`\`$/, '');
  }

  jsonString = jsonString.trim();

  try {
    const data = JSON.parse(jsonString);

    // Basic validation to ensure required fields exist
    const requiredNumberFields = [
      'overallScore', 'correctnessScore', 'timeComplexityScore', 
      'spaceComplexityScore', 'readabilityScore', 'bestPracticesScore', 
      'optimizationScore'
    ];

    const requiredStringFields = [
      'summary', 'timeComplexity', 'spaceComplexity', 'interviewerFeedback',
      'timeComplexityExplanation', 'spaceComplexityExplanation'
    ];

    const requiredArrayFields = [
      'strengths', 'weaknesses', 'bugs', 
      'optimizations', 'alternativeApproaches', 'recommendedTopics',
      'edgeCaseAnalysis', 'learningRoadmap', 'improvementChecklist'
    ];

    for (const field of requiredNumberFields) {
      if (typeof data[field] !== 'number') data[field] = 0;
    }

    for (const field of requiredStringFields) {
      if (typeof data[field] !== 'string') data[field] = 'Not provided';
    }

    for (const field of requiredArrayFields) {
      if (!Array.isArray(data[field])) data[field] = [];
    }

    // Default nested objects
    if (!data.interviewReadiness || typeof data.interviewReadiness !== 'object') {
      data.interviewReadiness = { rating: 'Good', feedback: 'Solid performance.' };
    }
    
    if (!data.industryComparison || typeof data.industryComparison !== 'object') {
      data.industryComparison = { averageScore: 75, candidateScore: data.overallScore || 0, estimatedPercentile: 'Top 50%' };
    }
    
    if (!data.interviewerNotes || typeof data.interviewerNotes !== 'object') {
      data.interviewerNotes = {
        communication: 7, codeOrganization: 7, problemSolving: 7,
        optimizationThinking: 7, debuggingAbility: 7, overallImpression: 'Average candidate.'
      };
    }

    return data;
  } catch (error) {
    console.error('Failed to parse AI Code Review JSON:', rawResponse);
    throw new Error('Failed to parse AI Code Review response into valid JSON.');
  }
};
