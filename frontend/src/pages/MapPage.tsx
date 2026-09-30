import { useState, useEffect, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  MapIcon,
  MapPinIcon,
  ClockIcon,
  ArrowPathIcon as RefreshCwIcon,
  InformationCircleIcon as InfoIcon,
  FireIcon as FlameIcon,
  CheckIcon as CheckSquareIcon,
  PaperAirplaneIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

import {
  fetchMapStations,
  fetchDiagnostics,
  fetchStubbleRisk,
  fetchRouteEvaluation,
  MapStationsData,
  DiagnosticData,
  StubbleRiskData,
  CleanAirRouteData,
  FALLBACK_MAP_STATIONS,
  FALLBACK_CLEAN_ROUTE
} from '../api/client'
import { getBadgeStyle } from '../utils/colors'

// Delhi NCR Center Coordinates
const NCR_CENTER: [number, number] = [28.6139, 77.2090]
const DEFAULT_ZOOM = 9.5

function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom, { animate: true })
  }, [center, zoom, map])
  return null
}

interface CanvasWindProps {
  active: boolean
  windSpeed: number
  windDirDeg: number
  animSpeedFactor: number
  isSmokeTransportActive: boolean
}

function CanvasWindStreamlineLayer({
  active,
  windSpeed,
  windDirDeg,
  animSpeedFactor
}: CanvasWindProps) {
  const map = useMap()

  useEffect(() => {
    if (!active) return

    const canvas = document.createElement('canvas')
    canvas.style.position = 'absolute'
    canvas.style.top = '0'
    canvas.style.left = '0'
    canvas.style.pointerEvents = 'none'
    canvas.style.zIndex = '400'

    const container = map.getPanes().overlayPane
    container.appendChild(canvas)

    let animationFrameId: number

    const resizeCanvas = () => {
      const size = map.getSize()
      canvas.width = size.x
      canvas.height = size.y
    }
    resizeCanvas()

    const rad = (windDirDeg * Math.PI) / 180
    const vx = Math.sin(rad) * windSpeed * 0.8 * animSpeedFactor
    const vy = -Math.cos(rad) * windSpeed * 0.8 * animSpeedFactor

    const particlesCount = 120
    const particles = Array.from({ length: particlesCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      length: Math.random() * 25 + 15,
      life: Math.random() * 100
    }))

    const render = () => {
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const mapPos = L.DomUtil.getPosition(map.getPanes().mapPane)
      canvas.style.transform = `translate3d(${-mapPos.x}px, ${-mapPos.y}px, 0px)`

      ctx.lineWidth = 1.5
      ctx.strokeStyle = 'rgba(14, 165, 233, 0.45)'

      particles.forEach(p => {
        p.x += vx
        p.y += vy
        p.life += 1

        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0
        if (p.life > 100) {
          p.x = Math.random() * canvas.width
          p.y = Math.random() * canvas.height
          p.life = 0
        }

        ctx.beginPath()
        ctx.moveTo(p.x, p.y)
        ctx.lineTo(p.x - vx * (p.length / 10), p.y - vy * (p.length / 10))
        ctx.stroke()
      })

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    map.on('move', resizeCanvas)
    map.on('zoom', resizeCanvas)

    return () => {
      cancelAnimationFrame(animationFrameId)
      map.off('move', resizeCanvas)
      map.off('zoom', resizeCanvas)
      if (container.contains(canvas)) {
        container.removeChild(canvas)
      }
    }
  }, [map, active, windSpeed, windDirDeg, animSpeedFactor])

  return null
}

