import React, { useState, useRef } from 'react';
import api from '../utils/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Image, Upload, Play, Loader2, RefreshCw, CheckCircle, ShieldAlert, AlertTriangle, AlertCircle, FileText, X } from 'lucide-react';

export default function ScreenshotScanner() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
  const MAX_SIZE_MB = 5;

  const validateFile = (file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Format file tidak didukung. Gunakan JPG, JPEG, atau PNG.');
      return false;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Ukuran file melebihi batas ${MAX_SIZE_MB}MB.`);
      return false;
    }
    return true;
  };

  const handleFileSelect = (file) => {
    setError('');
    if (!file) return;
    if (!validateFile(file)) return;

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAnalyzeImage = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await api.post('/api/v1/detect/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data && response.data.status === 'success') {
        setResult(response.data.data);
      } else {
        const errMsg = response.data?.ai_analysis?.recommendation || response.data?.data?.ai_analysis?.recommendation || response.data?.message || 'Format respons tidak valid';
        throw new Error(errMsg);
      }
    } catch (err) {
      console.error(err);
      if (err.response?.data?.errors) {
        const validationErrs = err.response.data.errors;
        const firstErr = validationErrs ? Object.values(validationErrs)[0][0] : 'Validasi gagal.';
        setError(firstErr);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(err.message || 'Gagal menganalisis gambar. Pastikan backend Laravel dan AI Service aktif.');
      }
    } finally {
      setIsLoading(false);
    }
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
      <Sidebar />

      <div className="flex-grow flex flex-col min-h-screen overflow-y-auto">
        <Navbar title="Screenshot Scam Analyzer" />

        <main className="p-8 space-y-8 max-w-5xl mx-auto w-full">
          {/* Upload Form */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 mb-2">Analisis Screenshot / Gambar</h3>
            <p className="text-sm text-slate-400 mb-6 font-semibold">
              Unggah tangkapan layar struk transfer, bukti obrolan, atau dokumen mencurigakan untuk dianalisis melalui teknologi OCR.
            </p>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-brand-red/10 border border-brand-red/20 text-brand-red text-sm flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleAnalyzeImage} className="space-y-6">
              {/* Drag & Drop Zone */}
              {!selectedFile ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative flex flex-col items-center justify-center w-full h-56 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 ${
                    isDragOver
                      ? 'border-brand-primary bg-brand-primary/5'
                      : 'border-slate-200 bg-slate-50 hover:border-brand-primary/40 hover:bg-slate-100/50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={handleInputChange}
                    className="hidden"
                  />
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all duration-200 ${
                    isDragOver
                      ? 'bg-brand-primary/10 text-brand-primary'
                      : 'bg-slate-100 text-slate-400'
                  }`}>
                    <Upload className="h-7 w-7" />
                  </div>
                  <p className="text-sm font-semibold text-slate-600">
                    {isDragOver ? 'Lepaskan file di sini...' : 'Seret & Lepas gambar, atau klik untuk memilih'}
                  </p>
                  <p className="text-xs text-slate-400 font-medium mt-1">
                    Format: JPG, JPEG, PNG · Maks. {MAX_SIZE_MB}MB
                  </p>
                </div>
              ) : (
                /* File Preview */
                <div className="relative flex items-center space-x-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <div className="w-24 h-24 rounded-xl overflow-hidden border border-slate-200 bg-white flex-shrink-0">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{selectedFile.name}</p>
                    <p className="text-xs text-slate-400 font-medium mt-1">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB · {selectedFile.type}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-2 text-slate-400 hover:text-brand-red hover:bg-brand-red/5 rounded-xl transition-colors duration-150 flex-shrink-0"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={isLoading || !selectedFile}
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
                      <span>Analisis Gambar</span>
                    </>
                  )}
                </button>

                {(selectedFile || result) && (
                  <button
                    type="button"
                    onClick={handleRemoveFile}
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
            <div className="space-y-8">
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

                {/* Analysis Details */}
                <div className="md:col-span-2 p-6 rounded-3xl bg-white border border-slate-200 flex flex-col justify-between shadow-sm space-y-6">
                  <div>
                    <div className="flex items-center space-x-2 mb-4">
                      {React.createElement(getRiskStyles(result.risk_level).icon, {
                        className: `h-6 w-6 ${getRiskStyles(result.risk_level).text}`
                      })}
                      <h4 className="text-sm font-bold text-slate-800">Hasil Analisis Forensik Digital</h4>
                    </div>

                    {/* Recommendation */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 mb-6">
                      <p className="text-sm font-semibold text-slate-600 leading-relaxed">
                        {result.ai_analysis.recommendation}
                      </p>
                    </div>

                    {/* Indicators */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Manipulation Detection */}
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          result.ai_analysis.manipulation_detected
                            ? 'bg-brand-red/10 text-brand-red'
                            : 'bg-brand-green/10 text-brand-green'
                        }`}>
                          {result.ai_analysis.manipulation_detected
                            ? <ShieldAlert className="h-5 w-5" />
                            : <CheckCircle className="h-5 w-5" />
                          }
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Manipulasi</p>
                          <p className={`text-sm font-extrabold ${
                            result.ai_analysis.manipulation_detected ? 'text-brand-red' : 'text-brand-green'
                          }`}>
                            {result.ai_analysis.manipulation_detected ? 'Terdeteksi' : 'Tidak Ada'}
                          </p>
                        </div>
                      </div>

                      {/* Anomaly Area */}
                      {result.ai_analysis.anomaly_area && (
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-brand-yellow/10 flex items-center justify-center text-brand-yellow">
                            <AlertTriangle className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Area Anomali</p>
                            <p className="text-xs font-bold text-slate-700">{result.ai_analysis.anomaly_area}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Extracted Text (OCR) */}
              {result.extracted_text && (
                <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
                  <div className="flex items-center space-x-2 mb-4">
                    <FileText className="h-5 w-5 text-brand-primary" />
                    <h4 className="text-sm font-bold text-slate-800">Teks Hasil Ekstraksi OCR</h4>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 font-mono text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {result.extracted_text}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
