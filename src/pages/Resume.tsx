import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { UploadCloud, FileText, CheckCircle, Trash2, FileOutput, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { api } from '../lib/api';
import { cn } from '../utils/cn';

interface ResumeData {
  fileName: string;
  uploadedAt: string;
  extractedText: string;
}

export const Resume = () => {
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchResume = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/resume');
      if (response.data.success) {
        setResumeData(response.data.resume);
      }
    } catch (error: any) {
      if (error.response?.status !== 404) {
        toast.error('Failed to load resume');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResume();
  }, []);

  const handleFile = async (file: File) => {
    if (file.type !== 'application/pdf') {
      toast.error('Please upload a valid PDF file.');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File exceeds the 5MB limit.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('resume', file);

    try {
      // Simulate progress for UI UX since actual local upload is instant
      const interval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const response = await api.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      clearInterval(interval);
      setUploadProgress(100);

      if (response.data.success) {
        toast.success('Resume uploaded and processed successfully!');
        setResumeData(response.data.resume);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload resume');
      setUploadProgress(0);
    } finally {
      setTimeout(() => setIsUploading(false), 500); // allow progress bar to show 100%
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete your resume? This will affect your AI interviews.')) return;
    
    try {
      const response = await api.delete('/resume');
      if (response.data.success) {
        setResumeData(null);
        toast.success('Resume deleted');
      }
    } catch (error) {
      toast.error('Failed to delete resume');
    }
  };

  if (isLoading) {
    return <div className="animate-pulse flex items-center gap-2 text-primary"><Loader2 className="animate-spin" /> Loading resume data...</div>;
  }

  return (
    <div className="max-w-4xl animate-in fade-in duration-500 pb-20">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">Resume Intelligence</h1>
          <p className="text-text-secondary">Upload your latest resume to tailor your AI interviews to your exact experience.</p>
        </div>
      </div>

      {!resumeData && (
        <div 
          className={cn(
            "bg-white border-2 border-dashed rounded-2xl p-12 text-center transition-all",
            isDragging ? "border-accent bg-accent/5" : "border-border hover:border-gray-400",
            isUploading ? "pointer-events-none opacity-80" : ""
          )}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="application/pdf"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFile(e.target.files[0]);
              }
            }}
          />
          
          <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
            {isUploading ? (
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            ) : (
              <UploadCloud className="w-10 h-10 text-primary" />
            )}
          </div>
          
          {isUploading ? (
            <div className="max-w-md mx-auto">
              <h3 className="text-xl font-bold text-primary mb-2">Extracting Text...</h3>
              <p className="text-text-secondary mb-4">Our AI is parsing your PDF document.</p>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-accent transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <>
              <h3 className="text-xl font-bold text-primary mb-2">Upload your Resume</h3>
              <p className="text-text-secondary mb-6 max-w-md mx-auto">
                Drag and drop your PDF resume here, or click to browse. Maximum file size is 5MB.
              </p>
              <Button>Select PDF File</Button>
            </>
          )}
        </div>
      )}

      {resumeData && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-border shadow-sm p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-primary truncate">{resumeData.fileName}</h3>
                <p className="text-sm text-text-secondary flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-success" /> Processed successfully on {new Date(resumeData.uploadedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
              <Button variant="secondary" onClick={() => fileInputRef.current?.click()} className="flex-1 sm:flex-none">
                Replace
              </Button>
              <Button className="text-error border-error/20 hover:bg-error/5 flex-1 sm:flex-none" onClick={handleDelete}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            {/* Hidden input for replacing */}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="application/pdf"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFile(e.target.files[0]);
                }
              }}
            />
          </div>

          <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col">
            <div className="bg-gray-50 border-b border-border p-4 flex items-center gap-2">
              <FileOutput className="w-5 h-5 text-text-secondary" />
              <h3 className="font-bold text-primary text-sm">Extracted Text Content</h3>
              <span className="ml-auto text-xs bg-primary/10 text-primary px-2 py-1 rounded-md font-medium">Debug View</span>
            </div>
            <div className="p-4 bg-[#1E1E1E] overflow-x-auto max-h-[500px]">
              <pre className="text-gray-300 text-sm font-mono whitespace-pre-wrap leading-relaxed">
                {resumeData.extractedText}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