// Continuous Spatial AQI Heatmap Canvas Layer
function CanvasAqiHeatmapLayer({
  active,
  stations
}: {
  active: boolean
  stations: Array<{ lat: number; lon: number; aqi: number; color: string }>
}) {
  const map = useMap()

  useEffect(() => {
    if (!active || !stations.length) return

    const canvas = document.createElement('canvas')
    canvas.style.position = 'absolute'
    canvas.style.top = '0'
    canvas.style.left = '0'
    canvas.style.pointerEvents = 'none'
    canvas.style.zIndex = '350'
    canvas.style.opacity = '0.45'

    const container = map.getPanes().overlayPane
    container.appendChild(canvas)

    const drawHeatmap = () => {
      const size = map.getSize()
      canvas.width = size.x
      canvas.height = size.y

      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const mapPos = L.DomUtil.getPosition(map.getPanes().mapPane)
      canvas.style.transform = `translate3d(${-mapPos.x}px, ${-mapPos.y}px, 0px)`

      // Render radial gaussian density surfaces around stations
      stations.forEach(st => {
        const pt = map.latLngToContainerPoint([st.lat, st.lon])
        const radius = Math.max(90, map.getZoom() * 14)

        const grad = ctx.createRadialGradient(pt.x, pt.y, 10, pt.x, pt.y, radius)
        grad.addColorStop(0, st.color)
        grad.addColorStop(0.5, st.color)
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)')

        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2)
        ctx.fill()
      })
    }

    drawHeatmap()
    map.on('move', drawHeatmap)
    map.on('zoom', drawHeatmap)

    return () => {
      map.off('move', drawHeatmap)
      map.off('zoom', drawHeatmap)
      if (container.contains(canvas)) {
        container.removeChild(canvas)
      }
    }
  }, [map, active, stations])

  return null
}

// 24-Hour Backward Wind Trajectory Plume (HYSPLIT-style Air Parcel Tracing)
function BackwardTrajectoryPlume({
  active,
  origin,
  windSpeed,
  windDirDeg
}: {
  active: boolean
  origin: [number, number]
  windSpeed: number
  windDirDeg: number
}) {
  if (!active) return null

  // Calculate reverse wind advection over 24 hours
  // Reverse wind angle = wind coming FROM angle
  const rad = (windDirDeg * Math.PI) / 180
  const speedScale = (windSpeed * 3600) / 111000 // Convert m/s to degrees per hour approx

  const points: [number, number][] = [origin]
  const intervals = [6, 12, 18, 24]

  intervals.forEach(h => {
    // Air parcel came from opposite direction (upwind)
    const latOffset = Math.cos(rad) * speedScale * h * 0.4
    const lonOffset = Math.sin(rad) * speedScale * h * 0.4
    points.push([origin[0] + latOffset, origin[1] + lonOffset])
  })

  return (
    <>
      <Polyline
        positions={points}
        pathOptions={{
          color: '#e11d48',
          weight: 3,
          dashArray: '6, 6',
          opacity: 0.8
        }}
      />
      {points.map((pt, idx) => (
        <Marker
          key={idx}
          position={pt}
          icon={L.divIcon({
            html: `<div style="background:#e11d48;color:#fff;font-size:9px;font-weight:bold;padding:1px 4px;border-radius:4px;border:1px solid #fff;white-space:nowrap;">-${idx * 6}h</div>`,
            className: 'custom-trajectory-marker',
            iconSize: [28, 16],
            iconAnchor: [14, 8]
          })}
        />
      ))}
    </>
  )
}

function createStationIcon(value: number, color: string, isSelected: boolean) {
  const size = isSelected ? 36 : 30
  const borderStyle = isSelected ? '2px solid #1a1a1a' : '2px solid #ffffff'
  const html = `
    <div style="
      background-color: ${color};
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      border: ${borderStyle};
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-weight: 500;
      font-size: 11px;
      font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      box-shadow: 0 2px 4px rgba(0,0,0,0.15);
    ">
      ${value}
    </div>
  `
  return L.divIcon({ html, className: 'custom-station-marker', iconSize: [size, size], iconAnchor: [size / 2, size / 2] })
}

function createFireIcon(frp: number) {
  const size = Math.min(Math.max(Math.round(frp / 2), 12), 24)
  const html = `
    <div style="
      background-color: #ef4444;
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      border: 2px solid #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 8px rgba(239, 68, 68, 0.6);
    ">
      <div style="width: 4px; height: 4px; background: #ffffff; border-radius: 50%;"></div>
    </div>
  `
  return L.divIcon({ html, className: 'custom-fire-marker', iconSize: [size, size], iconAnchor: [size / 2, size / 2] })
}

