export const getPistonLanguage = (language: string): { language: string, version: string } => {
  const normalizedLanguage = language.toLowerCase();
  
  switch (normalizedLanguage) {
    case 'javascript':
    case 'js':
      return { language: 'javascript', version: '*' };
    case 'python':
    case 'py':
      return { language: 'python', version: '*' };
    case 'java':
      return { language: 'java', version: '*' };
    case 'cpp':
    case 'c++':
      return { language: 'cpp', version: '*' };
    case 'c':
      return { language: 'c', version: '*' };
    case 'c#':
    case 'csharp':
    case 'cs':
      return { language: 'csharp', version: '*' };
    case 'go':
      return { language: 'go', version: '*' };
    case 'kotlin':
      return { language: 'kotlin', version: '*' };
    default:
      throw new Error(`Unsupported language: ${language}`);
  }
};
