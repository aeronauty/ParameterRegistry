import { ClassData, RegistryData, Summary } from '../types';

class DataService {
  private baseUrl: string;
  private cache: Map<string, any> = new Map();

  constructor() {
    // Adjust this path based on your deployment setup
    // @ts-ignore - Vite injects this at build time
    this.baseUrl = import.meta.env?.DEV ? '/data' : './data';
  }

  async fetchSummary(): Promise<Summary> {
    if (this.cache.has('summary')) {
      return this.cache.get('summary');
    }

    try {
      const response = await fetch(`${this.baseUrl}/summary.json`);
      if (!response.ok) {
        throw new Error(`Failed to fetch summary: ${response.statusText}`);
      }
      const data = await response.json();
      this.cache.set('summary', data);
      return data;
    } catch (error) {
      console.error('Error fetching summary:', error);
      throw error;
    }
  }

  async fetchClassData(className: string): Promise<ClassData> {
    const cacheKey = `class_${className}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await fetch(`${this.baseUrl}/${className}.json`);
      if (!response.ok) {
        throw new Error(`Failed to fetch class data for ${className}: ${response.statusText}`);
      }
      const data = await response.json();
      this.cache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error(`Error fetching class data for ${className}:`, error);
      throw error;
    }
  }

  async fetchFullRegistry(): Promise<RegistryData> {
    if (this.cache.has('registry')) {
      return this.cache.get('registry');
    }

    try {
      const response = await fetch(`${this.baseUrl}/registry.json`);
      if (!response.ok) {
        throw new Error(`Failed to fetch registry: ${response.statusText}`);
      }
      const data = await response.json();
      this.cache.set('registry', data);
      return data;
    } catch (error) {
      console.error('Error fetching registry:', error);
      throw error;
    }
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const dataService = new DataService();
