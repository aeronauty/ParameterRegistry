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
  const columnDefs: ColDef[] = Object.keys(data[0]).map(key => {
    const colDef: ColDef = {
      headerName: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      field: key,
      sortable: true,
      filter: true,
      resizable: true,
      flex: 1,
      minWidth: 120
    };

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

  const onSelectionChanged = (event: any) => {
    const selectedRows = event.api.getSelectedRows();
    if (selectedRows.length > 0 && onRowSelection) {
      onRowSelection(selectedRows[0].instance);
    }
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>
      {selectedInstance && (
        <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
          <strong>Selected Instance:</strong> {selectedInstance}
        </div>
      )}
      <div className="ag-theme-alpine" style={{ height: '400px', width: '100%' }}>
        <AgGridReact
          rowData={data}
          columnDefs={columnDefs}
          defaultColDef={{
            sortable: true,
            filter: true,
            resizable: true,
          }}
          rowSelection="single"
          onSelectionChanged={onSelectionChanged}
          pagination={true}
          paginationPageSize={10}
          domLayout="normal"
        />
      </div>
    </div>
  );
};
