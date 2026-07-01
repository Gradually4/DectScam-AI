import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { BookOpen, User, Calendar, ArrowRight, Loader2 } from 'lucide-react';

export default function Education() {
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await api.get('/api/v1/articles');
        if (response.data?.status === 'success') {
          setArticles(response.data.data);
        } else {
          setError('Gagal memuat artikel.');
        }
      } catch (err) {
        console.error('Error fetching articles:', err);
        setError('Terjadi kesalahan jaringan saat memuat artikel.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex-grow flex flex-col min-h-screen">
        <Navbar title="Edukasi Siber" />

        {/* Main Content Area */}
        <main className="p-8 flex-grow max-w-6xl mx-auto w-full space-y-8">
          
          {/* Header */}
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-slate-800 flex items-center space-x-2.5">
              <BookOpen className="h-7 w-7 text-brand-primary" />
              <span>Pusat Edukasi Keamanan Siber</span>
            </h3>
            <p className="text-slate-500 max-w-2xl text-sm leading-relaxed">
              Pelajari modus penipuan online terbaru, cara mendeteksi serangan phishing, serta praktik terbaik untuk mengamankan data pribadi Anda.
            </p>
          </div>

          {/* Content Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="h-10 w-10 text-brand-primary animate-spin" />
              <span className="text-slate-500 font-semibold text-sm">Memuat artikel edukasi...</span>
            </div>
          )}

          {/* Error State */}
          {!isLoading && error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl text-sm font-semibold max-w-md mx-auto text-center shadow-sm">
              {error}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && articles.length === 0 && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center max-w-md mx-auto shadow-sm">
              <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h4 className="text-slate-800 font-bold text-lg">Belum Ada Artikel</h4>
              <p className="text-slate-400 text-sm mt-1">Nantikan artikel edukasi terbaru dari kami segera!</p>
            </div>
          )}

          {/* Articles Grid */}
          {!isLoading && !error && articles.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <div 
                  key={article.id} 
                  className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between"
                >
                  {/* Thumbnail Image */}
                  <div className="relative h-48 bg-slate-100 overflow-hidden shrink-0 border-b border-slate-100">
                    {article.thumbnail ? (
                      <img 
                        src={article.thumbnail} 
                        alt={article.title} 
                        className="w-full h-full object-cover transition-transform duration-350 hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-100">
                        <BookOpen className="h-12 w-12" />
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      {/* Meta Tags */}
                      <div className="flex items-center space-x-3 text-[11px] font-bold text-slate-400">
                        <span className="flex items-center space-x-1">
                          <User className="h-3.5 w-3.5 text-brand-primary" />
                          <span>{article.author}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>
                            {article.created_at ? new Date(article.created_at).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            }) : 'Baru saja'}
                          </span>
                        </span>
                      </div>

                      {/* Title */}
                      <h4 className="text-slate-800 font-extrabold text-base leading-snug hover:text-brand-primary transition-colors">
                        <Link to={`/education/${article.slug}`}>
                          {article.title}
                        </Link>
                      </h4>

                      {/* Excerpt */}
                      <p className="text-slate-500 text-xs leading-relaxed line-clamp-3">
                        {article.excerpt}
                      </p>
                    </div>

                    {/* Action Link */}
                    <div className="pt-2 border-t border-slate-50">
                      <Link 
                        to={`/education/${article.slug}`}
                        className="inline-flex items-center space-x-1 text-xs font-bold text-brand-primary hover:text-brand-hover transition-colors group"
                      >
                        <span>Baca Selengkapnya</span>
                        <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
