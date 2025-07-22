import React from 'react';

interface BufferSliderProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
}

export const BufferSlider: React.FC<BufferSliderProps> = ({ 
  value, 
  onChange, 
  label = "Plot Buffer" 
}) => {
  return (
    <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
      <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
        {label}:
      </label>
      <div className="flex-1 min-w-0">
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${value}%, #e5e7eb ${value}%, #e5e7eb 100%)`
          }}
        />
      </div>
      <span className="text-sm font-mono text-gray-600 w-12 text-right">
        {value}%
      </span>
    </div>
  );
};
