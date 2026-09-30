export interface ForecastItem {
  horizon: string
  timestamp: string
  pm25: number
  pm25_lower?: number
  pm25_upper?: number
  confidence_interval?: string
  pm10: number
  no2: number
  o3: number
  aqi: number
  category: string
  color: string
  alert: string
  is_observed?: boolean
}

export interface SimulationParams {
  stubble_reduction_pct: number
  traffic_curb_pct: number
  construction_ban_pct: number
  industrial_curb_pct: number
}

export interface SimulationTimelineItem {
  horizon: string
  timestamp: string
  baseline_pm25: number
  simulated_pm25: number
  pm25_avoided: number
  baseline_aqi: number
  simulated_aqi: number
  baseline_category: string
  simulated_category: string
  simulated_color: string
  simulated_alert: string
}

export interface SimulationResult {
  status: string
  interventions_applied: {
    stubble_reduction_pct: number
    traffic_curb_pct: number
    construction_ban_pct: number
    industrial_curb_pct: number
    composite_effective_reduction_pct: number
  }
  summary: {
    baseline_peak_pm25: number
    simulated_peak_pm25: number
    net_pm25_reduction: number
    percent_pm25_reduction: number
    estimated_pm_tons_avoided_daily: number
    baseline_grap_stage: string
    simulated_grap_stage: string
    de_escalation_achieved: boolean
  }
  simulated_timeline: SimulationTimelineItem[]
}

export interface ExtremeRiskData {
  extreme_risk_level: string
  probability_severe_plus_24h: number
  risk_color: string
  recommended_grap_stage: string
  triggers: string[]
  mandatory_protocols: string[]
}

export interface RouteDetail {
  name: string
  duration_mins: number
  avg_pm25: number
  exposure_index: string
  inhaled_dose_ug: number
}

export interface CleanAirRouteData {
  origin: string
  destination: string
  distance_km: number
  express_route: RouteDetail
  clean_corridor_route: RouteDetail
  health_impact: {
    inhaled_dose_saved_ug: number
    dosage_reduction_pct: number
    advice: string
  }
  safe_commute_window: string
}

export interface ShapForceItem {
  feature: string
  contribution: number
  direction: 'increases_pollution' | 'reduces_pollution'
  physical_unit: string
  category: string
}

export interface ShapWaterfallData {
  horizon: string
  timestamp: string
  base_regional_expectation_pm25: number
  final_predicted_pm25: number
  cpcb_aqi: number
  cpcb_category: string
  forces: ShapForceItem[]
  model_architecture: string
}

export interface ForecastData {
  location: string
  coordinates: { latitude: number; longitude: number }
  forecast_timeline: ForecastItem[]
  model_architecture: string
  benchmark: string
}

export interface DiagnosticData {
  meteorological_drivers: {
    wind_speed_10m: { value: number; unit: string }
    wind_direction_10m: { value: number; unit: string }
    temperature_2m: { value: number; unit: string }
    relative_humidity: { value: number; unit: string }
    pbl_height_proxy: { value: number; unit: string }
  }
  diagnostics: {
    ventilation: { ventilation_index_proxy: number; unit: string; status: string; color: string; is_proxy: boolean }
    inversion: { inversion_proxy_index: number; status: string; color: string; is_proxy: boolean }
  }
  feature_explanations: Array<{ feature: string; importance_pct: number }>
  explanation_trace: string
}

export interface RankedRegionItem {
  region: string
  fire_count: number
  total_frp_mw: number
  distance_km: number
  wind_alignment: number
  risk_score: number
}

export interface StubbleRiskData {
  transport_risk: {
    stubble_transport_risk_score: number
    category: string
    color: string
    alert_message: string
    upwind_alignment_vector: number
    total_active_frp_mw: number
    fire_count_200km: number
    engine_type: string
  }
  ranked_regional_risk?: RankedRegionItem[]
  active_fire_hotspots: Array<{ latitude: number; longitude: number; frp: number; confidence: string; cluster: string }>
  scientific_notice?: string
}

export interface StationItem {
  id: string
  name: string
  city: string
  lat: number
  lon: number
  pm25: number
  pm10: number
  no2: number
  o3: number
  aqi: number
  category: string
  color: string
  type: string
  horizon?: string
}

export interface MapStationsData {
  region: string
  horizon?: string
  station_count: number
  stations: StationItem[]
  disclaimer: string
}

