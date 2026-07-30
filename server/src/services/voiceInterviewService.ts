import { InterviewSession } from '../models/InterviewSession';
import { Evaluation } from '../models/Evaluation';
import { AIProviderFactory } from './ai/AIProviderFactory';

export const voiceInterviewService = {
  async generateEvaluation(sessionId: string) {
    const session = await InterviewSession.findById(sessionId);
    if (!session || !session.transcript) return;

    const transcriptText = session.transcript.map(t => `${t.speaker}: ${t.text}`).join('\n');
    
    const prompt = `
      You are an expert technical recruiter and senior engineer. Please evaluate the following interview transcript.
      The interview was for a ${session.role} position (${session.experienceLevel}).
      The interview type was ${session.interviewType} (Difficulty: ${session.difficulty}).

      Transcript:
      ${transcriptText}

      Please provide a detailed evaluation in strictly valid JSON format with the following structure:
      {
        "overallScore": 85,
        "technicalScore": 80,
        "communicationScore": 90,
        "problemSolvingScore": 85,
        "confidenceScore": 88,
        "projectScore": 85,
        "timeManagementScore": 90,
        "behavioralScore": 85,
        "vocabularyRichness": 80,
        "summary": "A detailed 2-3 sentence summary...",
        "strengths": ["Strength 1", "Strength 2", "Strength 3"],
        "improvements": ["Improvement 1", "Improvement 2", "Improvement 3"],
        "nextPracticePlan": {
          "topicsToRevise": ["Topic 1", "Topic 2"],
          "interviewTips": ["Tip 1", "Tip 2"],
          "suggestedPractice": ["Problem 1", "Problem 2"]
        },
        "questionFeedback": [
          {
            "questionId": "1",
            "score": 85,
            "strengths": ["Good point 1"],
            "missingPoints": ["Missed point 1"],
            "feedback": "Detailed feedback on this specific answer."
          }
        ]
      }
    `;

    try {
      console.log(`[AI Evaluation] Requesting evaluation for Live Session ${sessionId}`);
      const response = await AIProviderFactory.executeWithFallback('evaluateInterview', prompt);
      console.log(`[AI Evaluation] AI Response received (Length: ${response.length})`);
      
      let evalData;
      try {
        // Robust JSON extraction
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        const cleanedJson = jsonMatch ? jsonMatch[0] : response;
        evalData = JSON.parse(cleanedJson);
        console.log(`[AI Evaluation] Successfully parsed JSON`);
      } catch (parseError) {
        console.error(`[AI Evaluation] Failed to parse JSON. Falling back to metrics. Error:`, parseError);
        console.error(`[AI Evaluation] Raw AI Response:`, response);
        
        // Generate fallback evaluation
        const wpm = session.speechMetrics?.wordsPerMinute || 0;
        const isWpmGood = wpm >= 110 && wpm <= 160;
        const questionsAnswered = session.transcript?.filter(t => t.speaker === 'User').length || 0;
        
        const commScore = isWpmGood ? 85 : 70;
        const techScore = questionsAnswered > 0 ? 80 : 50;
        const confScore = (session.speechMetrics?.fillerWords || 0) < 5 ? 90 : 75;
        const overall = Math.round((commScore + techScore + confScore) / 3);
        
        evalData = {
          overallScore: overall,
          technicalScore: techScore,
          communicationScore: commScore,
          problemSolvingScore: techScore,
          confidenceScore: confScore,
          projectScore: techScore,
          timeManagementScore: 80,
          behavioralScore: 85,
          vocabularyRichness: 80,
          summary: "AI evaluation generation failed. These scores are estimated based on your speech metrics.",
          strengths: ["Completed the interview"],
          improvements: ["Ensure clear audio and steady pace"],
          nextPracticePlan: {
            topicsToRevise: ["Core concepts"],
            interviewTips: ["Speak clearly and at a moderate pace"],
            suggestedPractice: ["Mock interviews"]
          },
          questionFeedback: []
        };
      }

      // Ensure required scores exist to prevent Mongoose validation errors
      if (typeof evalData.overallScore !== 'number') evalData.overallScore = 70;
      if (typeof evalData.technicalScore !== 'number') evalData.technicalScore = 70;
      if (typeof evalData.communicationScore !== 'number') evalData.communicationScore = 70;

      const savedEval = await Evaluation.create({
        userId: session.userId,
        interviewId: session._id,
        ...evalData
      });
      console.log(`[AI Evaluation] Saved evaluation successfully: ${savedEval._id}`);

      // Update session score
      session.score = evalData.overallScore;
      await session.save();
      console.log(`[AI Evaluation] Session ${sessionId} score updated to ${session.score}`);

    } catch (error) {
      console.error('[AI Evaluation] Complete failure in live interview evaluation:', error);
    }
  }
};
