import { FunctionSignature, MethodParameter } from '../../models/CodingQuestion';

export const wrapCode = (code: string, language: string, signature: FunctionSignature): string => {
  if (language === 'JavaScript') {
    return wrapJavaScript(code, signature);
  }
  
  if (language === 'Java') {
    return wrapJava(code, signature);
  }

  // Fallback for languages not yet supported by wrappers (Python, C++)
  return code;
};

const wrapJavaScript = (code: string, signature: FunctionSignature): string => {
  let parsingLogic = '';
  let argsList: string[] = [];
  
  signature.parameters.forEach((param, i) => {
    if (param.type === 'int[]') {
      parsingLogic += `    const arg${i} = lines[${i}].trim().split(' ').map(Number);\n`;
    } else if (param.type === 'int') {
      parsingLogic += `    const arg${i} = parseInt(lines[${i}].trim());\n`;
    } else {
      parsingLogic += `    const arg${i} = lines[${i}];\n`;
    }
    argsList.push(`arg${i}`);
  });

  let outputLogic = '';
  if (signature.returnType === 'int[]') {
    outputLogic = `console.log(result.join(' '));`;
  } else {
    outputLogic = `console.log(result);`;
  }

  return `${code}

const fs = require('fs');
function __main__() {
  try {
    const input = fs.readFileSync(0, 'utf-8').trim();
    if (!input) return;
    const lines = input.split('\\n');
${parsingLogic}
    const result = ${signature.methodName}(${argsList.join(', ')});
    ${outputLogic}
  } catch(e) {
    console.error(e);
  }
}
__main__();`;
};

const wrapJava = (code: string, signature: FunctionSignature): string => {
  let parsingLogic = '';
  let argsList: string[] = [];
  
  signature.parameters.forEach((param, i) => {
    if (param.type === 'int[]') {
      parsingLogic += `
        String[] parts${i} = scanner.nextLine().trim().split("\\\\s+");
        int[] arg${i} = new int[parts${i}.length];
        for (int j = 0; j < parts${i}.length; j++) {
            arg${i}[j] = Integer.parseInt(parts${i}[j]);
        }`;
    } else if (param.type === 'int') {
      parsingLogic += `
        int arg${i} = Integer.parseInt(scanner.nextLine().trim());`;
    } else {
      parsingLogic += `
        String arg${i} = scanner.nextLine();`;
    }
    argsList.push(`arg${i}`);
  });

  let outputLogic = '';
  if (signature.returnType === 'int[]') {
    outputLogic = `
        for (int i = 0; i < result.length; i++) {
            System.out.print(result[i] + (i == result.length - 1 ? "" : " "));
        }
        System.out.println();`;
  } else {
    outputLogic = `        System.out.println(result);`;
  }

  return `import java.util.*;\nimport java.io.*;\n\n${code}\n
public class Main {
    public static void main(String[] args) throws Exception {
        Scanner scanner = new Scanner(System.in);
        if (!scanner.hasNextLine()) return;
        ${parsingLogic}
        Solution solution = new Solution();
        ${signature.returnType} result = solution.${signature.methodName}(${argsList.join(', ')});
        ${outputLogic}
    }
}`;
};
