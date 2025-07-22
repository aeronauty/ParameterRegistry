export interface ParameterData {
  value: any;
  unit: string;
  description: string;
  type: string;
  added_by: string;
  source: string;
  date_added: string;
  confidence: number;
}

export interface EquipmentInstance {
  [parameter: string]: any;
}

export interface ClassData {
  instances: { [instanceName: string]: EquipmentInstance };
  metadata: { [instanceName: string]: { [parameter: string]: ParameterData } };
}

export interface RegistryData {
  metadata: {
    created: string;
    version: string;
    description: string;
  };
  constants: { [path: string]: ParameterData };
  classes: { [className: string]: ClassData };
}

export interface Summary {
  classes: string[];
  constants: string[];
  metadata: {
    created: string;
    version: string;
    description: string;
  };
}

export interface ParsedPath {
  domain: string;
  category: string;
  parameter: string;
  class_type: string | null;
  instance: string | null;
}
