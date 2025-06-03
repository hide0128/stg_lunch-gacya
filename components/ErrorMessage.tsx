
import React from 'react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <div className="my-8 p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 rounded-lg text-center" role="alert">
      <p className="font-semibold">おっと、問題が発生しました！</p>
      <p className="text-sm mb-3">{message}</p>
      {onRetry && (
         <button
            onClick={onRetry}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
          >
            再試行
          </button>
      )}
    </div>
  );
};

export default ErrorMessage;
