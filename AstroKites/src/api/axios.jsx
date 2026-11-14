import axios from 'axios';

const rawBaseURL = import.meta.env.VITE_API_BASE_URL ?? (import.meta.env.DEV ? 'http://127.0.0.1:8000' : '');
const baseURL = (rawBaseURL || '').replace(/\/+$/, '');

// Create axios instance with base configuration
const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

// Generic helper to unwrap response
const unwrap = (resp) => (resp && resp.data ? resp.data : resp);
const toErrorPayload = (err) => {
    if (err?.response) {
        return { ok: false, status: err.response.status, error: err.response.data || err.message };
    }
    if (err?.request) {
        return { ok: false, status: 0, error: 'No response from server' };
    }
    return { ok: false, status: 0, error: err?.message || 'Unknown error' };
};

const postSafe = async (url, payload) => {
    try {
        const res = await api.post(url, payload);
        return { ok: true, status: res.status, data: unwrap(res) };
    } catch (err) {
        return toErrorPayload(err);
    }
};

const getSafe = async (url, params = {}) => {
    try {
        const res = await api.get(url, { params });
        return { ok: true, status: res.status, data: unwrap(res) };
    } catch (err) {
        return toErrorPayload(err);
    }
};

// ==========================================
// Existing Legacy Endpoints (Fully Preserved)
// ==========================================

export const postPowerData = async ({ lat, lon, start = null, end = null, parameters = ['T2M', 'PRECTOT', 'WS2M'], token = null, timeout = 60 }) => {
    const payload = { lat, lon, start, end, parameters, token, timeout };
    return await postSafe('/power-data', payload);
};

export const postForecast = async ({ lat, lon, start = null, end = null, parameters = ['T2M', 'PRECTOT', 'WS2M'], window = 7, token = null, timeout = 60 }) => {
    const payload = { lat, lon, start, end, parameters, window, token, timeout };
    return await postSafe('/forecast', payload);
};

export const getForecastData = async (lat, lon) => {
    return await postSafe('/forecast', { lat, lon });
};

export const postForecastSimple = async ({ lat, lon, date, ndays = 7, parameters = ['T2M', 'PRECTOT', 'WS2M'], window = 7, token = null, timeout = 60 }) => {
    const payload = { lat, lon, date, ndays, parameters, window, token, timeout };
    return await postSafe('/forecast-simple', payload);
};

export const postCheckDate = async ({ lat, lon, date, ndays = 30, window = 7, thresholds = null, token = null, timeout = 30 }) => {
    const payload = { lat, lon, date, ndays, window, thresholds, token, timeout };
    return await postSafe('/check-date', payload);
};

export const postStateSevenDayForecast = async ({ states, phone = null, send_sms = false, hot_threshold_c = 38.0, heavy_rain_threshold_mm = 50.0, openweather_api_key = null }) => {
    const payload = { states, phone, send_sms, hot_threshold_c, heavy_rain_threshold_mm, openweather_api_key };
    return await postSafe('/state-7day-forecast', payload);
};

export const postSendSms = async ({ phone, body }) => {
    const payload = { phone, body };
    return await postSafe('/send-sms', payload);
};

// ==========================================
// EarthTrend India v1 Scientific Endpoints
// ==========================================

export const getVariables = async () => getSafe('/api/v1/variables');
export const getDatasets = async () => getSafe('/api/v1/datasets');
export const getIndianStates = async () => getSafe('/api/v1/regions/states');
export const getIndianDistricts = async (state) => getSafe('/api/v1/regions/districts', { state });

export const getTimeSeries = async ({ region = 'IN-MH', variable = 'temperature', start_year = null, end_year = 2024 }) => {
    return getSafe('/api/v1/data/series', { region, variable, start_year, end_year });
};

export const analyzeTrends = async ({ region_id = 'IN-MH', variable = 'temperature', start_year = null, end_year = 2024, prewhiten = true, alpha = 0.05 }) => {
    return postSafe('/api/v1/trends/analyze', { region_id, variable, start_year, end_year, prewhiten, alpha });
};

export const getTrendsMap = async (variable = 'temperature') => {
    return getSafe('/api/v1/trends/map', { variable });
};

export const compareRegions = async ({ region_ids = ['IN-MH', 'IN-RJ'], variable = 'temperature' }) => {
    return postSafe('/api/v1/compare', { region_ids, variable });
};

export const getOppositeTrends = async (variable = 'temperature') => {
    return getSafe('/api/v1/trends/opposite', { variable });
};

export const getBivariateCorrelation = async ({ region_id = 'IN-MH', variable_1 = 'rainfall', variable_2 = 'vegetation' }) => {
    return postSafe('/api/v1/correlation', { region_id, variable_1, variable_2 });
};

export const getCorrelationMatrix = async (region = 'IN-MH') => {
    return getSafe('/api/v1/correlation/matrix', { region });
};

export const detectAnomalies = async ({ region_id = 'IN-MH', variable = 'temperature', start_year = null, end_year = 2024 }) => {
    return postSafe('/api/v1/anomalies', { region_id, variable, start_year, end_year });
};

export const getDataQuality = async () => getSafe('/api/v1/data-quality');

export const askScientificAssistant = async (question) => {
    return postSafe('/api/v1/assistant/explain', { question });
};

export const createPdfReport = async ({ region_id = 'IN-MH', variable = 'temperature' }) => {
    return postSafe('/api/v1/reports', { region_id, variable });
};

export const getReportsList = async () => getSafe('/api/v1/reports');
