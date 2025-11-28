import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingProps {
  isLoading: boolean;
  children: React.ReactNode;
}

const Loading: React.FC<LoadingProps> = ({ isLoading, children }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
};

export default Loading;
