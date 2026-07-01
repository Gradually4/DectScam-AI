import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { ChevronLeft, User, Calendar, Loader2, BookOpen } from 'lucide-react';

export default function ArticleDetail() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticleDetail = async () => {
      try {
        const response = await api.get(`/api/v1/articles/${slug}`);
        if (response.data?.status === 'success') {
          setArticle(response.data.data);
        } else {
          setError('Artikel tidak ditemukan.');
        }
      } catch (err) {
        console.error('Error fetching article detail:', err);
        setError('Terjadi kesalahan jaringan atau artikel tidak ditemukan.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticleDetail();
  }, [slug]);

  // Parse custom format helper for styling headings, lists, bold text
  const renderFormattedContent = (content) => {
    if (!content) return null;

    return content.split('\n').map((line, idx) => {
      // Bold text formatting: **text**
      let formattedLine = line;
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;
      
      while ((match = boldRegex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          parts.push(line.substring(lastIndex, match.index));
        }
        parts.push(<strong key={match.index} className="font-extrabold text-slate-900">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      if (lastIndex < line.length) {
        parts.push(line.substring(lastIndex));
      }
      
      const renderedText = parts.length > 0 ? parts : formattedLine;

      // H3 formatting: ### Heading
      if (line.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-lg font-bold text-slate-800 mt-6 mb-3 tracking-tight">
            {line.replace('### ', '')}
          </h3>
        );
      }

      // Ordered list items: "1. " or "2. "
      const listRegex = /^(\d+\.\s)(.*)/;
      if (listRegex.test(line)) {
        const match = line.match(listRegex);
        return (
          <div key={idx} className="pl-4 py-1 flex items-start space-x-2 text-slate-700">
            <span className="font-bold text-brand-primary min-w-[20px]">{match[1]}</span>
            <span className="text-sm md:text-base leading-relaxed">{match[2]}</span>
          </div>
        );
      }

      // Unordered list items: "- "
      if (line.startsWith('- ')) {
        return (
          <div key={idx} className="pl-6 py-1 flex items-start space-x-2.5 text-slate-700">
            <span className="text-brand-primary mt-2 h-1.5 w-1.5 rounded-full bg-brand-primary block shrink-0" />
            <span className="text-sm md:text-base leading-relaxed">{line.replace('- ', '')}</span>
          </div>
        );
      }

      // Blank line spacer
      if (line.trim() === '') {
        return <div key={idx} className="h-4" />;
      }

      // Regular paragraph
      return (
        <p key={idx} className="text-sm md:text-base leading-relaxed text-slate-600 mb-2">
          {renderedText}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex-grow flex flex-col min-h-screen">
        <Navbar title="Detail Artikel" />

        {/* Main Content Area */}
        <main className="p-8 flex-grow max-w-4xl mx-auto w-full space-y-6">
          {/* Back Button */}
          <div>
            <Link 
              to="/education" 
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-400 hover:text-slate-800 transition-colors group"
            >
              <ChevronLeft className="h-4 w-4 transform group-hover:-translate-x-0.5 transition-transform" />
              <span>Kembali ke Edukasi</span>
            </Link>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
              <Loader2 className="h-10 w-10 text-brand-primary animate-spin" />
              <span className="text-slate-500 font-semibold text-sm">Memuat konten artikel...</span>
            </div>
          )}

          {/* Error State */}
          {!isLoading && error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl text-sm font-semibold max-w-md mx-auto text-center shadow-sm">
              {error}
            </div>
          )}

          {/* Article Full Render */}
          {!isLoading && !error && article && (
            <article className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm p-6 md:p-10 space-y-8">
              
              {/* Header Info */}
              <div className="space-y-4">
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 leading-tight">
                  {article.title}
                </h2>
                
                {/* Meta details */}
                <div className="flex items-center space-x-4 text-xs font-bold text-slate-400 border-b border-slate-100 pb-4">
                  <span className="flex items-center space-x-1.5">
                    <User className="h-4 w-4 text-brand-primary" />
                    <span>{article.author}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center space-x-1.5">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {article.created_at ? new Date(article.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      }) : 'Baru saja'}
                    </span>
                  </span>
                </div>
              </div>

              {/* Cover/Thumbnail Image */}
              {article.thumbnail && (
                <div className="h-64 md:h-96 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
                  <img 
                    src={article.thumbnail} 
                    alt={article.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Text Content */}
              <div className="max-w-none pt-2">
                {renderFormattedContent(article.content)}
              </div>

            </article>
          )}

        </main>
      </div>
    </div>
  );
}
