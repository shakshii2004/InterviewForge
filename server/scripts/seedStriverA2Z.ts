import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import axios from 'axios';
import { CodingQuestion } from '../src/models/CodingQuestion';

const LEETCODE_API = 'https://leetcode.com/graphql';

const striverSlugs = [
  "set-matrix-zeroes",
  "pascals-triangle",
  "next-permutation",
  "maximum-subarray",
  "sort-colors",
  "best-time-to-buy-and-sell-stock",
  "rotate-image",
  "merge-intervals",
  "merge-sorted-array",
  "find-the-duplicate-number",
  "search-a-2d-matrix",
  "powx-n",
  "majority-element",
  "majority-element-ii",
  "unique-paths",
  "reverse-pairs",
  "two-sum",
  "4sum",
  "longest-consecutive-sequence",
  "subarray-sum-equals-k",
  "longest-substring-without-repeating-characters",
  "reverse-linked-list",
  "middle-of-the-linked-list",
  "merge-two-sorted-lists",
  "remove-nth-node-from-end-of-list",
  "add-two-numbers",
  "intersection-of-two-linked-lists",
  "linked-list-cycle",
  "reverse-nodes-in-k-group",
  "palindrome-linked-list",
  "linked-list-cycle-ii",
  "copy-list-with-random-pointer"
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
      methodName: metaData.name || 'solve',
      parameters: (metaData.params || []).map((p: any) => ({
        name: p.name,
        type: mapLeetCodeTypeToOurs(p.type)
      })),
      returnType: mapLeetCodeTypeToOurs(metaData.return?.type || 'void')
    };

    const topics = data.topicTags.map((t: any) => t.name);
    // Important: Add Striver A2Z tag!
    topics.push('Striver A2Z');

    const newQuestion = {
      title: data.title,
      slug: data.titleSlug,
      difficulty: data.difficulty,
      description: data.content,
      topics: Array.from(new Set(topics)), // Ensure no duplicate tags
      hints: data.hints || [],
      companies: [],
      constraints: [],
      examples: [], 
      starterCode,
      signature,
      sampleTestCases: [], 
      hiddenTestCases: []
    };

    // upsert ensures no duplicates
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
    console.log(`Connected to DB. Starting import of ${striverSlugs.length} Striver problems...`);
    
    let successCount = 0;
    for (let i = 0; i < striverSlugs.length; i++) {
      console.log(`(${i+1}/${striverSlugs.length}) Importing ${striverSlugs[i]}...`);
      const success = await importProblem(striverSlugs[i]);
      if (success) successCount++;
      
      // Delay 1.5 seconds between requests to avoid LeetCode IP ban
      await sleep(1500);
    }
    
    console.log(`\nImport complete! Successfully imported ${successCount}/${striverSlugs.length} problems.`);
    process.exit(0);
  } catch (error) {
    console.error('Fatal Error:', error);
    process.exit(1);
  }
}

seed();
