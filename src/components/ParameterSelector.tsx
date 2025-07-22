import React, { useState, useEffect } from 'react';
import { X, Check, Settings } from 'lucide-react';

interface ParameterSelectorProps {
  availableParameters: string[];
  selectedParameters: string[];
  onSelectionChange: (selected: string[]) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const ParameterSelector: React.FC<ParameterSelectorProps> = ({
  availableParameters,
  selectedParameters,
  onSelectionChange,
  isOpen,
  onClose
}) => {
  const [tempSelection, setTempSelection] = useState<string[]>(selectedParameters);

  useEffect(() => {
    setTempSelection(selectedParameters);
  }, [selectedParameters, isOpen]);

  const handleToggleParameter = (parameter: string) => {
    setTempSelection(prev => 
      prev.includes(parameter)
        ? prev.filter(p => p !== parameter)
        : [...prev, parameter]
    );
  };

  const handleSelectAll = () => {
    setTempSelection([...availableParameters]);
  };

  const handleDeselectAll = () => {
    setTempSelection([]);
  };

  const handleApply = () => {
    onSelectionChange(tempSelection);
    onClose();
  };

  const handleCancel = () => {
    setTempSelection(selectedParameters);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full m-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold">Select Parameters</h2>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-sm text-gray-600 mb-4">
            Choose which parameters to include in the pair plot. At least 2 parameters must be selected.
          </p>

          {/* Select/Deselect All */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={handleSelectAll}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            >
              Select All
            </button>
            <button
              onClick={handleDeselectAll}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              Deselect All
            </button>
            <div className="ml-auto text-sm text-gray-600">
              {tempSelection.length} of {availableParameters.length} selected
            </div>
          </div>

          {/* Parameter List */}
          <div className="space-y-2">
            {availableParameters.map(parameter => (
              <label
                key={parameter}
                className={`
                  flex items-center p-3 rounded-lg border cursor-pointer transition-all
                  ${tempSelection.includes(parameter)
                    ? 'bg-blue-50 border-blue-200 text-blue-900'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }
                `}
              >
                <div className="flex items-center">
                  <div className={`
                    w-5 h-5 rounded border-2 flex items-center justify-center mr-3 transition-colors
                    ${tempSelection.includes(parameter)
                      ? 'bg-blue-600 border-blue-600'
                      : 'border-gray-300'
                    }
                  `}>
                    {tempSelection.includes(parameter) && (
                      <Check className="h-3 w-3 text-white" />
                    )}
                  </div>
                  <span className="font-medium">{parameter}</span>
                </div>
                <input
                  type="checkbox"
                  checked={tempSelection.includes(parameter)}
                  onChange={() => handleToggleParameter(parameter)}
                  className="sr-only"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            {tempSelection.length < 2 && (
              <span className="text-red-600">⚠ At least 2 parameters required</span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={tempSelection.length < 2}
              className={`
                px-4 py-2 rounded-md transition-colors
                ${tempSelection.length >= 2
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
