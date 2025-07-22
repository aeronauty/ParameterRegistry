import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import dash
from dash import dcc, html, Input, Output, callback
import dash_ag_grid as dag
from datetime import datetime, date
from typing import Dict, List, Any, Optional
import json
from collections import defaultdict
import os

class ParameterRegistry:
    """
    Hierarchical parameter registry using dot notation with Plotly/Dash interface
    Supports any domain with structure: domain.category.class.instance.parameter
    """
    
    def __init__(self):
        self.parameters = {}
        self.metadata = {
            'created': datetime.now(),
            'version': '1.0',
            'description': 'Hierarchical Parameter Registry with Interactive Interface'
        }
        
        # Initialize with example methane parameters
        self._initialize_default_parameters()
    
    def _initialize_default_parameters(self):
        """Initialize by loading parameters from CSV files"""
        
        # Physical Properties (Constants - no instances)
        self.add_parameter(
            'methane.properties.lower_heating_value',
            value=50.0,
            unit='MJ/kg',
            description='Lower heating value',
            parameter_type='constant',
            added_by='J. Smith',
            source='NIST Database',
            confidence=0.99
        )
        
        self.add_parameter(
            'methane.properties.density_stp',
            value=0.717,
            unit='kg/m³',
            description='Density at standard temperature and pressure',
            parameter_type='constant',
            added_by='J. Smith',
            source='NIST Database',
            confidence=0.99
        )
        
        # Load equipment data from CSV files
        self._load_from_csv()
    
    def _load_from_csv(self):
        """Load equipment parameters from CSV files"""
        
        csv_files = {
            'lng_truck': 'lng_trucks.csv',
            'pipeline': 'pipelines.csv', 
            'terminal': 'terminals.csv',
            'compressor': 'compressors.csv'
        }
        
        for equipment_type, filename in csv_files.items():
            try:
                self._load_equipment_csv(equipment_type, filename)
            except FileNotFoundError:
                print(f"CSV file {filename} not found. Creating sample data...")
                self._create_sample_csv(equipment_type, filename)
                self._load_equipment_csv(equipment_type, filename)
    
    def _load_equipment_csv(self, equipment_type: str, filename: str):
        """Load equipment data from a specific CSV file"""
        import pandas as pd
        
        try:
            df = pd.read_csv(filename)
            
            for _, row in df.iterrows():
                instance = row['instance']
                
                # Get category based on equipment type
                if equipment_type == 'lng_truck':
                    category = 'distribution'
                elif equipment_type == 'pipeline':
                    category = 'distribution'
                elif equipment_type == 'terminal':
                    category = 'storage'
                elif equipment_type == 'compressor':
                    category = 'infrastructure'
                
                # Add each parameter (skip NaN values)
                for col in df.columns:
                    if col not in ['instance', 'added_by', 'source', 'confidence', 'date_added']:
                        if pd.notna(row[col]):
                            # Parse parameter info from column name (param_unit format)
                            if '_' in col:
                                param_name, unit = col.rsplit('_', 1)
                            else:
                                param_name, unit = col, ''
                            
                            path = f'methane.{category}.{equipment_type}.{instance}.{param_name}'
                            
                            self.add_parameter(
                                path=path,
                                value=row[col],
                                unit=unit,
                                description=f'{equipment_type} {param_name.replace("_", " ")}',
                                added_by=row.get('added_by', 'Data Import'),
                                source=row.get('source', 'CSV Import'),
                                confidence=row.get('confidence', 0.85)
                            )
                            
        except Exception as e:
            print(os.getcwd())
            print(f"Error loading {filename}: {e}")
    
    def _create_sample_csv(self, equipment_type: str, filename: str):
        """Create sample CSV files with realistic equipment data"""
        import pandas as pd
        
        if equipment_type == 'lng_truck':
            # Realistic LNG truck data with some missing parameters
            data = [
                {
                    'instance': 'volvo_fh460', 
                    'capacity_mj': 185000, 'cost_usd': 89000, 'efficiency_ratio': 0.87, 
                    'range_km': 780, 'fuel_rate_l_per_100km': 38, 'maintenance_cost_annual_usd': 12500,
                    'added_by': 'Fleet Manager', 'source': 'Volvo Specs', 'confidence': 0.92
                },
                {
                    'instance': 'scania_r500', 
                    'capacity_mj': 195000, 'cost_usd': 94000, 'efficiency_ratio': 0.89, 
                    'range_km': 820, 'fuel_rate_l_per_100km': 36, 'maintenance_cost_annual_usd': 13200,
                    'added_by': 'Fleet Manager', 'source': 'Scania Specs', 'confidence': 0.90
                },
                {
                    'instance': 'man_tgx', 
                    'capacity_mj': 170000, 'cost_usd': 82000, 'efficiency_ratio': 0.84, 
                    'range_km': 740, 'fuel_rate_l_per_100km': None, 'maintenance_cost_annual_usd': 11800,
                    'added_by': 'Operations', 'source': 'MAN Datasheet', 'confidence': 0.88
                },
                {
                    'instance': 'iveco_stralis', 
                    'capacity_mj': 178000, 'cost_usd': 86000, 'efficiency_ratio': None, 
                    'range_km': 760, 'fuel_rate_l_per_100km': 39, 'maintenance_cost_annual_usd': None,
                    'added_by': 'Procurement', 'source': 'Iveco Quote', 'confidence': 0.85
                },
                {
                    'instance': 'mercedes_actros', 
                    'capacity_mj': 188000, 'cost_usd': 91000, 'efficiency_ratio': 0.86, 
                    'range_km': 790, 'fuel_rate_l_per_100km': 37, 'maintenance_cost_annual_usd': 12800,
                    'added_by': 'Fleet Manager', 'source': 'Mercedes Specs', 'confidence': 0.91
                }
            ]
        
        elif equipment_type == 'pipeline':
            # Pipeline data with some missing parameters
            data = [
                {
                    'instance': 'nord_stream_segment', 
                    'capacity_j_day': 55000000, 'cost_per_km_usd': 280000, 'pressure_bar': 75,
                    'added_by': 'Engineering', 'source': 'Pipeline Database', 'confidence': 0.94
                },
                {
                    'instance': 'trans_adriatic', 
                    'capacity_j_day': 36000000, 'cost_per_km_usd': 220000, 'pressure_bar': 68,
                    'added_by': 'Engineering', 'source': 'TAP Specs', 'confidence': 0.92
                },
                {
                    'instance': 'regional_feeder_a', 
                    'capacity_j_day': 18000000, 'cost_per_km_usd': 150000, 'pressure_bar': None,
                    'added_by': 'Project Manager', 'source': 'Regional Study', 'confidence': 0.80
                },
                {
                    'instance': 'distribution_main', 
                    'capacity_j_day': 28000000, 'cost_per_km_usd': 190000, 'pressure_bar': 62,
                    'added_by': 'Engineering', 'source': 'Design Specs', 'confidence': 0.89
                }
            ]
        
        elif equipment_type == 'terminal':
            # Terminal data with some missing parameters
            data = [
                {
                    'instance': 'rotterdam_gate', 
                    'capacity_j': 5200000000, 'cost_usd': 18500000, 'throughput_j_day': 580000, 
                    'efficiency_ratio': 0.94, 'safety_score': 9.3,
                    'added_by': 'Terminal Engineer', 'source': 'Gate Terminal Data', 'confidence': 0.96
                },
                {
                    'instance': 'zeebrugge_lng', 
                    'capacity_j': 3800000000, 'cost_usd': 14200000, 'throughput_j_day': 420000, 
                    'efficiency_ratio': 0.91, 'safety_score': 9.1,
                    'added_by': 'Operations', 'source': 'Zeebrugge Reports', 'confidence': 0.93
                },
                {
                    'instance': 'montoir_terminal', 
                    'capacity_j': 2900000000, 'cost_usd': None, 'throughput_j_day': 320000, 
                    'efficiency_ratio': 0.88, 'safety_score': 8.9,
                    'added_by': 'Terminal Engineer', 'source': 'Montoir Data', 'confidence': 0.87
                },
                {
                    'instance': 'isle_of_grain', 
                    'capacity_j': 4100000000, 'cost_usd': 15800000, 'throughput_j_day': None, 
                    'efficiency_ratio': 0.90, 'safety_score': 9.0,
                    'added_by': 'Operations', 'source': 'National Grid', 'confidence': 0.91
                }
            ]
        
        elif equipment_type == 'compressor':
            # Compressor data with some missing parameters
            data = [
                {
                    'instance': 'siemens_sgt800', 
                    'power_kw': 3200, 'cost_usd': 620000,
                    'added_by': 'Mechanical Engineer', 'source': 'Siemens Datasheet', 'confidence': 0.95
                },
                {
                    'instance': 'ge_lm2500', 
                    'power_kw': 2800, 'cost_usd': 580000,
                    'added_by': 'Procurement', 'source': 'GE Quote', 'confidence': 0.92
                },
                {
                    'instance': 'solar_mars100', 
                    'power_kw': 1900, 'cost_usd': None,
                    'added_by': 'Engineering', 'source': 'Solar Turbines', 'confidence': 0.88
                }
            ]
        
        # Create DataFrame and save to CSV
        df = pd.DataFrame(data)
        df.to_csv(filename, index=False)
        print(f"Created sample CSV file: {filename}")
    
    def add_parameter(self, path: str, value: Any, unit: str, description: str = "", 
                     parameter_type: str = "instance", added_by: str = "System", 
                     source: str = "Internal", confidence: float = 0.95, **kwargs):
        """Add a parameter using dot notation with metadata"""
        
        self.parameters[path] = {
            'value': value,
            'unit': unit,
            'description': description,
            'type': parameter_type,
            'added_by': added_by,
            'source': source,
            'date_added': datetime.now().strftime('%Y-%m-%d'),
            'confidence': confidence,
            'last_updated': datetime.now(),
            **kwargs
        }
    
    def parse_path(self, path: str) -> Dict[str, str]:
        """Parse dot notation path into components"""
        parts = path.split('.')
        
        # For constants: methane.properties.lower_heating_value
        if len(parts) <= 3:
            return {
                'domain': parts[0] if len(parts) > 0 else '',
                'category': parts[1] if len(parts) > 1 else '',
                'parameter': parts[2] if len(parts) > 2 else '',
                'class_type': None,
                'instance': None
            }
        
        # For instances: methane.distribution.lng_truck.fleet_alpha.capacity_mj
        if len(parts) >= 5:
            return {
                'domain': parts[0],
                'category': parts[1], 
                'class_type': parts[2],
                'instance': parts[3],
                'parameter': '.'.join(parts[4:])
            }
        
        return {
            'domain': parts[0],
            'category': parts[1],
            'class_type': parts[2],
            'instance': None,
            'parameter': parts[3] if len(parts) > 3 else ''
        }
    
    def get_classes(self) -> List[str]:
        """Get all class types (e.g., lng_truck, pipeline, terminal)"""
        classes = set()
        
        for path in self.parameters.keys():
            parsed = self.parse_path(path)
            if parsed['class_type'] and parsed['instance']:
                classes.add(parsed['class_type'])
        
        return sorted(list(classes))
    
    def get_instances(self, class_type: str) -> List[str]:
        """Get all instances of a specific class"""
        instances = set()
        
        for path in self.parameters.keys():
            parsed = self.parse_path(path)
            if parsed['class_type'] == class_type and parsed['instance']:
                instances.add(parsed['instance'])
        
        return sorted(list(instances))
    
    def get_class_dataframe(self, class_type: str) -> pd.DataFrame:
        """Get DataFrame for all instances of a class"""
        instances = self.get_instances(class_type)
        if not instances:
            return pd.DataFrame()
        
        # Collect all parameters for this class
        all_parameters = set()
        for path in self.parameters.keys():
            parsed = self.parse_path(path)
            if parsed['class_type'] == class_type and parsed['instance']:
                all_parameters.add(parsed['parameter'])
        
        # Build DataFrame
        rows = []
        for instance in instances:
            row = {'instance': instance}
            
            for param in all_parameters:
                full_path = f"methane.{self.get_category_for_class(class_type)}.{class_type}.{instance}.{param}"
                if full_path in self.parameters:
                    param_info = self.parameters[full_path]
                    # Create clean column name with unit
                    clean_name = param.replace('_', ' ').title()
                    col_name = f"{clean_name} ({param_info['unit']})"
                    row[col_name] = param_info['value']
            
            rows.append(row)
        
        return pd.DataFrame(rows)
    
    def get_category_for_class(self, class_type: str) -> str:
        """Get the category for a class type"""
        for path in self.parameters.keys():
            parsed = self.parse_path(path)
            if parsed['class_type'] == class_type:
                return parsed['category']
        return 'unknown'
    
    def create_plotly_pairplot(self, class_type: str):
        """Create interactive Plotly pair plot for a class with click support"""
        df = self.get_class_dataframe(class_type)
        
        if df.empty or len(df.columns) <= 2:
            return go.Figure().add_annotation(
                text=f"Insufficient data for {class_type} pair plot",
                xref="paper", yref="paper", x=0.5, y=0.5,
                showarrow=False, font_size=16
            )
        
        # Get numeric columns (exclude 'instance')
        numeric_cols = [col for col in df.columns if col != 'instance']
        n_vars = len(numeric_cols)
        
        # Create consistent color scheme
        instances = sorted(df['instance'].unique())
        colors = px.colors.qualitative.Set1[:len(instances)]
        color_map = {instance: colors[i] for i, instance in enumerate(instances)}
        
        # Create custom subplot grid without subtitles
        fig = make_subplots(
            rows=n_vars, cols=n_vars,
            vertical_spacing=0.08, horizontal_spacing=0.08
        )
        
        for i, y_param in enumerate(numeric_cols):
            for j, x_param in enumerate(numeric_cols):
                row, col = i + 1, j + 1
                
                if i == j:
                    # Diagonal: histogram with invisible background trace for clicking
                    for k, instance in enumerate(df['instance']):
                        fig.add_trace(
                            go.Histogram(
                                x=[df[df['instance'] == instance][x_param].iloc[0]],
                                name=instance,
                                marker_color=colors[k],
                                showlegend=(i == 0 and j == 0),
                                customdata=[[x_param, x_param, instance]],
                                hovertemplate=f"{instance}: {x_param} = %{{x}}<extra></extra>"
                            ),
                            row=row, col=col
                        )
                    
                    # Add invisible background trace for subplot detection
                    fig.add_trace(
                        go.Scatter(
                            x=[df[x_param].min(), df[x_param].max()],
                            y=[0, 0],
                            mode='markers',
                            marker=dict(size=0, opacity=0),
                            showlegend=False,
                            customdata=[[x_param, x_param, f"subplot_{row}_{col}"]],
                            hoverinfo='skip',
                            name=f'background_{row}_{col}'
                        ),
                        row=row, col=col
                    )
                else:
                    # Off-diagonal: scatter plot
                    fig.add_trace(
                        go.Scatter(
                            x=df[x_param],
                            y=df[y_param],
                            mode='markers',
                            marker=dict(color=[color_map[inst] for inst in df['instance']], size=8),
                            text=df['instance'],
                            name='',
                            showlegend=False,
                            customdata=[[x_param, y_param, inst] for inst in df['instance']],
                            hovertemplate=f"%{{text}}<br>{x_param}: %{{x}}<br>{y_param}: %{{y}}<extra></extra>"
                        ),
                        row=row, col=col
                    )
                    
                    # Add invisible background trace covering the subplot area for click detection
                    x_range = [df[x_param].min(), df[x_param].max()]
                    y_range = [df[y_param].min(), df[y_param].max()]
                    
                    fig.add_trace(
                        go.Scatter(
                            x=[x_range[0], x_range[1], x_range[1], x_range[0], x_range[0]],
                            y=[y_range[0], y_range[0], y_range[1], y_range[1], y_range[0]],
                            mode='lines',
                            line=dict(width=0, color='rgba(0,0,0,0)'),
                            fill='toself',
                            fillcolor='rgba(0,0,0,0)',
                            showlegend=False,
                            customdata=[[x_param, y_param, f"subplot_{row}_{col}"] for _ in range(5)],
                            hoverinfo='skip',
                            name=f'background_{row}_{col}'
                        ),
                        row=row, col=col
                    )
        
        # Update layout for clean, standard appearance
        fig.update_layout(
            title=f'Parameter Relationships: {class_type.replace("_", " ").title()}',
            height=600,
            font_size=10,
            title_font_size=16,
            showlegend=True if n_vars > 0 else False,
            plot_bgcolor='white',
            paper_bgcolor='white'
        )
        
        # Update all subplot axes for clean appearance with selective axis display
        for i in range(n_vars):
            for j in range(n_vars):
                # Show x-axis only on bottom row
                if i == n_vars - 1:  # Bottom row
                    fig.update_xaxes(
                        showgrid=False,
                        showline=True,
                        linewidth=1,
                        linecolor='black',
                        zeroline=False,
                        title_text=numeric_cols[j],  # Add x-axis label
                        row=i+1, col=j+1
                    )
                else:
                    fig.update_xaxes(
                        showgrid=False,
                        showline=False,
                        zeroline=False,
                        row=i+1, col=j+1
                    )
                
                # Show y-axis only on leftmost column
                if j == 0:  # Leftmost column
                    fig.update_yaxes(
                        showgrid=False,
                        showline=True,
                        linewidth=1,
                        linecolor='black',
                        zeroline=False,
                        title_text=numeric_cols[i],  # Add y-axis label
                        row=i+1, col=j+1
                    )
                else:
                    fig.update_yaxes(
                        showgrid=False,
                        showline=False,
                        zeroline=False,
                        row=i+1, col=j+1
                    )
        
        # Store parameter mapping for click detection
        fig._parameter_mapping = {
            f"{i+1}_{j+1}": (numeric_cols[j], numeric_cols[i]) 
            for i in range(n_vars) for j in range(n_vars)
        }
        
        return fig
    
    def create_individual_scatter(self, class_type: str, x_param: str, y_param: str):
        """Create individual scatter plot for detailed view with consistent colors"""
        df = self.get_class_dataframe(class_type)
        
        if df.empty:
            return go.Figure()
        
        # Find columns that match the parameters
        x_col = next((col for col in df.columns if x_param.lower() in col.lower()), None)
        y_col = next((col for col in df.columns if y_param.lower() in col.lower()), None)
        
        if not x_col or not y_col:
            return go.Figure().add_annotation(
                text="Parameters not found",
                xref="paper", yref="paper", x=0.5, y=0.5,
                showarrow=False
            )
        
        # Use consistent color scheme - same as pair plot
        instances = sorted(df['instance'].unique())
        colors = px.colors.qualitative.Set1[:len(instances)]
        color_map = {instance: colors[i] for i, instance in enumerate(instances)}
        
        fig = px.scatter(
            df, 
            x=x_col, 
            y=y_col,
            color='instance',
            color_discrete_map=color_map,
            text='instance',
            title=f'{y_col} vs {x_col}',
            height=500
        )
        
        fig.update_traces(textposition="top center", marker_size=12)
        fig.update_layout(
            font_size=12, 
            title_font_size=14,
            plot_bgcolor='white',
            paper_bgcolor='white'
        )
        
        # Clean axes styling - show both axes for single plot
        fig.update_xaxes(
            showgrid=False,
            showline=True,
            linewidth=1,
            linecolor='black',
            zeroline=False
        )
        
        fig.update_yaxes(
            showgrid=False,
            showline=True,
            linewidth=1,
            linecolor='black',
            zeroline=False
        )
        
        return fig
    
    def export_to_excel(self, filename: str = 'parameters.xlsx'):
        """Export to Excel organized by class"""
        
        with pd.ExcelWriter(filename, engine='openpyxl') as writer:
            # Export each class to its own sheet
            for class_type in self.get_classes():
                df = self.get_class_dataframe(class_type)
                if not df.empty:
                    sheet_name = class_type.replace('_', ' ').title()[:31]
                    df.to_excel(writer, sheet_name=sheet_name, index=False)
        
        print(f"Excel file exported: {filename}")