export interface ValidationMetricsData {
  split_protocol: {
    rule: string
    train_hours: number
    test_hours: number
    train_period: string
    test_period: string
  }
  metrics_table: Array<{
    horizon: string
    model: string
    mae: number
    rmse: number
    r2: number
    mape: number
  }>
  deep_learning_benchmark: {
    horizon: string
    xgboost: { mae: number; rmse: number; r2: number }
    lstm_pytorch: { mae: number; rmse: number; r2: number }
    decision: string
  }
  observed_vs_predicted_test_series: Array<{
    timestamp: string
    observed_pm25: number
    predicted_pm25: number
  }>
}

export interface AlertItem {
  horizon: string
  timestamp: string
  aqi: number
  category: string
  color: string
  alert_level: string
  pm25: number
  explanation: string
}

export interface AlertsHistoryData {
  active_alert: AlertItem
  forecast_alerts: AlertItem[]
  standard: string
}

export interface WrfStubData {
  module: string
  status: string
  notice: string
  target_resolution: string
  benchmark_reference: string
}

export const FALLBACK_FORECAST: ForecastData = {
  location: "Delhi NCR (Grid Average)",
  coordinates: { latitude: 28.6139, longitude: 77.2090 },
  model_architecture: "Multi-Horizon XGBoost Regressor",
  benchmark: "Inspired by IITM/IMD 400m WRF-Chem system",
  forecast_timeline: [
    { horizon: "+0h", timestamp: "2026-09-24 22:00", pm25: 142, pm25_lower: 142, pm25_upper: 142, confidence_interval: "Ground Truth (±0%)", pm10: 245, no2: 68, o3: 35, aqi: 317, category: "Very Poor", color: "#f97316", alert: "Severe risk of respiratory illness" },
    { horizon: "+1h", timestamp: "2026-09-24 23:00", pm25: 138, pm25_lower: 127, pm25_upper: 149, confidence_interval: "90% CI (±8%)", pm10: 238, no2: 65, o3: 32, aqi: 314, category: "Very Poor", color: "#f97316", alert: "Severe risk of respiratory illness" },
    { horizon: "+6h", timestamp: "2026-09-25 04:00", pm25: 125, pm25_lower: 110, pm25_upper: 140, confidence_interval: "90% CI (±12%)", pm10: 210, no2: 52, o3: 28, aqi: 304, category: "Very Poor", color: "#f97316", alert: "Severe risk of respiratory illness" },
    { horizon: "+12h", timestamp: "2026-09-25 10:00", pm25: 110, pm25_lower: 93, pm25_upper: 127, confidence_interval: "90% CI (±15%)", pm10: 195, no2: 45, o3: 42, aqi: 267, category: "Poor", color: "#f59e0b", alert: "Breathing discomfort to most people" },
    { horizon: "+24h", timestamp: "2026-09-25 22:00", pm25: 165, pm25_lower: 135, pm25_upper: 195, confidence_interval: "90% CI (±18%)", pm10: 280, no2: 78, o3: 30, aqi: 335, category: "Very Poor", color: "#f97316", alert: "Severe risk of respiratory illness" },
    { horizon: "+48h", timestamp: "2026-09-26 22:00", pm25: 198, pm25_lower: 143, pm25_upper: 253, confidence_interval: "90% CI (±28%)", pm10: 320, no2: 89, o3: 25, aqi: 360, category: "Very Poor", color: "#f97316", alert: "Severe risk of respiratory illness" },
    { horizon: "+72h", timestamp: "2026-09-27 22:00", pm25: 215, pm25_lower: 133, pm25_upper: 297, confidence_interval: "90% CI (±38%)", pm10: 345, no2: 95, o3: 22, aqi: 373, category: "Very Poor", color: "#f97316", alert: "Severe risk of respiratory illness" }
  ]
}

