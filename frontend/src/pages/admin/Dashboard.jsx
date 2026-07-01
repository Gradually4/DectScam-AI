import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../contexts/AuthContext';
import {
  Shield, Check, X, Loader2, AlertCircle, FileText,
  Clock, AlertTriangle, User, Calendar, Tag, ShieldCheck, ShieldAlert, Trash2,
  TrendingUp, BarChart2, PieChart as PieIcon, BookOpen, Pencil, Plus, ImageIcon, Link as LinkIcon
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';

// Curated colors for Pie chart and visual components
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

export default function Dashboard() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Tab State
  const [activeTab, setActiveTab] = useState('reports'); // 'reports' or 'articles'

  // State for moderation list
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [reportsError, setReportsError] = useState('');

  // State for articles list
  const [articles, setArticles] = useState([]);
  const [loadingArticles, setLoadingArticles] = useState(true);
  const [articlesError, setArticlesError] = useState('');

  // State for analytics
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [analyticsError, setAnalyticsError] = useState('');
  const [timeRange, setTimeRange] = useState(7);

  // Action states
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleteArticleConfirmId, setDeleteArticleConfirmId] = useState(null);
  const [toast, setToast] = useState(null);

  // Edit Article Modal States
  const [editArticle, setEditArticle] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editThumbnailType, setEditThumbnailType] = useState('file'); // 'file' or 'url'
  const [editThumbnailFile, setEditThumbnailFile] = useState(null);
  const [editThumbnailUrl, setEditThumbnailUrl] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

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

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        navigate('/login');
      } else if (user?.role !== 'admin') {
        navigate('/dashboard');
      }
    }
  }, [user, isAuthenticated, authLoading, navigate]);

  // Fetch reports
  const fetchAdminReports = async () => {
    setLoadingReports(true);
    setReportsError('');
    try {
      const response = await api.get('/api/v1/admin/reports');
      if (response.data?.status === 'success') {
        setReports(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch admin reports:', err);
      setReportsError(err.response?.data?.message || 'Gagal memuat semua laporan. Silakan coba lagi.');
    } finally {
      setLoadingReports(false);
    }
  };

  // Fetch articles
  const fetchArticles = async () => {
    setLoadingArticles(true);
    setArticlesError('');
    try {
      const response = await api.get('/api/v1/articles');
      if (response.data?.status === 'success') {
        setArticles(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch articles:', err);
      setArticlesError(err.response?.data?.message || 'Gagal memuat artikel edukasi.');
    } finally {
      setLoadingArticles(false);
    }
  };

  // Fetch analytics
  const fetchAnalytics = async (days = timeRange) => {
    setLoadingAnalytics(true);
    setAnalyticsError('');
    try {
      const response = await api.get(`/api/v1/admin/analytics?days=${days}`);
      if (response.data?.status === 'success') {
        setAnalyticsData(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch admin analytics:', err);
      setAnalyticsError(err.response?.data?.message || 'Gagal memuat data analitik.');
    } finally {
      setLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAdminReports();
      fetchArticles();
    }
  }, [user]);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAnalytics(timeRange);
    }
  }, [user, timeRange]);

  // Handle status approval / rejection
  const handleUpdateStatus = async (reportId, newStatus) => {
    setActionLoadingId(reportId);
    try {
      const response = await api.patch(`/api/v1/admin/reports/${reportId}/status`, {
        status: newStatus,
      });

      if (response.data?.status === 'success') {
        setReports((prevReports) =>
          prevReports.map((r) => (r.id === reportId ? { ...r, status: newStatus } : r))
        );
        const statusText = newStatus === 'approved' ? 'disetujui' : 'ditolak';
        showToast(`Status laporan berhasil diperbarui menjadi ${statusText}.`, 'success');
        fetchAnalytics();
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
        setReports((prevReports) => prevReports.filter((r) => r.id !== reportId));
        showToast('Laporan berhasil dihapus secara permanen.', 'success');
        fetchAnalytics();
      }
    } catch (err) {
      console.error('Failed to delete report:', err);
      showToast(err.response?.data?.message || 'Gagal menghapus laporan.', 'error');
    } finally {
      setActionLoadingId(null);
      setDeleteConfirmId(null);
    }
  };

  // Handle article deletion
  const handleDeleteArticle = async (articleId) => {
    setActionLoadingId(articleId);
    try {
      const response = await api.delete(`/api/v1/articles/${articleId}`);

      if (response.data?.status === 'success') {
        setArticles((prev) => prev.filter((a) => a.id !== articleId));
        showToast('Artikel edukasi siber berhasil dihapus.', 'success');
      }
    } catch (err) {
      console.error('Failed to delete article:', err);
      showToast(err.response?.data?.message || 'Gagal menghapus artikel.', 'error');
    } finally {
      setActionLoadingId(null);
      setDeleteArticleConfirmId(null);
    }
  };

  // Open Edit Modal & Populate Form
  const handleOpenEditModal = async (article) => {
    setEditArticle(article);
    setEditTitle(article.title);
    setEditError('');
    
    // Fetch full article content first (since index endpoint might only return excerpt)
    try {
      const response = await api.get(`/api/v1/articles/${article.slug}`);
      if (response.data?.status === 'success') {
        setEditContent(response.data.data.content);
        const thumb = response.data.data.thumbnail;
        if (thumb && (thumb.startsWith('http://') || thumb.startsWith('https://'))) {
          setEditThumbnailType('url');
          setEditThumbnailUrl(thumb);
        } else {
          setEditThumbnailType('file');
          setEditThumbnailUrl(thumb || '');
        }
      }
    } catch (err) {
      console.error('Failed to fetch full article details:', err);
      setEditContent(article.content || '');
      setEditThumbnailType('file');
    }
    setEditThumbnailFile(null);
  };

  // Handle Edit Article Submission
  const handleEditArticleSubmit = async (e) => {
    e.preventDefault();
    setEditError('');

    if (!editTitle.trim()) {
      setEditError('Judul artikel wajib diisi.');
      return;
    }
    if (!editContent.trim()) {
      setEditError('Isi artikel wajib diisi.');
      return;
    }

    setEditLoading(true);

    // Using Laravel method spoofing for multipart PUT
    const formData = new FormData();
    formData.append('_method', 'PUT');
    formData.append('title', editTitle);
    formData.append('content', editContent);

    if (editThumbnailType === 'file') {
      if (editThumbnailFile) {
        formData.append('thumbnail', editThumbnailFile);
      } else {
        formData.append('thumbnail', editThumbnailUrl); // Keep existing
      }
    } else {
      formData.append('thumbnail', editThumbnailUrl);
    }

    try {
      const response = await api.post(`/api/v1/articles/${editArticle.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data?.status === 'success') {
        showToast('Artikel berhasil diperbarui.', 'success');
        setEditArticle(null);
        fetchArticles(); // Refresh list
      }
    } catch (err) {
      console.error('Failed to update article:', err);
      setEditError(err.response?.data?.message || 'Gagal memperbarui artikel.');
    } finally {
      setEditLoading(false);
    }
  };

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

  // Calculations for static status cards
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-2xl font-bold text-slate-800 flex items-center space-x-2">
                <Shield className="h-7 w-7 text-brand-primary" />
                <span>Dashboard Administrasi SCAM</span>
              </h3>
              <p className="text-sm text-slate-400 font-semibold mt-1">
                Kelola laporan penipuan, lakukan moderasi, dan perbarui edukasi siber DectScam AI.
              </p>
            </div>
            
            {/* Tab Selector */}
            <div className="flex bg-white border border-slate-200 p-1 rounded-2xl w-fit shadow-sm">
              <button
                onClick={() => setActiveTab('reports')}
                className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 ${
                  activeTab === 'reports'
                    ? 'bg-brand-primary text-white shadow-md'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <AlertTriangle className="h-4 w-4" />
                <span>Moderasi Laporan</span>
              </button>
              <button
                onClick={() => setActiveTab('articles')}
                className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 ${
                  activeTab === 'articles'
                    ? 'bg-brand-primary text-white shadow-md'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <BookOpen className="h-4 w-4" />
                <span>Kelola Edukasi Siber</span>
              </button>
            </div>
          </div>

          {/* TAB 1: MODERASI LAPORAN & STATISTIK */}
          {activeTab === 'reports' && (
            <>
              {/* Stats Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
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

              {/* Advanced Analytics Charts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                {/* Chart 1: Tren Laporan */}
                <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-brand-primary" />
                      <h4 className="text-base font-bold text-slate-800">
                        Tren Laporan {Number(timeRange) === 365 ? 'Tahun Ini' : `${timeRange} Hari Terakhir`}
                      </h4>
                    </div>
                    <select
                      value={timeRange}
                      onChange={(e) => setTimeRange(Number(e.target.value))}
                      className="text-xs bg-slate-50 border border-slate-200 text-slate-600 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary font-medium cursor-pointer transition-all duration-200"
                    >
                      <option value={7}>7 Hari Terakhir</option>
                      <option value={14}>14 Hari Terakhir</option>
                      <option value={30}>30 Hari Terakhir</option>
                      <option value={365}>Tahun Ini</option>
                    </select>
                  </div>
                  <div className="h-72 w-full flex-grow">
                    {loadingAnalytics ? (
                      <div className="h-full flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-brand-primary" />
                      </div>
                    ) : analyticsError ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-4">
                        <AlertCircle className="h-8 w-8 text-brand-red mb-2" />
                        <p className="text-sm text-slate-500 font-semibold">{analyticsError}</p>
                      </div>
                    ) : !analyticsData?.report_trend?.labels || analyticsData?.report_trend?.labels?.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                        Tidak ada data tren laporan.
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart 
                          data={analyticsData.report_trend.labels.map((label, idx) => ({
                            date: label,
                            count: analyticsData.report_trend.data[idx] || 0
                          }))} 
                          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                          <XAxis dataKey="date" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', border: 'none', color: '#F8FAFC' }}
                            itemStyle={{ color: '#F8FAFC' }}
                            labelStyle={{ fontWeight: 'bold', color: '#94A3B8' }}
                          />
                          <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#FFFFFF' }} activeDot={{ r: 6 }} name="Jumlah Laporan" />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                {/* Chart 2: Total Kategori */}
                <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm flex flex-col">
                  <div className="flex items-center space-x-2 mb-6">
                    <PieIcon className="h-5 w-5 text-brand-primary" />
                    <h4 className="text-base font-bold text-slate-800">Total Laporan per Kategori</h4>
                  </div>
                  <div className="h-72 w-full flex-grow flex flex-col justify-center">
                    {loadingAnalytics ? (
                      <div className="h-full flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-brand-primary" />
                      </div>
                    ) : analyticsError ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-4">
                        <AlertCircle className="h-8 w-8 text-brand-red mb-2" />
                        <p className="text-sm text-slate-500 font-semibold">{analyticsError}</p>
                      </div>
                    ) : analyticsData?.reports_by_category?.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                        Belum ada kategori yang terdata.
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row items-center justify-around h-full gap-4">
                        <div className="h-48 w-48 relative shrink-0">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={analyticsData?.reports_by_category}
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={75}
                                paddingAngle={3}
                                dataKey="count"
                                nameKey="category_name"
                              >
                                {analyticsData?.reports_by_category.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip 
                                contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', border: 'none', color: '#F8FAFC' }}
                                itemStyle={{ color: '#F8FAFC' }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        {/* Legend */}
                        <div className="flex flex-col space-y-2 max-h-52 overflow-y-auto px-2 w-full">
                          {analyticsData?.reports_by_category.map((entry, index) => (
                            <div key={entry.category_name} className="flex items-center justify-between text-xs">
                              <div className="flex items-center space-x-2">
                                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                                <span className="font-semibold text-slate-600 truncate max-w-[120px]">{entry.category_name}</span>
                              </div>
                              <span className="font-extrabold text-slate-800 ml-2">{entry.count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Reports Moderation List */}
              <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden animate-fade-in">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <h4 className="text-base font-bold text-slate-800">Daftar Antrean Laporan</h4>
                  <button
                    onClick={fetchAdminReports}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-650 hover:bg-slate-50 transition-colors"
                  >
                    Segarkan Antrean
                  </button>
                </div>

                {loadingReports ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
                    <span className="ml-3 text-slate-500 font-semibold">Memuat data laporan...</span>
                  </div>
                ) : reportsError ? (
                  <div className="p-6 text-center py-16">
                    <AlertCircle className="h-10 w-10 text-brand-red mx-auto mb-3" />
                    <p className="text-slate-600 font-semibold">{reportsError}</p>
                  </div>
                ) : reports.length === 0 ? (
                  <div className="p-6 text-center py-20 text-slate-400">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-slate-200" />
                    <p className="font-semibold">Belum ada laporan dari pengguna.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-650 border-collapse">
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
                            <td className="py-4 px-6 whitespace-nowrap text-xs text-slate-400 font-medium">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>{formatDate(report.created_at)}</span>
                              </div>
                            </td>
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
                            <td className="py-4 px-6">
                              <div className="font-semibold text-slate-700 text-xs">{report.entity_name}</div>
                              {report.entity_contact && (
                                <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[150px]">
                                  Hub: {report.entity_contact}
                                </div>
                              )}
                              {report.location_platform && (
                                <div className="text-[10px] bg-slate-100 text-slate-650 border border-slate-200 rounded px-1.5 py-0.5 mt-1.5 inline-block font-semibold">
                                  {report.location_platform}
                                </div>
                              )}
                            </td>
                            <td className="py-4 px-6 whitespace-nowrap text-xs font-semibold text-slate-500">
                              <div className="flex items-center space-x-1">
                                <Tag className="h-3.5 w-3.5 text-slate-400" />
                                <span>{report.fraud_type}</span>
                              </div>
                            </td>
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
            </>
          )}

          {/* TAB 2: KELOLA ARTIKEL EDUKASI SIBER */}
          {activeTab === 'articles' && (
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden animate-fade-in">
              <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h4 className="text-base font-bold text-slate-800">Daftar Artikel Edukasi Siber</h4>
                  <p className="text-xs text-slate-400 font-medium mt-1">Kelola publikasi materi keamanan siber untuk publik.</p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Link
                    to="/admin/create-article"
                    className="px-4 py-2 bg-brand-primary text-white rounded-xl text-xs font-bold hover:bg-blue-750 transition-colors flex items-center space-x-1.5 shadow-sm"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Tulis Artikel Baru</span>
                  </Link>
                  <button
                    onClick={fetchArticles}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-650 hover:bg-slate-50 transition-colors"
                  >
                    Segarkan
                  </button>
                </div>
              </div>

              {loadingArticles ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
                  <span className="ml-3 text-slate-500 font-semibold">Memuat daftar artikel...</span>
                </div>
              ) : articlesError ? (
                <div className="p-6 text-center py-16">
                  <AlertCircle className="h-10 w-10 text-brand-red mx-auto mb-3" />
                  <p className="text-slate-600 font-semibold">{articlesError}</p>
                </div>
              ) : articles.length === 0 ? (
                <div className="p-6 text-center py-20 text-slate-400">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-slate-250" />
                  <h5 className="font-bold text-slate-700">Belum ada artikel edukasi</h5>
                  <p className="text-xs text-slate-400 mt-1">Klik tombol di atas untuk menerbitkan artikel pertama.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-650 border-collapse">
                    <thead className="text-xs uppercase font-semibold text-slate-400 bg-slate-50/50 border-b border-slate-100">
                      <tr>
                        <th className="py-4 px-6">Gambar Sampul</th>
                        <th className="py-4 px-6">Judul Artikel</th>
                        <th className="py-4 px-6">Penulis & Tanggal</th>
                        <th className="py-4 px-6 text-center">Aksi Pengelolaan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {articles.map((article) => (
                        <tr key={article.id} className="hover:bg-slate-50/30 transition-colors">
                          {/* Thumbnail */}
                          <td className="py-4 px-6 whitespace-nowrap">
                            <div className="w-16 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                              {article.thumbnail ? (
                                <img src={article.thumbnail.startsWith('http') ? article.thumbnail : `/${article.thumbnail}`} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <BookOpen className="h-4 w-4 text-slate-400" />
                              )}
                            </div>
                          </td>
                          {/* Title */}
                          <td className="py-4 px-6 max-w-xs font-bold text-slate-800">
                            <Link to={`/education/${article.slug}`} className="hover:text-brand-primary transition-colors">
                              {article.title}
                            </Link>
                            <p className="text-xs text-slate-400 font-normal line-clamp-1 mt-1">{article.excerpt}</p>
                          </td>
                          {/* Author & Date */}
                          <td className="py-4 px-6 whitespace-nowrap text-xs">
                            <div className="font-semibold text-slate-700">{article.author}</div>
                            <div className="text-slate-400 font-medium mt-0.5">{formatDate(article.created_at)}</div>
                          </td>
                          {/* Actions */}
                          <td className="py-4 px-6 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <button
                                onClick={() => handleOpenEditModal(article)}
                                className="p-2 bg-blue-50 hover:bg-brand-primary text-brand-primary hover:text-white rounded-lg border border-blue-100 hover:border-transparent transition-all cursor-pointer"
                                title="Edit Artikel"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setDeleteArticleConfirmId(article.id)}
                                className="p-2 bg-brand-red/10 hover:bg-brand-red text-brand-red hover:text-white rounded-lg border border-brand-red/20 hover:border-transparent transition-all cursor-pointer"
                                title="Hapus Artikel"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Report Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center space-x-3 text-brand-red">
              <div className="p-2 bg-brand-red/10 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-brand-red" />
              </div>
              <h5 className="text-lg font-bold text-slate-800">Konfirmasi Penghapusan</h5>
            </div>
            <p className="text-sm text-slate-550 leading-relaxed">
              Apakah Anda yakin ingin menghapus laporan ini secara permanen dari basis data? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-650 hover:bg-slate-50 transition-colors"
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

      {/* Article Delete Confirmation Modal */}
      {deleteArticleConfirmId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center space-x-3 text-brand-red">
              <div className="p-2 bg-brand-red/10 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-brand-red" />
              </div>
              <h5 className="text-lg font-bold text-slate-800">Hapus Artikel Edukasi?</h5>
            </div>
            <p className="text-sm text-slate-550 leading-relaxed">
              Apakah Anda yakin ingin menghapus artikel edukasi siber ini? Pembaca tidak akan lagi dapat menemukan materi ini di platform.
            </p>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setDeleteArticleConfirmId(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-650 hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => handleDeleteArticle(deleteArticleConfirmId)}
                className="px-4 py-2 bg-brand-red hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
              >
                Hapus Artikel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Article Modal */}
      {editArticle && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <Pencil className="h-5 w-5 text-brand-primary" />
                <h5 className="text-lg font-extrabold text-slate-800">Edit Artikel Edukasi</h5>
              </div>
              <button
                onClick={() => setEditArticle(null)}
                className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {editError && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start space-x-3 text-red-700 text-sm">
                <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleEditArticleSubmit} className="space-y-5">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Judul Artikel</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Ketik judul artikel..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-brand-primary rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all duration-200 text-slate-800 placeholder-slate-400 font-semibold text-sm"
                  required
                />
              </div>

              {/* Cover Image */}
              <div className="space-y-2.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Gambar Sampul (Thumbnail)</label>
                <div className="flex bg-slate-150 p-1 rounded-xl w-fit text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setEditThumbnailType('file')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      editThumbnailType === 'file' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-850'
                    }`}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditThumbnailType('url')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      editThumbnailType === 'url' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-850'
                    }`}
                  >
                    Gunakan URL Link
                  </button>
                </div>

                {editThumbnailType === 'file' ? (
                  <div className="border border-dashed border-slate-300 rounded-2xl p-4 flex flex-col items-center justify-center bg-slate-50">
                    <ImageIcon className="h-8 w-8 text-slate-400 mb-1.5" />
                    <span className="text-xs font-semibold text-slate-650 mb-3">
                      {editThumbnailFile ? editThumbnailFile.name : editThumbnailUrl ? 'Gambar Sampul Saat Ini' : 'Pilih file baru'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      id="edit-file-upload"
                      onChange={(e) => setEditThumbnailFile(e.target.files[0])}
                      className="hidden"
                    />
                    <label
                      htmlFor="edit-file-upload"
                      className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-sm"
                    >
                      Pilih File Baru
                    </label>
                  </div>
                ) : (
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                      <LinkIcon className="h-4 w-4" />
                    </span>
                    <input
                      type="url"
                      value={editThumbnailUrl}
                      onChange={(e) => setEditThumbnailUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-primary rounded-xl focus:outline-none text-slate-800 text-sm font-medium"
                    />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Isi Konten Artikel</label>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Ketik konten artikel secara detail..."
                  rows="8"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-brand-primary rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all duration-200 text-slate-800 placeholder-slate-400 font-medium text-sm leading-relaxed resize-y"
                  required
                />
              </div>

              {/* Save Button */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditArticle(null)}
                  className="px-5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-650 hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-5 py-2.5 bg-brand-primary hover:bg-blue-600 disabled:bg-blue-400 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-sm"
                >
                  {editLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan Perubahan</span>
                  )}
                </button>
              </div>
            </form>
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
