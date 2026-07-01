import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { User, Lock, Mail, Loader2, AlertCircle, CheckCircle, Camera, FileText, Calendar, ShieldAlert } from 'lucide-react';

export default function Profile() {
  const { user, setUser } = useAuth();
  
  // Profile Info State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Profile Photo Upload State
  const [isPhotoLoading, setIsPhotoLoading] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [photoSuccess, setPhotoSuccess] = useState('');

  // Password Update State
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // User Reports History State
  const [reports, setReports] = useState([]);
  const [isReportsLoading, setIsReportsLoading] = useState(true);
  const [reportsError, setReportsError] = useState('');

  // Fetch reports on component mount
  useEffect(() => {
    const fetchUserReports = async () => {
      try {
        const response = await api.get('/api/v1/user/reports');
        if (response.data && response.data.status === 'success') {
          setReports(response.data.data.reports || []);
        }
      } catch (err) {
        console.error('Failed to fetch user reports:', err);
        setReportsError('Gagal memuat riwayat laporan penipuan.');
      } finally {
        setIsReportsLoading(false);
      }
    };

    fetchUserReports();
  }, []);

  const getProfilePhotoUrl = () => {
    if (!user?.profile_photo_path) return null;
    if (user.profile_photo_path.startsWith('http')) return user.profile_photo_path;
    
    // Dynamically retrieve baseURL from Axios instance configuration or fallback to port 8080/8000
    const apiBase = api.defaults.baseURL || 'http://localhost:8000';
    // Strip trailing slash if present
    const base = apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase;
    
    // We replace the API's port/path with the storage path
    // For local dev, Laravel serves assets via public/storage/ which maps to storage/app/public/
    return `${base}/storage/${user.profile_photo_path}`;
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size: 2MB max
    if (file.size > 2 * 1024 * 1024) {
      setPhotoError('Ukuran berkas melebihi batas maksimal 2MB.');
      setPhotoSuccess('');
      return;
    }

    const formData = new FormData();
    formData.append('photo', file);

    setIsPhotoLoading(true);
    setPhotoError('');
    setPhotoSuccess('');

    try {
      const response = await api.post('/api/v1/user/profile/photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data && response.data.status === 'success') {
        const updatedUser = response.data.data.user;
        
        // Sync React context state and localStorage
        const authUser = JSON.parse(localStorage.getItem('auth_user') || '{}');
        const newAuthUser = { ...authUser, ...updatedUser };
        localStorage.setItem('auth_user', JSON.stringify(newAuthUser));
        if (setUser) setUser(newAuthUser);
        
        setPhotoSuccess(response.data.message || 'Foto profil berhasil diperbarui.');
      }
    } catch (err) {
      console.error(err);
      setPhotoError(err.response?.data?.message || 'Gagal mengunggah foto profil.');
    } finally {
      setIsPhotoLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsProfileLoading(true);
    setProfileError('');
    setProfileSuccess('');

    try {
      const response = await api.put('/api/v1/user/profile', { name, email });
      if (response.data && response.data.status === 'success') {
        const updatedUser = response.data.data.user;
        
        // Sync React context state and localStorage
        const authUser = JSON.parse(localStorage.getItem('auth_user') || '{}');
        const newAuthUser = { ...authUser, ...updatedUser };
        localStorage.setItem('auth_user', JSON.stringify(newAuthUser));
        if (setUser) setUser(newAuthUser);
        
        setProfileSuccess(response.data.message || 'Profil berhasil diperbarui.');
      }
    } catch (err) {
      console.error(err);
      setProfileError(err.response?.data?.message || 'Gagal memperbarui profil.');
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (password !== passwordConfirmation) {
      setPasswordError('Konfirmasi password baru tidak cocok.');
      return;
    }

    setIsPasswordLoading(true);
    setPasswordError('');
    setPasswordSuccess('');

    try {
      const response = await api.put('/api/v1/user/password', {
        current_password: currentPassword,
        password,
        password_confirmation: passwordConfirmation,
      });

      if (response.data && response.data.status === 'success') {
        setPasswordSuccess(response.data.message || 'Kata sandi berhasil diperbarui.');
        setCurrentPassword('');
        setPassword('');
        setPasswordConfirmation('');
      }
    } catch (err) {
      console.error(err);
      setPasswordError(err.response?.data?.message || 'Gagal memperbarui kata sandi.');
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200/50 text-[10px] font-extrabold uppercase rounded-full tracking-wider block text-center max-w-[90px]">
            Disetujui
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2.5 py-1 bg-rose-50 text-rose-600 border border-rose-200/50 text-[10px] font-extrabold uppercase rounded-full tracking-wider block text-center max-w-[90px]">
            Ditolak
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="px-2.5 py-1 bg-amber-50 text-amber-600 border border-amber-200/50 text-[10px] font-extrabold uppercase rounded-full tracking-wider block text-center max-w-[90px]">
            Pending
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col min-h-screen overflow-y-auto">
        <Navbar title="Profil Saya" />

        <main className="p-8 space-y-8 max-w-6xl mx-auto w-full">
          
          {/* Header Card with Profile Photo management */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center sm:space-x-6 space-y-4 sm:space-y-0">
            {/* Avatar container with hover upload trigger */}
            <div className="w-24 h-24 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary border-2 border-brand-primary/20 overflow-hidden relative group shrink-0 shadow-sm">
              {user?.profile_photo_path ? (
                <img
                  src={getProfilePhotoUrl()}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="h-10 w-10 text-brand-primary" />
              )}
              {/* Overlay hover element */}
              <label className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity duration-200 text-white text-[10px] font-extrabold uppercase tracking-wider">
                <Camera className="h-5 w-5 mb-1 text-slate-100" />
                <span>Ubah Foto</span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  className="hidden"
                  onChange={handlePhotoChange}
                  disabled={isPhotoLoading}
                />
              </label>
            </div>

            <div className="text-center sm:text-left flex-grow space-y-1">
              <h3 className="text-xl font-extrabold text-slate-800">{user?.name}</h3>
              <p className="text-sm text-slate-400 font-semibold">{user?.email}</p>
              
              <div className="pt-2 flex flex-wrap gap-2 items-center justify-center sm:justify-start">
                <span className="px-3 py-1 bg-brand-primary/10 text-brand-primary border border-brand-primary/20 text-xs font-bold uppercase rounded-full tracking-wider shadow-sm">
                  {user?.role} Account
                </span>
                {isPhotoLoading && (
                  <span className="text-xs text-brand-primary font-bold animate-pulse flex items-center space-x-1">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Sedang mengunggah foto...</span>
                  </span>
                )}
              </div>

              {/* Status messages for photo upload */}
              {photoError && (
                <div className="mt-2 text-xs text-brand-red font-bold flex items-center space-x-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>{photoError}</span>
                </div>
              )}
              {photoSuccess && (
                <div className="mt-2 text-xs text-brand-green font-bold flex items-center space-x-1">
                  <CheckCircle className="h-3.5 w-3.5" />
                  <span>{photoSuccess}</span>
                </div>
              )}
            </div>
          </div>

          {/* Two Columns Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Accounts & Security Forms */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Profile Info Form */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm">
                <h4 className="text-base font-bold text-slate-800 mb-1">Informasi Profil</h4>
                <p className="text-xs text-slate-400 mb-6 font-semibold">
                  Perbarui nama lengkap dan alamat email utama Anda.
                </p>

                {profileError && (
                  <div className="mb-6 p-4 rounded-xl bg-brand-red/10 border border-brand-red/20 text-brand-red text-xs flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <span>{profileError}</span>
                  </div>
                )}

                {profileSuccess && (
                  <div className="mb-6 p-4 rounded-xl bg-brand-green/10 border border-brand-green/20 text-brand-green text-xs flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 flex-shrink-0" />
                    <span>{profileSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleUpdateProfile} className="space-y-5">
                  {/* Name Input */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Nama Lengkap
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        <User className="h-5 w-5" />
                      </span>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nama Lengkap"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none text-slate-900 transition-all text-sm"
                      />
                    </div>
                  </div>

                  {/* Email Input */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Alamat Email
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        <Mail className="h-5 w-5" />
                      </span>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nama@email.com"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none text-slate-900 transition-all text-sm"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isProfileLoading || (name === user?.name && email === user?.email)}
                    className="w-full py-3 bg-brand-primary hover:bg-brand-hover text-white font-bold rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-[0_4px_12px_rgba(37,99,235,0.15)] disabled:opacity-50"
                  >
                    {isProfileLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <span>Simpan Perubahan</span>
                    )}
                  </button>
                </form>
              </div>

              {/* Change Password Form */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm">
                <h4 className="text-base font-bold text-slate-800 mb-1">Keamanan Kata Sandi</h4>
                <p className="text-xs text-slate-400 mb-6 font-semibold">
                  Ubah kata sandi Anda secara berkala untuk menjaga keamanan akun.
                </p>

                {passwordError && (
                  <div className="mb-6 p-4 rounded-xl bg-brand-red/10 border border-brand-red/20 text-brand-red text-xs flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <span>{passwordError}</span>
                  </div>
                )}

                {passwordSuccess && (
                  <div className="mb-6 p-4 rounded-xl bg-brand-green/10 border border-brand-green/20 text-brand-green text-xs flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 flex-shrink-0" />
                    <span>{passwordSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  {/* Current Password Input */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Kata Sandi Saat Ini
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        <Lock className="h-4 w-4" />
                      </span>
                      <input
                        type="password"
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none text-slate-900 transition-all text-sm"
                      />
                    </div>
                  </div>

                  {/* New Password Input */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Kata Sandi Baru
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        <Lock className="h-4 w-4" />
                      </span>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none text-slate-900 transition-all text-sm"
                      />
                    </div>
                  </div>

                  {/* Confirm New Password Input */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Konfirmasi Kata Sandi Baru
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        <Lock className="h-4 w-4" />
                      </span>
                      <input
                        type="password"
                        required
                        value={passwordConfirmation}
                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none text-slate-900 transition-all text-sm"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isPasswordLoading || !currentPassword || !password || !passwordConfirmation}
                    className="w-full py-3 bg-brand-primary hover:bg-brand-hover text-white font-bold rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-[0_4px_12px_rgba(37,99,235,0.15)] disabled:opacity-50"
                  >
                    {isPasswordLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <span>Ubah Kata Sandi</span>
                    )}
                  </button>
                </form>
              </div>

            </div>

            {/* Right Column: User Reports History */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-base font-bold text-slate-800">Riwayat Laporan Penipuan</h4>
                  <span className="px-2.5 py-1 bg-slate-50 text-slate-600 border border-slate-200 text-xs font-bold rounded-xl">
                    Total: {reports.length}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-6 font-semibold">
                  Daftar aduan komunitas yang Anda kirimkan untuk memetakan ancaman digital.
                </p>

                {reportsError && (
                  <div className="p-4 rounded-xl bg-brand-red/10 border border-brand-red/20 text-brand-red text-xs flex items-center space-x-2 mb-6">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <span>{reportsError}</span>
                  </div>
                )}

                {isReportsLoading ? (
                  <div className="py-12 flex flex-col items-center justify-center space-y-3 text-slate-400">
                    <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
                    <p className="text-sm font-semibold">Memuat riwayat laporan...</p>
                  </div>
                ) : reports.length === 0 ? (
                  <div className="py-16 flex flex-col items-center justify-center space-y-3 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 text-slate-400">
                    <ShieldAlert className="h-10 w-10 text-slate-300" />
                    <p className="text-sm font-bold">Belum Ada Laporan</p>
                    <p className="text-xs text-center max-w-[280px]">
                      Anda belum pernah mengirimkan laporan penipuan ke komunitas.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-slate-200/60">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 text-[10px] font-extrabold uppercase tracking-wider border-b border-slate-200/60">
                          <th className="px-5 py-4">Laporan & Pelaku</th>
                          <th className="px-5 py-4">Platform</th>
                          <th className="px-5 py-4">Tanggal</th>
                          <th className="px-5 py-4 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {reports.map((report) => (
                          <tr key={report.id} className="hover:bg-slate-50/30 transition-colors">
                            <td className="px-5 py-4">
                              <p className="text-sm font-bold text-slate-800 line-clamp-1">{report.title}</p>
                              <p className="text-xs text-slate-400 font-semibold line-clamp-1 mt-0.5">{report.entity_name}</p>
                            </td>
                            <td className="px-5 py-4">
                              <span className="text-xs font-semibold text-slate-600 block">{report.location_platform}</span>
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">{report.fraud_type}</span>
                            </td>
                            <td className="px-5 py-4 text-slate-500 text-xs font-semibold">
                              {formatDate(report.created_at)}
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex justify-center">
                                {getStatusBadge(report.status)}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
