import { FunctionSignature, MethodParameter } from '../../models/CodingQuestion';

export const wrapCode = (code: string, language: string, signature: FunctionSignature): string => {
  const lang = language.toLowerCase();
  
  if (lang.includes('java') && !lang.includes('javascript')) {
    return wrapJava(code, signature);
  } else if (lang.includes('python')) {
    return wrapPython(code, signature);
  } else if (lang.includes('cpp') || lang.includes('c++')) {
    return wrapCpp(code, signature);
  } else if (lang.includes('javascript') || lang.includes('js')) {
    return wrapJavaScript(code, signature);
  }
  
  // For unsupported languages, just return the raw code (the user must write their own main method)
  return code;
};

// =======================
// JAVA WRAPPER
// =======================
function wrapJava(code: string, signature: FunctionSignature): string {
  let mainBody = `
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) return;
`;

  const paramNames: string[] = [];

  for (const param of signature.parameters) {
    paramNames.push(param.name);
    if (param.type === 'int') {
      mainBody += `        int ${param.name} = sc.nextInt();\n`;
    } else if (param.type === 'int[]') {
      mainBody += `        int size_${param.name} = sc.nextInt();
        int[] ${param.name} = new int[size_${param.name}];
        for(int i=0; i<size_${param.name}; i++) {
            ${param.name}[i] = sc.nextInt();
        }\n`;
    } else if (param.type === 'String') {
      mainBody += `        String ${param.name} = sc.next();\n`;
    }
    // Add other types as needed
  }

  mainBody += `        Solution sol = new Solution();\n`;
  const invoke = `sol.${signature.methodName}(${paramNames.join(', ')})`;

  if (signature.returnType === 'int[]') {
    mainBody += `        int[] res = ${invoke};
        for(int i=0; i<res.length; i++) {
            System.out.print(res[i] + (i == res.length - 1 ? "" : " "));
        }\n`;
  } else if (signature.returnType === 'int') {
    mainBody += `        System.out.print(${invoke});\n`;
  } else if (signature.returnType === 'String') {
    mainBody += `        System.out.print(${invoke});\n`;
  } else if (signature.returnType === 'boolean') {
    mainBody += `        System.out.print(${invoke} ? "true" : "false");\n`;
  }

  const wrapper = `
import java.util.*;

public class Main {
    public static void main(String[] args) {
${mainBody}
    }
}
`;

  return wrapper + "\n" + code;
}

// =======================
// PYTHON WRAPPER
// =======================
function wrapPython(code: string, signature: FunctionSignature): string {
  let mainBody = `
if __name__ == '__main__':
    import sys
    input_data = sys.stdin.read().split()
    if not input_data: sys.exit(0)
    ptr = 0
`;

  const paramNames: string[] = [];

  for (const param of signature.parameters) {
    paramNames.push(param.name);
    if (param.type === 'int') {
      mainBody += `    ${param.name} = int(input_data[ptr]); ptr += 1\n`;
    } else if (param.type === 'int[]') {
      mainBody += `    size_${param.name} = int(input_data[ptr]); ptr += 1
    ${param.name} = []
    for _ in range(size_${param.name}):
        ${param.name}.append(int(input_data[ptr]))
        ptr += 1\n`;
    } else if (param.type === 'String') {
      mainBody += `    ${param.name} = input_data[ptr]; ptr += 1\n`;
    }
  }

  const invoke = `${signature.methodName}(${paramNames.join(', ')})`;

  if (signature.returnType === 'int[]') {
    mainBody += `    res = ${invoke}
    print(" ".join(map(str, res)))\n`;
  } else {
    mainBody += `    print(str(${invoke}))\n`;
  }

  return code + "\n" + mainBody;
}

// =======================
// C++ WRAPPER
// =======================
function wrapCpp(code: string, signature: FunctionSignature): string {
  let mainBody = `
int main() {
`;

  const paramNames: string[] = [];

  for (const param of signature.parameters) {
    paramNames.push(param.name);
    if (param.type === 'int') {
      mainBody += `    int ${param.name};\n    if (!(cin >> ${param.name})) return 0;\n`;
    } else if (param.type === 'int[]') {
      mainBody += `    int size_${param.name};\n    if (!(cin >> size_${param.name})) return 0;
    vector<int> ${param.name}(size_${param.name});
    for(int i=0; i<size_${param.name}; i++) {
        cin >> ${param.name}[i];
    }\n`;
    }
  }

  mainBody += `    Solution sol;\n`;
  const invoke = `sol.${signature.methodName}(${paramNames.join(', ')})`;

  if (signature.returnType === 'int[]') {
    mainBody += `    vector<int> res = ${invoke};
    for(int i=0; i<res.size(); i++) {
        cout << res[i] << (i == res.size() - 1 ? "" : " ");
    }\n`;
  } else {
    mainBody += `    cout << ${invoke};\n`;
  }

  mainBody += `    return 0;\n}\n`;

  const headers = `
#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <unordered_map>
#include <map>
using namespace std;
`;

  return headers + "\n" + code + "\n" + mainBody;
}

// =======================
// JAVASCRIPT WRAPPER
// =======================
function wrapJavaScript(code: string, signature: FunctionSignature): string {
  let mainBody = `
const fs = require('fs');
function _run() {
    const raw = fs.readFileSync(0, 'utf-8').trim();
    if (!raw) return;
    const input_data = raw.split(/\\s+/);
    let ptr = 0;
`;

  const paramNames: string[] = [];

  for (const param of signature.parameters) {
    paramNames.push(param.name);
    if (param.type === 'int') {
      mainBody += `    const ${param.name} = parseInt(input_data[ptr++], 10);\n`;
    } else if (param.type === 'int[]') {
      mainBody += `    const size_${param.name} = parseInt(input_data[ptr++], 10);
    const ${param.name} = [];
    for(let i=0; i<size_${param.name}; i++) {
        ${param.name}.push(parseInt(input_data[ptr++], 10));
    }\n`;
    } else if (param.type === 'String') {
      mainBody += `    const ${param.name} = input_data[ptr++];\n`;
    }
  }

  const invoke = `${signature.methodName}(${paramNames.join(', ')})`;

  if (signature.returnType === 'int[]') {
    mainBody += `    const res = ${invoke};
    console.log(res.join(" "));\n`;
  } else {
    mainBody += `    console.log(${invoke});\n`;
  }

  mainBody += `}\n_run();\n`;

  return code + "\n" + mainBody;
}
