import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

export const InterviewSession = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center p-6">
      <div className="max-w-md space-y-6">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <span className="text-4xl">🎙️</span>
        </div>
        <h1 className="text-3xl font-bold text-primary">Interview Room</h1>
        <p className="text-text-secondary">
          Session ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{sessionId}</span>
        </p>
        <div className="bg-yellow-50 text-yellow-800 p-4 rounded-xl border border-yellow-200">
          <p className="font-medium">AI interview logic has not been implemented yet.</p>
          <p className="text-sm mt-1">This phase focused purely on setup and session creation.</p>
        </div>
        <Button onClick={() => navigate('/dashboard')} className="w-full">
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
};
