import { Request, Response } from 'express';
import axios from 'axios';
import { CodingQuestion } from '../models/CodingQuestion';

export const importFromLeetCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { titleSlug } = req.body;
    if (!titleSlug) {
      res.status(400).json({ message: 'titleSlug is required' });
      return;
    }

    // 1. Fetch Question Data & MetaData
    const query = `
      query questionData($titleSlug: String!) {
        question(titleSlug: $titleSlug) {
          questionId
          title
          titleSlug
          content
          difficulty
          topicTags { name }
          metaData
          hints
        }
      }
    `;

    const lq = await axios.post('https://leetcode.com/graphql', {
      query,
      variables: { titleSlug }
    });

    const data = lq.data?.data?.question;
    if (!data) {
      res.status(404).json({ message: 'Problem not found on LeetCode' });
      return;
    }

    // 2. Fetch Code Snippets
    const snippetQuery = `
      query questionEditorData($titleSlug: String!) {
        question(titleSlug: $titleSlug) {
          codeSnippets {
            lang
            langSlug
            code
          }
        }
      }
    `;

    const sq = await axios.post('https://leetcode.com/graphql', {
      query: snippetQuery,
      variables: { titleSlug }
    });
    
    const snippets = sq.data?.data?.question?.codeSnippets || [];
    const starterCode: Record<string, string> = {};
    
    snippets.forEach((s: any) => {
      if (s.lang === 'Java') starterCode['Java'] = s.code;
      if (s.lang === 'C++') starterCode['C++'] = s.code;
      if (s.lang === 'Python3') starterCode['Python'] = s.code;
      if (s.lang === 'JavaScript') starterCode['JavaScript'] = s.code;
      if (s.lang === 'C') starterCode['C'] = s.code;
      if (s.lang === 'Go') starterCode['Go'] = s.code;
      if (s.lang === 'Kotlin') starterCode['Kotlin'] = s.code;
      if (s.lang === 'C#') starterCode['C#'] = s.code;
    });

    // 3. Parse MetaData for Signature
    const metaData = JSON.parse(data.metaData);
    
    const mapLeetCodeTypeToOurs = (lcType: string) => {
      // Leetcode types: integer[], integer, string, boolean, list<integer>, ListNode, TreeNode
      if (lcType === 'integer') return 'int';
      if (lcType === 'integer[]') return 'int[]';
      if (lcType === 'string') return 'String';
      if (lcType === 'string[]') return 'String[]';
      if (lcType === 'boolean') return 'boolean';
      if (lcType === 'double') return 'double';
      if (lcType === 'list<integer>') return 'int[]'; // Simplified
      return lcType;
    };

    const signature = {
      methodName: metaData.name,
      parameters: (metaData.params || []).map((p: any) => ({
        name: p.name,
        type: mapLeetCodeTypeToOurs(p.type)
      })),
      returnType: mapLeetCodeTypeToOurs(metaData.return?.type || 'void')
    };

    // 4. Save to DB
    const newQuestion = new CodingQuestion({
      title: data.title,
      slug: data.titleSlug,
      difficulty: data.difficulty,
      description: data.content,
      topics: data.topicTags.map((t: any) => t.name),
      hints: data.hints || [],
      companies: [], // Will be filled manually or by other sources
      constraints: [], // Can parse from HTML later
      examples: [], 
      starterCode,
      signature,
      sampleTestCases: [], // Need manual or AI generation
      hiddenTestCases: []
    });

    // We use upsert so we can re-import to update
    const saved = await CodingQuestion.findOneAndUpdate(
      { slug: data.titleSlug },
      newQuestion.toObject(),
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({ message: 'Imported successfully', question: saved });

  } catch (error: any) {
    console.error('LeetCode Import Error:', error);
    res.status(500).json({ message: 'Server error during import', error: error.message });
  }
};