def create_dash_app(registry: ParameterRegistry):
    """Create Dash application for interactive parameter exploration"""
    
    app = dash.Dash(__name__)
    
    # Get available classes
    classes = registry.get_classes()
    
    app.layout = html.Div([
        html.H1("Parameter Registry - Interactive Explorer", 
                style={'textAlign': 'center', 'marginBottom': 30}),
        
        html.Div([
            html.Div([
                html.Label("Select Equipment Class:", style={'fontWeight': 'bold'}),
                dcc.Dropdown(
                    id='class-dropdown',
                    options=[{'label': cls.replace('_', ' ').title(), 'value': cls} 
                            for cls in classes],
                    value=classes[0] if classes else None,
                    style={'marginBottom': 20}
                )
            ], style={'width': '30%', 'display': 'inline-block'}),
            
            html.Div([
                html.Label("Select Parameters for Detail View:", style={'fontWeight': 'bold'}),
                html.Div([
                    dcc.Dropdown(id='x-param-dropdown', placeholder="X-axis parameter",
                                style={'width': '48%', 'display': 'inline-block'}),
                    dcc.Dropdown(id='y-param-dropdown', placeholder="Y-axis parameter",
                                style={'width': '48%', 'display': 'inline-block', 'marginLeft': '4%'})
                ])
            ], style={'width': '65%', 'display': 'inline-block', 'marginLeft': '5%'})
        ], style={'marginBottom': 30}),
        
        html.Div([
            html.Div([
                html.H3("Parameter Pair Plot", style={'textAlign': 'center'}),
                html.P("Click on any subplot to view in detail panel →", 
                       style={'textAlign': 'center', 'fontStyle': 'italic', 'color': 'gray'}),
                dcc.Graph(id='pairplot-graph', style={'height': '600px'})
            ], style={'width': '60%', 'display': 'inline-block'}),
            
            html.Div([
                html.H3("Detail View", style={'textAlign': 'center'}),
                dcc.Graph(id='detail-graph', style={'height': '500px'})
            ], style={'width': '38%', 'display': 'inline-block', 'marginLeft': '2%'})
        ]),
        
        # Store selected instance for row highlighting
        dcc.Store(id='selected-instance-store', data=None),
        
        html.Div(id='data-table-container', style={'marginTop': 30})
    ])
    
    @app.callback(
        [Output('pairplot-graph', 'figure'),
         Output('x-param-dropdown', 'options'),
         Output('y-param-dropdown', 'options'),
         Output('data-table-container', 'children')],
        [Input('class-dropdown', 'value'),
         Input('selected-instance-store', 'data')]
    )
    def update_pairplot(selected_class, selected_instance):
        if not selected_class:
            empty_fig = go.Figure()
            return empty_fig, [], [], html.Div()
        
        # Create pair plot
        pairplot_fig = registry.create_plotly_pairplot(selected_class)
        
        # Get parameter options for dropdowns
        df = registry.get_class_dataframe(selected_class)
        param_options = []
        if not df.empty:
            numeric_cols = [col for col in df.columns if col != 'instance']
            param_options = [{'label': col, 'value': col} for col in numeric_cols]
        
        # Create data table using ag-grid
        if not df.empty:
            # Prepare column definitions for ag-grid
            column_defs = []
            for col in df.columns:
                col_def = {
                    "headerName": col.replace('_', ' ').title(),
                    "field": col,
                    "sortable": True,
                    "filter": True,
                    "resizable": True
                }
                
                # Special formatting for specific columns
                if 'cost' in col.lower() or 'USD' in col:
                    col_def["valueFormatter"] = {"function": "d3.format('$,.0f')(params.value)"}
                elif 'efficiency' in col.lower() or 'ratio' in col.lower():
                    col_def["valueFormatter"] = {"function": "d3.format('.1%')(params.value)"}
                elif col not in ['instance'] and str(df[col].dtype) in ['float64', 'int64']:
                    col_def["valueFormatter"] = {"function": "d3.format(',.0f')(params.value)"}
                
                column_defs.append(col_def)
            
            # Create ag-grid component with row highlighting
            row_data = df.to_dict('records')
            
            # Set up row highlighting based on selected instance
            selected_row_data = []
            if selected_instance:
                for row in row_data:
                    if row.get('instance') == selected_instance:
                        selected_row_data.append(row)
            
            data_grid = dag.AgGrid(
                id='parameter-grid',
                rowData=row_data,
                columnDefs=column_defs,
                defaultColDef={
                    "flex": 1,
                    "minWidth": 120,
                    "sortable": True,
                    "filter": True,
                    "resizable": True,
                },
                dashGridOptions={
                    "pagination": True,
                    "paginationPageSize": 10,
                    "domLayout": "autoHeight",
                    "rowSelection": "single",
                    "suppressRowClickSelection": False
                },
                selectedRows=selected_row_data,
                style={"height": "400px"}
            )
            
            # Create metadata grid using parameter data directly
            metadata_rows = []
            for path, param in registry.parameters.items():
                parsed = registry.parse_path(path)
                if parsed['class_type'] == selected_class:
                    metadata_rows.append({
                        'instance': parsed['instance'],
                        'parameter': parsed['parameter'],
                        'value': param['value'],
                        'unit': param['unit'],
                        'added_by': param.get('added_by', 'Unknown'),
                        'source': param.get('source', 'Unknown'),
                        'date_added': param.get('date_added', 'Unknown'),
                        'confidence': param.get('confidence', 0.0)
                    })
            
            if metadata_rows:
                metadata_df = pd.DataFrame(metadata_rows)
                
                metadata_column_defs = [
                    {"headerName": "Instance", "field": "instance", "width": 120},
                    {"headerName": "Parameter", "field": "parameter", "width": 200},
                    {"headerName": "Value", "field": "value", "width": 100, 
                     "valueFormatter": {"function": "typeof params.value === 'number' ? d3.format(',.2f')(params.value) : params.value"}},
                    {"headerName": "Unit", "field": "unit", "width": 80},
                    {"headerName": "Added By", "field": "added_by", "width": 120},
                    {"headerName": "Source", "field": "source", "width": 150},
                    {"headerName": "Date Added", "field": "date_added", "width": 100},
                    {"headerName": "Confidence", "field": "confidence", "width": 100,
                     "valueFormatter": {"function": "d3.format('.1%')(params.value)"}}
                ]
                
                metadata_row_data = metadata_df.to_dict('records')
                
                # Set up row highlighting for metadata grid based on selected instance
                metadata_selected_row_data = []
                if selected_instance:
                    for row in metadata_row_data:
                        if row.get('instance') == selected_instance:
                            metadata_selected_row_data.append(row)
                
                metadata_grid = dag.AgGrid(
                    id='metadata-grid',
                    rowData=metadata_row_data,
                    columnDefs=metadata_column_defs,
                    defaultColDef={
                        "sortable": True,
                        "filter": True,
                        "resizable": True,
                    },
                    dashGridOptions={
                        "pagination": True,
                        "paginationPageSize": 15,
                        "domLayout": "autoHeight",
                        "rowSelection": "multiple",
                        "suppressRowClickSelection": False
                    },
                    selectedRows=metadata_selected_row_data,
                    style={"height": "500px"}
                )
                
                data_table = html.Div([
                    html.H3(f"{selected_class.replace('_', ' ').title()} - Parameter Values"),
                    html.P(f"Selected Instance: {selected_instance}", 
                           style={'backgroundColor': '#e3f2fd', 'padding': '5px', 'borderRadius': '3px', 'fontWeight': 'bold'}) if selected_instance else html.Div(),
                    data_grid,
                    html.H3(f"{selected_class.replace('_', ' ').title()} - Metadata Details", 
                           style={'marginTop': 30}),
                    metadata_grid
                ])
            else:
                data_table = html.Div([
                    html.H3(f"{selected_class.replace('_', ' ').title()} - Parameter Values"),
                    html.P(f"Selected Instance: {selected_instance}", 
                           style={'backgroundColor': '#e3f2fd', 'padding': '5px', 'borderRadius': '3px', 'fontWeight': 'bold'}) if selected_instance else html.Div(),
                    data_grid,
                    html.P("No metadata available for this class.")
                ])
        else:
            data_table = html.Div("No data available for selected class.")
        
        return pairplot_fig, param_options, param_options, data_table
        
    @app.callback(
        Output('selected-instance-store', 'data'),
        [Input('pairplot-graph', 'clickData'),
         Input('detail-graph', 'clickData')],
        prevent_initial_call=True
    )
    def store_selected_instance(pairplot_click, detail_click):
        # Determine which input triggered the callback
        ctx = dash.callback_context
        if not ctx.triggered:
            return None
        
        trigger_id = ctx.triggered[0]['prop_id'].split('.')[0]
        
        if trigger_id == 'pairplot-graph' and pairplot_click:
            clickData = pairplot_click
        elif trigger_id == 'detail-graph' and detail_click:
            clickData = detail_click
        else:
            return None
        
        if not clickData or 'points' not in clickData:
            return None
        
        try:
            point = clickData['points'][0]
            
            # Extract instance name from the clicked point
            if 'text' in point:
                # For scatter plots, instance name is in 'text'
                return point['text']
            elif 'customdata' in point and len(point['customdata']) >= 3:
                # For other plots, instance name might be in customdata
                return point['customdata'][2]
                
        except (KeyError, IndexError, TypeError):
            pass
        
        return None
    
    @app.callback(
        [Output('x-param-dropdown', 'value'),
         Output('y-param-dropdown', 'value')],
        [Input('pairplot-graph', 'clickData'),
         Input('pairplot-graph', 'figure')],
        prevent_initial_call=True
    )
    def update_detail_from_click(clickData, figure_data):
        if not clickData or 'points' not in clickData:
            return dash.no_update, dash.no_update
        
        try:
            point = clickData['points'][0]
            
            # Method 1: Extract from customdata if available
            if 'customdata' in point and point['customdata']:
                custom_data = point['customdata']
                if len(custom_data) >= 2:
                    x_param = custom_data[0]
                    y_param = custom_data[1]
                    
                    # Don't update if it's a diagonal (histogram) plot
                    if x_param != y_param:
                        return x_param, y_param
            
            # Method 2: Use subplot coordinates to determine parameters
            if 'xaxis' in point and 'yaxis' in point:
                # Extract subplot row/col from axis references
                xaxis_ref = point['xaxis']
                yaxis_ref = point['yaxis']
                
                # Parse subplot position (e.g., 'x2' -> col 2, 'y3' -> row 3)
                if xaxis_ref == 'x':
                    col = 1
                else:
                    col = int(xaxis_ref[1:]) if len(xaxis_ref) > 1 else 1
                
                if yaxis_ref == 'y':
                    row = 1
                else:
                    row = int(yaxis_ref[1:]) if len(yaxis_ref) > 1 else 1
                
                # Get parameter mapping from figure if available
                if figure_data and '_parameter_mapping' in figure_data:
                    subplot_key = f"{row}_{col}"
                    if subplot_key in figure_data['_parameter_mapping']:
                        x_param, y_param = figure_data['_parameter_mapping'][subplot_key]
                        if x_param != y_param:  # Skip diagonal
                            return x_param, y_param
                        
        except (KeyError, IndexError, TypeError, ValueError):
            pass
        
        return dash.no_update, dash.no_update
        if not clickData or 'points' not in clickData:
            return dash.no_update, dash.no_update
        
        try:
            point = clickData['points'][0]
            
            # Method 1: Extract from customdata if available
            if 'customdata' in point and point['customdata']:
                custom_data = point['customdata']
                if len(custom_data) >= 2:
                    x_param = custom_data[0]
                    y_param = custom_data[1]
                    
                    # Don't update if it's a diagonal (histogram) plot
                    if x_param != y_param:
                        return x_param, y_param
            
            # Method 2: Use subplot coordinates to determine parameters
            if 'xaxis' in point and 'yaxis' in point:
                # Extract subplot row/col from axis references
                xaxis_ref = point['xaxis']
                yaxis_ref = point['yaxis']
                
                # Parse subplot position (e.g., 'x2' -> col 2, 'y3' -> row 3)
                if xaxis_ref == 'x':
                    col = 1
                else:
                    col = int(xaxis_ref[1:]) if len(xaxis_ref) > 1 else 1
                
                if yaxis_ref == 'y':
                    row = 1
                else:
                    row = int(yaxis_ref[1:]) if len(yaxis_ref) > 1 else 1
                
                # Get parameter mapping from figure if available
                if figure_data and '_parameter_mapping' in figure_data:
                    subplot_key = f"{row}_{col}"
                    if subplot_key in figure_data['_parameter_mapping']:
                        x_param, y_param = figure_data['_parameter_mapping'][subplot_key]
                        if x_param != y_param:  # Skip diagonal
                            return x_param, y_param
                        
        except (KeyError, IndexError, TypeError, ValueError):
            pass
        
        return dash.no_update, dash.no_update
    
    @app.callback(
        Output('detail-graph', 'figure'),
        [Input('class-dropdown', 'value'),
         Input('x-param-dropdown', 'value'),
         Input('y-param-dropdown', 'value')]
    )
    def update_detail_plot(selected_class, x_param, y_param):
        if not all([selected_class, x_param, y_param]):
            return go.Figure()
        
        return registry.create_individual_scatter(selected_class, x_param, y_param)
    
    return app

# Example usage
if __name__ == "__main__":
    # Create registry
    registry = ParameterRegistry()
    
    # Create and run Dash app
    app = create_dash_app(registry)
    app.run(debug=True, port=8060)
    
    print("Dash app running at http://localhost:8060")