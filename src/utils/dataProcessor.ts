import { ClassData } from '../types';

export interface TableRow {
  instance: string;
  [key: string]: any;
}

export class DataProcessor {
  static processClassDataForTable(classData: ClassData): TableRow[] {
    const instances = Object.keys(classData.instances);
    if (instances.length === 0) return [];

    // Get all unique parameters across all instances
    const allParameters = new Set<string>();
    Object.values(classData.instances).forEach(instance => {
      Object.keys(instance).forEach(param => allParameters.add(param));
    });

    // Build table rows
    return instances.map(instanceName => {
      const row: TableRow = { instance: instanceName };
      const instanceData = classData.instances[instanceName];
      const instanceMetadata = classData.metadata[instanceName] || {};

      allParameters.forEach(param => {
        if (instanceData[param] !== undefined) {
          const metadata = instanceMetadata[param];
          const unit = metadata?.unit || '';
          const cleanName = param.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          const columnName = unit ? `${cleanName} (${unit})` : cleanName;
          row[columnName] = instanceData[param];
        }
      });

      return row;
    });
  }

  static getNumericColumns(rows: TableRow[]): string[] {
    if (rows.length === 0) return [];
    
    const firstRow = rows[0];
    return Object.keys(firstRow).filter(col => {
      if (col === 'instance') return false;
      const value = firstRow[col];
      return typeof value === 'number' && !isNaN(value);
    });
  }

  static processDataForPlotly(
    classData: ClassData,
    xParam: string,
    yParam: string
  ): {
    x: number[];
    y: number[];
    text: string[];
    customdata: string[][];
  } {
    const instances = Object.keys(classData.instances);
    const x: number[] = [];
    const y: number[] = [];
    const text: string[] = [];
    const customdata: string[][] = [];

    instances.forEach(instanceName => {
      const instanceData = classData.instances[instanceName];
      
      // Extract the base parameter name from the formatted column name
      // e.g., "Capacity (mj)" -> "capacity"
      const extractParamName = (paramDisplay: string) => {
        return paramDisplay
          .split('(')[0] // Remove unit part
          .trim()
          .toLowerCase()
          .replace(/\s+/g, '_'); // Convert spaces back to underscores
      };

      const xBaseParam = extractParamName(xParam);
      const yBaseParam = extractParamName(yParam);

      // Find matching parameters in instance data
      const xKey = Object.keys(instanceData).find(key => 
        key.toLowerCase() === xBaseParam ||
        key.toLowerCase().includes(xBaseParam) ||
        xBaseParam.includes(key.toLowerCase())
      );
      const yKey = Object.keys(instanceData).find(key => 
        key.toLowerCase() === yBaseParam ||
        key.toLowerCase().includes(yBaseParam) ||
        yBaseParam.includes(key.toLowerCase())
      );

      if (xKey && yKey && 
          typeof instanceData[xKey] === 'number' && 
          typeof instanceData[yKey] === 'number') {
        x.push(instanceData[xKey]);
        y.push(instanceData[yKey]);
        text.push(instanceName);
        customdata.push([xParam, yParam, instanceName]);
      }
    });

    return { x, y, text, customdata };
  }

