import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import {
  AlertTriangle, Send, Loader2, RefreshCw, X, CheckCircle,
  AlertCircle, Clock, MapPin, User, Tag, ChevronLeft, ChevronRight, Plus, FileText, Phone
} from 'lucide-react';

const FRAUD_TYPES = [
  'Penipuan Online Shop',
  'Phishing / Social Engineering',
  'Investasi Bodong',
  'Pinjaman Online Ilegal',
  'Penipuan Lowongan Kerja',
  'Penipuan Berkedok Hadiah',
  'Penipuan Transfer / Struk Palsu',
  'Lainnya',
];

export default function ScamReports() {
  // Public Feed State
  const [reports, setReports] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, total_pages: 1, total: 0 });
  const [feedLoading, setFeedLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('public');
  const [expandedReports, setExpandedReports] = useState({});

  // Modal Form State
  const [showModal, setShowModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    entity_name: '',
    entity_contact: '',
    fraud_type: '',
    description: '',
    location_platform: '',
  });

  const { isAuthenticated, user } = useAuth();

  // Fetch public reports feed
  const fetchReports = async (page = 1, status = 'approved') => {
    setFeedLoading(true);
    try {
      const response = await api.get(`/api/v1/reports?page=${page}&limit=6&status=${status}`);
      if (response.data?.status === 'success') {
        setReports(response.data.data);
        setMeta(response.data.meta);
        setCurrentPage(page);
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setFeedLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(1, activeTab === 'moderation' ? 'pending' : 'approved');
  }, [activeTab]);

  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleExpandReport = (id) => {
    setExpandedReports((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Submit new report
  const handleSubmitReport = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    setFormSuccess('');

    try {
      const response = await api.post('/api/v1/reports', formData);
      if (response.data?.status === 'success') {
        setFormSuccess(response.data.message);
        setFormData({
          title: '',
          entity_name: '',
          entity_contact: '',
          fraud_type: '',
          description: '',
          location_platform: '',
        });
        // Close modal after 2s, refresh feed
        setTimeout(() => {
          setShowModal(false);
          setFormSuccess('');
          fetchReports(1, activeTab === 'moderation' ? 'pending' : 'approved');
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      if (err.response?.data?.errors) {
        const validationErrs = err.response.data.errors;
        const firstErr = validationErrs ? Object.values(validationErrs)[0][0] : 'Validasi gagal.';
        setFormError(firstErr);
      } else {
        setFormError(err.response?.data?.message || 'Gagal mengirim laporan. Pastikan server aktif.');
      }
    } finally {
      setFormLoading(false);
    }
  };

  // Approve / reject report (Admin only)
  const handleUpdateStatus = async (reportId, newStatus) => {
    try {
      const response = await api.patch(`/api/v1/reports/${reportId}/status`, { status: newStatus });
      if (response.data?.status === 'success') {
        // Refresh the list
        fetchReports(currentPage, activeTab === 'moderation' ? 'pending' : 'approved');
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      alert(err.response?.data?.message || 'Gagal memperbarui status laporan.');
    }
  };

  // Get badge color for fraud type
  const getFraudTypeBadge = (type) => {
    if (type?.includes('Phishing')) return 'bg-brand-red/10 text-brand-red border-brand-red/20';
    if (type?.includes('Investasi')) return 'bg-brand-yellow/10 text-brand-yellow border-brand-yellow/20';
    if (type?.includes('Online Shop')) return 'bg-blue-50 text-brand-primary border-brand-primary/20';
    return 'bg-slate-100 text-slate-600 border-slate-200';
  };

  // Format date to relative
  const formatDate = (isoDate) => {
    if (!isoDate) return '-';
    const date = new Date(isoDate);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit yang lalu`;
    if (diffHrs < 24) return `${diffHrs} jam yang lalu`;
    if (diffDays < 7) return `${diffDays} hari yang lalu`;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />

      <div className="flex-grow flex flex-col min-h-screen overflow-y-auto">
        <Navbar title="Community Scam Report" />

        <main className="p-8 space-y-8 max-w-6xl mx-auto w-full">
          {/* Header & Action */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-800">Laporan Penipuan Komunitas</h3>
              <p className="text-sm text-slate-400 font-semibold mt-1">
                {activeTab === 'moderation'
                  ? 'Meninjau laporan penipuan masuk yang dikirim oleh pengguna.'
                  : 'Laporan penipuan dari pengguna yang telah diverifikasi oleh admin.'}
                {meta.total > 0 && <span className="ml-1">({meta.total} laporan)</span>}
              </p>
            </div>

            {isAuthenticated && (
              <button
                onClick={() => {
                  setShowModal(true);
                  setFormError('');
                  setFormSuccess('');
                }}
                className="px-5 py-2.5 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-hover transition-all duration-200 flex items-center space-x-2 shadow-[0_4px_12px_rgba(37,99,235,0.2)] text-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Buat Laporan</span>
              </button>
            )}
          </div>

          {/* Admin Moderation Tabs */}
          {user?.role === 'admin' && (
            <div className="flex space-x-6 border-b border-slate-200">
              <button
                onClick={() => setActiveTab('public')}
                className={`pb-3 text-sm font-bold border-b-2 transition-all duration-150 ${
                  activeTab === 'public'
                    ? 'border-brand-primary text-brand-primary'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Laporan Publik (Terverifikasi)
              </button>
              <button
                onClick={() => setActiveTab('moderation')}
                className={`pb-3 text-sm font-bold border-b-2 transition-all duration-150 flex items-center space-x-1.5 ${
                  activeTab === 'moderation'
                    ? 'border-brand-primary text-brand-primary'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <span>Antrean Moderasi</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600 font-bold">
                  Pending
                </span>
              </button>
            </div>
          )}

          {/* Public Feed Cards */}
          {feedLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
              <span className="ml-3 text-slate-500 font-semibold">Memuat laporan...</span>
            </div>
          ) : reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-slate-300" />
              </div>
              <p className="text-slate-500 font-semibold">
                {activeTab === 'moderation' ? 'Tidak ada laporan dalam antrean moderasi.' : 'Belum ada laporan yang disetujui.'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {activeTab === 'moderation' ? 'Semua laporan masuk telah dimoderasi.' : 'Jadilah yang pertama melaporkan kasus penipuan!'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-brand-primary/20 transition-all duration-200 flex flex-col justify-between"
                  >
                    {/* Card Header */}
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase ${getFraudTypeBadge(report.fraud_type)}`}>
                          {report.fraud_type}
                        </span>
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase ${
                          report.status === 'approved'
                            ? 'bg-brand-green/10 text-brand-green border-brand-green/20'
                            : report.status === 'rejected'
                            ? 'bg-brand-red/10 text-brand-red border-brand-red/20'
                            : 'bg-brand-yellow/10 text-brand-yellow border-brand-yellow/20'
                        }`}>
                          {report.status === 'approved' ? 'Verified' : report.status}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-800 mb-2 line-clamp-2 leading-snug">
                        {report.title}
                      </h4>

                      <p className={`text-xs text-slate-500 leading-relaxed mb-3 ${expandedReports[report.id] ? '' : 'line-clamp-3'}`}>
                        {report.description}
                      </p>
                      {report.description && report.description.length > 120 && (
                        <button
                          onClick={() => toggleExpandReport(report.id)}
                          className="text-[11px] font-bold text-brand-primary hover:text-brand-hover mb-3 block cursor-pointer transition-colors"
                        >
                          {expandedReports[report.id] ? 'Sembunyikan' : 'Baca Selengkapnya'}
                        </button>
                      )}
                    </div>

                    {/* Card Footer Meta */}
                    <div className="space-y-2 pt-3 border-t border-slate-100">
                      <div className="flex items-center space-x-2 text-xs text-slate-400">
                        <AlertTriangle className="h-3.5 w-3.5 text-brand-red flex-shrink-0" />
                        <span className="font-semibold text-slate-600 truncate">{report.entity_name}</span>
                      </div>
                      {report.entity_contact && (
                        <div className="flex items-center space-x-2 text-xs text-slate-400">
                          <Phone className="h-3.5 w-3.5 text-brand-primary flex-shrink-0" />
                          <span className="truncate text-slate-600 font-semibold">{report.entity_contact}</span>
                        </div>
                      )}
                      {report.location_platform && (
                        <div className="flex items-center space-x-2 text-xs text-slate-400">
                          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="truncate">{report.location_platform}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                        <div className="flex items-center space-x-1">
                          <User className="h-3.5 w-3.5" />
                          <span>{report.user_name}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{formatDate(report.created_at)}</span>
                        </div>
                      </div>

                      {/* Moderation Actions (Admin Only) */}
                      {activeTab === 'moderation' && (
                        <div className="flex space-x-2 pt-2 border-t border-slate-100">
                          <button
                            onClick={() => handleUpdateStatus(report.id, 'approved')}
                            className="flex-grow py-2 bg-brand-green hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center space-x-1 text-xs cursor-pointer"
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                            <span>Setujui</span>
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(report.id, 'rejected')}
                            className="flex-grow py-2 bg-brand-red hover:bg-rose-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center space-x-1 text-xs cursor-pointer"
                          >
                            <X className="h-3.5 w-3.5" />
                            <span>Tolak</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {meta.total_pages > 1 && (
                <div className="flex items-center justify-center space-x-3 pt-4">
                  <button
                    onClick={() => fetchReports(currentPage - 1, activeTab === 'moderation' ? 'pending' : 'approved')}
                    disabled={currentPage <= 1}
                    className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <span className="text-sm font-bold text-slate-600">
                    Hal. {currentPage} dari {meta.total_pages}
                  </span>
                  <button
                    onClick={() => fetchReports(currentPage + 1, activeTab === 'moderation' ? 'pending' : 'approved')}
                    disabled={currentPage >= meta.total_pages}
                    className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Modal Form: New Report */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800">Laporkan Kasus Penipuan</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitReport} className="p-6 space-y-5">
              {formError && (
                <div className="p-3 rounded-xl bg-brand-red/10 border border-brand-red/20 text-brand-red text-sm flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="p-3 rounded-xl bg-brand-green/10 border border-brand-green/20 text-brand-green text-sm flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Judul Laporan *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Contoh: Penipuan oleh akun @scammer di Shopee"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none text-sm text-slate-900 placeholder-slate-400 transition-all"
                />
              </div>

              {/* Entity Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Nama Entitas Penipu *
                </label>
                <input
                  type="text"
                  name="entity_name"
                  required
                  value={formData.entity_name}
                  onChange={handleChange}
                  placeholder="Nama toko/akun/nomor penipu"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none text-sm text-slate-900 placeholder-slate-400 transition-all"
                />
              </div>

              {/* Entity Contact (Optional) */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Kontak Entitas <span className="text-slate-300">(Opsional)</span>
                </label>
                <input
                  type="text"
                  name="entity_contact"
                  value={formData.entity_contact}
                  onChange={handleChange}
                  placeholder="No. telp, email, atau link profil penipu"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none text-sm text-slate-900 placeholder-slate-400 transition-all"
                />
              </div>

              {/* Fraud Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Jenis Penipuan *
                </label>
                <select
                  name="fraud_type"
                  required
                  value={formData.fraud_type}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none text-sm text-slate-900 transition-all appearance-none"
                >
                  <option value="">-- Pilih jenis penipuan --</option>
                  {FRAUD_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Kronologi / Deskripsi *
                </label>
                <textarea
                  name="description"
                  required
                  rows="4"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Ceritakan kronologi penipuan yang Anda alami secara detail..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none text-sm text-slate-900 placeholder-slate-400 transition-all resize-none"
                />
              </div>

              {/* Location / Platform (Optional) */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Platform / Lokasi <span className="text-slate-300">(Opsional)</span>
                </label>
                <input
                  type="text"
                  name="location_platform"
                  value={formData.location_platform}
                  onChange={handleChange}
                  placeholder="WhatsApp, Shopee, Tokopedia, Instagram, dll."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none text-sm text-slate-900 placeholder-slate-400 transition-all"
                />
              </div>

              {/* Submit */}
              <div className="flex space-x-3 pt-2">
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 py-3 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-hover transition-all duration-200 flex items-center justify-center space-x-2 shadow-[0_4px_12px_rgba(37,99,235,0.2)] disabled:opacity-50 text-sm"
                >
                  {formLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Mengirim...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Kirim Laporan</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors text-sm"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
