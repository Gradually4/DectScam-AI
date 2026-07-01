import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../contexts/AuthContext';
import { PencilLine, FileText, Image as ImageIcon, Link as LinkIcon, Loader2, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export default function CreateArticle() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [thumbnailType, setThumbnailType] = useState('file'); // 'file' or 'url'
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title.trim()) {
      setError('Judul artikel wajib diisi.');
      return;
    }
    if (!content.trim()) {
      setError('Isi artikel wajib diisi.');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);

    if (thumbnailType === 'file') {
      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
      }
    } else {
      if (thumbnailUrl.trim()) {
        formData.append('thumbnail', thumbnailUrl);
      }
    }

    try {
      const response = await api.post('/api/v1/articles', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data?.status === 'success') {
        setSuccess('Artikel berhasil diterbitkan!');
        setTitle('');
        setContent('');
        setThumbnailFile(null);
        setThumbnailUrl('');
        
        // Redirect to cyber education page after 2 seconds
        setTimeout(() => {
          navigate('/education');
        }, 2000);
      } else {
        setError('Gagal menerbitkan artikel.');
      }
    } catch (err) {
      console.error('Error creating article:', err);
      setError(err.response?.data?.message || 'Terjadi kesalahan saat menerbitkan artikel.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-brand-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex-grow flex flex-col min-h-screen">
        <Navbar title="Tulis Artikel Edukasi" />

        {/* Main Content Area */}
        <main className="p-8 flex-grow max-w-4xl mx-auto w-full space-y-6">
          {/* Back link */}
          <button
            onClick={() => navigate('/education')}
            className="flex items-center space-x-2 text-slate-500 hover:text-slate-800 text-sm font-semibold transition-colors duration-150"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Edukasi Siber</span>
          </button>

          {/* Header */}
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-slate-800 flex items-center space-x-2.5">
              <PencilLine className="h-7 w-7 text-brand-primary" />
              <span>Tulis Artikel Edukasi Baru</span>
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Buat artikel edukasi baru yang akan langsung diterbitkan di halaman edukasi siber bagi seluruh pengguna.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start space-x-3 text-red-700 text-sm">
                <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start space-x-3 text-emerald-700 text-sm">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title Input */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">Judul Artikel</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                    <FileText className="h-5 w-5" />
                  </span>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Contoh: Waspada Modus Penipuan Social Engineering"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-brand-primary rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all duration-200 text-slate-800 placeholder-slate-400 font-medium"
                    required
                  />
                </div>
              </div>

              {/* Thumbnail Selector & Input */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-700">Gambar Sampul (Thumbnail)</label>
                
                {/* Selector Tabs */}
                <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
                  <button
                    type="button"
                    onClick={() => setThumbnailType('file')}
                    className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 ${
                      thumbnailType === 'file'
                        ? 'bg-white text-slate-800 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <ImageIcon className="h-3.5 w-3.5" />
                    <span>Upload File</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setThumbnailType('url')}
                    className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 ${
                      thumbnailType === 'url'
                        ? 'bg-white text-slate-800 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <LinkIcon className="h-3.5 w-3.5" />
                    <span>Gunakan URL Link</span>
                  </button>
                </div>

                {/* Input Body depending on selection */}
                {thumbnailType === 'file' ? (
                  <div className="border-2 border-dashed border-slate-200 hover:border-brand-primary/50 rounded-2xl p-6 transition-colors duration-200 flex flex-col items-center justify-center bg-slate-50">
                    <ImageIcon className="h-10 w-10 text-slate-400 mb-2" />
                    <span className="text-sm font-medium text-slate-600 mb-1">
                      {thumbnailFile ? thumbnailFile.name : 'Pilih file gambar Anda'}
                    </span>
                    <span className="text-xs text-slate-400 mb-4">Mendukung PNG, JPG, JPEG (Maks. 2MB)</span>
                    <input
                      type="file"
                      accept="image/*"
                      id="file-upload"
                      onChange={(e) => setThumbnailFile(e.target.files[0])}
                      className="hidden"
                    />
                    <label
                      htmlFor="file-upload"
                      className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-sm"
                    >
                      Pilih File
                    </label>
                  </div>
                ) : (
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                      <LinkIcon className="h-5 w-5" />
                    </span>
                    <input
                      type="url"
                      value={thumbnailUrl}
                      onChange={(e) => setThumbnailUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-brand-primary rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all duration-200 text-slate-800 placeholder-slate-400 font-medium"
                    />
                  </div>
                )}
              </div>

              {/* Content Textarea */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">Isi Artikel</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Ketik konten/isi artikel secara mendalam di sini..."
                  rows="12"
                  className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-brand-primary rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all duration-200 text-slate-800 placeholder-slate-400 font-medium leading-relaxed resize-y"
                  required
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-brand-primary hover:bg-blue-600 disabled:bg-blue-400 text-white rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-lg shadow-brand-primary/20 hover:shadow-xl transition-all duration-150"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Menerbitkan...</span>
                  </>
                ) : (
                  <span>Terbitkan Artikel</span>
                )}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