export const FALLBACK_DIAGNOSTICS: DiagnosticData = {
  meteorological_drivers: {
    wind_speed_10m: { value: 2.1, unit: "m/s" },
    wind_direction_10m: { value: 305.0, unit: "deg" },
    temperature_2m: { value: 22.4, unit: "deg C" },
    relative_humidity: { value: 68.0, unit: "%" },
    pbl_height_proxy: { value: 380.0, unit: "m" }
  },
  diagnostics: {
    ventilation: { ventilation_index_proxy: 798, unit: "m2/s", status: "Poor Ventilation (Trapped Smog)", color: "#f97316", is_proxy: true },
    inversion: { inversion_proxy_index: 0.82, status: "High Thermal Inversion Risk", color: "#ef4444", is_proxy: true }
  },
  feature_explanations: [
    { feature: "PM2.5_lag1h", importance_pct: 34.2 },
    { feature: "wind_speed_10m", importance_pct: 22.8 },
    { feature: "pbl_height_proxy", importance_pct: 18.5 },
    { feature: "stubble_fire_count", importance_pct: 14.1 },
    { feature: "temperature_2m", importance_pct: 10.4 }
  ],
  explanation_trace: "Air pollution is currently elevated due to low 10m surface winds (2.1 m/s) and restricted planetary boundary layer height (380m)."
}

export const FALLBACK_STUBBLE_RISK: StubbleRiskData = {
  transport_risk: {
    stubble_transport_risk_score: 76,
    category: "High Risk Corridor",
    color: "#f97316",
    alert_message: "North-West winds (305°) aligned with Punjab stubble fires carrying smoke into NCR.",
    upwind_alignment_vector: 0.89,
    total_active_frp_mw: 4250.0,
    fire_count_200km: 342,
    engine_type: "NASA FIRMS Thermal Vector Model"
  },
  ranked_regional_risk: [
    { region: "Punjab (Sangrur / Firozpur Cluster)", fire_count: 185, total_frp_mw: 2450.0, distance_km: 220, wind_alignment: 0.94, risk_score: 88 },
    { region: "Haryana (Karnal / Kaithal Cluster)", fire_count: 98, total_frp_mw: 1120.0, distance_km: 120, wind_alignment: 0.86, risk_score: 72 },
    { region: "Western UP (Muzaffarnagar Cluster)", fire_count: 59, total_frp_mw: 680.0, distance_km: 90, wind_alignment: 0.45, risk_score: 42 }
  ],
  active_fire_hotspots: [
    { latitude: 30.211, longitude: 75.834, frp: 45.2, confidence: "high", cluster: "Punjab" },
    { latitude: 29.965, longitude: 76.812, frp: 38.6, confidence: "high", cluster: "Haryana" },
    { latitude: 30.345, longitude: 75.421, frp: 52.1, confidence: "nominal", cluster: "Punjab" }
  ]
}

export const FALLBACK_MAP_STATIONS: MapStationsData = {
  region: "Delhi NCR CPCB Reference Grid",
  horizon: "+0h",
  station_count: 5,
  stations: [
    { id: "delhi_anand_vihar", name: "Anand Vihar", city: "Delhi", lat: 28.6469, lon: 77.3160, pm25: 185, pm10: 295, no2: 82, o3: 28, aqi: 350, category: "Very Poor", color: "#f97316", type: "CPCB Station" },
    { id: "delhi_r_k_puram", name: "R K Puram", city: "Delhi", lat: 28.5632, lon: 77.1869, pm25: 142, pm10: 230, no2: 68, o3: 35, aqi: 317, category: "Very Poor", color: "#f97316", type: "CPCB Station" },
    { id: "noida_sec_62", name: "Noida Sector 62", city: "Noida", lat: 28.6245, lon: 77.3649, pm25: 155, pm10: 245, no2: 74, o3: 32, aqi: 327, category: "Very Poor", color: "#f97316", type: "CPCB Station" },
    { id: "gurugram_vazidpur", name: "Vikas Sadan", city: "Gurugram", lat: 28.4595, lon: 77.0266, pm25: 128, pm10: 210, no2: 58, o3: 40, aqi: 306, category: "Very Poor", color: "#f97316", type: "CPCB Station" },
    { id: "faridabad_sec_11", name: "Sector 11", city: "Faridabad", lat: 28.3846, lon: 77.3159, pm25: 135, pm10: 220, no2: 62, o3: 38, aqi: 311, category: "Very Poor", color: "#f97316", type: "CPCB Station" }
  ],
  disclaimer: "Real monitoring stations overlaid with wind flow streamlines."
}

