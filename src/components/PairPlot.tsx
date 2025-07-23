import React, { useRef, useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import { ClassData } from '../types';
import { DataProcessor } from '../utils/dataProcessor';

interface PairPlotProps {
  classData: ClassData;
  className: string;
  selectedParameters?: string[];
  onPlotClick?: (data: { x_param: string; y_param: string; instance: string }) => void;
  instanceColorMap: { [instance: string]: string };
  plotBuffer?: number;
}

export const PairPlot: React.FC<PairPlotProps> = ({ classData, className, selectedParameters, onPlotClick, instanceColorMap, plotBuffer = 10 }) => {
  const { data, layout, numericColumns } = DataProcessor.createPairPlotData(classData, selectedParameters, instanceColorMap, plotBuffer);
  const containerRef = useRef<HTMLDivElement>(null);
  const plotRef = useRef<any>(null);
  const [plotRevision, setPlotRevision] = useState(0);

  // Set up resize observer to trigger plot resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      // Force Plotly to relayout
      setTimeout(() => {
        if (plotRef.current) {
          plotRef.current.resizeHandler();
        }
        setPlotRevision(prev => prev + 1);
      }, 100);
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Also trigger resize when selectedParameters changes
  useEffect(() => {
    setPlotRevision(prev => prev + 1);
  }, [selectedParameters]);

  if (numericColumns.length < 2) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500">
        <div className="text-center">
          <p className="text-lg">Insufficient numeric data for pair plot</p>
          <p className="text-sm">Need at least 2 numeric parameters</p>
        </div>
      </div>
    );
  }

  const handlePlotClick = (event: any) => {
    if (!onPlotClick || !event.points || event.points.length === 0) return;

    const point = event.points[0];
    
    try {
      // Extract parameter info from customdata or trace info
      if (point.customdata && point.customdata.length >= 3) {
        const [x_param, y_param, instance] = point.customdata;
        if (x_param !== y_param) { // Skip diagonal plots
          onPlotClick({ x_param, y_param, instance });
        }
      }
    } catch (error) {
      console.warn('Error handling plot click:', error);
    }
  };

  const plotLayout = {
    ...layout,
    title: `Parameter Relationships: ${className.replace(/_/g, ' ').toUpperCase()}`,
    margin: { t: 60, r: 30, b: 60, l: 60 },
    autosize: true,
    datarevision: plotRevision,
  };

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col">
      <div className="flex-1 min-h-0">
        <Plot
          ref={plotRef}
          data={data}
          layout={plotLayout}
          config={{
            responsive: true,
            displayModeBar: true,
            modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
          }}
          onClick={handlePlotClick}
          style={{ width: '100%', height: '100%' }}
          useResizeHandler={true}
        />
      </div>
    </div>
  );
};
