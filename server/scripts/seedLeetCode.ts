import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import axios from 'axios';
import { CodingQuestion } from '../src/models/CodingQuestion';

const LEETCODE_API = 'https://leetcode.com/graphql';

// A curated list of 50 popular LeetCode questions (Blind 75 / Top 150 favorites)
const slugs = [
  "two-sum",
  "valid-parentheses",
  "merge-two-sorted-lists",
  "best-time-to-buy-and-sell-stock",
  "valid-palindrome",
  "invert-binary-tree",
  "valid-anagram",
  "binary-search",
  "flood-fill",
  "lowest-common-ancestor-of-a-binary-search-tree",
  "balanced-binary-tree",
  "linked-list-cycle",
  "implement-queue-using-stacks",
  "first-bad-version",
  "ransom-note",
  "climbing-stairs",
  "longest-palindrome",
  "reverse-linked-list",
  "majority-element",
  "add-binary",
  "diameter-of-binary-tree",
  "middle-of-the-linked-list",
  "maximum-depth-of-binary-tree",
  "contains-duplicate",
  "meeting-rooms",
  "roman-to-integer",
  "backspace-string-compare",
  "counting-bits",
  "same-tree",
  "number-of-1-bits",
  "longest-common-prefix",
  "single-number",
  "palindrome-linked-list",
  "move-zeroes",
  "symmetric-tree",
  "missing-number",
  "palindrome-number",
  "convert-sorted-array-to-binary-search-tree",
  "reverse-bits",
  "subtree-of-another-tree",
  "squares-of-a-sorted-array",
  "maximum-subarray",
  "insert-interval",
  "01-matrix",
  "k-closest-points-to-origin",
  "longest-substring-without-repeating-characters",
  "3sum",
  "binary-tree-level-order-traversal",
  "clone-graph",
  "evaluate-reverse-polish-notation"
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function importProblem(titleSlug: string) {
  try {
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

    const lq = await axios.post(LEETCODE_API, { query, variables: { titleSlug } });
    const data = lq.data?.data?.question;
    
    if (!data) {
      console.log(`[SKIP] ${titleSlug} - Not found`);
      return false;
    }

    const snippetQuery = `
      query questionEditorData($titleSlug: String!) {
        question(titleSlug: $titleSlug) {
          codeSnippets { lang, code }
        }
      }
    `;

    const sq = await axios.post(LEETCODE_API, { query: snippetQuery, variables: { titleSlug } });
    const snippets = sq.data?.data?.question?.codeSnippets || [];
    const starterCode: Record<string, string> = {};
    
    snippets.forEach((s: any) => {
      if (s.lang === 'Java') starterCode['Java'] = s.code;
      if (s.lang === 'C++') starterCode['C++'] = s.code;
      if (s.lang === 'Python3') starterCode['Python'] = s.code;
      if (s.lang === 'JavaScript') starterCode['JavaScript'] = s.code;
    });

    const metaData = JSON.parse(data.metaData);
    
    const mapLeetCodeTypeToOurs = (lcType: string) => {
      if (lcType === 'integer') return 'int';
      if (lcType === 'integer[]') return 'int[]';
      if (lcType === 'string') return 'String';
      if (lcType === 'string[]') return 'String[]';
      if (lcType === 'boolean') return 'boolean';
      if (lcType === 'double') return 'double';
      if (lcType === 'list<integer>') return 'int[]'; 
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

    const newQuestion = {
      title: data.title,
      slug: data.titleSlug,
      difficulty: data.difficulty,
      description: data.content,
      topics: data.topicTags.map((t: any) => t.name),
      hints: data.hints || [],
      companies: [],
      constraints: [],
      examples: [], 
      starterCode,
      signature,
      sampleTestCases: [], 
      hiddenTestCases: []
    };

    await CodingQuestion.findOneAndUpdate(
      { slug: data.titleSlug },
      newQuestion,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log(`[SUCCESS] Imported: ${data.title}`);
    return true;
  } catch (error: any) {
    console.error(`[ERROR] Failed to import ${titleSlug}:`, error.message);
    return false;
  }
}

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log('Connected to DB. Starting import of 50 problems...');
    
    let successCount = 0;
    for (let i = 0; i < slugs.length; i++) {
      console.log(`(${i+1}/${slugs.length}) Importing ${slugs[i]}...`);
      const success = await importProblem(slugs[i]);
      if (success) successCount++;
      
      // Delay 1.5 seconds between requests to avoid LeetCode IP ban
      await sleep(1500);
    }
    
    console.log(`\nImport complete! Successfully imported ${successCount}/${slugs.length} problems.`);
    process.exit(0);
  } catch (error) {
    console.error('Fatal Error:', error);
    process.exit(1);
  }
}

seed();