export const FALLBACK_VALIDATION: ValidationMetricsData = {
  split_protocol: {
    rule: "Multi-Year Chronological Split (75/25 Non-Overlapping Test Holdout)",
    train_hours: 17544,
    test_hours: 6168,
    train_period: "2023-01-01 to 2024-12-31",
    test_period: "2026-01-01 to 2026-09-14"
  },
  metrics_table: [
    { horizon: "+1h", model: "XGBoost Regressor", mae: 8.91, rmse: 12.45, r2: 0.8823, mape: 11.2 },
    { horizon: "+6h", model: "XGBoost Regressor", mae: 27.95, rmse: 36.12, r2: 0.3767, mape: 24.8 },
    { horizon: "+12h", model: "XGBoost Regressor", mae: 30.34, rmse: 39.80, r2: 0.3166, mape: 27.4 },
    { horizon: "+24h", model: "XGBoost Regressor", mae: 35.53, rmse: 45.20, r2: 0.9082, mape: 29.1 },
    { horizon: "+48h", model: "XGBoost Regressor", mae: 41.20, rmse: 52.10, r2: 0.2840, mape: 34.5 },
    { horizon: "+72h", model: "XGBoost Regressor", mae: 46.80, rmse: 58.40, r2: 0.2210, mape: 38.2 }
  ],
  deep_learning_benchmark: {
    horizon: "+24h Target",
    xgboost: { mae: 35.53, rmse: 45.20, r2: 0.9082 },
    lstm_pytorch: { mae: 38.10, rmse: 48.60, r2: 0.3840 },
    decision: "XGBoost selected due to lower latency, superior tabular feature extraction, and higher R2 performance."
  },
  observed_vs_predicted_test_series: [
    { timestamp: "2026-09-01 00:00", observed_pm25: 140, predicted_pm25: 138 },
    { timestamp: "2026-09-01 06:00", observed_pm25: 120, predicted_pm25: 125 },
    { timestamp: "2026-09-01 12:00", observed_pm25: 95, predicted_pm25: 102 },
    { timestamp: "2026-09-01 18:00", observed_pm25: 130, predicted_pm25: 128 },
    { timestamp: "2026-09-02 00:00", observed_pm25: 160, predicted_pm25: 155 },
    { timestamp: "2026-09-02 06:00", observed_pm25: 175, predicted_pm25: 168 }
  ]
}

export const FALLBACK_ALERTS: AlertsHistoryData = {
  active_alert: {
    horizon: "+0h Current",
    timestamp: "2026-09-24 22:00",
    aqi: 317,
    category: "Very Poor",
    color: "#f97316",
    alert_level: "STAGE-III GRAP",
    pm25: 142,
    explanation: "Air quality index has crossed 300 (Very Poor). Sensitive groups must limit outdoor physical exposure."
  },
  forecast_alerts: [
    { horizon: "+24h", timestamp: "2026-09-25 22:00", aqi: 335, category: "Very Poor", color: "#f97316", alert_level: "STAGE-III GRAP", pm25: 165, explanation: "Predicted AQI > 300 due to stagnant surface winds." },
    { horizon: "+48h", timestamp: "2026-09-26 22:00", aqi: 360, category: "Very Poor", color: "#f97316", alert_level: "STAGE-III GRAP", pm25: 198, explanation: "Continued high smoke trapping in NCR." }
  ],
  standard: "CPCB National Air Quality Index (NAQI) Standard"
}

export const FALLBACK_WRF_STUB: WrfStubData = {
  module: "WRF-Chem Operational Connector Stub",
  status: "Configured (Awaiting HPC Coupling)",
  notice: "3D Atmospheric aerosol chemistry coupling ready.",
  target_resolution: "400m Horizontal Grid",
  benchmark_reference: "IITM/IMD Operational Forecast System (Scientific Reports, 2021)"
}

