/**
 * API client for fuzzy logic backend
 */
import axios from 'axios';
import type { InferenceResult, VisualizationData } from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// DEBUG: Log environment configuration
console.log('🔍 API Configuration:');
console.log('  - API_BASE_URL:', API_BASE_URL);
console.log('  - VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('  - All VITE_ vars:', Object.keys(import.meta.env).filter(k => k.startsWith('VITE_')));

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// DEBUG: Log all requests
api.interceptors.request.use(request => {
  console.log('🚀 Axios Request:', {
    method: request.method?.toUpperCase(),
    url: request.url,
    baseURL: request.baseURL,
    fullURL: `${request.baseURL}${request.url}`,
    hasData: !!request.data,
    data: request.data,
    hasParams: !!request.params,
    params: request.params,
  });
  return request;
});

// DEBUG: Log responses and errors
api.interceptors.response.use(
  response => {
    console.log('✅ Axios Response:', {
      status: response.status,
      url: response.config.url,
      dataKeys: Object.keys(response.data || {}),
    });
    return response;
  },
  error => {
    console.error('❌ Axios Error:', {
      message: error.message,
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      fullURL: error.config?.baseURL + error.config?.url,
    });
    return Promise.reject(error);
  }
);

export const fuzzyAPI = {
  /**
   * Calculate washing time using fuzzy logic
   */
  calculateWashingTime: async (dirtLevel: number, greaseLevel: number): Promise<InferenceResult> => {
    const response = await api.post('/fuzzy/washing-machine', {
      dirt_level: dirtLevel,
      grease_level: greaseLevel,
    });
    return response.data;
  },

  /**
   * Get visualization data for fuzzy inference
   */
  getVisualization: async (
    dirtLevel: number,
    greaseLevel: number,
    numPoints: number = 200
  ): Promise<VisualizationData> => {
    const response = await api.post('/fuzzy/visualize', {
      dirt_level: dirtLevel,
      grease_level: greaseLevel,
      num_points: numPoints,
    });
    return response.data;
  },

  /**
   * Get membership function definitions
   */
  getMembershipFunctions: async () => {
    const response = await api.get('/fuzzy/membership-functions');
    return response.data;
  },

  /**
   * Get fuzzy rules
   */
  getRules: async () => {
    const response = await api.get('/fuzzy/rules');
    return response.data;
  },
};
