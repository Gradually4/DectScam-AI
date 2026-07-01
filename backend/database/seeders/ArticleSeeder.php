<?php

namespace Database\Seeders;

use App\Models\Article;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ArticleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Article::create([
            'title' => 'Bahaya Modus File APK Undangan Pernikahan',
            'slug' => 'bahaya-modus-file-apk-undangan-pernikahan',
            'content' => "Modus penipuan berbasis file `.APK` yang disamarkan sebagai undangan pernikahan digital kian marak di Indonesia.\n\n### Bagaimana Cara Kerjanya?\nPenipu biasanya mengirimkan pesan WhatsApp yang berisi file dengan nama seperti `Undangan Pernikahan.apk`. Mereka membujuk korban untuk mengunduh dan memasang (install) aplikasi tersebut.\n\nSetelah dipasang, aplikasi jahat ini akan meminta izin akses tingkat tinggi, terutama akses membaca SMS. Ketika izin diberikan, aplikasi tersebut dapat membaca SMS OTP (One-Time Password) dari perbankan atau dompet digital korban, lalu mengirimkannya ke server penipu.\n\n### Langkah Pencegahan:\n1. **Jangan pernah mengunduh file `.apk`** dari orang asing di WhatsApp.\n2. Selalu unduh aplikasi hanya dari toko resmi seperti Google Play Store.\n3. Periksa kembali izin aplikasi yang Anda instal. Jangan berikan akses SMS pada aplikasi yang mencurigakan.",
            'thumbnail' => 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800',
            'author' => 'DectScam Security Team',
        ]);

        Article::create([
            'title' => 'Cara Membaca URL Phishing yang Menipu',
            'slug' => 'cara-membaca-url-phishing-yang-menipu',
            'content' => "Phishing adalah salah satu ancaman digital terbesar saat ini. Penipu sering kali membuat situs web tiruan yang sangat mirip dengan aslinya untuk mencuri kredensial masuk atau data kartu kredit Anda.\n\n### Cara Mendeteksi URL Phishing:\n- **Periksa Domain Utama:** Penipu sering menggunakan subdomain yang menipu. Contoh: `klikbca.pembatalan-tarif-bca.com` bukan situs BCA resmi. Domain utamanya adalah `pembatalan-tarif-bca.com`, bukan `klikbca.com`.\n- **Karakter Serupa (Homoglyph Attack):** Beberapa huruf diganti dengan karakter serupa dari alfabet lain. Contoh: `G00gle.com` (menggunakan angka nol) atau `l` kecil diganti `1`.\n- **Tidak Menggunakan HTTPS:** Meskipun sekarang banyak situs phishing memakai HTTPS, ketiadaan logo gembok keamanan adalah indikator kuat situs berbahaya.\n\n### Tips Aman:\n- Jangan mengklik tautan langsung dari SMS atau email mencurigakan. Selalu ketik alamat situs web resmi secara manual di browser Anda.",
            'thumbnail' => 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800',
            'author' => 'DectScam Research',
        ]);

        Article::create([
            'title' => 'Pentingnya Mengaktifkan Two-Factor Authentication',
            'slug' => 'pentingnya-mengaktifkan-two-factor-authentication',
            'content' => "Menggunakan kata sandi yang kuat saja terkadang tidak cukup untuk melindungi akun online Anda. Di sinilah Two-Factor Authentication (2FA) atau Otentikasi Dua Faktor menjadi sangat penting.\n\n### Apa itu 2FA?\n2FA menambahkan lapisan keamanan kedua setelah kata sandi. Untuk masuk ke akun, Anda harus memasukkan kata sandi dan kode verifikasi tambahan yang dikirimkan ke perangkat Anda (melalui SMS, email, atau aplikasi otentikasi seperti Google Authenticator).\n\n### Mengapa 2FA Sangat Penting?\n1. **Melindungi dari Kebocoran Data:** Jika kata sandi Anda bocor dalam pelanggaran data massal, penipu tetap tidak bisa mengakses akun Anda tanpa perangkat fisik Anda.\n2. **Mendeteksi Upaya Peretasan:** Jika Anda menerima notifikasi OTP atau permintaan verifikasi masuk padahal Anda sedang tidak mencoba masuk, itu berarti seseorang telah mengetahui kata sandi Anda dan sedang mencoba masuk ke akun Anda.\n\nSegera aktifkan 2FA di semua akun penting Anda seperti email, media sosial, dan perbankan.",
            'thumbnail' => 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&q=80&w=800',
            'author' => 'DectScam Advisor',
        ]);
    }
}
