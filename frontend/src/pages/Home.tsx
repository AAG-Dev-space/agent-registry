import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to agents page (main page like mcpserverhub)
    navigate('/agents');
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Redirecting...</p>
    </div>
  );
}
