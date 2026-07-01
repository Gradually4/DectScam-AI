import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import {
  Shield, Check, X, Loader2, AlertCircle, FileText,
  Clock, AlertTriangle, User, Calendar, Tag, ShieldCheck, ShieldAlert, Trash2
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Redirect if not admin (after auth state is fully loaded)
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        navigate('/login');
      } else if (user?.role !== 'admin') {
        navigate('/dashboard');
      }
    }
  }, [user, isAuthenticated, authLoading, navigate]);

  // Fetch all reports for admin
  const fetchAdminReports = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/api/v1/admin/reports');
      if (response.data?.status === 'success') {
        setReports(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch admin reports:', err);
      setError(err.response?.data?.message || 'Gagal memuat semua laporan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAdminReports();
    }
  }, [user]);

  // Handle status approval / rejection
  const handleUpdateStatus = async (reportId, newStatus) => {
    setActionLoadingId(reportId);
    try {
      const response = await api.patch(`/api/v1/admin/reports/${reportId}/status`, {
        status: newStatus,
      });

      if (response.data?.status === 'success') {
        // Update local state directly to show instant changes without page refresh
        setReports((prevReports) =>
          prevReports.map((r) => (r.id === reportId ? { ...r, status: newStatus } : r))
        );
        const statusText = newStatus === 'approved' ? 'disetujui' : 'ditolak';
        showToast(`Status laporan berhasil diperbarui menjadi ${statusText}.`, 'success');
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      showToast(err.response?.data?.message || 'Gagal memperbarui status laporan.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle report deletion
  const handleDeleteReport = async (reportId) => {
    setActionLoadingId(reportId);
    try {
      const response = await api.delete(`/api/v1/admin/reports/${reportId}`);

      if (response.data?.status === 'success') {
        // Remove from list
        setReports((prevReports) => prevReports.filter((r) => r.id !== reportId));
        showToast('Laporan berhasil dihapus secara permanen.', 'success');
      }
    } catch (err) {
      console.error('Failed to delete report:', err);
      showToast(err.response?.data?.message || 'Gagal menghapus laporan.', 'error');
    } finally {
      setActionLoadingId(null);
      setDeleteConfirmId(null);
    }
  };

  // Format date
  const formatDate = (isoDate) => {
    if (!isoDate) return '-';
    const date = new Date(isoDate);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Calculate statistics
  const totalPending = reports.filter((r) => r.status === 'pending').length;
  const totalApproved = reports.filter((r) => r.status === 'approved').length;
  const totalRejected = reports.filter((r) => r.status === 'rejected').length;

  if (authLoading || user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
        <span className="ml-3 text-slate-500 font-semibold">Mengotorisasi akses admin...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Component */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-grow flex flex-col min-h-screen overflow-y-auto">
        <Navbar title="Panel Administrasi & Moderasi" />

        <main className="p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div>
            <h3 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
              <Shield className="h-6 w-6 text-brand-primary" />
              <span>Dasbor Moderasi Laporan Penipuan</span>
            </h3>
            <p className="text-sm text-slate-400 font-semibold mt-1">
              Kelola dan moderasi laporan masuk dari seluruh komunitas pengguna.
            </p>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pending Stats */}
            <div className="bg-white border border-slate-200/80 p-6 rounded-2xl flex items-center justify-between shadow-sm">
              <div>
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Menunggu Moderasi</p>
                <h4 className="text-3xl font-extrabold text-brand-yellow">{totalPending}</h4>
              </div>
              <div className="p-4 bg-brand-yellow/10 rounded-xl">
                <Clock className="h-6 w-6 text-brand-yellow" />
              </div>
            </div>

            {/* Approved Stats */}
            <div className="bg-white border border-slate-200/80 p-6 rounded-2xl flex items-center justify-between shadow-sm">
              <div>
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Disetujui (Terbit)</p>
                <h4 className="text-3xl font-extrabold text-brand-green">{totalApproved}</h4>
              </div>
              <div className="p-4 bg-brand-green/10 rounded-xl">
                <ShieldCheck className="h-6 w-6 text-brand-green" />
              </div>
            </div>

            {/* Rejected Stats */}
            <div className="bg-white border border-slate-200/80 p-6 rounded-2xl flex items-center justify-between shadow-sm">
              <div>
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Ditolak</p>
                <h4 className="text-3xl font-extrabold text-brand-red">{totalRejected}</h4>
              </div>
              <div className="p-4 bg-brand-red/10 rounded-xl">
                <ShieldAlert className="h-6 w-6 text-brand-red" />
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h4 className="text-base font-bold text-slate-800">Daftar Antrean Laporan</h4>
              <button
                onClick={fetchAdminReports}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Segarkan Data
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
                <span className="ml-3 text-slate-500 font-semibold">Memuat data laporan...</span>
              </div>
            ) : error ? (
              <div className="p-6 text-center py-16">
                <AlertCircle className="h-10 w-10 text-brand-red mx-auto mb-3" />
                <p className="text-slate-600 font-semibold">{error}</p>
              </div>
            ) : reports.length === 0 ? (
              <div className="p-6 text-center py-20 text-slate-400">
                <FileText className="h-12 w-12 mx-auto mb-4 text-slate-200" />
                <p className="font-semibold">Belum ada laporan dari pengguna.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600 border-collapse">
                  <thead className="text-xs uppercase font-semibold text-slate-400 bg-slate-50/50 border-b border-slate-100">
                    <tr>
                      <th className="py-4 px-6">Tanggal</th>
                      <th className="py-4 px-6">Laporan & Pengirim</th>
                      <th className="py-4 px-6">Sasaran Penipu</th>
                      <th className="py-4 px-6">Kategori</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 text-center">Aksi Moderasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reports.map((report) => (
                      <tr key={report.id} className="hover:bg-slate-50/30 transition-colors">
                        {/* Date Column */}
                        <td className="py-4 px-6 whitespace-nowrap text-xs text-slate-400 font-medium">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{formatDate(report.created_at)}</span>
                          </div>
                        </td>

                        {/* Title & User Column */}
                        <td className="py-4 px-6 max-w-sm">
                          <div className="font-bold text-slate-800 line-clamp-1 mb-1">{report.title}</div>
                          <div className="text-xs text-slate-400 flex items-center space-x-1">
                            <User className="h-3 w-3" />
                            <span>Pelapor: {report.user_name}</span>
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100">
                            {report.description}
                          </p>
                        </td>

                        {/* Entity Targeted Column */}
                        <td className="py-4 px-6">
                          <div className="font-semibold text-slate-700 text-xs">{report.entity_name}</div>
                          {report.entity_contact && (
                            <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[150px]">
                              Hub: {report.entity_contact}
                            </div>
                          )}
                          {report.location_platform && (
                            <div className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200 rounded px-1.5 py-0.5 mt-1.5 inline-block font-semibold">
                              {report.location_platform}
                            </div>
                          )}
                        </td>

                        {/* Fraud Type Column */}
                        <td className="py-4 px-6 whitespace-nowrap text-xs font-semibold text-slate-500">
                          <div className="flex items-center space-x-1">
                            <Tag className="h-3.5 w-3.5 text-slate-400" />
                            <span>{report.fraud_type}</span>
                          </div>
                        </td>

                        {/* Status Column */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                            report.status === 'approved'
                              ? 'bg-brand-green/10 text-brand-green border-brand-green/20'
                              : report.status === 'rejected'
                              ? 'bg-brand-red/10 text-brand-red border-brand-red/20'
                              : 'bg-brand-yellow/10 text-brand-yellow border-brand-yellow/20'
                          }`}>
                            {report.status === 'approved' ? 'Verified' : report.status}
                          </span>
                        </td>

                        {/* Action Column */}
                        <td className="py-4 px-6 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center space-x-2">
                            {actionLoadingId === report.id ? (
                              <Loader2 className="h-5 w-5 animate-spin text-brand-primary" />
                            ) : (
                              <>
                                {report.status === 'pending' && (
                                  <>
                                    <button
                                      onClick={() => handleUpdateStatus(report.id, 'approved')}
                                      className="p-1.5 bg-brand-green/10 hover:bg-brand-green text-brand-green hover:text-white rounded-lg border border-brand-green/20 hover:border-transparent transition-all cursor-pointer"
                                      title="Setujui Laporan"
                                    >
                                      <Check className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => handleUpdateStatus(report.id, 'rejected')}
                                      className="p-1.5 bg-brand-red/10 hover:bg-brand-red text-brand-red hover:text-white rounded-lg border border-brand-red/20 hover:border-transparent transition-all cursor-pointer"
                                      title="Tolak Laporan"
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  </>
                                )}
                                <button
                                  onClick={() => setDeleteConfirmId(report.id)}
                                  className="p-1.5 bg-brand-red/10 hover:bg-brand-red text-brand-red hover:text-white rounded-lg border border-brand-red/20 hover:border-transparent transition-all cursor-pointer"
                                  title="Hapus Laporan Secara Permanen"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center space-x-3 text-brand-red">
              <div className="p-2 bg-brand-red/10 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-brand-red" />
              </div>
              <h5 className="text-lg font-bold text-slate-800">Konfirmasi Penghapusan</h5>
            </div>
            
            <p className="text-sm text-slate-500 leading-relaxed">
              Apakah Anda yakin ingin menghapus laporan ini secara permanen dari basis data? Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => handleDeleteReport(deleteConfirmId)}
                className="px-4 py-2 bg-brand-red hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
              >
                Hapus Laporan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success/Error Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-3 bg-slate-900 border border-slate-800 text-white px-5 py-4 rounded-2xl shadow-2xl max-w-sm animate-in slide-in-from-bottom-5 duration-300">
          {toast.type === 'success' ? (
            <div className="p-1 bg-brand-green/20 text-brand-green rounded-lg">
              <Check className="h-5 w-5" />
            </div>
          ) : (
            <div className="p-1 bg-brand-red/20 text-brand-red rounded-lg">
              <X className="h-5 w-5" />
            </div>
          )}
          <div className="flex-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Notifikasi</p>
            <p className="text-xs font-bold text-white mt-0.5">{toast.message}</p>
          </div>
          <button onClick={() => setToast(null)} className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
