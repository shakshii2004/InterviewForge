const fs = require('fs');
const files = [
  'src/services/execution/judge0Client.ts',
  'src/services/execution/languageMapper.ts',
  'src/services/execution/resultParser.ts',
  'src/services/execution/executionService.ts',
  'src/controllers/executionController.ts',
  '../src/pages/coding/workspace/CodingWorkspace.tsx'
];
files.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    content = content.replace(/\\\`/g, '\`').replace(/\\\$/g, '$');
    fs.writeFileSync(f, content);
    console.log('Fixed ' + f);
  }
});
