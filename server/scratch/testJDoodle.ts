import dotenv from 'dotenv';
dotenv.config();
import { wrapCode } from '../src/services/execution/codeWrapper';
import { jdoodleClient, getJDoodleLanguage } from '../src/services/execution/jdoodleClient';

async function run() {
  const code = `
class Solution {
    public int[] twoSum(int[] nums, int target) {
        return new int[]{0, 1};
    }
}
`;
  const signature = {
    methodName: 'twoSum',
    parameters: [
      { name: 'nums', type: 'int[]' },
      { name: 'target', type: 'int' }
    ],
    returnType: 'int[]'
  };

  const wrappedCode = wrapCode(code, 'java', signature);
  console.log("WRAPPED CODE:");
  console.log(wrappedCode);

  try {
    const jdoodleLang = getJDoodleLanguage('java');
    const response = await jdoodleClient.execute({
      script: wrappedCode,
      language: jdoodleLang.language,
      versionIndex: jdoodleLang.versionIndex,
      stdin: '4\n2 7 11 15\n9'
    });
    console.log("RESPONSE:", response);
  } catch (err: any) {
    console.error("ERROR:", err.message);
  }
}
run();
