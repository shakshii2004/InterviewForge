import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';
import { GripVertical, GripHorizontal } from 'lucide-react';

interface ResizableLayoutProps {
  leftPanel: ReactNode;
  topRightPanel: ReactNode;
  bottomRightPanel: ReactNode;
}

export const ResizableLayout = ({ leftPanel, topRightPanel, bottomRightPanel }: ResizableLayoutProps) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) {
    return (
      <div className="flex flex-col h-full overflow-y-auto">
        <div className="h-[50vh] min-h-[400px] border-b border-slate-200">
          {leftPanel}
        </div>
        <div className="h-[60vh] min-h-[500px] border-b border-slate-200">
          {topRightPanel}
        </div>
        <div className="h-[30vh] min-h-[250px]">
          {bottomRightPanel}
        </div>
      </div>
    );
  }

  return (
    <PanelGroup orientation="horizontal" className="h-full w-full">
      <Panel defaultSize={40} minSize={30}>
        {leftPanel}
      </Panel>
      
      <PanelResizeHandle className="w-2 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center cursor-col-resize group">
        <div className="h-8 w-1 bg-slate-300 rounded-full group-hover:bg-primary transition-colors flex items-center justify-center">
          <GripVertical className="w-3 h-3 text-white opacity-0 group-hover:opacity-100" />
        </div>
      </PanelResizeHandle>
      
      <Panel defaultSize={60} minSize={40}>
        <PanelGroup orientation="vertical">
          <Panel defaultSize={70} minSize={30}>
            {topRightPanel}
          </Panel>
          
          <PanelResizeHandle className="h-2 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center cursor-row-resize group relative z-10">
            <div className="w-8 h-1 bg-slate-300 rounded-full group-hover:bg-primary transition-colors flex items-center justify-center">
              <GripHorizontal className="w-3 h-3 text-white opacity-0 group-hover:opacity-100" />
            </div>
          </PanelResizeHandle>
          
          <Panel defaultSize={30} minSize={10}>
            {bottomRightPanel}
          </Panel>
        </PanelGroup>
      </Panel>
    </PanelGroup>
  );
};
