import React, { useState } from 'react';
import api from '../utils/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { MessageSquare, AlertTriangle, Play, Loader2, RefreshCw, HelpCircle, CheckCircle, ShieldAlert, AlertCircle } from 'lucide-react';

export default function ScamDetector() {
  const [textContent, setTextContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [riskScore, setRiskScore] = useState(null);
  const [riskLevel, setRiskLevel] = useState(null);
  const [hasilTemuanAI, setHasilTemuanAI] = useState(null);
  const [manipulativeKeywords, setManipulativeKeywords] = useState([]);
  const [error, setError] = useState('');

  const handleAnalyzeText = async (e) => {
    e.preventDefault();
    if (!textContent.trim() || textContent.trim().length < 10) return;

    setIsLoading(true);
    setError('');

    try {
      // Connect to Laravel Backend advanced text scan
      const response = await api.post('/api/v1/scam-analyze', {
        text_content: textContent
      });

      if (response.data && response.data.status === 'success') {
        const data = response.data.data;
        setRiskScore(data.risk_score);
        setRiskLevel(data.risk_level);
        setHasilTemuanAI(data.ai_analysis.recommendation);
        setManipulativeKeywords(data.ai_analysis.keywords_detected || []);
      } else {
        throw new Error(response.data?.message || 'Format respons tidak valid');
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.errors) {
        // Form Request validation errors
        const validationErrs = err.response.data.errors;
        const firstErr = validationErrs ? Object.values(validationErrs)[0][0] : 'Validasi gagal.';
        setError(firstErr);
      } else if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Gagal menganalisis teks pesan. Pastikan backend Laravel dan AI Service aktif.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setTextContent('');
    setRiskScore(null);
    setRiskLevel(null);
    setHasilTemuanAI(null);
    setManipulativeKeywords([]);
    setError('');
  };

  // Helper properties based on risk level
  const getRiskStyles = (level) => {
    switch (level) {
      case 'aman':
        return {
          bg: 'bg-brand-green/10 border-brand-green/20',
          text: 'text-brand-green',
          icon: CheckCircle,
          label: 'Aman (Low Risk)'
        };
      case 'waspada':
        return {
          bg: 'bg-brand-yellow/10 border-brand-yellow/20',
          text: 'text-brand-yellow',
          icon: AlertTriangle,
          label: 'Waspada (Medium Risk)'
        };
      case 'bahaya':
      default:
        return {
          bg: 'bg-brand-red/10 border-brand-red/20',
          text: 'text-brand-red',
          icon: ShieldAlert,
          label: 'Bahaya (High Risk)'
        };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col min-h-screen overflow-y-auto">
        <Navbar title="AI Scam Message Detector" />

        <main className="p-8 space-y-8 max-w-5xl mx-auto w-full">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 mb-2">Analisis Teks Pesan</h3>
            <p className="text-sm text-slate-400 mb-6 font-semibold">
              Salin dan tempelkan teks pesan dari SMS, WhatsApp, atau email untuk dianalisis oleh kecerdasan buatan.
            </p>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-brand-red/10 border border-brand-red/20 text-brand-red text-sm flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleAnalyzeText} className="space-y-6">
              <div>
                <textarea
                  rows="6"
                  required
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Tempel pesan mencurigakan di sini..."
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none text-slate-900 transition-all text-sm placeholder-slate-400 resize-none"
                />
                <div className="flex justify-between items-center mt-2 text-xs text-slate-400 font-bold">
                  <span>Panjang teks: {textContent.length} karakter</span>
                  <span>Min. 10 karakter</span>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={isLoading || textContent.trim().length < 10}
                  className="px-6 py-3 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-hover transition-all duration-200 flex items-center space-x-2 shadow-[0_4px_12px_rgba(37,99,235,0.2)] disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Menganalisis...</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5 fill-current" />
                      <span>Analisis Teks</span>
                    </>
                  )}
                </button>

                {(textContent || riskScore !== null) && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors duration-150 flex items-center space-x-2"
                  >
                    <RefreshCw className="h-5 w-5" />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Results section */}
          {riskScore !== null && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Risk Score Widget */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 flex flex-col items-center justify-between text-center shadow-sm">
                <h4 className="text-sm font-bold text-slate-800 mb-4">Fraud Risk Score</h4>

                {/* Circular Score Visualizer */}
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-100"
                      strokeWidth="2.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={(riskLevel || 'aman') === 'bahaya' ? 'text-brand-red' : (riskLevel || 'aman') === 'waspada' ? 'text-brand-yellow' : 'text-brand-green'}
                      strokeDasharray={`${riskScore || 0}, 100`}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute flex flex-col">
                    <span className="text-3xl font-extrabold text-slate-800">{riskScore !== null ? `${riskScore}%` : '0%'}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Skor Risiko</span>
                  </div>
                </div>

                <div className="mt-4">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold border uppercase ${getRiskStyles(riskLevel || 'aman').bg} ${getRiskStyles(riskLevel || 'aman').text}`}>
                    {getRiskStyles(riskLevel || 'aman').label}
                  </span>
                </div>
              </div>

              {/* Analysis Explanation & Highlight */}
              <div className="md:col-span-2 p-6 rounded-3xl bg-white border border-slate-200 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    {React.createElement(getRiskStyles(riskLevel || 'aman').icon, {
                      className: `h-6 w-6 ${getRiskStyles(riskLevel || 'aman').text}`
                    })}
                    <h4 className="text-sm font-bold text-slate-800">Hasil Temuan AI</h4>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 mb-6">
                    <p className="text-sm font-semibold text-slate-600 leading-relaxed">
                      {hasilTemuanAI || 'Pesan tampak normal dan aman untuk dibaca.'}
                    </p>
                  </div>
                </div>

                <div>
                  <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Kata Kunci Manipulatif Terdeteksi</h5>
                  <div className="flex flex-wrap gap-2">
                    {manipulativeKeywords && manipulativeKeywords.length > 0 ? (
                      manipulativeKeywords.map((word, idx) => (
                        <span key={idx} className="px-3 py-1 rounded-lg bg-brand-red/10 border border-brand-red/20 text-brand-red text-xs font-bold">
                          {word}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">Tidak ada kata kunci manipulatif terdeteksi.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
