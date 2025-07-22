import React from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { ColDef } from 'ag-grid-community';

interface DataTableProps {
  data: any[];
  selectedInstance?: string;
  onRowSelection?: (instance: string) => void;
  title?: string;
}

export const DataTable: React.FC<DataTableProps> = ({
  data,
  selectedInstance,
  onRowSelection,
  title = "Data Table"
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No data available
      </div>
    );
  }

  // Generate column definitions from data
  const columnDefs: ColDef[] = Object.keys(data[0]).map((key) => {
    const colDef: ColDef = {
      headerName: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      field: key,
      sortable: true,
      filter: true,
      resizable: true,
      // Use flex for auto-sizing but with minimum constraints
      flex: 1,
      minWidth: key === 'instance' ? 150 : 120,
      maxWidth: 300
    };

    // Debug: Log column definition
    // console.log('Column definition for', key, ':', colDef);

    // Format specific column types
    if (key.toLowerCase().includes('cost') || key.toLowerCase().includes('usd')) {
      colDef.valueFormatter = (params) => {
        if (typeof params.value === 'number') {
          return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0
          }).format(params.value);
        }
        return params.value;
      };
    } else if (key.toLowerCase().includes('efficiency') || key.toLowerCase().includes('ratio')) {
      colDef.valueFormatter = (params) => {
        if (typeof params.value === 'number') {
          return new Intl.NumberFormat('en-US', {
            style: 'percent',
            minimumFractionDigits: 1
          }).format(params.value);
        }
        return params.value;
      };
    } else if (typeof data[0][key] === 'number') {
      colDef.valueFormatter = (params) => {
        if (typeof params.value === 'number') {
          return new Intl.NumberFormat('en-US').format(params.value);
        }
        return params.value;
      };
    }

    return colDef;
  });

  // Debug: Log final column definitions and data
  // console.log('Final columnDefs:', columnDefs);
  // console.log('Data sample:', data.slice(0, 2));

  const onSelectionChanged = (event: any) => {
    const selectedRows = event.api.getSelectedRows();
    if (selectedRows.length > 0 && onRowSelection) {
      // Don't allow selection of statistical summary rows
      const instance = selectedRows[0].instance;
      if (!instance.includes('📊') && !instance.includes('📈')) {
        onRowSelection(instance);
      }
    }
  };

  // Custom row class function to highlight statistical rows
  const getRowClass = (params: any) => {
    if (params.data.instance && (params.data.instance.includes('📊') || params.data.instance.includes('📈'))) {
      return 'statistical-row';
    }
    return '';
  };

  // Check if row is selectable (not a statistical summary)
  const isRowSelectable = (rowNode: any) => {
    const instance = rowNode.data.instance;
    return !instance.includes('📊') && !instance.includes('📈');
  };

  return (
    <div className="w-full">
      <style>
        {`
          .statistical-row {
            background-color: #f8f9fa !important;
            font-weight: bold !important;
            border-top: 2px solid #dee2e6 !important;
          }
          .statistical-row .ag-cell {
            font-weight: bold !important;
          }
        `}
      </style>
      <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>
      {selectedInstance && (
        <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
          <strong>Selected Instance:</strong> {selectedInstance}
        </div>
      )}
      <div className="ag-theme-alpine w-full" style={{ height: '400px', width: '100%' }}>
        <AgGridReact
          rowData={data}
          columnDefs={columnDefs}
          defaultColDef={{
            sortable: true,
            filter: true,
            resizable: true,
            flex: 1,
            minWidth: 120,
          }}
          rowSelection="single"
          onSelectionChanged={onSelectionChanged}
          pagination={true}
          paginationPageSize={10}
          domLayout="normal"
          suppressHorizontalScroll={false}
          enableRangeSelection={false}
          getRowClass={getRowClass}
          isRowSelectable={isRowSelectable}
          onGridReady={(params) => {
            // Auto-size columns when grid is ready
            params.api.sizeColumnsToFit();
          }}
          onGridSizeChanged={(params) => {
            // Auto-size columns when grid size changes
            params.api.sizeColumnsToFit();
          }}
        />
      </div>
    </div>
  );
};
