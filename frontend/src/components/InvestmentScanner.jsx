import React, { useState, useRef } from 'react';
import api from '../utils/api';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { AlertCircle, ShieldAlert, AlertTriangle, CheckCircle, Loader2, Play, RefreshCw, Info, Upload, Trash2, X, FileImage, ShieldCheck } from 'lucide-react';

export default function InvestmentScanner() {
  // 1. Manajemen State (React Hooks)
  const [entityName, setEntityName] = useState('');
  const [promoText, setPromoText] = useState('');
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef(null);

  // File Upload Handlers
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    processFile(file);
  };

  const processFile = (file) => {
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('File yang diunggah harus berupa gambar (JPG, PNG, WEBP).');
      return;
    }

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Ukuran gambar maksimal adalah 10MB.');
      return;
    }

    setScreenshotFile(file);
    setError('');
    
    // Create local URL for preview
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  const removeImage = () => {
    setScreenshotFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview('');
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Drag & Drop Handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    processFile(file);
  };

  // 3. Logika Pengiriman Data (FormData)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!promoText.trim()) return;

    setIsLoading(true);
    setError('');
    setResult(null);

    // Build FormData payload
    const formData = new FormData();
    formData.append('entity_name', entityName);
    formData.append('promotional_text', promoText);
    if (screenshotFile) {
      formData.append('screenshot_file', screenshotFile);
    }

    try {
      // Kirim FormData ke endpoint API
      const response = await api.post('/api/v1/investment-scan', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data && response.data.status === 'success') {
        setResult(response.data.data);
      } else {
        throw new Error(response.data?.message || 'Gagal menerima data hasil analisis AI.');
      }
    } catch (err) {
      console.error('Investment scan submit error:', err);
      if (err.response && err.response.data && err.response.data.errors) {
        const validationErrs = err.response.data.errors;
        const firstErr = validationErrs ? Object.values(validationErrs)[0][0] : 'Validasi input gagal.';
        setError(firstErr);
      } else if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Gagal menganalisis teks investasi. Pastikan server Laravel dan AI Service berjalan.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setEntityName('');
    setPromoText('');
    removeImage();
    setResult(null);
    setError('');
  };

  const getRiskStyles = (level) => {
    switch (level) {
      case 'aman':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          badge: 'bg-emerald-500 text-white',
          stroke: '#10b981', // emerald-500
          icon: CheckCircle,
          label: 'Aman'
        };
      case 'waspada':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          badge: 'bg-amber-500 text-white',
          stroke: '#f59e0b', // amber-500
          icon: AlertTriangle,
          label: 'Waspada'
        };
      case 'bahaya':
      default:
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          badge: 'bg-rose-500 text-white',
          stroke: '#f43f5e', // rose-500
          icon: ShieldAlert,
          label: 'Bahaya'
        };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col min-h-screen overflow-y-auto">
        <Navbar title="Investment Forensics" />

        <main className="p-8 space-y-8 max-w-5xl mx-auto w-full">
          {/* Main Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-blue-50 text-brand-primary rounded-xl">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Deteksi Penipuan Investasi & Robot Trading Bodong</h3>
            </div>
            <p className="text-sm text-slate-400 mb-8 font-semibold">
              Tempelkan teks promosi, pesan chat grup, instruksi deposit, atau selebaran penawaran investasi di bawah ini. AI Forensik Finansial kami akan memeriksa kecacatan fundamental dan taktik psikologis penawaran tersebut.
            </p>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-brand-red/10 border border-brand-red/20 text-brand-red text-sm flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="font-semibold">{error}</span>
              </div>
            )}

            {/* 2. Desain Antarmuka Form Dua Kolom (Grid) */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Kolom Kiri (Input Teks) */}
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Nama Entitas / Platform Investasi
                    </label>
                    <input
                      type="text"
                      value={entityName}
                      onChange={(e) => setEntityName(e.target.value)}
                      placeholder="Contoh: Sentosa Trading, Budi Trading Mentor"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none text-slate-900 transition-all text-sm placeholder-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Teks Promosi atau Pesan Broadcast
                    </label>
                    <textarea
                      required
                      value={promoText}
                      onChange={(e) => setPromoText(e.target.value)}
                      placeholder="Tempelkan teks promosi investasi di sini..."
                      rows={6}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none text-slate-900 transition-all text-sm placeholder-slate-400 leading-relaxed resize-none"
                    />
                  </div>
                </div>

                {/* Kolom Kanan (Upload Bukti) */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Unggah Brosur / Screenshot Grafik (Opsional)
                  </label>
                  
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => !screenshotFile && fileInputRef.current?.click()}
                    className={`h-[238px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-200 overflow-hidden relative ${
                      isDragOver
                        ? 'border-brand-primary bg-brand-primary/5'
                        : screenshotFile
                        ? 'border-slate-200 bg-slate-50'
                        : 'border-slate-300 hover:border-brand-primary hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />

                    {/* Pratinjau Gambar / Image Preview */}
                    {screenshotFile && imagePreview ? (
                      <div className="w-full h-full relative group">
                        <img
                          src={imagePreview}
                          alt="Screenshot Preview"
                          className="w-full h-full object-contain"
                        />
                        {/* Overlay with details and remove button */}
                        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-4 space-y-3">
                          <p className="text-xs font-semibold truncate max-w-[90%]">{screenshotFile.name}</p>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent triggering file input click
                              removeImage();
                            }}
                            className="p-2 bg-brand-red text-white rounded-xl hover:bg-red-650 transition-colors flex items-center space-x-1 text-xs font-bold shadow-md"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Hapus Gambar</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Drag & Drop Placeholder
                      <div className="p-6 text-center space-y-3 flex flex-col items-center">
                        <div className="w-12 h-12 bg-blue-50 text-brand-primary rounded-xl flex items-center justify-center">
                          <Upload className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-700">Tarik & lepas file gambar di sini</p>
                          <p className="text-xs text-slate-400 font-semibold mt-1">atau klik untuk menelusuri file komputer Anda</p>
                        </div>
                        <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-bold uppercase tracking-wide">
                          JPG, PNG, WEBP (Maks 10MB)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-2">
                <button
                  type="submit"
                  disabled={isLoading || !promoText.trim()}
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
                      <span>Analisis Sekarang</span>
                    </>
                  )}
                </button>

                {(entityName || promoText || screenshotFile || result) && (
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

          {/* 4. Desain Hasil Analisis (Result Dashboard) */}
          {result && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in">
              
              {/* Risk Score Card */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 flex flex-col items-center justify-between text-center shadow-sm">
                <h4 className="text-sm font-bold text-slate-800 mb-4">Investment Risk Score</h4>
                
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
                      strokeDasharray={`${result.risk_score}, 100`}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      stroke={getRiskStyles(result.risk_level).stroke}
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute flex flex-col">
                    <span className="text-3xl font-extrabold text-slate-800">{Math.round(result.risk_score)}%</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Skor Risiko</span>
                  </div>
                </div>

                {/* 4. Badge untuk tingkat risiko */}
                <div className="mt-4">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${getRiskStyles(result.risk_level).badge}`}>
                    Risiko: {getRiskStyles(result.risk_level).label}
                  </span>
                </div>
              </div>

              {/* 4. Kotak terpisah (card) untuk rincian AI */}
              <div className="md:col-span-2 p-6 rounded-3xl bg-white border border-slate-200 flex flex-col justify-between shadow-sm space-y-6">
                <div>
                  <div className="flex items-center space-x-2 mb-4 border-b border-slate-150 pb-3">
                    {React.createElement(getRiskStyles(result.risk_level).icon, {
                      className: `h-6 w-6 ${getRiskStyles(result.risk_level).text}`
                    })}
                    <h4 className="text-base font-bold text-slate-800">Laporan Forensik AI Finansial</h4>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Fundamental Flaws Card */}
                    <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5 shadow-sm">
                      <h5 className="text-sm font-bold text-slate-800 flex items-center space-x-2 mb-3">
                        <span className="w-2 h-4 bg-blue-500 rounded-full inline-block"></span>
                        <span>Fundamental Reality Check</span>
                      </h5>
                      <p className="text-sm font-medium text-slate-650 leading-relaxed whitespace-pre-line">
                        {result.ai_analysis_details?.fundamental_flaws || 'Tidak terdeteksi kejanggalan fundamental.'}
                      </p>
                    </div>

                    {/* Psychological Tactics Card */}
                    <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5 shadow-sm">
                      <h5 className="text-sm font-bold text-slate-800 flex items-center space-x-2 mb-3">
                        <span className="w-2 h-4 bg-amber-500 rounded-full inline-block"></span>
                        <span>Analisis Taktik FOMO & Psikologis</span>
                      </h5>
                      <p className="text-sm font-medium text-slate-650 leading-relaxed whitespace-pre-line">
                        {result.ai_analysis_details?.psychological_tactics || 'Tidak terdeteksi taktik FOMO/urgensi palsu.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center space-x-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100 mt-2">
                  <Info className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>
                    Analisis di atas dibuat secara otomatis oleh sistem AI DectScam untuk membantu Anda memitigasi risiko finansial.
                  </span>
                </div>
              </div>

            </div>
          )}
        </main>
      </div>
    </div>
  );
}