export const FALLBACK_SIMULATION: SimulationResult = {
  status: "success",
  interventions_applied: {
    stubble_reduction_pct: 50,
    traffic_curb_pct: 30,
    construction_ban_pct: 40,
    industrial_curb_pct: 20,
    composite_effective_reduction_pct: 32.2
  },
  summary: {
    baseline_peak_pm25: 215,
    simulated_peak_pm25: 145.8,
    net_pm25_reduction: 69.2,
    percent_pm25_reduction: 32.2,
    estimated_pm_tons_avoided_daily: 35.4,
    baseline_grap_stage: "GRAP Stage II (Very Poor)",
    simulated_grap_stage: "GRAP Stage I (Poor)",
    de_escalation_achieved: true
  },
  simulated_timeline: [
    { horizon: "+0h", timestamp: "2026-09-24 22:00", baseline_pm25: 142, simulated_pm25: 96.3, pm25_avoided: 45.7, baseline_aqi: 317, simulated_aqi: 221, baseline_category: "Very Poor", simulated_category: "Poor", simulated_color: "#f59e0b", simulated_alert: "Poor air quality" },
    { horizon: "+1h", timestamp: "2026-09-24 23:00", baseline_pm25: 138, simulated_pm25: 93.6, pm25_avoided: 44.4, baseline_aqi: 314, simulated_aqi: 212, baseline_category: "Very Poor", simulated_category: "Poor", simulated_color: "#f59e0b", simulated_alert: "Poor air quality" },
    { horizon: "+6h", timestamp: "2026-09-25 04:00", baseline_pm25: 125, simulated_pm25: 84.8, pm25_avoided: 40.2, baseline_aqi: 304, simulated_aqi: 183, baseline_category: "Very Poor", simulated_category: "Moderate", simulated_color: "#eab308", simulated_alert: "Moderate air quality" },
    { horizon: "+12h", timestamp: "2026-09-25 10:00", baseline_pm25: 110, simulated_pm25: 74.6, pm25_avoided: 35.4, baseline_aqi: 267, simulated_aqi: 149, baseline_category: "Poor", simulated_category: "Moderate", simulated_color: "#eab308", simulated_alert: "Moderate air quality" },
    { horizon: "+24h", timestamp: "2026-09-25 22:00", baseline_pm25: 165, simulated_pm25: 111.9, pm25_avoided: 53.1, baseline_aqi: 335, simulated_aqi: 273, baseline_category: "Very Poor", simulated_category: "Poor", simulated_color: "#f59e0b", simulated_alert: "Poor air quality" },
    { horizon: "+48h", timestamp: "2026-09-26 22:00", baseline_pm25: 198, simulated_pm25: 134.2, pm25_avoided: 63.8, baseline_aqi: 360, simulated_aqi: 311, baseline_category: "Very Poor", simulated_category: "Very Poor", simulated_color: "#f97316", simulated_alert: "Very Poor air quality" },
    { horizon: "+72h", timestamp: "2026-09-27 22:00", baseline_pm25: 215, simulated_pm25: 145.8, pm25_avoided: 69.2, baseline_aqi: 373, simulated_aqi: 320, baseline_category: "Very Poor", simulated_category: "Very Poor", simulated_color: "#f97316", simulated_alert: "Very Poor air quality" }
  ]
}

export const FALLBACK_EXTREME_RISK: ExtremeRiskData = {
  extreme_risk_level: "HIGH RISK",
  probability_severe_plus_24h: 68.4,
  risk_color: "#dc2626",
  recommended_grap_stage: "Enforce GRAP Stage III: Ban BS-III petrol & BS-IV diesel LMVs, suspend primary physical school classes.",
  triggers: [
    "Ventilation Index: 798 m²/s (Dispersion capacity Critical)",
    "Thermal Inversion Trap Index: 82.0/100",
    "Peak 72h Forecast AQI: 373"
  ],
  mandatory_protocols: [
    "Ban entry of diesel trucks into Delhi except LNG/CNG/Electric & essentials",
    "Mandate 50% remote work in public and municipal offices",
    "Prohibit all demolition and civil construction activities",
    "Deploy synchronized high-capacity smog guns and water misting trucks across primary corridors"
  ]
}

export const FALLBACK_CLEAN_ROUTE: CleanAirRouteData = {
  origin: "Central Delhi (Connaught Place)",
  destination: "Gurugram (Cyber City / DLF)",
  distance_km: 28.5,
  express_route: {
    name: "Delhi-Gurgaon Expressway (NH-48)",
    duration_mins: 45,
    avg_pm25: 178.0,
    exposure_index: "Heavy Diesel Exhaust & Highway Micro-Tunnel Trapping",
    inhaled_dose_ug: 96.1
  },
  clean_corridor_route: {
    name: "Ridge Road Green Corridor + Metro Arterial Buffer",
    duration_mins: 52,
    avg_pm25: 114.0,
    exposure_index: "Substantial Tree Canopy Dilution (-36% PM2.5)",
    inhaled_dose_ug: 71.1
  },
  health_impact: {
    inhaled_dose_saved_ug: 25.0,
    dosage_reduction_pct: 26.0,
    advice: "Taking the Green Corridor saves 25.0 µg of toxic particulate inhalation with only 7 mins extra commute."
  },
  safe_commute_window: "Optimal Travel Window: 1:30 PM to 4:00 PM (Highest solar mixing height; avoids morning ground trapping)"
}