  static createPairPlotData(classData: ClassData, selectedParameters?: string[], instanceColorMap?: { [instance: string]: string }, plotBuffer: number = 10) {
    const tableData = this.processClassDataForTable(classData);
    const allNumericColumns = this.getNumericColumns(tableData);
    
    // Use selected parameters if provided, otherwise use all numeric columns
    const numericColumns = selectedParameters && selectedParameters.length > 0 
      ? selectedParameters.filter(param => allNumericColumns.includes(param))
      : allNumericColumns;
    
    if (numericColumns.length < 2) {
      return { data: [], layout: {}, numericColumns: allNumericColumns };
    }

    const n = numericColumns.length;
    const traces: any[] = [];

    // Generate color palette - use provided map or fallback
    const instances = tableData.map(row => row.instance);
    const uniqueInstances = Array.from(new Set(instances));
    
    // Use provided color map or create fallback  
    const getInstanceColor = (instance: string) => {
      if (instanceColorMap && instanceColorMap[instance]) {
        return instanceColorMap[instance];
      }
      // Fallback to default colors
      const defaultColors = [
        '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
        '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'
      ];
      const index = uniqueInstances.indexOf(instance);
      return defaultColors[index % defaultColors.length];
    };

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const xCol = numericColumns[j];
        const yCol = numericColumns[i];

        if (i === j) {
          // Diagonal: histogram
          const histData = tableData.map(row => row[xCol]).filter(v => v != null && typeof v === 'number');
          
          if (histData.length > 0) {
            traces.push({
              type: 'histogram',
              x: histData,
              marker: { color: 'lightblue', opacity: 0.7 },
              showlegend: false,
              xaxis: `x${i * n + j + 1}`,
              yaxis: `y${i * n + j + 1}`
            });
          }
        } else {
          // Off-diagonal: scatter plot
          const xData = tableData.map(row => row[xCol]);
          const yData = tableData.map(row => row[yCol]);
          
          const instanceColors = instances.map(instance => 
            getInstanceColor(instance)
          );

          traces.push({
            type: 'scatter',
            mode: 'markers',
            x: xData,
            y: yData,
            text: instances,
            marker: { color: instanceColors, size: 8 },
            showlegend: false,
            xaxis: `x${i * n + j + 1}`,
            yaxis: `y${i * n + j + 1}`,
            hovertemplate: `%{text}<br>${xCol}: %{x}<br>${yCol}: %{y}<extra></extra>`,
            customdata: instances.map(instance => [xCol, yCol, instance])
          });
        }
      }
    }

    // Create subplot layout
    const layout: any = {
      title: 'Parameter Relationships',
      showlegend: true,
      height: 600,
      font: { size: 10 },
      plot_bgcolor: 'white',
      paper_bgcolor: 'white',
      margin: { t: 60, r: 30, b: 60, l: 60 },
    };

    // Calculate ranges for each parameter to ensure consistent scales
    const paramRanges: { [key: string]: { min: number; max: number } } = {};
    numericColumns.forEach(col => {
      const allValues = tableData.map(row => row[col]).filter(v => v != null && typeof v === 'number');
      if (allValues.length > 0) {
        const min = Math.min(...allValues);
        const max = Math.max(...allValues);
        const padding = (max - min) * (plotBuffer / 100); // Use plotBuffer percentage
        paramRanges[col] = { 
          min: min - padding, 
          max: max + padding 
        };
      }
    });

    // Add axis definitions with proper spacing and shared axes
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const axisNum = i * n + j + 1;
        const xAxisKey = axisNum === 1 ? 'xaxis' : `xaxis${axisNum}`;
        const yAxisKey = axisNum === 1 ? 'yaxis' : `yaxis${axisNum}`;

        const xParam = numericColumns[j];
        const yParam = numericColumns[i];

        layout[xAxisKey] = {
          domain: [j / n + 0.01, (j + 1) / n - 0.01],
          anchor: `y${axisNum}`,
          showgrid: false,
          showline: i === n - 1, // Only show axis line on bottom row
          linewidth: 1,
          linecolor: 'black',
          title: i === n - 1 ? numericColumns[j] : undefined,
          titlefont: { size: 10 },
          showticklabels: i === n - 1, // Only show tick labels on bottom row
          tickfont: { size: 8 },
          range: paramRanges[xParam] ? [paramRanges[xParam].min, paramRanges[xParam].max] : undefined
        };

        layout[yAxisKey] = {
          domain: [(n - i - 1) / n + 0.01, (n - i) / n - 0.01],
          anchor: `x${axisNum}`,
          showgrid: false,
          showline: j === 0, // Only show axis line on leftmost column
          linewidth: 1,
          linecolor: 'black',
          title: j === 0 ? numericColumns[i] : undefined,
          titlefont: { size: 10 },
          showticklabels: j === 0, // Only show tick labels on leftmost column
          tickfont: { size: 8 },
          range: i === j ? [0, undefined] : (paramRanges[yParam] ? [paramRanges[yParam].min, paramRanges[yParam].max] : undefined)
        };
      }
    }

    return { data: traces, layout, numericColumns: allNumericColumns };
  }
}
