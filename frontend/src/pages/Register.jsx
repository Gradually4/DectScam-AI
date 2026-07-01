import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, User, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setValidationErrors({});

    if (password !== passwordConfirmation) {
      setIsLoading(false);
      setError('Konfirmasi password tidak cocok.');
      return;
    }

    try {
      await register(name, email, password, passwordConfirmation);
      setIsLoading(false);
      navigate('/dashboard');
    } catch (err) {
      setIsLoading(false);
      console.error(err);
      if (err.response && err.response.status === 422) {
        setValidationErrors(err.response.data.errors || {});
        setError('Validasi gagal. Silakan periksa kembali isian formulir.');
      } else {
        setError(
          err.response?.data?.message || 'Registrasi gagal. Pastikan server aktif dan silakan coba lagi.'
        );
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-brand-primary/5 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none" />

      {/* Brand logo header */}
      <div className="mb-8 flex flex-col items-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 flex items-center justify-center border border-brand-primary/20">
          <Shield className="h-8 w-8 text-brand-primary" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Daftar Akun Baru</h2>
        <p className="text-sm text-slate-500">Buat akun untuk mulai memproteksi data Anda dari penipuan</p>
      </div>

      {/* Register Card */}
      <div className="w-full max-w-md bg-white border border-slate-200 p-8 rounded-3xl shadow-lg">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-brand-red/10 border border-brand-red/20 text-brand-red text-sm flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
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
                placeholder="Budi Santoso"
                className={`w-full pl-10 pr-4 py-3 bg-slate-50 border ${
                  validationErrors.name ? 'border-brand-red' : 'border-slate-200'
                } rounded-xl focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none text-slate-900 transition-all text-sm placeholder-slate-400`}
              />
            </div>
            {validationErrors.name && (
              <p className="mt-1 text-xs text-brand-red font-semibold">{validationErrors.name[0]}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
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
                className={`w-full pl-10 pr-4 py-3 bg-slate-50 border ${
                  validationErrors.email ? 'border-brand-red' : 'border-slate-200'
                } rounded-xl focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none text-slate-900 transition-all text-sm placeholder-slate-400`}
              />
            </div>
            {validationErrors.email && (
              <p className="mt-1 text-xs text-brand-red font-semibold">{validationErrors.email[0]}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Lock className="h-5 w-5" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full pl-10 pr-10 py-3 bg-slate-50 border ${
                  validationErrors.password ? 'border-brand-red' : 'border-slate-200'
                } rounded-xl focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none text-slate-900 transition-all text-sm placeholder-slate-400`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {validationErrors.password && (
              <p className="mt-1 text-xs text-brand-red font-semibold">{validationErrors.password[0]}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Konfirmasi Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Lock className="h-5 w-5" />
              </span>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none text-slate-900 transition-all text-sm placeholder-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 mt-2 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-hover transition-all duration-200 flex items-center justify-center space-x-2 shadow-[0_4px_12px_rgba(37,99,235,0.2)] disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Mendaftar...</span>
              </>
            ) : (
              <span>Daftar Sekarang</span>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-500 font-medium">
          Sudah punya akun?{' '}
          <Link to="/login" className="text-brand-primary font-semibold hover:underline">
            Login di sini
          </Link>
        </div>
      </div>
    </div>
  );
}