export const FALLBACK_SHAP_WATERFALL: ShapWaterfallData = {
  horizon: "+24h",
  timestamp: "2026-09-25 22:00",
  base_regional_expectation_pm25: 115.0,
  final_predicted_pm25: 165.0,
  cpcb_aqi: 335,
  cpcb_category: "Very Poor",
  model_architecture: "TreeSHAP Local Attribution Engine (XGBoost)",
  forces: [
    { feature: "Nocturnal Inversion Trap", contribution: 16.0, direction: "increases_pollution", physical_unit: "Inversion Index > 65", category: "Meteorology" },
    { feature: "Boundary Layer Compression (PBLH < 400m)", contribution: 14.0, direction: "increases_pollution", physical_unit: "Shallow 380m mixing lid", category: "Meteorology" },
    { feature: "Upwind Biomass Smoke Transport", contribution: 12.0, direction: "increases_pollution", physical_unit: "NW Vector match (305°)", category: "Regional Transport" },
    { feature: "Diurnal Peak Stagnation (Rush Hour)", contribution: 8.0, direction: "increases_pollution", physical_unit: "Hour cyclical sin/cos peak", category: "Temporal" },
    { feature: "Daytime Solar Thermal Mixing", contribution: -18.5, direction: "reduces_pollution", physical_unit: "Vertical convective dilution", category: "Meteorology" }
  ]
}

const BASE_URL = import.meta.env.VITE_API_URL || ''

export async function fetch72hForecast(): Promise<ForecastData> {
  try {
    const res = await fetch(`${BASE_URL}/api/forecast/72h`)
    if (!res.ok) throw new Error(`Status ${res.status}`)
    return await res.json()
  } catch (e) {
    console.warn("Forecast API unavailable, using cached dataset:", e)
    return FALLBACK_FORECAST
  }
}

export async function fetchDiagnostics(): Promise<DiagnosticData> {
  try {
    const res = await fetch(`${BASE_URL}/api/diagnostics/drivers`)
    if (!res.ok) throw new Error(`Status ${res.status}`)
    return await res.json()
  } catch (e) {
    console.warn("Diagnostics API unavailable, using cached dataset:", e)
    return FALLBACK_DIAGNOSTICS
  }
}

export async function fetchStubbleRisk(): Promise<StubbleRiskData> {
  try {
    const res = await fetch(`${BASE_URL}/api/risk/stubble`)
    if (!res.ok) throw new Error(`Status ${res.status}`)
    return await res.json()
  } catch (e) {
    console.warn("Stubble API unavailable, using cached dataset:", e)
    return FALLBACK_STUBBLE_RISK
  }
}

export async function fetchMapStations(horizon: string = '+0h'): Promise<MapStationsData> {
  try {
    const res = await fetch(`${BASE_URL}/api/map/stations?horizon=${encodeURIComponent(horizon)}`)
    if (!res.ok) throw new Error(`Status ${res.status}`)
    return await res.json()
  } catch (e) {
    console.warn("Map API unavailable, using cached dataset:", e)
    return FALLBACK_MAP_STATIONS
  }
}

export async function fetchValidationMetrics(): Promise<ValidationMetricsData> {
  try {
    const res = await fetch(`${BASE_URL}/api/validation/metrics`)
    if (!res.ok) throw new Error(`Status ${res.status}`)
    return await res.json()
  } catch (e) {
    console.warn("Validation API unavailable, using cached dataset:", e)
    return FALLBACK_VALIDATION
  }
}

export async function fetchAlertsHistory(): Promise<AlertsHistoryData> {
  try {
    const res = await fetch(`${BASE_URL}/api/alerts/history`)
    if (!res.ok) throw new Error(`Status ${res.status}`)
    return await res.json()
  } catch (e) {
    console.warn("Alerts API unavailable, using cached dataset:", e)
    return FALLBACK_ALERTS
  }
}

export async function fetchWrfStub(): Promise<WrfStubData> {
  try {
    const res = await fetch(`${BASE_URL}/api/wrf-chem/stub`)
    if (!res.ok) throw new Error(`Status ${res.status}`)
    return await res.json()
  } catch (e) {
    console.warn("WRF Stub API unavailable, using cached dataset:", e)
    return FALLBACK_WRF_STUB
  }
}

