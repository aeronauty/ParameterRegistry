import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, Settings } from 'lucide-react';
import { dataService } from './services/dataService';
import { ClassData, Summary } from './types';
import { PairPlot } from './components/PairPlot';
import { DetailPlot } from './components/DetailPlot';
import { DataTable } from './components/DataTable';
import { ResizablePanes } from './components/ResizablePanes';
import { ParameterSelector } from './components/ParameterSelector';
import { BufferSlider } from './components/BufferSlider';
import { DataProcessor } from './utils/dataProcessor';

export const App: React.FC = () => {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [selectedInstance, setSelectedInstance] = useState<string>('');
  const [xParam, setXParam] = useState<string>('');
  const [yParam, setYParam] = useState<string>('');
  const [paramOptions, setParamOptions] = useState<string[]>([]);
  const [availableParameters, setAvailableParameters] = useState<string[]>([]);
  const [selectedParameters, setSelectedParameters] = useState<string[]>([]);
  const [isParameterSelectorOpen, setIsParameterSelectorOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [plotBuffer, setPlotBuffer] = useState<number>(10); // Default 10% buffer

  // Create instance-to-color mapping when classData changes
  const instanceColorMap = useMemo(() => {
    if (!classData) return {};
    
    const allInstances = Object.keys(classData.instances).sort(); // Sort for repeatability
    const colors = [
      '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
      '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'
    ];
    
    const colorMap: { [instance: string]: string } = {};
    allInstances.forEach((instance, index) => {
      colorMap[instance] = colors[index % colors.length];
    });
    
    return colorMap;
  }, [classData]);

  // Load summary data on mount
  useEffect(() => {
    const loadSummary = async () => {
      try {
        setLoading(true);
        const summaryData = await dataService.fetchSummary();
        setSummary(summaryData);
        if (summaryData.classes.length > 0) {
          setSelectedClass(summaryData.classes[0]);
        }
      } catch (err) {
        setError(`Failed to load data: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    loadSummary();
  }, []);

  // Load class data when class selection changes
  useEffect(() => {
    const loadClassData = async () => {
      if (!selectedClass) return;

      try {
        setLoading(true);
        const data = await dataService.fetchClassData(selectedClass);
        setClassData(data);
        
        // Update parameter options
        const { dataRows } = DataProcessor.processClassDataForTableWithSeparateStats(data);
        const numericCols = DataProcessor.getNumericColumns(dataRows);
        setParamOptions(numericCols);
        setAvailableParameters(numericCols);
        
        // Initialize selected parameters with all available parameters
        setSelectedParameters(numericCols);
        
        // Reset selections
        setSelectedInstance('');
        setXParam('');
        setYParam('');
      } catch (err) {
        setError(`Failed to load class data: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    loadClassData();
  }, [selectedClass]);

  const handlePairPlotClick = (data: { x_param: string; y_param: string; instance: string }) => {
    setXParam(data.x_param);
    setYParam(data.y_param);
    setSelectedInstance(data.instance);
  };

  const handleDetailPlotClick = (instance: string) => {
    setSelectedInstance(instance);
  };

  const handleRowSelection = (instance: string) => {
    setSelectedInstance(instance);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading parameter registry...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!summary || !classData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">No data available</p>
      </div>
    );
  }

    // Generate table data for display
  const { dataRows, statisticalRows } = DataProcessor.processClassDataForTableWithSeparateStats(classData);
  
  // Debug: Log table data structure
  // console.log('Data Rows Sample:', dataRows.slice(0, 2));
  // console.log('Statistical Rows:', statisticalRows);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 text-center">
            Parameter Registry - Interactive Explorer
          </h1>
        </div>
      </header>

      {/* Controls */}
      <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Class Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Equipment Class
              </label>
              <div className="relative">
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md bg-white pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {summary?.classes.map(cls => (
                    <option key={cls} value={cls}>
                      {cls.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Parameter Selection Button */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parameters
              </label>
              <button
                onClick={() => setIsParameterSelectorOpen(true)}
                className="w-full p-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between transition-colors"
              >
                <span className="text-gray-700">
                  {selectedParameters.length === availableParameters.length 
                    ? 'All parameters' 
                    : `${selectedParameters.length} of ${availableParameters.length} selected`
                  }
                </span>
                <Settings className="h-4 w-4 text-gray-400" />
              </button>
            </div>

            {/* X Parameter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                X-axis Parameter
              </label>
              <div className="relative">
                <select
                  value={xParam}
                  onChange={(e) => setXParam(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md bg-white pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select parameter...</option>
                  {paramOptions.map(param => (
                    <option key={param} value={param}>{param}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Y Parameter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Y-axis Parameter
              </label>
              <div className="relative">
                <select
                  value={yParam}
                  onChange={(e) => setYParam(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md bg-white pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select parameter...</option>
                  {paramOptions.map(param => (
                    <option key={param} value={param}>{param}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Plot Buffer Slider */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plot Buffer
              </label>
              <BufferSlider
                value={plotBuffer}
                onChange={setPlotBuffer}
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="h-[600px] mb-6">
          <ResizablePanes
            leftPane={
              <div className="bg-white rounded-lg shadow p-4 h-full">
                <h2 className="text-lg font-semibold mb-3 text-center">Parameter Pair Plot</h2>
                <div className="h-[calc(100%-3rem)]">
                  <PairPlot
                    classData={classData}
                    className={selectedClass}
                    selectedParameters={selectedParameters}
                    onPlotClick={handlePairPlotClick}
                    instanceColorMap={instanceColorMap}
                    plotBuffer={plotBuffer}
                  />
                </div>
              </div>
            }
            rightPane={
              <div className="bg-white rounded-lg shadow p-4 h-full ml-2">
                <h2 className="text-lg font-semibold mb-3 text-center">Detail View</h2>
                <div className="h-[calc(100%-3rem)]">
                  <DetailPlot
                    classData={classData}
                    xParam={xParam}
                    yParam={yParam}
                    className={selectedClass}
                    onPointClick={handleDetailPlotClick}
                    instanceColorMap={instanceColorMap}
                    plotBuffer={plotBuffer}
                  />
                </div>
              </div>
            }
            initialLeftWidth={65}
            minLeftWidth={20}
            maxLeftWidth={80}
            collapseThreshold={90}
          />
        </div>

        {/* Data Table */}
        <div className="mt-6">
          <div className="bg-white rounded-lg shadow p-6">
            <DataTable
              data={dataRows}
              selectedInstance={selectedInstance}
              onRowSelection={handleRowSelection}
              title={`${selectedClass.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} - Parameter Values`}
              pinnedBottomRowData={statisticalRows}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center text-gray-600">
            <p>Parameter Registry v{summary.metadata.version}</p>
            <p className="text-sm mt-1">Interactive Equipment Data Explorer</p>
          </div>
        </div>
      </footer>

      {/* Parameter Selector Modal */}
      <ParameterSelector
        availableParameters={availableParameters}
        selectedParameters={selectedParameters}
        onSelectionChange={setSelectedParameters}
        isOpen={isParameterSelectorOpen}
        onClose={() => setIsParameterSelectorOpen(false)}
      />
    </div>
  );
};
