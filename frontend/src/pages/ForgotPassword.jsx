import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Mail, Loader2, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import api from '../utils/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await api.post('/api/v1/auth/forgot-password', { email });
      if (response.data && response.data.status === 'success') {
        setSuccessMessage(response.data.message || 'Tautan reset password telah dikirim ke email Anda.');
      } else {
        setError(response.data?.message || 'Gagal mengirim tautan reset password.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Terjadi kesalahan. Silakan coba lagi nanti.');
    } finally {
      setIsLoading(false);
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
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Lupa Kata Sandi</h2>
        <p className="text-sm text-slate-400 font-semibold text-center max-w-xs">
          Masukkan alamat email Anda untuk mendapatkan tautan penyetelan ulang kata sandi.
        </p>
      </div>

      {/* Card container */}
      <div className="w-full max-w-md bg-white border border-slate-200 p-8 rounded-3xl shadow-lg">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-brand-red/10 border border-brand-red/20 text-brand-red text-sm flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 rounded-xl bg-brand-green/10 border border-brand-green/20 text-brand-green text-sm flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {!successMessage ? (
          <form onSubmit={handleForgotPassword} className="space-y-6">
            {/* Email input */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Email Address
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
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none text-slate-900 transition-all text-sm placeholder-slate-400"
                />
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-hover transition-all duration-200 flex items-center justify-center space-x-2 shadow-[0_4px_12px_rgba(37,99,235,0.2)] disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Mengirim Tautan...</span>
                </>
              ) : (
                <span>Kirim Tautan Reset</span>
              )}
            </button>
          </form>
        ) : (
          <div className="text-center py-4 space-y-4">
            <p className="text-sm text-slate-500 font-semibold leading-relaxed">
              Email instruksi reset kata sandi telah dikirim. Silakan periksa kotak masuk (atau tab spam) email Anda.
            </p>
            <div className="pt-2">
              <Link
                to="/login"
                className="inline-flex items-center space-x-2 text-sm font-bold text-brand-primary hover:underline"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Kembali ke Login</span>
              </Link>
            </div>
          </div>
        )}

        {!successMessage && (
          <div className="mt-8 text-center text-xs text-slate-500 font-medium">
            Ingat kata sandi Anda?{' '}
            <Link to="/login" className="text-brand-primary font-semibold hover:underline">
              Masuk di sini
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
