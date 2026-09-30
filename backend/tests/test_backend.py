import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.aqi_calculator import compute_cpcb_aqi, get_aqi_category
from app.diagnostics.meteorology import compute_ventilation_index_proxy, compute_inversion_proxy_index
from app.services.smoke_risk import compute_smoke_transport_risk

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "operational"
    assert "WRF-Chem" in data["benchmark"]

def test_cpcb_aqi_calculator():
    res = compute_cpcb_aqi(pm25=110.0)
    assert res["aqi"] > 200
    assert res["category"] in ["Poor", "Very Poor"]
    
    res_good = compute_cpcb_aqi(pm25=25.0)
    assert res_good["aqi"] <= 50
    assert res_good["category"] == "Good"

def test_meteorological_proxies():
    vent = compute_ventilation_index_proxy(wind_speed_10m=2.0, pbl_height_m=500.0)
    assert vent["ventilation_index_proxy"] == 1000.0
    assert vent["is_proxy"] is True
    assert "Stagnation" in vent["status"]
    
    inv = compute_inversion_proxy_index(temp_2m=15.0, rh_2m=85.0, wind_speed_10m=1.0, hour_ist=3)
    assert inv["is_proxy"] is True
    assert inv["inversion_proxy_index"] >= 50.0

def test_stubble_smoke_risk_engine():
    risk = compute_smoke_transport_risk(wind_dir_10m=315.0, wind_speed_10m=2.0, total_frp_200km=500.0, fire_count=100)
    assert risk["stubble_transport_risk_score"] > 30.0
    assert risk["engine_type"] == "Data-Driven Vector Transport Risk Engine (Proxy)"

def test_forecast_72h_api():
    response = client.get("/api/forecast/72h")
    assert response.status_code == 200
    data = response.json()
    assert "forecast_timeline" in data
    assert len(data["forecast_timeline"]) == 7 # +0h, +1h, +6h, +12h, +24h, +48h, +72h

def test_map_stations_api():
    response = client.get("/api/map/stations")
    assert response.status_code == 200
    data = response.json()
    assert "stations" in data
    assert len(data["stations"]) >= 5

def test_validation_metrics_api():
    response = client.get("/api/validation/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "metrics_table" in data
    assert "split_protocol" in data
    assert "Strict Time-Series" in data["split_protocol"]["rule"]

def test_alerts_history_api():
    response = client.get("/api/alerts/history")
    assert response.status_code == 200
    data = response.json()
    assert "active_alert" in data
    assert "forecast_alerts" in data

def test_wrf_chem_stub_api():
    response = client.get("/api/wrf-chem/stub")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "research_not_yet_operational"

def test_simulator_evaluate_api():
    response = client.get("/api/simulator/evaluate?stubble_reduction_pct=50&traffic_curb_pct=30")
    assert response.status_code == 200
    data = response.json()
    assert "summary" in data
    assert "simulated_timeline" in data
    assert data["summary"]["net_pm25_reduction"] >= 0

def test_extreme_risk_api():
    response = client.get("/api/alerts/extreme-risk")
    assert response.status_code == 200
    data = response.json()
    assert "probability_severe_plus_24h" in data
    assert "extreme_risk_level" in data

def test_routes_evaluate_api():
    response = client.get("/api/routes/evaluate")
    assert response.status_code == 200
    data = response.json()
    assert "express_route" in data
    assert "clean_corridor_route" in data
    assert "health_impact" in data

def test_shap_waterfall_api():
    response = client.get("/api/explainability/shap-waterfall?horizon=+24h")
    assert response.status_code == 200
    data = response.json()
    assert "forces" in data
    assert len(data["forces"]) >= 4