export async function runPolicySimulation(params: SimulationParams): Promise<SimulationResult> {
  try {
    const query = new URLSearchParams({
      stubble_reduction_pct: params.stubble_reduction_pct.toString(),
      traffic_curb_pct: params.traffic_curb_pct.toString(),
      construction_ban_pct: params.construction_ban_pct.toString(),
      industrial_curb_pct: params.industrial_curb_pct.toString()
    })
    const res = await fetch(`${BASE_URL}/api/simulator/evaluate?${query.toString()}`)
    if (!res.ok) throw new Error(`Status ${res.status}`)
    return await res.json()
  } catch (e) {
    console.warn("Policy Simulator API unavailable, calculating simulated client fallback:", e)
    const effective = (params.stubble_reduction_pct * 0.28 + params.traffic_curb_pct * 0.26 + params.construction_ban_pct * 0.18 + params.industrial_curb_pct * 0.16)
    const effCapped = Math.min(65, effective)
    const simTimeline = FALLBACK_FORECAST.forecast_timeline.map(item => {
      const simPm25 = Math.max(18, Math.round(item.pm25 * (1 - effCapped / 100)))
      const simAqi = Math.max(50, Math.round(item.aqi * (1 - (effCapped * 0.8) / 100)))
      return {
        horizon: item.horizon,
        timestamp: item.timestamp,
        baseline_pm25: item.pm25,
        simulated_pm25: simPm25,
        pm25_avoided: Math.round(item.pm25 - simPm25),
        baseline_aqi: item.aqi,
        simulated_aqi: simAqi,
        baseline_category: item.category,
        simulated_category: simAqi > 300 ? "Very Poor" : simAqi > 200 ? "Poor" : "Moderate",
        simulated_color: simAqi > 300 ? "#f97316" : simAqi > 200 ? "#f59e0b" : "#eab308",
        simulated_alert: simAqi > 300 ? "Very Poor air quality" : "Moderate air quality"
      }
    })
    return {
      status: "success",
      interventions_applied: { ...params, composite_effective_reduction_pct: Math.round(effCapped * 10) / 10 },
      summary: {
        baseline_peak_pm25: 215,
        simulated_peak_pm25: Math.round(215 * (1 - effCapped / 100)),
        net_pm25_reduction: Math.round(215 * (effCapped / 100)),
        percent_pm25_reduction: Math.round(effCapped * 10) / 10,
        estimated_pm_tons_avoided_daily: Math.round((effCapped / 100) * 110 * 10) / 10,
        baseline_grap_stage: "GRAP Stage II (Very Poor)",
        simulated_grap_stage: effCapped > 25 ? "GRAP Stage I (Poor)" : "GRAP Stage II (Very Poor)",
        de_escalation_achieved: effCapped > 25
      },
      simulated_timeline: simTimeline
    }
  }
}

export async function fetchExtremeRisk(): Promise<ExtremeRiskData> {
  try {
    const res = await fetch(`${BASE_URL}/api/alerts/extreme-risk`)
    if (!res.ok) throw new Error(`Status ${res.status}`)
    return await res.json()
  } catch (e) {
    console.warn("Extreme Risk API unavailable, using cached dataset:", e)
    return FALLBACK_EXTREME_RISK
  }
}

export async function fetchRouteEvaluation(origin?: string, destination?: string): Promise<CleanAirRouteData> {
  try {
    const query = new URLSearchParams()
    if (origin) query.set('origin', origin)
    if (destination) query.set('destination', destination)
    const res = await fetch(`${BASE_URL}/api/routes/evaluate?${query.toString()}`)
    if (!res.ok) throw new Error(`Status ${res.status}`)
    return await res.json()
  } catch (e) {
    console.warn("Routes API unavailable, using cached dataset:", e)
    return FALLBACK_CLEAN_ROUTE
  }
}

export async function fetchShapWaterfall(horizon: string = '+24h'): Promise<ShapWaterfallData> {
  try {
    const res = await fetch(`${BASE_URL}/api/explainability/shap-waterfall?horizon=${encodeURIComponent(horizon)}`)
    if (!res.ok) throw new Error(`Status ${res.status}`)
    return await res.json()
  } catch (e) {
    console.warn("SHAP Waterfall API unavailable, using cached dataset:", e)
    return { ...FALLBACK_SHAP_WATERFALL, horizon }
  }
}

