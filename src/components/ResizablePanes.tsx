import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ResizablePanesProps {
  leftPane: React.ReactNode;
  rightPane: React.ReactNode;
  initialLeftWidth?: number; // percentage (0-100)
  minLeftWidth?: number; // percentage
  maxLeftWidth?: number; // percentage
  collapseThreshold?: number; // percentage - when to auto-collapse
  className?: string;
}

export const ResizablePanes: React.FC<ResizablePanesProps> = ({
  leftPane,
  rightPane,
  initialLeftWidth = 60,
  minLeftWidth = 10,
  maxLeftWidth = 90,
  collapseThreshold = 90,
  className = ''
}) => {
  const [leftWidth, setLeftWidth] = useState(initialLeftWidth);
  const [isDragging, setIsDragging] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [lastValidWidth, setLastValidWidth] = useState(initialLeftWidth);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const mouseX = e.clientX - containerRect.left;
    
    const newLeftWidth = (mouseX / containerWidth) * 100;
    
    // Handle collapsing logic
    if (newLeftWidth >= collapseThreshold) {
      setIsRightCollapsed(true);
      setIsLeftCollapsed(false);
      setLeftWidth(100);
    } else if (newLeftWidth <= (100 - collapseThreshold)) {
      setIsLeftCollapsed(true);
      setIsRightCollapsed(false);
      setLeftWidth(0);
    } else {
      // Normal resize
      setIsRightCollapsed(false);
      setIsLeftCollapsed(false);
      const clampedWidth = Math.max(minLeftWidth, Math.min(maxLeftWidth, newLeftWidth));
      setLeftWidth(clampedWidth);
      setLastValidWidth(clampedWidth);
    }
  }, [isDragging, minLeftWidth, maxLeftWidth, collapseThreshold]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const expandLeftPane = useCallback(() => {
    setIsLeftCollapsed(false);
    setIsRightCollapsed(false);
    setLeftWidth(lastValidWidth);
  }, [lastValidWidth]);

  const expandRightPane = useCallback(() => {
    setIsRightCollapsed(false);
    setIsLeftCollapsed(false);
    setLeftWidth(lastValidWidth);
  }, [lastValidWidth]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div 
      ref={containerRef}
      className={`flex h-full relative ${className}`}
    >
      {/* Left Pane */}
      <div 
        style={{ width: isLeftCollapsed ? '0%' : `${leftWidth}%` }}
        className={`overflow-hidden transition-all duration-300 ${isLeftCollapsed ? 'hidden' : ''}`}
      >
        {leftPane}
      </div>

      {/* Left Collapsed Side Panel */}
      {isLeftCollapsed && (
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10">
          <button
            onClick={expandLeftPane}
            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-r-md shadow-lg transition-colors"
            title="Show left panel"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Resizer */}
      {!isLeftCollapsed && !isRightCollapsed && (
        <div
          className={`
            w-1 bg-gray-300 hover:bg-blue-500 cursor-col-resize flex-shrink-0 relative
            transition-colors duration-150 group
            ${isDragging ? 'bg-blue-500' : ''}
          `}
          onMouseDown={handleMouseDown}
        >
          {/* Visual indicator */}
          <div className="absolute inset-y-0 -left-1 -right-1 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-0.5 h-8 bg-white rounded-full shadow-sm"></div>
          </div>
        </div>
      )}

      {/* Right Pane */}
      <div 
        style={{ width: isRightCollapsed ? '0%' : `${100 - leftWidth}%` }}
        className={`overflow-hidden transition-all duration-300 ${isRightCollapsed ? 'hidden' : ''}`}
      >
        {rightPane}
      </div>

      {/* Right Collapsed Side Panel */}
      {isRightCollapsed && (
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10">
          <button
            onClick={expandRightPane}
            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-l-md shadow-lg transition-colors"
            title="Show right panel"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};
