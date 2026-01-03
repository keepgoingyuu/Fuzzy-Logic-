/**
 * Type definitions for Fuzzy Logic Demo
 */

export interface MembershipFunction {
  type: 'triangular' | 'trapezoidal';
  name: string;
  params: {
    a: number;
    b: number;
    c: number;
    d?: number;
  };
}

export interface FuzzyVariable {
  name: string;
  range: [number, number];
  membership_functions: MembershipFunction[];
}

export interface RuleActivation {
  rule: string;
  firing_strength: number;
  consequent: [string, string];
}

export interface InferenceResult {
  wash_time: number;
  fuzzified_inputs: {
    [key: string]: {
      [fuzzySet: string]: number;
    };
  };
  rule_activations: RuleActivation[];
  aggregated_output: {
    [key: string]: {
      [fuzzySet: string]: number;
    };
  };
}

export interface VisualizationData {
  inference_result: {
    output: { wash_time: number };
    fuzzified_inputs: InferenceResult['fuzzified_inputs'];
    rule_activations: RuleActivation[];
    aggregated_output: InferenceResult['aggregated_output'];
  };
  membership_curves: {
    [variable: string]: {
      x_values: number[];
      curves: {
        [fuzzySet: string]: number[];
      };
    };
  };
  aggregated_output: {
    x_values: number[];
    y_values: number[];
    centroid: number;
  };
}
