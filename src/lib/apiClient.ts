/**
 * Centralized, typed API client for Locentra backend.
 */

import {
  DefaultConfigResponse,
  HealthResponse,
  SimulationCompareRequest,
  SimulationCompareResponse,
  SimulationRunRequest,
  SimulationRunResponse,
} from '../types/api';
import { TrajectoryPoint } from '../types/scenario';

export class ApiError extends Error {
  status?: number;
  isNetworkError: boolean;
  errors?: string[];

  constructor(message: string, status?: number, isNetworkError: boolean = false, errors?: string[]) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.isNetworkError = isNetworkError;
    this.errors = errors;
  }
}
export const DEFAULT_PRODUCTION_API_URL = 'https://locentra.onrender.com';

/**
 * Resolves the backend API base URL from Vite environment variables.
 * Falls back to localhost in development, and to the deployed Render backend in production.
 */
export function getApiBaseUrl(): string {
  const metaEnv = (import.meta as unknown as { env?: Record<string, string | boolean | undefined> }).env;
  const envUrl = metaEnv?.VITE_API_BASE_URL;
  if (typeof envUrl === 'string' && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/+$/, '');
  }
  // Safe development default when VITE_API_BASE_URL is unset in dev
  if (metaEnv?.DEV) {
    return 'http://127.0.0.1:8000';
  }
  return DEFAULT_PRODUCTION_API_URL;
}

const DEFAULT_TIMEOUT_MS = 10000;

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      let errorDetail = `API request failed with status ${res.status}`;
      let validationErrors: string[] | undefined;
      try {
        const errorJson = await res.json();
        if (errorJson.detail) {
          errorDetail = typeof errorJson.detail === 'string' ? errorJson.detail : JSON.stringify(errorJson.detail);
        }
        if (Array.isArray(errorJson.errors)) {
          validationErrors = errorJson.errors;
        }
      } catch {
        // Response was not JSON
      }
      throw new ApiError(errorDetail, res.status, false, validationErrors);
    }

    const data = await res.json();
    return data as T;
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if (err instanceof ApiError) {
      throw err;
    }
    const isAbort = err instanceof DOMException && err.name === 'AbortError';
    const message = isAbort
      ? 'Request timed out after 10 seconds'
      : (err as Error)?.message || 'Failed to connect to positioning engine';
    throw new ApiError(message, undefined, true);
  }
}

export const apiClient = {
  /**
   * Health status check
   */
  async checkHealth(): Promise<HealthResponse> {
    return request<HealthResponse>('/health');
  },

  /**
   * Fetch canonical environment configuration
   */
  async fetchDefaultConfig(): Promise<DefaultConfigResponse> {
    return request<DefaultConfigResponse>('/api/v1/config/default');
  },

  /**
   * Run single positioning simulation
   */
  async runSimulation(req: SimulationRunRequest): Promise<SimulationRunResponse> {
    return request<SimulationRunResponse>('/api/v1/simulations/run', {
      method: 'POST',
      body: JSON.stringify(req),
    });
  },

  /**
   * Compare multiple positioning solvers
   */
  async compareSimulations(req: SimulationCompareRequest): Promise<SimulationCompareResponse> {
    return request<SimulationCompareResponse>('/api/v1/simulations/compare', {
      method: 'POST',
      body: JSON.stringify(req),
    });
  },
};

export const checkHealth = apiClient.checkHealth;
export const fetchDefaultConfig = apiClient.fetchDefaultConfig;
export const runSimulation = apiClient.runSimulation;
export const compareSimulations = apiClient.compareSimulations;

/**
 * Converts a backend SimulationRunResponse into frontend-ready TrajectoryPoints.
 * Handles missing observations and degraded fixes explicitly without crashing or faking (0,0).
 */
export function mapSimulationToTrajectoryPoints(response: SimulationRunResponse): TrajectoryPoint[] {
  const { ground_truth, estimates } = response;
  let lastKnownValidX = ground_truth[0]?.x ?? 6.0;
  let lastKnownValidY = ground_truth[0]?.y ?? 4.0;

  return ground_truth.map((gt, i) => {
    const est = estimates[i];
    const isEstimateValid = est && est.status === 'valid' && est.x !== null && est.y !== null;

    let estX: number;
    let estY: number;
    let errorMeters: number;

    if (isEstimateValid && est.x !== null && est.y !== null) {
      estX = Number(est.x.toFixed(3));
      estY = Number(est.y.toFixed(3));
      errorMeters = Number(Math.hypot(estX - gt.x, estY - gt.y).toFixed(3));
      lastKnownValidX = estX;
      lastKnownValidY = estY;
    } else {
      // For degraded or missing observations, maintain previous estimated track position
      // and explicitly flag status so UI renders degraded visual styling.
      estX = lastKnownValidX;
      estY = lastKnownValidY;
      errorMeters = Number(Math.hypot(estX - gt.x, estY - gt.y).toFixed(3));
    }

    return {
      id: gt.id,
      x: Number(gt.x.toFixed(3)),
      y: Number(gt.y.toFixed(3)),
      z: Number(gt.z.toFixed(3)),
      timestamp: Number(gt.timestamp.toFixed(3)),
      estimatedX: estX,
      estimatedY: estY,
      estimatedZ: Number(gt.z.toFixed(3)),
      errorMeters,
      status: est?.status || 'failed',
      isDegraded: !isEstimateValid,
    };
  });
}
