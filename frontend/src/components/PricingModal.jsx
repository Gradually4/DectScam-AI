import React, { useState } from 'react';
import { X, Check, Zap, Crown, ShieldAlert, Loader2, ChevronLeft, CreditCard, QrCode } from 'lucide-react';
import api from '../utils/api';

export default function PricingModal({ isOpen, onClose }) {
  const [selectedTier, setSelectedTier] = useState(null); // holds selected tier object
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('gopay'); // 'gopay' or 'card'
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [country, setCountry] = useState('Indonesia');

  if (!isOpen) return null;

  const tiers = [
    {
      id: 'plus',
      name: 'Plus Plan',
      price: 29000,
      priceFormatted: 'Rp 29.000',
      period: '/bulan',
      icon: Zap,
      colorClass: 'border-slate-200 hover:border-blue-400 bg-white text-slate-800',
      badgeColor: 'bg-blue-100 text-blue-800',
      buttonClass: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200',
      iconColor: 'text-blue-500',
      features: [
        '20 Deteksi Teks / hari',
        '20 Deteksi URL / hari',
        '10 Analisis Gambar / hari',
        '10 Chat Asisten AI / hari',
        'Dukungan Komunitas Utama',
      ],
    },
    {
      id: 'pro',
      name: 'Pro Plan',
      price: 59000,
      priceFormatted: 'Rp 59.000',
      period: '/bulan',
      icon: Crown,
      popular: true,
      colorClass: 'border-purple-300 hover:border-purple-500 bg-gradient-to-b from-purple-50/50 to-white shadow-md relative scale-105 z-10 text-slate-800',
      badgeColor: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white',
      buttonClass: 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-750 hover:to-indigo-750 text-white shadow-purple-200',
      iconColor: 'text-purple-600',
      features: [
        '50 Deteksi Teks / hari',
        '50 Deteksi URL / hari',
        '30 Analisis Gambar / hari',
        '30 Chat Asisten AI / hari',
        'Dukungan Prioritas 24/7',
        'Laporan PDF Ringkasan Keamanan',
      ],
    },
    {
      id: 'ultimate',
      name: 'Ultimate Plan',
      price: 99000,
      priceFormatted: 'Rp 99.000',
      period: '/bulan',
      icon: Crown,
      colorClass: 'border-slate-800 hover:border-slate-900 bg-slate-900 text-white',
      badgeColor: 'bg-amber-500 text-slate-950 font-bold',
      buttonClass: 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-900/10 font-bold',
      iconColor: 'text-amber-400',
      features: [
        'Deteksi Teks TANPA BATAS',
        'Deteksi URL TANPA BATAS',
        'Analisis Gambar TANPA BATAS',
        'Chat Asisten AI TANPA BATAS',
        'Konsultasi Keamanan Siber Pribadi',
        'Akses Awal Fitur Baru',
      ],
    },
  ];

  const handleUpgrade = async (tierId) => {
    setIsUpgrading(true);
    try {
      const response = await api.post('/api/v1/payment/snap-token', { tier: tierId });
      
      if (response.data && response.data.snap_token) {
        const snapToken = response.data.snap_token;
        
        if (window.snap) {
          window.snap.pay(snapToken, {
            onSuccess: function(result) {
              alert("Pembayaran Sukses! Paket Anda akan segera aktif.");
              onClose();
              window.location.reload();
            },
            onPending: function(result) {
              alert("Menunggu Pembayaran. Silakan selesaikan pembayaran Anda.");
            },
            onError: function(result) {
              alert("Pembayaran Gagal.");
            },
            onClose: function() {
              alert("Pembayaran dibatalkan.");
            }
          });
        } else {
          alert("Midtrans SDK tidak terdeteksi. Silakan segarkan halaman.");
        }
      } else {
        alert("Gagal mendapatkan token transaksi.");
      }
    } catch (error) {
      console.error("Upgrade error:", error);
      alert(error.response?.data?.message || "Gagal memproses pembayaran. Coba lagi nanti.");
    } finally {
      setIsUpgrading(false);
    }
  };

  // Calculate pricing breakdown
  const totalAmount = selectedTier ? selectedTier.price : 0;
  const basePrice = Math.round(totalAmount / 1.11);
  const vatAmount = totalAmount - basePrice;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 md:py-8">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className={`relative w-full transition-all duration-300 ${selectedTier ? 'max-w-4xl bg-[#171717] text-white border-zinc-800' : 'max-w-5xl bg-slate-50 border-slate-100 text-slate-800'} rounded-3xl shadow-2xl border p-6 md:p-8 my-auto overflow-hidden`}>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-full transition-colors duration-150 shadow-sm z-20 ${selectedTier ? 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white' : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'}`}
        >
          <X className="h-5 w-5" />
        </button>

        {!selectedTier ? (
          /* ================= PLAN SELECTION VIEW ================= */
          <div>
            {/* Modal Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center space-x-2 bg-amber-50 border border-amber-100 px-4 py-1.5 rounded-full mb-3 shadow-sm">
                <ShieldAlert className="h-5 w-5 text-amber-500 animate-pulse" />
                <span className="text-sm font-semibold text-amber-800">
                  Limit Transaksi Tercapai!
                </span>
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Pilih Paket Berlangganan DectScam AI
              </h2>
              <p className="text-slate-500 mt-2 max-w-md mx-auto text-sm">
                Tingkatkan keamanan digital Anda dan hilangkan batasan harian dengan berlangganan paket premium kami.
              </p>
            </div>

            {/* Pricing Table Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4 items-stretch py-2">
              {tiers.map((tier, idx) => {
                const IconComponent = tier.icon;
                return (
                  <div
                    key={idx}
                    className={`rounded-2xl border p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 ${tier.colorClass}`}
                  >
                    {/* Upper Section */}
                    <div>
                      {tier.popular && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow">
                          Paling Populer
                        </span>
                      )}
                      
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-sm font-bold tracking-wide uppercase opacity-80">
                          {tier.name}
                        </span>
                        <IconComponent className={`h-6 w-6 ${tier.iconColor}`} />
                      </div>

                      <div className="mb-6">
                        <span className="text-3xl font-extrabold tracking-tight">
                          {tier.priceFormatted}
                        </span>
                        <span className="text-sm opacity-70 font-medium">
                          {tier.period}
                        </span>
                      </div>

                      {/* Divider */}
                      <div className="h-px bg-slate-200/50 mb-6" />

                      {/* Features List */}
                      <ul className="space-y-3.5 mb-8">
                        {tier.features.map((feat, fIdx) => (
                          <li key={fIdx} className="flex items-start text-sm">
                            <Check className="h-5 w-5 mr-2.5 shrink-0 text-emerald-500" />
                            <span className="opacity-90">{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Button CTA */}
                    <button
                      onClick={() => setSelectedTier(tier)}
                      className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-all duration-150 shadow-lg hover:shadow-xl active:scale-95 ${tier.buttonClass}`}
                    >
                      Pilih {tier.name}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="text-center mt-6 text-xs text-slate-400">
              Dengan membeli paket, Anda menyetujui Ketentuan Layanan dan Kebijakan Privasi DectScam AI.
            </div>
          </div>
        ) : (
          /* ================= CONFIGURE PLAN / CHECKOUT VIEW ================= */
          <div className="space-y-6">
            {/* Back Button */}
            <button
              onClick={() => setSelectedTier(null)}
              className="flex items-center space-x-2 text-zinc-400 hover:text-white transition-colors duration-150 font-semibold text-sm group"
            >
              <ChevronLeft className="h-5 w-5 transform group-hover:-translate-x-0.5 transition-transform" />
              <span>Configure your plan</span>
            </button>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Form & Payment Method */}
              <div className="md:col-span-7 space-y-6">
                
                {/* Payment Method Selection */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Payment method</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('gopay')}
                      className={`flex items-center justify-center space-x-2 py-3.5 px-4 rounded-xl border font-bold text-sm transition-all duration-150 ${paymentMethod === 'gopay' ? 'border-white bg-zinc-800 text-white shadow-md' : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'}`}
                    >
                      <QrCode className="h-4 w-4 text-sky-400" />
                      <span>GoPay</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`flex items-center justify-center space-x-2 py-3.5 px-4 rounded-xl border font-bold text-sm transition-all duration-150 ${paymentMethod === 'card' ? 'border-white bg-zinc-800 text-white shadow-md' : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'}`}
                    >
                      <CreditCard className="h-4 w-4 text-emerald-400" />
                      <span>Card</span>
                    </button>
                  </div>
                </div>

                {/* Helper notice */}
                <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl space-y-2">
                  <div className="flex items-center space-x-2 text-zinc-300">
                    <QrCode className="h-5 w-5 text-sky-400" />
                    <span className="text-xs font-bold">Complete checkout to pay with {paymentMethod === 'gopay' ? 'GoPay' : 'Card / Bank Transfer'}.</span>
                  </div>
                  <p className="text-xs text-zinc-500">
                    After submission, you will be redirected to securely complete next steps on the Midtrans gateway.
                  </p>
                </div>

                {/* Billing Address Form */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Billing address</h3>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-300">Full name</label>
                    <input
                      type="text"
                      placeholder="Jane Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm focus:outline-none focus:border-zinc-500 text-white placeholder-zinc-600 transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-300">Country or region</label>
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm focus:outline-none focus:border-zinc-500 text-white transition-colors"
                      >
                        <option value="Indonesia">Indonesia</option>
                        <option value="Malaysia">Malaysia</option>
                        <option value="Singapore">Singapore</option>
                        <option value="United States">United States</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-300">Address line 1</label>
                      <input
                        type="text"
                        placeholder="Street Name, No. 123"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm focus:outline-none focus:border-zinc-500 text-white placeholder-zinc-600 transition-colors"
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Premium Plan Card & Pricing breakdown */}
              <div className="md:col-span-5 space-y-6">
                
                {/* Checkout summary box */}
                <div className="bg-[#232323] border border-zinc-800/80 rounded-3xl p-6 space-y-6 shadow-xl">
                  
                  {/* Selected Plan Details */}
                  <div className="space-y-2">
                    <h4 className="text-2xl font-extrabold text-white tracking-tight">Go {selectedTier.name}</h4>
                    <p className="text-xs text-zinc-400">Top features:</p>
                    
                    <ul className="space-y-2 pt-2">
                      {selectedTier.features.slice(0, 4).map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-center text-xs text-zinc-300">
                          <Check className="h-4 w-4 mr-2 text-emerald-400 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="h-px bg-zinc-800" />

                  {/* Financial Breakdown */}
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between text-zinc-400">
                      <span>Monthly subscription</span>
                      <span>IDR {basePrice.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>VAT (11%)</span>
                      <span>IDR {vatAmount.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between font-extrabold text-sm text-white pt-1">
                      <span>Due today</span>
                      <span>IDR {totalAmount.toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  {/* Payment Trigger Button */}
                  <button
                    onClick={() => handleUpgrade(selectedTier.id)}
                    disabled={isUpgrading}
                    className="w-full py-4 bg-white hover:bg-zinc-150 text-black rounded-full font-bold text-sm transition-all duration-150 shadow-md flex items-center justify-center space-x-2 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed"
                  >
                    {isUpgrading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <span>Subscribe</span>
                    )}
                  </button>

                </div>

                {/* T&C text */}
                <p className="text-[10px] text-zinc-500 leading-normal text-center px-4">
                  Renews monthly until cancelled. IDR {totalAmount.toLocaleString('id-ID')}/month will be charged. Cancel anytime in Settings. By subscribing, you agree to our Terms of Use and Privacy Policy, and authorize DectScam to store and charge your payment method.
                </p>

              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
