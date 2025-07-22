# Parameter Registry - TypeScript/React Frontend

This is a modern TypeScript/React frontend for the Parameter Registry system, designed to work with GitLab Pages.

## Features

- **Interactive Data Visualization**: Plotly.js-powered pair plots and scatter charts
- **Advanced Data Tables**: AG-Grid with sorting, filtering, and pagination
- **Modern UI**: Tailwind CSS with responsive design
- **TypeScript**: Full type safety and IntelliSense support
- **Static Deployment**: Works perfectly with GitLab Pages

## Project Structure

```
├── src/
│   ├── components/          # React components
│   │   ├── DataTable.tsx    # AG-Grid data table component
│   │   ├── PairPlot.tsx     # Plotly pair plot component
│   │   └── DetailPlot.tsx   # Detailed scatter plot component
│   ├── services/            # Data fetching services
│   │   └── dataService.ts   # API service for JSON data
│   ├── utils/               # Utility functions
│   │   └── dataProcessor.ts # Data processing utilities
│   ├── types/               # TypeScript type definitions
│   │   └── index.ts         # Shared interfaces
│   ├── App.tsx              # Main application component
│   ├── main.tsx             # Application entry point
│   └── index.css            # Global styles with Tailwind
├── scripts/
│   └── generate-data.ts     # Data generation from CSV files
├── public/
│   └── data/                # Generated JSON data files
├── *.csv                    # Source CSV data files
├── .gitlab-ci.yml           # GitLab CI/CD configuration
└── package.json             # Dependencies and scripts
```

## Development Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Generate data files from CSV**:
   ```bash
   npm run generate-data
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**: http://localhost:3000

## Building for Production

1. **Generate data and build**:
   ```bash
   npm run generate-data
   npm run build
   ```

2. **Preview production build**:
   ```bash
   npm run preview
   ```

## GitLab Pages Deployment

The project is configured to automatically deploy to GitLab Pages:

1. **Push to main/master branch** - triggers CI/CD pipeline
2. **Generate data** - converts CSV files to JSON
3. **Build application** - creates optimized production bundle
4. **Deploy to Pages** - serves from `public/` directory

### Pipeline Stages:

1. **generate-data**: Converts CSV files to JSON format
2. **build**: Builds the React application with Vite
3. **deploy**: Deploys to GitLab Pages

## Data Sources

The application loads equipment data from these CSV files:

- `lng_trucks.csv` - LNG truck specifications
- `pipelines.csv` - Pipeline capacity and cost data
- `terminals.csv` - Terminal throughput and efficiency
- `compressors.csv` - Compressor power and cost data

## Features & Usage

### Interactive Pair Plot
- Shows relationships between all numeric parameters
- Click any subplot to view details in the right panel
- Color-coded by equipment instance

### Detail View
- Focused scatter plot for selected parameter pair
- Interactive point selection
- Consistent color scheme with pair plot

### Data Table
- Sortable and filterable columns
- Row selection highlights corresponding data points
- Automatic number formatting (currency, percentages, etc.)

### Parameter Selection
- Dropdown menus for X/Y axis parameter selection
- Equipment class selection
- Real-time updates across all visualizations

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Charts**: Plotly.js + react-plotly.js
- **Tables**: AG-Grid Community
- **Icons**: Lucide React
- **Data Processing**: Custom utilities
- **Deployment**: GitLab Pages

## Configuration

### Environment Variables
- Development: Loads data from `/data/`
- Production: Loads data from `./data/` (relative paths)

### Vite Configuration
- Base path set to `./` for GitLab Pages compatibility
- Output directory: `public/` (required by GitLab Pages)
- Asset optimization and code splitting enabled

## Performance Features

- **Lazy loading**: Data loaded per equipment class
- **Caching**: Service layer caches JSON responses
- **Optimization**: Vite handles code splitting and tree shaking
- **Responsive**: Mobile-friendly responsive design

## Browser Support

- Modern browsers with ES2020+ support
- Chrome, Firefox, Safari, Edge (latest versions)
- Mobile browsers on iOS/Android

## Contributing

1. Make changes to CSV files or source code
2. Test locally with `npm run dev`
3. Commit and push to trigger deployment
4. Changes will be live on GitLab Pages within minutes

## License

Internal use - Equipment Parameter Registry System
