# DectScam AI

DectScam AI adalah aplikasi fullstack berbasis Kecerdasan Buatan (AI) yang dirancang untuk mendeteksi berbagai jenis ancaman siber, mulai dari rekayasa sosial (pesan scam kurir/APK), tautan phishing, hingga investigasi forensik pada promosi investasi bodong dan robot trading.

Proyek ini dibangun sebagai solusi literasi digital dan keamanan siber, dengan arsitektur yang sudah sepenuhnya di-Containerization menggunakan Docker agar siap dijalankan di lingkungan produksi maupun lokal.

## Fitur Utama

- **Scam Message Detector:** Membedah teks pesan (SMS/WhatsApp/Email) untuk mendeteksi taktik manipulasi psikologis, ancaman malware (.apk), dan pencatutan nama instansi resmi.
- **URL Phishing Scanner:** Memindai tautan mencurigakan, termasuk teknik typosquatting dan tautan berbasis IP Address mentah, untuk mencegah pencurian kredensial.
- **Investment Forensics:** Otomasi deteksi investasi bodong. Menganalisis teks promosi untuk mencari kecacatan fundamental (seperti janji fix return harian) dan taktik FOMO (Fear Of Missing Out), lalu membandingkannya dengan mekanisme pasar nyata.
- **Admin Dashboard & Trend Chart:** Visualisasi data laporan penipuan dengan filter rentang waktu dinamis (7 hari, 14 hari, 30 hari).

## Teknologi yang Digunakan

- **Frontend:** React, Tailwind CSS, Vite
- **Backend:** Laravel 11, PHP 8.2
- **Database:** MariaDB 10.4
- **AI Integration:** OpenAI / Gemini API (via HTTP Client)
- **DevOps:** Docker & Docker Compose

## Cara Instalasi (Lokal)

Karena proyek ini sudah menggunakan Docker, proses instalasi menjadi sangat mudah tanpa perlu menginstal PHP, Node.js, atau MariaDB secara manual di komputer Anda.

### Prasyarat
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (atau Docker Engine & Docker Compose)
- Git

### Langkah-langkah

1. **Clone repository ini**
   ```bash
   git clone [https://github.com/Gradually4/DectScam-AI.git](https://github.com/Gradually4/DectScam-AI.git)
   cd DectScam-AI
