import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { 
  ShieldAlert, 
  CheckCircle, 
  AlertTriangle, 
  Loader2, 
  FileText, 
  TrendingUp, 
  ShieldX,
  MessageSquare,
  Link2,
  Image as ImageIcon
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';

export default function Dashboard() {
  const [statsData, setStatsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await api.get('/api/v1/analytics/dashboard');
        if (response.data && response.data.status === 'success') {
          setStatsData(response.data.data);
        } else {
          setError('Format respons data analitik tidak valid.');
        }
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Gagal mengambil data statistik dashboard.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex">
        <Sidebar />
        <div className="flex-grow flex flex-col min-h-screen">
          <Navbar title="Dashboard Ringkasan" />
          <div className="flex-grow flex items-center justify-center">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-10 w-10 text-brand-primary animate-spin" />
              <p className="text-sm font-semibold text-slate-500">Memuat data analitik...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex">
        <Sidebar />
        <div className="flex-grow flex flex-col min-h-screen">
          <Navbar title="Dashboard Ringkasan" />
          <div className="p-8 max-w-7xl mx-auto w-full flex-grow">
            <div className="p-6 rounded-2xl bg-brand-red/10 border border-brand-red/20 text-brand-red flex items-center space-x-3">
              <ShieldAlert className="h-6 w-6 flex-shrink-0" />
              <div>
                <h4 className="font-bold">Gagal Memuat Analitik</h4>
                <p className="text-sm font-medium mt-1">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isAdmin = statsData?.role === 'admin';

  const stats = [
    { 
      label: isAdmin ? 'Total Pemindaian Global' : 'Total Pemindaian Anda', 
      value: statsData?.total_scans || 0, 
      icon: TrendingUp, 
      color: 'text-brand-primary bg-blue-50 border-blue-100' 
    },
    { 
      label: isAdmin ? 'Laporan Komunitas' : 'Laporan Saya', 
      value: statsData?.total_reports || 0, 
      icon: FileText, 
      color: 'text-cyan-600 bg-cyan-50 border-cyan-100' 
    },
    { 
      label: isAdmin ? 'Deteksi Bahaya (Global)' : 'Deteksi Bahaya Anda', 
      value: statsData?.risk_distribution?.bahaya || 0, 
      icon: ShieldX, 
      color: 'text-brand-red bg-red-50 border-red-100' 
    },
    { 
      label: isAdmin ? 'Deteksi Waspada (Global)' : 'Deteksi Waspada Anda', 
      value: statsData?.risk_distribution?.waspada || 0, 
      icon: AlertTriangle, 
      color: 'text-brand-yellow bg-yellow-50 border-yellow-100' 
    },
  ];

  // Prepare PieChart Data for Risk Distribution
  const riskPieData = [
    { name: 'Aman', value: statsData?.risk_distribution?.aman || 0, color: '#10B981' },
    { name: 'Waspada', value: statsData?.risk_distribution?.waspada || 0, color: '#F59E0B' },
    { name: 'Bahaya', value: statsData?.risk_distribution?.bahaya || 0, color: '#EF4444' },
  ].filter(item => item.value > 0);

  // If no items, provide fallback item for rendering
  if (riskPieData.length === 0) {
    riskPieData.push({ name: 'Belum Ada Data', value: 1, color: '#E2E8F0' });
  }

  // Prepare BarChart Data for Scan Types
  const scanBarData = [
    { name: 'Teks', Jumlah: statsData?.scan_types?.text || 0, fill: '#3B82F6' },
    { name: 'Tautan', Jumlah: statsData?.scan_types?.url || 0, fill: '#0891B2' },
    { name: 'Gambar', Jumlah: statsData?.scan_types?.image || 0, fill: '#4F46E5' },
  ];

  const recentScans = statsData?.recent_scans || [];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col min-h-screen overflow-y-auto">
        <Navbar title={isAdmin ? "Dashboard Ringkasan Admin" : "Dashboard Ringkasan Saya"} />

        <main className="p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="p-6 rounded-3xl bg-white border border-slate-200/80 flex items-center space-x-4 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className={`p-4 rounded-2xl border ${stat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-3xl font-extrabold text-slate-800 tracking-tight">{stat.value}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{stat.label}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Graphical representation & Distribution metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Scan Types BarChart */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 flex flex-col justify-between shadow-sm">
              <div>
                <h3 className="text-base font-bold text-slate-800 mb-1">
                  {isAdmin ? 'Metrik Jenis Pemindaian Global' : 'Metrik Jenis Pemindaian Anda'}
                </h3>
                <p className="text-xs text-slate-400 font-semibold mb-6">
                  {isAdmin 
                    ? 'Distribusi pemindaian berdasarkan format data (Teks, Tautan, Gambar) seluruh platform.' 
                    : 'Distribusi format data yang telah Anda pindai.'}
                </p>
              </div>
              
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scanBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} fontWeight={600} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={11} fontWeight={600} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#FFF', borderRadius: '12px', border: '1px solid #E2E8F0', fontFamily: 'sans-serif', fontSize: '12px' }}
                      cursor={{ fill: '#F8FAFC' }}
                    />
                    <Bar dataKey="Jumlah" radius={[6, 6, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Risk Distribution PieChart */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 flex flex-col justify-between shadow-sm">
              <div>
                <h3 className="text-base font-bold text-slate-800 mb-1">
                  {isAdmin ? 'Status Keamanan Sistem (Global)' : 'Status Keamanan Pemindaian Anda'}
                </h3>
                <p className="text-xs text-slate-400 font-semibold mb-6">
                  {isAdmin 
                    ? 'Proporsi tingkat bahaya yang terdeteksi secara keseluruhan.' 
                    : 'Proporsi tingkat bahaya dari riwayat pemindaian Anda.'}
                </p>
              </div>

              <div className="h-64 w-full flex items-center justify-center">
                <div className="w-1/2 h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={riskPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {riskPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#FFF', borderRadius: '12px', border: '1px solid #E2E8F0', fontFamily: 'sans-serif', fontSize: '12px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-1/2 space-y-4 pl-4">
                  {riskPieData.map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-3">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-700">{item.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold mt-0.5">{item.value} Deteksi</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Scans Table */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 mb-6">
              {isAdmin ? 'Aktivitas Pemindaian Terbaru (Global)' : 'Aktivitas Pemindaian Terbaru Anda'}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Tipe</th>
                    {isAdmin && <th className="py-3 px-4">Pelapor</th>}
                    <th className="py-3 px-4">Data Input</th>
                    <th className="py-3 px-4">Skor Risiko</th>
                    <th className="py-3 px-4">Level</th>
                    <th className="py-3 px-4">Waktu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentScans.length === 0 ? (
                    <tr>
                      <td colSpan={isAdmin ? 6 : 5} className="py-8 text-center text-sm font-semibold text-slate-400">
                        Belum ada aktivitas pemindaian.
                      </td>
                    </tr>
                  ) : (
                    recentScans.map((scan) => {
                      let levelColor = 'text-brand-green';
                      let levelBg = 'bg-brand-green/10 border-brand-green/20';
                      if (scan.level === 'waspada') {
                        levelColor = 'text-brand-yellow';
                        levelBg = 'bg-brand-yellow/10 border-brand-yellow/20';
                      } else if (scan.level === 'bahaya') {
                        levelColor = 'text-brand-red';
                        levelBg = 'bg-brand-red/10 border-brand-red/20';
                      }

                      return (
                        <tr key={scan.id} className="hover:bg-slate-50/40 transition-colors">
                          <td className="py-4 px-4">
                            <span className="flex items-center space-x-2 font-bold text-slate-800">
                              {scan.type === 'Text' && <MessageSquare className="h-4 w-4 text-brand-primary" />}
                              {scan.type === 'Url' && <Link2 className="h-4 w-4 text-cyan-600" />}
                              {scan.type === 'Image' && <ImageIcon className="h-4 w-4 text-indigo-600" />}
                              <span>{scan.type}</span>
                            </span>
                          </td>
                          {isAdmin && <td className="py-4 px-4 font-semibold text-slate-500">{scan.user_name}</td>}
                          <td className="py-4 px-4 font-medium text-slate-500 truncate max-w-xs">{scan.input}</td>
                          <td className="py-4 px-4 font-bold text-slate-800">{scan.score}%</td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase ${levelBg} ${levelColor}`}>
                              {scan.level}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-xs text-slate-400 font-semibold">{scan.time}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
