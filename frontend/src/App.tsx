import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import OverviewPage from './pages/OverviewPage'
import ForecastPage from './pages/ForecastPage'
import MapPage from './pages/MapPage'
import AtmospherePage from './pages/AtmospherePage'
import StubblePage from './pages/StubblePage'
import ExplainabilityPage from './pages/ExplainabilityPage'
import AlertsPage from './pages/AlertsPage'
import ValidationPage from './pages/ValidationPage'
import TermsPage from './pages/TermsPage'
import PrivacyPage from './pages/PrivacyPage'
import PolicySimulatorPage from './pages/PolicySimulatorPage'
import BulletinModal from './components/BulletinModal'
import {
  fetch72hForecast, fetchDiagnostics, fetchStubbleRisk, fetchValidationMetrics, fetchAlertsHistory, fetchWrfStub,
  ForecastData, DiagnosticData, StubbleRiskData, ValidationMetricsData, AlertsHistoryData, WrfStubData
} from './api/client'

export default function App() {
  const [forecast, setForecast] = useState<ForecastData | null>(null)
  const [diagnostics, setDiagnostics] = useState<DiagnosticData | null>(null)
  const [risk, setRisk] = useState<StubbleRiskData | null>(null)
  const [validation, setValidation] = useState<ValidationMetricsData | null>(null)
  const [alerts, setAlerts] = useState<AlertsHistoryData | null>(null)
  const [wrfStub, setWrfStub] = useState<WrfStubData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showWrfModal, setShowWrfModal] = useState(false)
  const [showBulletinModal, setShowBulletinModal] = useState(false)

  const loadAllData = async () => {
    setLoading(true)
    try {
      const [fData, dData, rData, vData, aData, wData] = await Promise.all([
        fetch72hForecast(),
        fetchDiagnostics(),
        fetchStubbleRisk(),
        fetchValidationMetrics(),
        fetchAlertsHistory(),
        fetchWrfStub()
      ])
      setForecast(fData)
      setDiagnostics(dData)
      setRisk(rData)
      setValidation(vData)
      setAlerts(aData)
      setWrfStub(wData)
    } catch (e) {
      console.error('Failed to load application data:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAllData()
  }, [])

  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-page text-textMain">
        <Sidebar />

        <div className="flex-1 flex flex-col min-w-0">
          <Header
            onRefresh={loadAllData}
            loading={loading}
            onOpenWrfModal={() => setShowWrfModal(true)}
            onOpenBulletinModal={() => setShowBulletinModal(true)}
          />

          <main className="flex-1 overflow-y-auto bg-page relative">
            <Routes>
              <Route path="/" element={<OverviewPage forecast={forecast} diagnostics={diagnostics} risk={risk} loading={loading} />} />
              <Route path="/forecast" element={<ForecastPage forecast={forecast} loading={loading} />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/atmosphere" element={<AtmospherePage diagnostics={diagnostics} loading={loading} />} />
              <Route path="/stubble" element={<StubblePage risk={risk} loading={loading} />} />
              <Route path="/explainability" element={<ExplainabilityPage diagnostics={diagnostics} forecast={forecast} loading={loading} />} />
              <Route path="/alerts" element={<AlertsPage alerts={alerts} loading={loading} />} />
              <Route path="/simulator" element={<PolicySimulatorPage />} />
              <Route path="/validation" element={<ValidationPage validation={validation} loading={loading} />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
            </Routes>
          </main>

          <footer className="py-6 px-10 flex flex-col sm:flex-row items-center justify-between text-[11px] text-textMuted bg-page shrink-0 gap-2 border-t border-borderSubtle">
            <span>AeroCast NCR · Air Pollution-Weather Intelligence System</span>
            <div className="flex items-center gap-6">
              <Link to="/terms" className="hover:text-textMain transition-colors">Terms of Service</Link>
              <Link to="/privacy" className="hover:text-textMain transition-colors">Privacy Policy</Link>
              <a href="https://github.com/CodesByY22/AeroCast-NCR" target="_blank" rel="noreferrer" className="hover:text-textMain transition-colors">GitHub</a>
            </div>
          </footer>
        </div>

        {/* WRF-Chem modal */}
        {showWrfModal && wrfStub && (
          <div className="fixed inset-0 bg-white/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="bg-surface border border-borderSubtle rounded-2xl max-w-lg w-full p-8 space-y-6 shadow-2xl">
              <div className="flex justify-between items-start">
                <h3 className="text-[16px] font-medium text-textMain tracking-tight">
                  Operational WRF-Chem Connector Contract
                </h3>
                <button onClick={() => setShowWrfModal(false)} className="text-textMuted hover:text-textMain text-xl p-1 leading-none">&times;</button>
              </div>
              <div className="bg-[#f4f4f5] rounded-xl p-5 font-mono text-[12px] text-textMain space-y-2 border border-borderSubtle">
                <div><span className="text-accent font-medium">Status:</span> {wrfStub.status}</div>
                <div><span className="text-[#f97316] font-medium">Notice:</span> {wrfStub.notice}</div>
                <div><span className="text-[#22c55e] font-medium">Target Resolution:</span> {wrfStub.target_resolution}</div>
                <div><span className="text-textMuted font-medium">Benchmark:</span> {wrfStub.benchmark_reference}</div>
              </div>
              <p className="text-[13px] text-textMuted leading-relaxed">
                This research stub satisfies the hard constraint: AeroCast NCR does not fake 3D atmospheric chemistry runs, exposing a clean API contract for operational WRF-Chem HPC coupling post-MVP.
              </p>
            </div>
          </div>
        )}

        {/* Official Environmental Bulletin Modal */}
        <BulletinModal
          isOpen={showBulletinModal}
          onClose={() => setShowBulletinModal(false)}
          forecast={forecast}
          diagnostics={diagnostics}
          risk={risk}
          alerts={alerts}
        />
      </div>
    </BrowserRouter>
  )
}
