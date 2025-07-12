import React from 'react';
import { AlertCircle, CheckCircle, XCircle, Info } from 'lucide-react';

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
}

const Alert: React.FC<AlertProps> = ({ type, message, onClose }) => {
  const config = {
    success: {
      bgColor: 'bg-green-50',
      textColor: 'text-green-800',
      borderColor: 'border-green-200',
      icon: CheckCircle
    },
    error: {
      bgColor: 'bg-red-50',
      textColor: 'text-red-800',
      borderColor: 'border-red-200',
      icon: XCircle
    },
    warning: {
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-800',
      borderColor: 'border-yellow-200',
      icon: AlertCircle
    },
    info: {
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-800',
      borderColor: 'border-blue-200',
      icon: Info
    }
  };

  const { bgColor, textColor, borderColor, icon: Icon } = config[type];

  return (
    <div className={`border rounded-lg p-4 ${bgColor} ${borderColor}`}>
      <div className="flex items-center">
        <Icon className={`h-5 w-5 ${textColor} mr-3`} />
        <span className={`text-sm font-medium ${textColor}`}>
          {message}
        </span>
        {onClose && (
          <button
            onClick={onClose}
            className={`ml-auto ${textColor} hover:opacity-75`}
          >
            <XCircle className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;