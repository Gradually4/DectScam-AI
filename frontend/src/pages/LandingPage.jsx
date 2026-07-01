import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield,
  MessageSquare,
  Link2,
  Image as ImageIcon,
  GraduationCap,
  ChevronRight,
  ShieldCheck,
  Cpu,
  Terminal,
  Users,
  Lock,
  ArrowRight
} from 'lucide-react';

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12
      }
    }
  };

  const itemVariants = {
    hidden: { y: 25, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col justify-between overflow-x-hidden selection:bg-blue-100 selection:text-blue-800">

      {/* Background radial glow spots (Subtle light mode versions) */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-blue-400/5 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Header / Navbar */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
              <Shield className="h-6 w-6 text-blue-600 animate-pulse" />
            </div>
            <span className="font-extrabold text-xl bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent tracking-tight">
              DectScam AI
            </span>
          </div>
          <div className="flex items-center space-x-6">
            <Link
              to="/login"
              className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors duration-200"
            >
              Sign In
            </Link>
            <Link
              to="/login"
              className="px-5 py-2.5 text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all duration-200 shadow-[0_4px_15px_rgba(37,99,235,0.15)] hover:shadow-[0_4px_20px_rgba(37,99,235,0.25)] hover:scale-[1.02]"
            >
              Mulai Sekarang
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow">
        <section className="max-w-7xl mx-auto px-6 sm:px-8 py-24 sm:py-32 text-center relative flex flex-col items-center">

          {/* Tagline Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="mb-8 px-4 py-1.5 bg-blue-50 border border-blue-100/80 text-blue-600 text-xs font-extrabold uppercase rounded-full tracking-widest inline-flex items-center space-x-2"
          >
            <ShieldCheck className="h-4.5 w-4.5 text-blue-600 mr-1" />
            <span>PROTEKSI SIBER CERDAS BERBASIS AI</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 90, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 mb-8 max-w-4xl leading-[1.15]"
          >
            Amankan Jejak Digitalmu dari <br className="hidden md:inline" />
            <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-800 bg-clip-text text-transparent">
              Penipuan Digital Dengan AI
            </span>
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            initial={{ y: 25, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 90, delay: 0.2 }}
            className="max-w-2xl text-lg text-slate-500 mb-12 leading-relaxed font-medium"
          >
            DectScam AI adalah perisai keamanan digital proaktif. Deteksi SMS scam, tautan phishing, dan manipulasi gambar transfer secara akurat untuk melindungi finansial Anda dalam hitungan detik.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 90, delay: 0.3 }}
            className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center"
          >
            <Link
              to="/login"
              className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all duration-200 shadow-[0_4px_15px_rgba(37,99,235,0.2)] hover:shadow-[0_4px_20px_rgba(37,99,235,0.35)] hover:scale-[1.03] flex items-center justify-center space-x-2"
            >
              <span>Mulai Pemindaian</span>
              <ChevronRight className="h-5 w-5" />
            </Link>
            <a
              href="#fitur"
              className="px-8 py-4 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all duration-200 hover:text-slate-800 flex items-center justify-center"
            >
              Pelajari Fitur
            </a>
          </motion.div>
        </section>

        {/* Social Proof / Stats Section */}
        <section className="border-y border-slate-200 bg-white py-16">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">

            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-2">
                <Cpu className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-4xl font-extrabold text-slate-900 tracking-tight">98.7%</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Akurasi Deteksi AI Engine</p>
            </div>

            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-2">
                <Lock className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-4xl font-extrabold text-slate-900 tracking-tight">&lt; 2.0 Detik</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Waktu Analisis Real-Time</p>
            </div>

            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-2">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-4xl font-extrabold text-slate-900 tracking-tight">24/7</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Perlindungan Komunitas Aktif</p>
            </div>

          </div>
        </section>

        {/* Feature Showcase Section (Bento Grid) */}
        <section id="fitur" className="max-w-7xl mx-auto px-6 sm:px-8 py-32">

          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
              Perlindungan Multimodal Komprehensif
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto text-sm sm:text-base font-semibold">
              Mendeteksi ancaman digital melalui teks, tautan, dan unggahan gambar secara langsung.
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
          >

            {/* Card 1: Scam Message Detector (span-2) */}
            <motion.div
              variants={itemVariants}
              className="md:col-span-2 p-8 rounded-3xl bg-white border border-slate-200/80 hover:border-blue-500/30 hover:shadow-[0_8px_30px_rgba(37,99,235,0.06)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[320px] relative overflow-hidden group shadow-sm"
            >
              <div className="space-y-4 max-w-lg z-10">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Scam Message Detector</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-semibold">
                  Unggah teks SMS, WhatsApp, atau email mencurigakan. AI Engine kami menganalisis pola kalimat, rekayasa sosial, dan indikator manipulasi psikologis untuk memitigasi kerugian Anda.
                </p>
              </div>

              <Link
                to="/login"
                className="inline-flex items-center space-x-2 px-5 py-3 bg-blue-50 hover:bg-blue-100 border border-blue-100 hover:border-blue-200 text-blue-600 hover:text-blue-700 text-xs font-extrabold uppercase rounded-xl tracking-wider transition-all duration-200 mt-6 shadow-sm w-fit cursor-pointer group"
              >
                <span>Coba Fitur Detektor Teks</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            {/* Card 2: URL Phishing Detector */}
            <motion.div
              variants={itemVariants}
              className="p-8 rounded-3xl bg-white border border-slate-200/80 hover:border-blue-500/30 hover:shadow-[0_8px_30px_rgba(37,99,235,0.06)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[320px] group shadow-sm"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <Link2 className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">URL Phishing Detector</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-semibold">
                  Menganalisis domain, SSL certificate, dan ekspansi tautan palsu tanpa harus mengunjunginya.
                </p>
              </div>

              <Link
                to="/login"
                className="inline-flex items-center space-x-2 px-5 py-3 bg-blue-50 hover:bg-blue-100 border border-blue-100 hover:border-blue-200 text-blue-600 hover:text-blue-700 text-xs font-extrabold uppercase rounded-xl tracking-wider transition-all duration-200 mt-6 shadow-sm w-fit cursor-pointer group"
              >
                <span>Pindai URL</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            {/* Card 3: Screenshot Scanner */}
            <motion.div
              variants={itemVariants}
              className="p-8 rounded-3xl bg-white border border-slate-200/80 hover:border-blue-500/30 hover:shadow-[0_8px_30px_rgba(37,99,235,0.06)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[320px] group shadow-sm"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <ImageIcon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">Screenshot Scanner</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-semibold">
                  Ekstrak teks dari struk transfer bank atau percakapan digital via OCR untuk mengidentifikasi keabsahan bukti pembayaran.
                </p>
              </div>

              <Link
                to="/login"
                className="inline-flex items-center space-x-2 px-5 py-3 bg-blue-50 hover:bg-blue-100 border border-blue-100 hover:border-blue-200 text-blue-600 hover:text-blue-700 text-xs font-extrabold uppercase rounded-xl tracking-wider transition-all duration-200 mt-6 shadow-sm w-fit cursor-pointer group"
              >
                <span>Unggah Gambar</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            {/* Card 4: Learning Center & Chat (span-2) */}
            <motion.div
              variants={itemVariants}
              className="md:col-span-2 p-8 rounded-3xl bg-white border border-slate-200/80 hover:border-blue-500/30 hover:shadow-[0_8px_30px_rgba(37,99,235,0.06)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[320px] relative overflow-hidden group shadow-sm"
            >
              <div className="space-y-4 max-w-lg z-10">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Asisten Obrolan AI & Pusat Edukasi</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-semibold">
                  Konsultasikan ancaman siber 24 jam bersama AI Security Assistant dan pelajari tips keamanan terkini melalui pusat edukasi literasi digital terintegrasi.
                </p>
              </div>

              <Link
                to="/login"
                className="inline-flex items-center space-x-2 px-5 py-3 bg-blue-50 hover:bg-blue-100 border border-blue-100 hover:border-blue-200 text-blue-600 hover:text-blue-700 text-xs font-extrabold uppercase rounded-xl tracking-wider transition-all duration-200 mt-6 shadow-sm w-fit cursor-pointer group"
              >
                <span>Tanya Asisten AI</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

          </motion.div>
        </section>

        {/* Security Alert banner callout */}
        <section className="max-w-5xl mx-auto px-6 sm:px-8 mb-24">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-blue-50 to-blue-50/40 border border-blue-100 flex flex-col sm:flex-row items-center sm:justify-between space-y-6 sm:space-y-0 text-center sm:text-left shadow-sm"
          >
            <div className="space-y-2">
              <h4 className="text-xl font-bold text-slate-900">Curiga dengan pesan atau tautan mencurigakan?</h4>
              <p className="text-sm text-slate-500 font-semibold max-w-xl">
                Jangan tunggu sampai data Anda dicuri. Masuk sekarang dan gunakan AI Detector kami untuk memverifikasi secara instan.
              </p>
            </div>
            <Link
              to="/login"
              className="px-6 py-3 bg-blue-600 text-white hover:bg-blue-500 font-extrabold rounded-xl transition-all duration-150 shadow-md text-sm shrink-0 inline-flex items-center space-x-2 hover:scale-[1.02]"
            >
              <span>Uji Coba Sekarang</span>
              <ChevronRight className="h-4.5 w-4.5" />
            </Link>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 flex flex-col md:flex-row items-center justify-between text-sm text-slate-500">

          <div className="flex items-center space-x-3 mb-6 md:mb-0">
            <Shield className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-slate-800">DectScam AI</span>
          </div>

          <div className="flex space-x-8 mb-6 md:mb-0 text-xs font-extrabold uppercase tracking-wider">
            <a href="#" className="hover:text-slate-900 transition-colors text-slate-500">Kebijakan Privasi</a>
            <a href="#" className="hover:text-slate-900 transition-colors text-slate-500">Syarat & Ketentuan</a>
            <a href="#" className="hover:text-slate-900 transition-colors text-slate-500">Hubungi Kami</a>
          </div>

          <p className="text-xs text-slate-400 font-semibold">&copy; 2026 DectScam AI. Hak Cipta Dilindungi Undang-Undang.</p>
        </div>
      </footer>
    </div>
  );
}
