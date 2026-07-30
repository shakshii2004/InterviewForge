import { useState } from 'react';
import Editor, { useMonaco } from '@monaco-editor/react';
import { Settings, Maximize2, RotateCcw, Copy, Check } from 'lucide-react';

export const STARTER_CODE: Record<string, string> = {
  'Java': 'class Solution {\n    public static void main(String[] args){\n        \n    }\n}',
  'Python': 'def solve():\n    pass',
  'JavaScript': 'function solve(){\n    \n}',
  'C++': '#include <bits/stdc++.h>\nusing namespace std;\n\nint main(){\n    return 0;\n}'
};

const MONACO_LANGUAGES: Record<string, string> = {
  'Java': 'java',
  'Python': 'python',
  'JavaScript': 'javascript',
  'C++': 'cpp'
};

interface EditorPanelProps {
  language: string;
  code: string;
  onChange: (value: string | undefined) => void;
  onReset: () => void;
}

export const EditorPanel = ({ language, code, onChange, onReset }: EditorPanelProps) => {
  // Removed unused monaco var
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [minimap, setMinimap] = useState(true);

  // Setup Monaco options
  const options = {
    fontSize,
    minimap: { enabled: minimap },
    wordWrap: 'on' as const,
    autoIndent: 'advanced' as const,
    bracketPairColorization: { enabled: true },
    formatOnPaste: true,
    padding: { top: 16, bottom: 16 },
    lineNumbersMinChars: 3,
    scrollBeyondLastLine: false,
    smoothScrolling: true,
    cursorBlinking: 'smooth' as const,
    cursorSmoothCaretAnimation: 'on' as const,
    renderLineHighlight: 'all' as const,
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Editor Toolbar */}
      <div className="h-10 border-b border-slate-200 flex items-center justify-between px-4 bg-slate-50">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-700">{language}</span>
        </div>
        
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-2 mr-4 border-r border-slate-200 pr-4">
            <button 
              onClick={() => setFontSize(f => Math.max(10, f - 2))}
              className="w-6 h-6 rounded flex items-center justify-center text-slate-500 hover:bg-slate-200 text-xs font-bold"
              title="Decrease Font Size"
            >
              A-
            </button>
            <button 
              onClick={() => setFontSize(f => Math.min(24, f + 2))}
              className="w-6 h-6 rounded flex items-center justify-center text-slate-500 hover:bg-slate-200 text-sm font-bold"
              title="Increase Font Size"
            >
              A+
            </button>
          </div>

          <button 
            onClick={() => setMinimap(!minimap)}
            className={`p-1.5 rounded transition-colors ${minimap ? 'text-primary bg-primary/10' : 'text-slate-500 hover:bg-slate-200'}`}
            title="Toggle Minimap"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button 
            onClick={onReset}
            className="p-1.5 rounded text-slate-500 hover:bg-slate-200 transition-colors"
            title="Reset to Starter Code"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button 
            onClick={handleCopy}
            className="p-1.5 rounded text-slate-500 hover:bg-slate-200 transition-colors"
            title="Copy Code"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>
          <button 
            className="p-1.5 rounded text-slate-500 hover:bg-slate-200 transition-colors ml-1"
            title="Fullscreen (F11)"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <Editor
          height="100%"
          language={MONACO_LANGUAGES[language] || 'javascript'}
          theme="vs-light"
          value={code}
          onChange={onChange}
          options={options}
          loading={
            <div className="flex items-center justify-center h-full text-slate-400 gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              Loading Editor...
            </div>
          }
        />
      </div>
    </div>
  );
};
