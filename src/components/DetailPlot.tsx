import React, { useRef, useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import { ClassData } from '../types';
import { DataProcessor } from '../utils/dataProcessor';

interface DetailPlotProps {
  classData: ClassData;
  xParam: string;
  yParam: string;
  className: string;
  onPointClick?: (instance: string) => void;
}

export const DetailPlot: React.FC<DetailPlotProps> = ({ 
  classData, 
  xParam, 
  yParam, 
  onPointClick 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const plotRef = useRef<any>(null);
  const [plotRevision, setPlotRevision] = useState(0);
  const [plotDimensions, setPlotDimensions] = useState({ width: 0, height: 0 });

  // Set up resize observer to trigger plot resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      const rect = container.getBoundingClientRect();
      setPlotDimensions({ width: rect.width, height: rect.height });
      
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

  // Also trigger resize when xParam or yParam changes
  useEffect(() => {
    setPlotRevision(prev => prev + 1);
  }, [xParam, yParam]);

  if (!xParam || !yParam) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500">
        <p>Select parameters from the dropdown menus above</p>
      </div>
    );
  }

  const { x, y, text, customdata } = DataProcessor.processDataForPlotly(classData, xParam, yParam);

  if (x.length === 0 || y.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500">
        <p>No data available for selected parameters</p>
      </div>
    );
  }

  const handlePointClick = (event: any) => {
    if (!onPointClick || !event.points || event.points.length === 0) return;

    const point = event.points[0];
    if (point.text) {
      onPointClick(point.text);
    }
  };

  // Generate consistent colors
  const uniqueInstances = Array.from(new Set(text));
  const colors = [
    '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
    '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'
  ];
  const instanceColors = text.map(instance => 
    colors[uniqueInstances.indexOf(instance) % colors.length]
  );

  const data = [{
    type: 'scatter' as const,
    mode: 'markers+text' as const,
    x: x,
    y: y,
    text: text,
    textposition: 'top center' as const,
    marker: {
      color: instanceColors,
      size: 12,
      line: { width: 1, color: 'white' }
    },
    hovertemplate: `%{text}<br>${xParam}: %{x}<br>${yParam}: %{y}<extra></extra>`,
    customdata: customdata
  }] as any;

  const layout = {
    title: `${yParam} vs ${xParam}`,
    xaxis: {
      title: xParam,
      showgrid: false,
      showline: true,
      linewidth: 1,
      linecolor: 'black',
      zeroline: false
    },
    yaxis: {
      title: yParam,
      showgrid: false,
      showline: true,
      linewidth: 1,
      linecolor: 'black',
      zeroline: false
    },
    plot_bgcolor: 'white',
    paper_bgcolor: 'white',
    font: { size: 12 },
    margin: { t: 60, r: 20, b: 60, l: 60 },
    showlegend: false,
    autosize: true,
    datarevision: plotRevision,
  };

  return (
    <div ref={containerRef} className="w-full h-full">
      <Plot
        ref={plotRef}
        data={data}
        layout={layout}
        config={{
          responsive: true,
          displayModeBar: true,
          modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
        }}
        onClick={handlePointClick}
        style={{ width: '100%', height: '100%' }}
        useResizeHandler={true}
      />
    </div>
  );
};
