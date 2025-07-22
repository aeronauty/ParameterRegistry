// Shared color utility for consistent coloring across all plots

export const DEFAULT_COLOR_PALETTE = [
  '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
  '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'
];

export interface ColorMapping {
  [instanceName: string]: string;
}

export class ColorUtils {
  /**
   * Create a consistent color mapping for instances
   */
  static createColorMapping(instances: string[]): ColorMapping {
    const uniqueInstances = Array.from(new Set(instances)).sort(); // Sort for consistency
    const mapping: ColorMapping = {};
    
    uniqueInstances.forEach((instance, index) => {
      mapping[instance] = DEFAULT_COLOR_PALETTE[index % DEFAULT_COLOR_PALETTE.length];
    });
    
    return mapping;
  }
  
  /**
   * Get colors for a list of instances based on a color mapping
   */
  static getColorsForInstances(instances: string[], colorMapping: ColorMapping): string[] {
    return instances.map(instance => colorMapping[instance] || DEFAULT_COLOR_PALETTE[0]);
  }
  
  /**
   * Get unique instances and their colors
   */
  static getUniqueInstanceColors(instances: string[]): { instances: string[], colors: string[] } {
    const uniqueInstances = Array.from(new Set(instances)).sort();
    const colorMapping = this.createColorMapping(uniqueInstances);
    const colors = uniqueInstances.map(instance => colorMapping[instance]);
    
    return { instances: uniqueInstances, colors };
  }
}
