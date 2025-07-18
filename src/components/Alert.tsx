import React, { useEffect, useState } from 'react';

interface AlertProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Alert: React.FC<AlertProps> = ({ message, type, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg text-white flex items-center justify-between max-w-sm w-full z-50 ${
        type === 'success' ? 'bg-purple-600' : 'bg-purple-800'
      }`}
    >
      <span>{message}</span>
      <button
        onClick={() => {
          setIsVisible(false);
          onClose();
        }}
        className="ml-4 text-white hover:text-gray-200"
      >
        ✕
      </button>
    </div>
  );
};

export default Alert;