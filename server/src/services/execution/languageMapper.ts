export const getJudge0LanguageId = (language: string): number => {
  const normalizedLanguage = language.toLowerCase();
  
  switch (normalizedLanguage) {
    case 'javascript':
    case 'js':
      return 63; // JavaScript (Node.js 12.14.0) or 93 (Node.js 18.15.0) - using standard 63 for CE
    case 'python':
    case 'py':
      return 71; // Python (3.8.1)
    case 'java':
      return 62; // Java (OpenJDK 13.0.1)
    case 'cpp':
    case 'c++':
      return 54; // C++ (GCC 9.2.0)
    case 'c':
      return 50; // C (GCC 9.2.0)
    default:
      throw new Error(`Unsupported language: ${language}`);
  }
};
