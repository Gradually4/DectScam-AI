import React, { useState } from 'react';
import api from '../utils/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Link2, AlertTriangle, Play, Loader2, RefreshCw, CheckCircle, ShieldAlert, AlertCircle, ShieldCheck, Globe } from 'lucide-react';

export default function URLScanner() {
  const [urlContent, setUrlContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Sanitizer to extract only the main URL, removing leading/trailing spaces, brackets, or markdown tags
  const sanitizeInput = (input) => {
    let sanitized = input.trim();
    
    // Extract URL pattern that starts with http:// or https://
    // Supports matching IP addresses, domain names, ports, and paths
    const urlPattern = /https?:\/\/[^\s)\]']+/gi;
    const matches = sanitized.match(urlPattern);
    if (matches && matches.length > 0) {
      sanitized = matches[0];
    }
    
    return sanitized;
  };

  const handleAnalyzeUrl = async (e) => {
    e.preventDefault();
    if (!urlContent.trim()) return;

    // Sanitize input URL (extract from markdown if present)
    const sanitizedUrl = sanitizeInput(urlContent);

    // Regex to validate URL (supports IPv4, domains without TLD requirements, ports, and paths)
    const urlRegex = /^https?:\/\/(?:(?:\d{1,3}\.){3}\d{1,3}|[a-zA-Z0-9][-a-zA-Z0-9]*[a-zA-Z0-9](?:\.[a-zA-Z0-9][-a-zA-Z0-9]*[a-zA-Z0-9])*|localhost)(?::\d+)?(?:\/[^\s]*)?$/i;

    if (!urlRegex.test(sanitizedUrl)) {
      setError('Format URL tidak valid. Pastikan diawali dengan http:// atau https://');
      return;
    }

    // Set input box value to the sanitized URL
    setUrlContent(sanitizedUrl);

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await api.post('/api/v1/detect/url', {
        url: sanitizedUrl,
      });

      if (response.data && response.data.status === 'success') {
        setResult(response.data.data);
      } else {
        throw new Error(response.data?.message || 'Format respons tidak valid');
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.errors) {
        const validationErrs = err.response.data.errors;
        const firstErr = validationErrs ? Object.values(validationErrs)[0][0] : 'Validasi gagal.';
        setError(firstErr);
      } else if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Gagal menganalisis URL. Pastikan backend Laravel dan AI Service aktif.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setUrlContent('');
    setResult(null);
    setError('');
  };

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
        <Navbar title="URL Phishing Detector" />

        <main className="p-8 space-y-8 max-w-5xl mx-auto w-full">
          {/* URL Input Form */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 mb-2">Pemindaian URL / Tautan Phishing</h3>
            <p className="text-sm text-slate-400 mb-6 font-semibold">
              Masukkan alamat website lengkap (tautan) untuk memverifikasi keamanan domain, status sertifikat SSL, dan status blacklist global.
            </p>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-brand-red/10 border border-brand-red/20 text-brand-red text-sm flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleAnalyzeUrl} className="space-y-6">
              <div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                    <Link2 className="h-5 w-5" />
                  </span>
                  <input
                    type="text"
                    required
                    value={urlContent}
                    onChange={(e) => setUrlContent(e.target.value)}
                    placeholder="https://alamat-tautan-mencurigakan.com"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none text-slate-900 transition-all text-sm placeholder-slate-400"
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={isLoading || !urlContent.trim()}
                  className="px-6 py-3 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-hover transition-all duration-200 flex items-center space-x-2 shadow-[0_4px_12px_rgba(37,99,235,0.2)] disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Memindai...</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5 fill-current" />
                      <span>Periksa Tautan</span>
                    </>
                  )}
                </button>
                
                {(urlContent || result) && (
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
          {result && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Risk Score Card */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 flex flex-col items-center justify-between text-center shadow-sm">
                <h4 className="text-sm font-bold text-slate-800 mb-4">Fraud Risk Score</h4>
                
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
                      className={result.risk_level === 'bahaya' ? 'text-brand-red' : result.risk_level === 'waspada' ? 'text-brand-yellow' : 'text-brand-green'}
                      strokeDasharray={`${result.risk_score}, 100`}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute flex flex-col">
                    <span className="text-3xl font-extrabold text-slate-800">{result.risk_score}%</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Skor Risiko</span>
                  </div>
                </div>

                <div className="mt-4">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold border uppercase ${getRiskStyles(result.risk_level).bg} ${getRiskStyles(result.risk_level).text}`}>
                    {getRiskStyles(result.risk_level).label}
                  </span>
                </div>
              </div>

              {/* URL Domain Metrics & AI Analysis Details */}
              <div className="md:col-span-2 p-6 rounded-3xl bg-white border border-slate-200 flex flex-col justify-between shadow-sm space-y-6">
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    {React.createElement(getRiskStyles(result.risk_level).icon, {
                      className: `h-6 w-6 ${getRiskStyles(result.risk_level).text}`
                    })}
                    <h4 className="text-sm font-bold text-slate-800">Analisis Keamanan Domain</h4>
                  </div>
                  
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 mb-6">
                    <p className="text-sm font-semibold text-slate-600 leading-relaxed">
                      {result.ai_analysis.recommendation}
                    </p>
                  </div>

                  {/* SSL, Age, & Blacklist indicators */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Domain Age */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-brand-primary">
                        <Globe className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Usia Domain</p>
                        <p className="text-sm font-extrabold text-slate-800">{result.ai_analysis.domain_age_days} Hari</p>
                      </div>
                    </div>

                    {/* SSL Status */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${result.ai_analysis.ssl_status === 'valid' ? 'bg-brand-green/10 text-brand-green' : 'bg-brand-red/10 text-brand-red'}`}>
                        {result.ai_analysis.ssl_status === 'valid' ? <ShieldCheck className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Status SSL</p>
                        <p className={`text-sm font-extrabold capitalize ${result.ai_analysis.ssl_status === 'valid' ? 'text-brand-green' : 'text-brand-red'}`}>
                          {result.ai_analysis.ssl_status}
                        </p>
                      </div>
                    </div>

                    {/* Blacklist Status */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${!result.ai_analysis.blacklist_match ? 'bg-brand-green/10 text-brand-green' : 'bg-brand-red/10 text-brand-red'}`}>
                        {!result.ai_analysis.blacklist_match ? <CheckCircle className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Blacklist Match</p>
                        <p className={`text-sm font-extrabold ${result.ai_analysis.blacklist_match ? 'text-brand-red' : 'text-brand-green'}`}>
                          {result.ai_analysis.blacklist_match ? 'Terdaftar' : 'Aman'}
                        </p>
                      </div>
                    </div>
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
