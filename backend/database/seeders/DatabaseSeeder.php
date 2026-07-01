<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Report;
use App\Models\FraudCategory;
use App\Models\Platform;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed Fraud Categories
        $catOnlineShop = FraudCategory::updateOrCreate(['slug' => 'penipuan-online-shop'], ['name' => 'Penipuan Online Shop']);
        $catPhishing = FraudCategory::updateOrCreate(['slug' => 'phishing'], ['name' => 'Phishing / Social Engineering']);
        $catInvestasi = FraudCategory::updateOrCreate(['slug' => 'investasi-bodong'], ['name' => 'Investasi Bodong']);
        $catLowongan = FraudCategory::updateOrCreate(['slug' => 'penipuan-lowongan-kerja'], ['name' => 'Penipuan Lowongan Kerja']);

        // 2. Seed Platforms
        $platInstagram = Platform::updateOrCreate(['name' => 'Instagram']);
        $platWhatsApp = Platform::updateOrCreate(['name' => 'WhatsApp']);
        $platTelegram = Platform::updateOrCreate(['name' => 'Telegram']);
        $platWebsite = Platform::updateOrCreate(['name' => 'Website']);
        $platSMS = Platform::updateOrCreate(['name' => 'SMS']);

        // 3. Create Admin User
        $admin = User::updateOrCreate(
            ['email' => 'agung@gmail.com'],
            [
                'name' => 'Administrator DectScam',
                'password' => Hash::make('12345678'),
                'role' => 'admin',
                'subscription_tier' => 'ultimate',
            ]
        );

        // 4. Create Normal User (Free)
        $user = User::updateOrCreate(
            ['email' => 'user@dectscam.ai'],
            [
                'name' => 'Budiman Sentosa (Free)',
                'password' => Hash::make('password'),
                'role' => 'user',
                'subscription_tier' => 'free',
            ]
        );

        // 5. Create Plus User
        $plusUser = User::updateOrCreate(
            ['email' => 'plus@dectscam.ai'],
            [
                'name' => 'Ahmad Faisal (Plus)',
                'password' => Hash::make('password'),
                'role' => 'user',
                'subscription_tier' => 'plus',
            ]
        );

        // 6. Create Pro User
        $proUser = User::updateOrCreate(
            ['email' => 'pro@dectscam.ai'],
            [
                'name' => 'Diana Lestari (Pro)',
                'password' => Hash::make('password'),
                'role' => 'user',
                'subscription_tier' => 'pro',
            ]
        );

        // 7. Create Ultimate User
        $ultimateUser = User::updateOrCreate(
            ['email' => 'ultimate@dectscam.ai'],
            [
                'name' => 'Rian Wijaya (Ultimate)',
                'password' => Hash::make('password'),
                'role' => 'user',
                'subscription_tier' => 'ultimate',
            ]
        );

        // 8. Create Approved Reports
        $report1 = Report::create([
            'user_id' => $user->id,
            'title' => 'Penipuan Toko Instagram @distro_murah_jogja',
            'entity_name' => 'distro_murah_jogja (Andi Setiawan)',
            'entity_contact' => 'Bank Mandiri 1370012345678 / WA 081234567890',
            'fraud_category_id' => $catOnlineShop->id,
            'description' => 'Saya memesan jaket seharga Rp 350.000 melalui toko tersebut. Setelah saya transfer ke rekening Bank Mandiri atas nama Andi Setiawan, nomor WhatsApp saya langsung diblokir dan resi pengiriman yang diberikan palsu.',
            'status' => 'approved',
        ]);
        $report1->platforms()->attach([$platInstagram->id, $platWhatsApp->id]);

        $report2 = Report::create([
            'user_id' => $user->id,
            'title' => 'Tautan Phishing Meniru Bank BCA',
            'entity_name' => 'klikbca-pembatalan-tarif.com',
            'entity_contact' => 'http://klikbca-pembatalan-tarif.com/login/auth.php',
            'fraud_category_id' => $catPhishing->id,
            'description' => 'Menerima SMS dari pengirim yang mengaku dari BCA tentang kenaikan tarif transaksi bulanan sebesar Rp 150.000. SMS menyertakan tautan untuk konfirmasi pembatalan tarif yang mengarah ke formulir login palsu untuk mencuri data OTP.',
            'status' => 'approved',
        ]);
        $report2->platforms()->attach([$platSMS->id, $platWebsite->id]);

        $report3 = Report::create([
            'user_id' => $user->id,
            'title' => 'Penawaran Investasi Robot Trading Bodong',
            'entity_name' => 'SmartFX Trading / PT Smart Kripto Indo',
            'entity_contact' => 'SmartFX App / CS WA 085566778899',
            'fraud_category_id' => $catInvestasi->id,
            'description' => 'Menjanjikan keuntungan tetap (fix return) 20% per bulan dengan jaminan modal aman. Setelah berjalan 3 bulan, website tidak bisa diakses dan uang modal tidak dapat ditarik kembali.',
            'status' => 'approved',
        ]);
        $report3->platforms()->attach([$platTelegram->id, $platWebsite->id]);

        // 9. Create Pending Reports (Waiting for moderation)
        $report4 = Report::create([
            'user_id' => $user->id,
            'title' => 'Scam Lowongan Kerja Paruh Waktu Komisi Like Video',
            'entity_name' => 'Maju Jaya Media (WA HRD)',
            'entity_contact' => 'WA 089911223344',
            'fraud_category_id' => $catLowongan->id,
            'description' => 'Dihubungi via WA ditawari kerja paruh waktu dengan menekan tombol like pada video YouTube. Awalnya dibayar Rp 10.000, lalu disuruh masuk ke grup Telegram dan diminta deposit modal bertahap dengan alasan tugas prabayar. Setelah deposit Rp 2.000.000, admin menghilang.',
            'status' => 'pending',
        ]);
        $report4->platforms()->attach([$platWhatsApp->id, $platTelegram->id]);

        $this->call(ArticleSeeder::class);
    }
}
