import * as fs from 'fs';
import * as path from 'path';
import csv from 'csv-parser';

interface ParameterData {
  value: any;
  unit: string;
  description: string;
  type: string;
  added_by: string;
  source: string;
  date_added: string;
  confidence: number;
}

interface EquipmentInstance {
  [parameter: string]: any;
}

interface ClassData {
  instances: { [instanceName: string]: EquipmentInstance };
  metadata: { [instanceName: string]: { [parameter: string]: ParameterData } };
}

interface RegistryData {
  metadata: {
    created: string;
    version: string;
    description: string;
  };
  constants: { [path: string]: ParameterData };
  classes: { [className: string]: ClassData };
}

class DataGenerator {
  private data: RegistryData = {
    metadata: {
      created: new Date().toISOString(),
      version: '1.0',
      description: 'Hierarchical Parameter Registry with Interactive Interface'
    },
    constants: {},
    classes: {}
  };

  constructor() {
    this.initializeConstants();
  }

  private initializeConstants() {
    // Physical Properties (Constants)
    this.data.constants['methane.properties.lower_heating_value'] = {
      value: 50.0,
      unit: 'MJ/kg',
      description: 'Lower heating value',
      type: 'constant',
      added_by: 'J. Smith',
      source: 'NIST Database',
      date_added: '2024-01-01',
      confidence: 0.99
    };

    this.data.constants['methane.properties.density_stp'] = {
      value: 0.717,
      unit: 'kg/m³',
      description: 'Density at standard temperature and pressure',
      type: 'constant',
      added_by: 'J. Smith',
      source: 'NIST Database',
      date_added: '2024-01-01',
      confidence: 0.99
    };
  }

  async loadCSVData() {
    const csvFiles = [
      { type: 'battery_pack', file: 'battery_packs.csv', category: 'distribution' },
      { type: 'pipeline', file: 'pipelines.csv', category: 'distribution' },
      { type: 'terminal', file: 'terminals.csv', category: 'storage' },
      { type: 'compressor', file: 'compressors.csv', category: 'infrastructure' }
    ];

    for (const { type, file, category } of csvFiles) {
      try {
        await this.loadEquipmentCSV(type, file, category);
      } catch (error) {
        console.error(`Error loading ${file}:`, error);
      }
    }
  }

  private async loadEquipmentCSV(equipmentType: string, filename: string, category: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const filePath = path.join(process.cwd(), filename);
      
      if (!fs.existsSync(filePath)) {
        console.warn(`File ${filename} not found, skipping...`);
        resolve();
        return;
      }

      const rows: any[] = [];

      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => rows.push(row))
        .on('end', () => {
          if (!this.data.classes[equipmentType]) {
            this.data.classes[equipmentType] = {
              instances: {},
              metadata: {}
            };
          }

          for (const row of rows) {
            const instance = row.instance;
            if (!instance) continue;

            this.data.classes[equipmentType].instances[instance] = {};
            this.data.classes[equipmentType].metadata[instance] = {};

            // Process each parameter column
            for (const [col, value] of Object.entries(row)) {
              if (['instance', 'added_by', 'source', 'confidence', 'date_added'].includes(col)) {
                continue;
              }

              if (value !== null && value !== undefined && value !== '') {
                // Parse parameter info from column name
                let paramName: string, unit: string;
                if (col.includes('_') && !col.endsWith('_')) {
                  const parts = col.split('_');
                  // Check if last part looks like a unit
                  const lastPart = parts[parts.length - 1];
                  if (['mj', 'usd', 'km', 'bar', 'kw', 'j', 'ratio'].includes(lastPart.toLowerCase())) {
                    paramName = parts.slice(0, -1).join('_');
                    unit = lastPart;
                  } else {
                    paramName = col;
                    unit = '';
                  }
                } else {
                  paramName = col;
                  unit = '';
                }

                // Store the value
                this.data.classes[equipmentType].instances[instance][paramName] = 
                  isNaN(Number(value)) ? value : Number(value);

                // Store metadata
                this.data.classes[equipmentType].metadata[instance][paramName] = {
                  value: isNaN(Number(value)) ? value : Number(value),
                  unit: unit,
                  description: `${equipmentType} ${paramName.replace(/_/g, ' ')}`,
                  type: 'instance',
                  added_by: row.added_by || 'Data Import',
                  source: row.source || 'CSV Import',
                  date_added: row.date_added || '2024-01-01',
                  confidence: Number(row.confidence) || 0.85
                };
              }
            }
          }

          resolve();
        })
        .on('error', reject);
    });
  }

  async generateDataFiles() {
    // Create public/data directory
    const dataDir = path.join(process.cwd(), 'public', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Load CSV data
    await this.loadCSVData();

    // Write main registry data
    fs.writeFileSync(
      path.join(dataDir, 'registry.json'),
      JSON.stringify(this.data, null, 2)
    );

    // Write individual class data files for better performance
    for (const [className, classData] of Object.entries(this.data.classes)) {
      fs.writeFileSync(
        path.join(dataDir, `${className}.json`),
        JSON.stringify(classData, null, 2)
      );
    }

    // Create summary file with class list
    const summary = {
      classes: Object.keys(this.data.classes),
      constants: Object.keys(this.data.constants),
      metadata: this.data.metadata
    };

    fs.writeFileSync(
      path.join(dataDir, 'summary.json'),
      JSON.stringify(summary, null, 2)
    );

    console.log('Data files generated successfully!');
    console.log(`Generated files:`);
    console.log(`- registry.json (complete data)`);
    console.log(`- summary.json (class list and metadata)`);
    Object.keys(this.data.classes).forEach(className => {
      console.log(`- ${className}.json`);
    });
  }
}

// Run the generator
async function main() {
  const generator = new DataGenerator();
  await generator.generateDataFiles();
}

main().catch(console.error);