export default function MapPage() {
  const [stationData, setStationData] = useState<MapStationsData | null>(null)
  const [diagnosticData, setDiagnosticData] = useState<DiagnosticData | null>(null)
  const [stubbleData, setStubbleData] = useState<StubbleRiskData | null>(null)
  const [routeData, setRouteData] = useState<CleanAirRouteData>(FALLBACK_CLEAN_ROUTE)
  const [loading, setLoading] = useState(true)

  const [selectedHorizon, setSelectedHorizon] = useState<'+0h' | '+6h' | '+12h' | '+24h' | '+48h' | '+72h'>('+0h')
  const [selectedFilter, setSelectedFilter] = useState<'aqi' | 'pm25' | 'pm10' | 'no2' | 'o3'>('aqi')
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null)

  const [mapCenter, setMapCenter] = useState<[number, number]>(NCR_CENTER)
  const [mapZoom, setMapZoom] = useState<number>(DEFAULT_ZOOM)

  const [satelliteMode, setSatelliteMode] = useState<'none' | 'sentinel_no2' | 'modis_aod'>('none')

  const [layers, setLayers] = useState({
    airQuality: true,
    continuousHeatmap: true,
    atmosphericFlow: true,
    backwardTrajectory: true,
    fireActivity: true,
    smokeTransport: true
  })

  // Route selector state
  const [selectedRoutePair, setSelectedRoutePair] = useState<number>(0)
  const routeOptions = [
    { origin: "Central Delhi (Connaught Place)", destination: "Gurugram (Cyber City / DLF)" },
    { origin: "East Delhi (Anand Vihar Hub)", destination: "Noida (Sector 62 / Electronic City)" },
    { origin: "North Delhi (Rohini / GTB Nagar)", destination: "South Delhi (AIIMS / Hauz Khas)" }
  ]

  const loadAllData = useCallback(async (horizonStr: string) => {
    setLoading(true)
    try {
      const [stRes, diagRes, stubRes, rtRes] = await Promise.all([
        fetchMapStations(horizonStr),
        fetchDiagnostics().catch(() => null),
        fetchStubbleRisk().catch(() => null),
        fetchRouteEvaluation().catch(() => FALLBACK_CLEAN_ROUTE)
      ])
      setStationData(stRes)
      if (diagRes) setDiagnosticData(diagRes)
      if (stubRes) setStubbleData(stubRes)
      if (rtRes) setRouteData(rtRes)

      if (stRes.stations.length > 0 && !selectedStationId) {
        setSelectedStationId(stRes.stations[0].id)
      }
    } catch (err) {
      console.error('Failed to load map data:', err)
    } finally {
      setLoading(false)
    }
  }, [selectedStationId])

  useEffect(() => {
    loadAllData(selectedHorizon)
  }, [selectedHorizon, loadAllData])

  const handleRouteChange = async (idx: number) => {
    setSelectedRoutePair(idx)
    const opt = routeOptions[idx]
    const updated = await fetchRouteEvaluation(opt.origin, opt.destination)
    setRouteData(updated)
  }

  const stations = (stationData?.stations && stationData.stations.length > 0) ? stationData.stations : FALLBACK_MAP_STATIONS.stations
  const activeStation = stations.find(s => s.id === selectedStationId) || stations[0]

  const windSpd = diagnosticData?.meteorological_drivers?.wind_speed_10m?.value ?? 6.0
  const windDir = diagnosticData?.meteorological_drivers?.wind_direction_10m?.value ?? 315

  const toggleLayer = (layerKey: keyof typeof layers) => setLayers(prev => ({ ...prev, [layerKey]: !prev[layerKey] }))

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-borderSubtle pb-6">
        <div>
          <div className="flex items-center gap-2 text-[12px] font-medium text-textMuted uppercase tracking-wider mb-1">
            <MapIcon className="w-4 h-4 text-[#0ea5e9]" />
            <span>Spatial Atmospheric Intelligence</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-textMain">
            Delhi NCR Air Quality & Wind Vector Map
          </h1>
          <p className="text-[13px] text-textMuted mt-1">
            Continuous spatial pollution interpolation, animated 10m surface streamlines, satellite fire spots, and 24h backward plume tracking.
          </p>
        </div>

        {/* Satellite Mode Switcher */}
        <div className="flex items-center gap-2 bg-surface p-1 rounded-xl border border-borderSubtle">
          <span className="text-[11px] font-medium text-textMuted px-2">Satellite Layer:</span>
          <button
            onClick={() => setSatelliteMode('none')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
              satelliteMode === 'none' ? 'bg-textMain text-surface' : 'text-textMuted hover:text-textMain'
            }`}
          >
            None
          </button>
          <button
            onClick={() => setSatelliteMode('sentinel_no2')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
              satelliteMode === 'sentinel_no2' ? 'bg-[#8b5cf6] text-white' : 'text-textMuted hover:text-textMain'
            }`}
          >
            Sentinel-5P NO₂
          </button>
          <button
            onClick={() => setSatelliteMode('modis_aod')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
              satelliteMode === 'modis_aod' ? 'bg-[#f59e0b] text-white' : 'text-textMuted hover:text-textMain'
            }`}
          >
            MODIS AOD
          </button>
        </div>
      </div>

      {/* Control Strip */}
      <div className="flex flex-wrap items-center justify-between gap-6 bg-surface p-4 rounded-2xl border border-borderSubtle shadow-sm">
        <div className="flex items-center gap-4">
          <span className="text-[11px] font-medium tracking-wider text-textMuted uppercase">Forecast Horizon:</span>
          <div className="flex gap-1.5">
            {(['+0h', '+6h', '+12h', '+24h', '+48h', '+72h'] as const).map(h => (
              <button
                key={h}
                onClick={() => setSelectedHorizon(h)}
                className={`px-3 py-1 rounded-lg text-[12px] font-medium transition-colors ${
                  selectedHorizon === h ? 'bg-textMain text-surface' : 'text-textMuted hover:text-textMain hover:bg-[#f4f4f5]'
                }`}
              >
                {h === '+0h' ? 'LIVE NOW' : h}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-[11px] font-medium tracking-wider text-textMuted uppercase">Metric:</span>
          <div className="flex gap-1.5">
            {(['aqi', 'pm25', 'pm10', 'no2', 'o3'] as const).map(p => (
              <button
                key={p}
                onClick={() => setSelectedFilter(p)}
                className={`px-3 py-1 rounded-lg text-[12px] uppercase font-medium transition-colors ${
                  selectedFilter === p ? 'bg-textMain text-surface' : 'text-textMuted hover:text-textMain hover:bg-[#f4f4f5]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map + Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Map Container */}
        <div className="lg:col-span-8 space-y-6">
          <div className="h-[560px] w-full rounded-2xl border border-borderSubtle relative overflow-hidden shadow-sm">
            <MapContainer
              center={NCR_CENTER}
              zoom={DEFAULT_ZOOM}
              scrollWheelZoom={true}
              style={{ height: '100%', width: '100%', backgroundColor: '#f4f4f6' }}
            >
              <MapController center={mapCenter} zoom={mapZoom} />
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
                maxZoom={16}
              />

              {/* Satellite Overlays Simulation */}
              {satelliteMode === 'sentinel_no2' && (
                <div className="leaflet-top leaflet-left pointer-events-none p-4 z-[450]">
                  <div className="bg-[#8b5cf6]/20 border border-[#8b5cf6] text-[#6d28d9] px-3 py-1 rounded-lg text-[11px] font-medium backdrop-blur-sm">
                    Copernicus Sentinel-5P Tropospheric NO₂ Overlay (Active)
                  </div>
                </div>
              )}

              {satelliteMode === 'modis_aod' && (
                <div className="leaflet-top leaflet-left pointer-events-none p-4 z-[450]">
                  <div className="bg-[#f59e0b]/20 border border-[#f59e0b] text-[#b45309] px-3 py-1 rounded-lg text-[11px] font-medium backdrop-blur-sm">
                    NASA MODIS Aerosol Optical Depth (AOD) Layer (Active)
                  </div>
                </div>
              )}

              {/* Continuous Spatial AQI Heatmap Canvas Layer */}
              <CanvasAqiHeatmapLayer active={layers.continuousHeatmap} stations={stations} />

              {/* 24-Hour Backward Trajectory Plume */}
              <BackwardTrajectoryPlume
                active={layers.backwardTrajectory}
                origin={[activeStation?.lat ?? NCR_CENTER[0], activeStation?.lon ?? NCR_CENTER[1]]}
                windSpeed={windSpd}
                windDirDeg={windDir}
              />

              {/* Station Markers */}
              {layers.airQuality && stations.map(st => {
                const val = selectedFilter === 'aqi' ? st.aqi : st[selectedFilter]
                return (
                  <Marker
                    key={st.id}
                    position={[st.lat, st.lon]}
                    icon={createStationIcon(val, st.color, st.id === selectedStationId)}
                    eventHandlers={{
                      click: () => {
                        setSelectedStationId(st.id)
                        setMapCenter([st.lat, st.lon])
                      }
                    }}
                  />
                )
              })}

              {/* Dynamic 10m Wind Streamlines */}
              <CanvasWindStreamlineLayer
                active={layers.atmosphericFlow}
                windSpeed={windSpd}
                windDirDeg={windDir}
                animSpeedFactor={1.0}
                isSmokeTransportActive={layers.smokeTransport}
              />

              {/* Satellite Fire Hotspots */}
              {layers.fireActivity && stubbleData?.active_fire_hotspots?.map((fire: any, idx: number) => (
                <Marker key={idx} position={[fire.latitude, fire.longitude]} icon={createFireIcon(fire.frp)} />
              ))}
            </MapContainer>
          </div>

          {/* Clean Air Commute Route Navigator */}
          <div className="bg-surface border border-borderSubtle rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-borderSubtle pb-4">
              <div>
                <h3 className="text-[15px] font-medium text-textMain flex items-center gap-2">
                  <PaperAirplaneIcon className="w-4 h-4 text-[#0ea5e9]" />
                  Clean Air Commute Route Navigator
                </h3>
                <p className="text-[12px] text-textMuted">
                  Calculate and compare personal particulate inhalation exposure between travel corridors.
                </p>
              </div>

              {/* Route Picker */}
              <select
                value={selectedRoutePair}
                onChange={(e) => handleRouteChange(Number(e.target.value))}
                className="bg-[#f4f4f5] border border-borderSubtle rounded-lg px-3 py-1.5 text-[12px] font-medium text-textMain outline-none cursor-pointer"
              >
                {routeOptions.map((opt, i) => (
                  <option key={i} value={i}>
                    {opt.origin.split(' ')[0]} → {opt.destination.split(' ')[0]}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Route A: Express */}
              <div className="p-4 rounded-xl border border-borderSubtle bg-[#fafafa] space-y-2">
                <div className="flex justify-between items-center text-[12px]">
                  <span className="font-semibold text-textMain">{routeData.express_route.name}</span>
                  <span className="text-[#dc2626] font-medium font-mono">High Exposure</span>
                </div>
                <div className="text-[11px] text-textMuted">{routeData.express_route.exposure_index}</div>
                <div className="flex justify-between items-baseline pt-2 border-t border-borderSubtle text-[12px]">
                  <span>Travel Time: <b>{routeData.express_route.duration_mins} mins</b></span>
                  <span>Avg PM2.5: <b>{routeData.express_route.avg_pm25} µg</b></span>
                  <span className="text-[#dc2626] font-semibold">Inhaled: {routeData.express_route.inhaled_dose_ug} µg</span>
                </div>
              </div>

              {/* Route B: Clean Corridor */}
              <div className="p-4 rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] space-y-2">
                <div className="flex justify-between items-center text-[12px]">
                  <span className="font-semibold text-[#166534]">{routeData.clean_corridor_route.name}</span>
                  <span className="text-[#16a34a] font-bold font-mono">Recommended</span>
                </div>
                <div className="text-[11px] text-[#15803d]">{routeData.clean_corridor_route.exposure_index}</div>
                <div className="flex justify-between items-baseline pt-2 border-t border-[#bbf7d0] text-[12px] text-[#166534]">
                  <span>Travel Time: <b>{routeData.clean_corridor_route.duration_mins} mins</b></span>
                  <span>Avg PM2.5: <b>{routeData.clean_corridor_route.avg_pm25} µg</b></span>
                  <span className="font-bold text-[#15803d]">Inhaled: {routeData.clean_corridor_route.inhaled_dose_ug} µg</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-[#f0f9ff] border border-[#bae6fd] rounded-xl text-[12px] text-[#0369a1]">
              <span>💡 {routeData.health_impact.advice}</span>
              <span className="font-semibold shrink-0">{routeData.safe_commute_window}</span>
            </div>
          </div>
        </div>

        {/* Sidebar Controls & Selected Station Details */}
        <div className="lg:col-span-4 space-y-6">
          {/* Map Layer Toggles */}
          <div className="bg-surface border border-borderSubtle rounded-2xl p-5 shadow-sm space-y-4">
            <span className="text-[11px] font-medium tracking-wider text-textMuted uppercase block border-b border-borderSubtle pb-2">
              Display Layers
            </span>
            <div className="space-y-3 text-[13px] text-textMain">
              <button onClick={() => toggleLayer('airQuality')} className="flex items-center gap-3 w-full group">
                <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${layers.airQuality ? 'bg-textMain border-textMain' : 'border-borderSubtle'}`}>
                  {layers.airQuality && <CheckSquareIcon className="w-3 h-3 text-surface" strokeWidth={2.5} />}
                </div>
                <span className="group-hover:text-textMuted transition-colors">CPCB Monitoring Stations</span>
              </button>

              <button onClick={() => toggleLayer('continuousHeatmap')} className="flex items-center gap-3 w-full group">
                <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${layers.continuousHeatmap ? 'bg-textMain border-textMain' : 'border-borderSubtle'}`}>
                  {layers.continuousHeatmap && <CheckSquareIcon className="w-3 h-3 text-surface" strokeWidth={2.5} />}
                </div>
                <span className="group-hover:text-textMuted transition-colors">Continuous Spatial AQI Heatmap</span>
              </button>

              <button onClick={() => toggleLayer('atmosphericFlow')} className="flex items-center gap-3 w-full group">
                <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${layers.atmosphericFlow ? 'bg-textMain border-textMain' : 'border-borderSubtle'}`}>
                  {layers.atmosphericFlow && <CheckSquareIcon className="w-3 h-3 text-surface" strokeWidth={2.5} />}
                </div>
                <span className="group-hover:text-textMuted transition-colors">10m Dynamic Wind Streamlines</span>
              </button>

              <button onClick={() => toggleLayer('backwardTrajectory')} className="flex items-center gap-3 w-full group">
                <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${layers.backwardTrajectory ? 'bg-textMain border-textMain' : 'border-borderSubtle'}`}>
                  {layers.backwardTrajectory && <CheckSquareIcon className="w-3 h-3 text-surface" strokeWidth={2.5} />}
                </div>
                <span className="group-hover:text-textMuted transition-colors">24h Backward Plume Trajectory</span>
              </button>

              <button onClick={() => toggleLayer('fireActivity')} className="flex items-center gap-3 w-full group">
                <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${layers.fireActivity ? 'bg-textMain border-textMain' : 'border-borderSubtle'}`}>
                  {layers.fireActivity && <CheckSquareIcon className="w-3 h-3 text-surface" strokeWidth={2.5} />}
                </div>
                <span className="group-hover:text-textMuted transition-colors">NASA FIRMS Satellite Active Fires</span>
              </button>
            </div>
          </div>

          {/* Selected Station Panel */}
          {activeStation && (
            <div className="bg-surface border border-borderSubtle rounded-2xl p-6 shadow-sm space-y-4">
              <span className="text-[11px] font-medium tracking-wider text-textMuted uppercase block border-b border-borderSubtle pb-2">
                Monitoring Node Details
              </span>
              <div>
                <h3 className="text-[16px] font-medium text-textMain">{activeStation.name}</h3>
                <p className="text-[12px] text-textMuted">{activeStation.city} · [{activeStation.lat.toFixed(2)}, {activeStation.lon.toFixed(2)}]</p>
              </div>

              <div className="pt-2 flex items-baseline justify-between">
                <div>
                  <div className="text-[48px] font-light tracking-tighter leading-none" style={{ color: activeStation.color }}>
                    {activeStation.aqi}
                  </div>
                  <div className="text-[11px] mt-2 font-medium px-2 py-0.5 rounded inline-block" style={getBadgeStyle(activeStation.color)}>
                    {activeStation.category}
                  </div>
                </div>
                <div className="text-right text-[11px] text-textMuted">
                  <div>Horizon: <b>{activeStation.horizon ?? selectedHorizon}</b></div>
                  <div className="mt-1">{activeStation.type}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-borderSubtle text-[12px]">
                <div className="p-2.5 bg-[#fafafa] rounded-xl border border-borderSubtle">
                  <span className="text-textMuted text-[10px] block">PM2.5</span>
                  <span className="text-[14px] font-semibold text-textMain">{activeStation.pm25} µg/m³</span>
                </div>
                <div className="p-2.5 bg-[#fafafa] rounded-xl border border-borderSubtle">
                  <span className="text-textMuted text-[10px] block">PM10</span>
                  <span className="text-[14px] font-semibold text-textMain">{activeStation.pm10} µg/m³</span>
                </div>
                <div className="p-2.5 bg-[#fafafa] rounded-xl border border-borderSubtle">
                  <span className="text-textMuted text-[10px] block">NO2</span>
                  <span className="text-[14px] font-semibold text-textMain">{activeStation.no2} µg/m³</span>
                </div>
                <div className="p-2.5 bg-[#fafafa] rounded-xl border border-borderSubtle">
                  <span className="text-textMuted text-[10px] block">O3</span>
                  <span className="text-[14px] font-semibold text-textMain">{activeStation.o3} µg/m³</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
