import os
import io
import pytesseract
from PIL import Image
from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
import google.generativeai as genai
from dotenv import load_dotenv
import socket
import ssl
import urllib.parse
import json
import re
from datetime import datetime
import urllib.request

# Load environment variables
load_dotenv()

# Tesseract Path Configuration for Windows
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

app = FastAPI(title="DectScam AI Service", version="1.0.0")

# Request Models
class TextScanRequest(BaseModel):
    text_content: str

class UrlScanRequest(BaseModel):
    url: str

class ChatRequest(BaseModel):
    user_message: str

class InvestmentScanRequest(BaseModel):
    promotional_text: str
    system_prompt: str

class TextAdvancedRequest(BaseModel):
    text_content: str
    system_prompt: str



# Endpoints
@app.post("/api/v1/detect/text")
async def detect_text(request: TextScanRequest):
    try:
        text_lower = request.text_content.lower()
        
        risk_score = 0.0
        keywords_detected = []
        
        # Word lists with risk weightings
        financial_keywords = ["rekening", "otp", "pin", "cvv", "password", "transfer", "atm"]
        urgency_keywords = ["segera", "blokir", "batas", "waktu", "denda", "ancaman", "penting"]
        reward_keywords = ["hadiah", "undian", "selamat", "menang", "klaim", "shopee", "bca", "rupiah"]
        
        for kw in financial_keywords:
            if kw in text_lower:
                risk_score += 30.0
                keywords_detected.append(kw)
                
        for kw in urgency_keywords:
            if kw in text_lower:
                risk_score += 30.0
                keywords_detected.append(kw)
                
        for kw in reward_keywords:
            if kw in text_lower:
                risk_score += 40.0
                keywords_detected.append(kw)
                
        if risk_score > 100.0:
            risk_score = 100.0
            
        # Determine risk level based on score intervals
        if risk_score >= 70.0:
            risk_level = "bahaya"
            recommendation = "Pesan ini terindikasi kuat sebagai penipuan rekayasa sosial/phishing. Jangan memberikan data pribadi Anda."
        elif risk_score >= 30.0:
            risk_level = "waspada"
            recommendation = "Pesan ini menunjukkan kecurigaan tingkat menengah. Harap verifikasi identitas pengirim secara manual."
        else:
            risk_level = "aman"
            recommendation = "Pesan tampak normal dan aman untuk dibaca."
            
        return {
            "status": "success",
            "data": {
                "scan_id": 101,
                "risk_level": risk_level,
                "risk_score": risk_score,
                "ai_analysis": {
                    "keywords_detected": keywords_detected,
                    "recommendation": recommendation
                }
            }
        }
        
    except Exception as e:
        return {
            "status": "error",
            "message": f"Terjadi kesalahan internal pada analisis teks AI: {str(e)}"
        }

def check_ssl_and_connection(url: str):
    try:
        parsed = urllib.parse.urlparse(url)
        hostname = parsed.netloc or parsed.path.split('/')[0]
        if ':' in hostname:
            hostname = hostname.split(':')[0]
            
        if not hostname:
            return "invalid", False
            
        try:
            socket.gethostbyname(hostname)
        except socket.gaierror:
            return "none", False
            
        context = ssl.create_default_context()
        try:
            with socket.create_connection((hostname, 443), timeout=3) as sock:
                with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                    ssock.getpeercert()
                    return "valid", True
        except ssl.SSLError:
            return "invalid", True
        except Exception:
            return "none", True
    except Exception:
        return "invalid", False

def get_base_domain(hostname: str) -> str:
    parts = hostname.split('.')
    if len(parts) <= 2:
        return hostname
    # Check for common double extensions/SLDs
    second_last = parts[-2]
    if len(second_last) <= 3 or second_last in ["com", "co", "or", "net", "ac", "go", "sch", "mil"]:
        return ".".join(parts[-3:])
    return ".".join(parts[-2:])

def get_domain_age_rdap(domain: str) -> int:
    try:
        domain = domain.lower().strip()
        url = f"https://rdap.org/domain/{domain}"
        req = urllib.request.Request(
            url, 
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        )
        with urllib.request.urlopen(req, timeout=3) as response:
            data = json.loads(response.read().decode())
            events = data.get("events", [])
            for event in events:
                if event.get("eventAction") in ["registration", "creation"]:
                    event_date_str = event.get("eventDate")
                    clean_date = event_date_str.replace('Z', '').split('.')[0]
                    created_date = datetime.fromisoformat(clean_date[:19])
                    age_days = (datetime.utcnow() - created_date).days
                    return max(0, age_days)
    except Exception as e:
        print(f"RDAP lookup failed for {domain}: {str(e)}")
    return None

def is_local_host(hostname: str) -> bool:
    if not hostname:
        return False
    hostname = hostname.lower().strip()
    if hostname in ["localhost", "127.0.0.1", "::1"]:
        return True
    # Match private IPv4 address ranges (10.x.x.x, 172.16.x.x-172.31.x.x, 192.168.x.x)
    private_ip_pattern = re.compile(
        r'^(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3})|(?:172\.(?:1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})|(?:192\.168\.\d{1,3}\.\d{1,3})$'
    )
    if private_ip_pattern.match(hostname):
        return True
    return False

@app.post("/api/v1/detect/url")
async def detect_url(request: UrlScanRequest):
    try:
        url_lower = request.url.lower()
        
        # Extract hostname and base domain for RDAP lookup
        parsed = urllib.parse.urlparse(request.url)
        hostname = parsed.netloc or parsed.path.split('/')[0]
        if ':' in hostname:
            hostname = hostname.split(':')[0]
            
        is_local = is_local_host(hostname)
        
        if is_local:
            ssl_status = "none"
            domain_resolves = True
            rdap_age = 0
        else:
            ssl_status, domain_resolves = check_ssl_and_connection(request.url)
            
        if hostname and domain_resolves and not is_local:
            base_domain = get_base_domain(hostname)
            rdap_age = get_domain_age_rdap(base_domain)
        elif is_local:
            rdap_age = 0
        else:
            rdap_age = None
            
        # Default initialization
        risk_score = 10.0
        risk_level = "aman"
        domain_age_days = rdap_age if rdap_age is not None else 1250
        blacklist_match = False
        recommendation = "Tautan tampak aman. Tetap periksa ulang sertifikat SSL dan domain sebelum memasukkan kredensial."
        
        # Load environment variables dynamically to check for API Key
        load_dotenv(override=True)
        api_key = os.getenv("GEMINI_API_KEY")
        
        if api_key and api_key.strip() != "":
            try:
                genai.configure(api_key=api_key)
                model = genai.GenerativeModel('gemini-2.5-flash-lite')
                
                prompt = (
                    f"Analyze the safety of the following URL/domain: '{request.url}'.\n"
                    f"Context:\n"
                    f"- SSL Status: {ssl_status}\n"
                    f"- Domain Resolves: {'Yes' if domain_resolves else 'No'}\n"
                    f"- Real Domain Age (Days): {rdap_age if rdap_age is not None else 'Unknown'}\n\n"
                    f"Is this URL a phishing scam, typo-squatting, malware, or safe?\n"
                    f"Reply with ONLY a valid raw JSON object matching this structure (no markdown formatting, no codeblocks):\n"
                    f"{{\n"
                    f"  \"risk_score\": <integer between 0 and 100>,\n"
                    f"  \"risk_level\": \"<aman|waspada|bahaya>\",\n"
                    f"  \"domain_age_days\": <integer or null if unknown>,\n"
                    f"  \"blacklist_match\": <true|false>,\n"
                    f"  \"recommendation\": \"<short recommendation in Indonesian>\"\n"
                    f"}}"
                )
                response = model.generate_content(prompt)
                res_text = response.text.strip()
                if res_text.startswith("```"):
                    lines = res_text.splitlines()
                    if lines[0].startswith("```"):
                        lines = lines[1:]
                    if lines and lines[-1].startswith("```"):
                        lines = lines[:-1]
                    res_text = "\n".join(lines).strip()
                
                analysis = json.loads(res_text)
                risk_score = float(analysis.get("risk_score", 10.0))
                risk_level = analysis.get("risk_level", "aman")
                
                # Overwrite/set domain age days
                gemini_age = analysis.get("domain_age_days")
                if rdap_age is not None:
                    domain_age_days = rdap_age
                elif gemini_age is not None:
                    domain_age_days = gemini_age
                else:
                    domain_age_days = 1250 if risk_level == "aman" else 5
                    
                blacklist_match = bool(analysis.get("blacklist_match", False))
                recommendation = analysis.get("recommendation", recommendation)
            except Exception as gemini_err:
                print(f"Gemini URL Analysis failed, falling back to heuristics: {str(gemini_err)}")
                api_key = None # trigger fallback below
                
        if not api_key or api_key.strip() == "":
            is_suspicious = any(x in url_lower for x in ["login", "verify", "secure", "bank", "update", "klikbca", "shopee", "giveaway", "hadiah"])
            if not domain_resolves:
                risk_score = 99.0
                risk_level = "bahaya"
                recommendation = "Domain tidak dapat diselesaikan secara DNS. Situs kemungkinan besar tidak aktif atau palsu."
                domain_age_days = 0
                blacklist_match = True
            elif ssl_status == "invalid" or ssl_status == "none":
                risk_score = 80.0
                risk_level = "bahaya"
                recommendation = "Sertifikat SSL tidak valid atau tidak didukung. Sangat berbahaya untuk memasukkan informasi sensitif."
                domain_age_days = rdap_age if rdap_age is not None else 15
                blacklist_match = is_suspicious
            elif is_suspicious:
                risk_score = 90.0
                risk_level = "bahaya"
                recommendation = "Tautan ini terdeteksi mencurigakan karena menggunakan kata kunci phishing di dalam URL."
                domain_age_days = rdap_age if rdap_age is not None else 5
                blacklist_match = True
            else:
                risk_score = 10.0
                risk_level = "aman"
                recommendation = "Tautan tampak aman berdasarkan analisis awal. Tetap waspada sebelum memasukkan kredensial."
                domain_age_days = rdap_age if rdap_age is not None else 1250
                blacklist_match = False
                
        return {
            "status": "success",
            "data": {
                "scan_id": 102,
                "risk_level": risk_level,
                "risk_score": risk_score,
                "ai_analysis": {
                    "domain_age_days": domain_age_days,
                    "ssl_status": ssl_status,
                    "blacklist_match": blacklist_match,
                    "recommendation": recommendation
                }
            }
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Terjadi kesalahan internal pada analisis URL AI: {str(e)}"
        }

@app.post("/api/v1/detect/image")
async def detect_image(file: UploadFile = File(...)):
    try:
        # Read file contents
        contents = await file.read()
        
        # Load image via PIL from byte stream
        try:
            image = Image.open(io.BytesIO(contents))
        except Exception as img_err:
            raise ValueError(f"File yang diunggah bukan format gambar yang valid: {str(img_err)}")
            
        # Check if tesseract binary exists
        if not os.path.exists(pytesseract.pytesseract.tesseract_cmd):
            raise FileNotFoundError(f"Tesseract tidak ditemukan di path: {pytesseract.pytesseract.tesseract_cmd}")
        
        # Run Tesseract OCR (without lang parameter as requested)
        extracted_text = pytesseract.image_to_string(image)
        
        # Clean text
        extracted_text_clean = extracted_text.strip()
        text_lower = extracted_text_clean.lower()
        
        # High-risk keyword check (updated list based on request)
        keywords = ['undian', 'hadiah', 'pemenang', 'pin', 'simcard', 'polri', 'tersangka', 'penipuan', 'transfer', 'otp']
        keywords_detected = []
        risk_score = 0.0
        for kw in keywords:
            if kw in text_lower:
                risk_score += 15.0
                keywords_detected.append(kw)
        
        if risk_score > 100.0:
            risk_score = 100.0
            
        # Determine risk level
        if risk_score >= 70.0:
            risk_level = "bahaya"
            recommendation = "Gambar/Struk menunjukkan indikasi manipulasi digital atau penipuan aktif. Verifikasi mutasi rekening Anda secara manual."
        elif risk_score >= 30.0:
            risk_level = "waspada"
            recommendation = "Ditemukan beberapa kata kunci berisiko tinggi. Harap periksa keaslian struk/gambar secara teliti."
        else:
            risk_level = "aman"
            recommendation = "Tidak terdeteksi anomali kata kunci berbahaya pada gambar."
            
        return {
            "status": "success",
            "data": {
                "scan_id": 103,
                "risk_level": risk_level,
                "risk_score": risk_score,
                "extracted_text": extracted_text_clean if extracted_text_clean else "(Teks tidak terdeteksi pada gambar)",
                "ai_analysis": {
                    "manipulation_detected": risk_score >= 30.0,
                    "anomaly_area": "Kepadatan kata kunci mencurigakan tinggi." if risk_score >= 30.0 else "Tidak ditemukan anomali teks.",
                    "recommendation": recommendation
                }
            }
        }
        
    except Exception as e:
        print(f"OCR ERROR: {str(e)}")  # Print error to terminal
        return {
            "status": "error",
            "extracted_text": "",
            "risk_score": 0,
            "risk_level": "aman",
            "ai_analysis": {
                "manipulation_detected": False,
                "recommendation": f"Sistem OCR gagal: {str(e)}"
            },
            # Include nested data key for compatibility with Laravel json parser
            "data": {
                "extracted_text": "",
                "risk_score": 0,
                "risk_level": "aman",
                "ai_analysis": {
                    "manipulation_detected": False,
                    "recommendation": f"Sistem OCR gagal: {str(e)}"
                }
            }
        }

@app.post("/api/v1/chat")
async def chat_assistant(request: ChatRequest):
    try:
        # Reload environment variables dynamically to pick up edits in .env instantly
        load_dotenv(override=True)

        user_msg = request.user_message.strip()
        if not user_msg:
            return {
                "status": "success",
                "bot_reply": "Halo! Ada yang bisa saya bantu hari ini terkait keamanan digital Anda?"
            }

        # Check if API Key is set
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key or api_key.strip() == "":
            return {
                "status": "success",
                "bot_reply": (
                    "Halo! Saya **DectScam AI Security Assistant** 🛡️.\n\n"
                    "⚠️ **Pemberitahuan**: Sistem AI pintar (Gemini LLM) belum selesai dikonfigurasi oleh tim pengembang (API Key kosong).\n\n"
                    "Silakan tempelkan API Key Gemini asli Anda ke file `.env` di dalam folder `ai-service` (`GEMINI_API_KEY=AIzaSy...`) untuk mengaktifkan asisten cerdas ini.\n\n"
                    "Untuk sementara, jika Anda mengalami penipuan keuangan: segera hubungi bank/e-wallet tujuan untuk memblokir dana, kumpulkan screenshot bukti percakapan/transfer, lalu buat laporan resmi ke pihak berwajib."
                )
            }

        # Dynamically configure API key
        genai.configure(api_key=api_key)

        # Initialize the gemini-2.5-flash-lite model
        model = genai.GenerativeModel('gemini-2.5-flash-lite')

        # Define cybersecurity assistant persona and system instructions
        context = (
            "Anda adalah DectScam AI, asisten keamanan siber yang ramah, profesional, dan empatik. "
            "Tugas Anda adalah membantu pengguna mengidentifikasi indikasi penipuan (scam/phishing), memberikan panduan keamanan siber tingkat dasar, "
            "langkah penyelamatan data setelah menjadi korban penipuan, dan panduan penggunaan fitur aplikasi DectScam AI. "
            "Gunakan bahasa Indonesia yang natural, mudah dipahami masyarakat awam, dan berikan langkah mitigasi terstruktur (gunakan bullet/numbering yang rapi jika menjelaskan langkah)."
        )

        prompt = f"{context}\n\nUser Message: {user_msg}"

        # Generate content
        response = model.generate_content(prompt)
        reply = response.text.strip()

        return {
            "status": "success",
            "bot_reply": reply
        }
    except Exception as e:
        print(f"GEMINI CHATBOT ERROR: {str(e)}")
        from fastapi.responses import JSONResponse
        error_msg = str(e)
        if "429" in error_msg or "quota" in error_msg.lower():
            error_msg = "Kuota API Gemini Anda telah habis (429 Exceeded Quota). Silakan perbarui GEMINI_API_KEY di file ai-service/.env dengan API key yang baru."
        return JSONResponse(
            status_code=500,
            content={
                "status": "error",
                "message": f"Kesalahan AI Service: {error_msg}"
            }
        )

@app.post("/api/v1/detect/investment")
async def detect_investment(request: InvestmentScanRequest):
    try:
        # Reload environment variables dynamically to check for API Key
        load_dotenv(override=True)
        api_key = os.getenv("GEMINI_API_KEY")
        
        # Default fallback metrics
        risk_score = 0.0
        risk_level = "aman"
        ai_analysis_details = {
            "fundamental_flaws": "Tidak terdeteksi kejanggalan fundamental.",
            "psychological_tactics": "Tidak terdeteksi taktik FOMO/manipulasi psikologis."
        }

        if api_key and api_key.strip() != "":
            try:
                genai.configure(api_key=api_key)
                model = genai.GenerativeModel('gemini-2.5-flash-lite')
                
                # Combine system prompt and promotional text
                prompt = (
                    f"{request.system_prompt}\n\n"
                    f"Teks promosi yang harus dianalisis:\n"
                    f"\"\"\"\n{request.promotional_text}\n\"\"\"\n\n"
                    f"Reply with ONLY a valid raw JSON object matching this structure (no markdown formatting, no codeblocks):\n"
                    f"{{\n"
                    f"  \"risk_score\": <integer between 0 and 100>,\n"
                    f"  \"risk_level\": \"<aman|waspada|bahaya>\",\n"
                    f"  \"ai_analysis_details\": {{\n"
                    f"    \"fundamental_flaws\": \"<rincian kecacatan fundamental dalam bahasa Indonesia>\",\n"
                    f"    \"psychological_tactics\": \"<rincian taktik psikologis dalam bahasa Indonesia>\"\n"
                    f"  }}\n"
                    f"}}"
                )
                
                response = model.generate_content(prompt)
                res_text = response.text.strip()
                if res_text.startswith("```"):
                    lines = res_text.splitlines()
                    if lines[0].startswith("```"):
                        lines = lines[1:]
                    if lines and lines[-1].startswith("```"):
                        lines = lines[:-1]
                    res_text = "\n".join(lines).strip()
                
                analysis = json.loads(res_text)
                risk_score = float(analysis.get("risk_score", 0.0))
                risk_level = analysis.get("risk_level", "aman")
                ai_analysis_details = analysis.get("ai_analysis_details", ai_analysis_details)
                
            except Exception as gemini_err:
                print(f"Gemini Investment Analysis failed, falling back to heuristics: {str(gemini_err)}")
                api_key = None # trigger fallback below
                
        if not api_key or api_key.strip() == "":
            # Heuristic detection fallback
            text_lower = request.promotional_text.lower()
            risk_score = 10.0
            flaws = []
            tactics = []
            
            # Heuristic rules
            # Guaranteed high returns / daily/monthly fix return
            if any(w in text_lower for w in ["garansi", "pasti profit", "fix return", "return pasti", "keuntungan pasti", "pasif income", "profit harian", "profit bulanan", "1% per hari", "2% per hari", "5% per hari", "10% per hari", "15% per hari", "bagi hasil pasti"]):
                risk_score += 45.0
                flaws.append("Menjanjikan keuntungan tetap/pasti (fix return) yang tidak masuk akal secara finansial untuk pasar keuangan riil.")
            
            # Saham / robot trading bodong
            if any(w in text_lower for w in ["robot trading", "trading bot", "ea trading", "autotrade", "auto trade"]):
                risk_score += 25.0
                flaws.append("Menawarkan sistem otomatis robot trading/trading bot yang seringkali merupakan skema Ponzi berselubung.")
                
            if any(w in text_lower for w in ["deposit", "depo", "transfer pribadi", "rekening pribadi", "titip modal", "titip dana"]):
                risk_score += 20.0
                flaws.append("Meminta transfer dana ke rekening pribadi atau platform tidak berizin di luar sekuritas resmi.")
            
            # FOMO / Psychological
            if any(w in text_lower for w in ["slot terbatas", "kuota terbatas", "hanya hari ini", "sebelum ditutup", "buruan", "siapa cepat", "jangan lewatkan"]):
                risk_score += 20.0
                tactics.append("Menggunakan taktik kelangkaan (scarcity) dan urgensi palsu untuk memicu FOMO (Fear of Missing Out) agar korban segera memutuskan tanpa riset.")
            
            if any(w in text_lower for w in ["kaya mendadak", "cepat kaya", "anti rugi", "bebas finansial", "pasti kaya"]):
                risk_score += 15.0
                tactics.append("Menggunakan janji kekayaan instan untuk mengaburkan akal sehat calon investor.")

            if risk_score > 100.0:
                risk_score = 100.0
                
            if risk_score >= 70.0:
                risk_level = "bahaya"
            elif risk_score >= 30.0:
                risk_level = "waspada"
            else:
                risk_level = "aman"
                
            ai_analysis_details = {
                "fundamental_flaws": " \n".join(flaws) if flaws else "Tidak terdeteksi kejanggalan fundamental yang signifikan.",
                "psychological_tactics": " \n".join(tactics) if tactics else "Tidak terdeteksi taktik FOMO/urgensi palsu yang kuat."
            }

        return {
            "status": "success",
            "data": {
                "risk_level": risk_level,
                "risk_score": risk_score,
                "ai_analysis_details": ai_analysis_details
            }
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Terjadi kesalahan internal pada analisis investasi: {str(e)}"
        }

@app.post("/api/v1/detect/text-advanced")
async def detect_text_advanced(request: TextAdvancedRequest):
    try:
        load_dotenv(override=True)
        api_key = os.getenv("GEMINI_API_KEY")
        
        # Default fallback
        risk_score = 0.0
        risk_level = "aman"
        analysis = "Tidak terdeteksi kejanggalan pada teks."
        manipulative_keywords = []

        # Heuristics for fallback and forced rules
        text_lower = request.text_content.lower()
        force_danger = False
        
        # Malware/APK Rule: .apk, .pdf palsu, or unofficial link typosquatting
        if ".apk" in text_lower or ".apk " in text_lower or "/download.apk" in text_lower or ".pdf.apk" in text_lower:
            force_danger = True
            
        if force_danger:
            risk_score = 95.0
            risk_level = "bahaya"
            analysis = "Teks ini terdeteksi sangat berbahaya karena memuat tautan atau ajakan mengunduh berkas aplikasi (.APK) yang berpotensi menjadi malware/trojan untuk mencuri data OTP dan SMS Anda."
            manipulative_keywords = ["apk", "download", "aplikasi", "resi", "unduh"]

        if api_key and api_key.strip() != "":
            try:
                genai.configure(api_key=api_key)
                model = genai.GenerativeModel('gemini-2.5-flash-lite')
                
                prompt = (
                    f"{request.system_prompt}\n\n"
                    f"Teks pesan yang harus dianalisis:\n"
                    f"\"\"\"\n{request.text_content}\n\"\"\"\n\n"
                    f"Reply with ONLY a valid raw JSON object matching this structure (no markdown formatting, no codeblocks):\n"
                    f"{{\n"
                    f"  \"risk_score\": <integer between 0 and 100>,\n"
                    f"  \"risk_level\": \"<aman|waspada|bahaya>\",\n"
                    f"  \"analysis\": \"<penjelasan mengapa ini penipuan dalam bahasa Indonesia>\",\n"
                    f"  \"manipulative_keywords\": [<array of string keywords detected>]\n"
                    f"}}"
                )
                
                generation_config = genai.types.GenerationConfig(
                    temperature=0.1,
                )
                
                response = model.generate_content(prompt, generation_config=generation_config)
                res_text = response.text.strip()
                if res_text.startswith("```"):
                    lines = res_text.splitlines()
                    if lines[0].startswith("```"):
                        lines = lines[1:]
                    if lines and lines[-1].startswith("```"):
                        lines = lines[:-1]
                    res_text = "\n".join(lines).strip()
                
                parsed_json = json.loads(res_text)
                
                # If Gemini analyzed and it has APK but Gemini returned low risk, we override it as per the absolute rules!
                risk_score_parsed = float(parsed_json.get("risk_score", 0.0))
                risk_level_parsed = parsed_json.get("risk_level", "aman")
                analysis_parsed = parsed_json.get("analysis", "")
                keywords_parsed = parsed_json.get("manipulative_keywords", [])
                
                if force_danger:
                    risk_score = 95.0
                    risk_level = "bahaya"
                    analysis = "Teks ini terdeteksi sangat berbahaya karena memuat tautan atau ajakan mengunduh berkas aplikasi (.APK) yang berpotensi menjadi malware/trojan untuk mencuri data OTP dan SMS Anda. " + analysis_parsed
                    manipulative_keywords = list(set(manipulative_keywords + keywords_parsed))
                else:
                    risk_score = risk_score_parsed
                    risk_level = risk_level_parsed
                    analysis = analysis_parsed
                    manipulative_keywords = keywords_parsed
                    
            except Exception as gemini_err:
                print(f"Gemini Advanced Text Analysis failed: {str(gemini_err)}")
                # If Gemini fails, fall back to our heuristics (e.g. if force_danger, it's already set)
                if not force_danger:
                    # Let's perform general simple heuristics
                    is_suspicious_text = any(x in text_lower for x in ["paket", "retur", "kurir", "resi", "rekening", "blokir", "tagihan", "tilang", "pln", "j&t", "jnt", "polisi", "kepolisian", "bank"])
                    if is_suspicious_text:
                        risk_score = 75.0
                        risk_level = "bahaya"
                        analysis = "Teks terindikasi mencurigakan karena memuat unsur rekayasa sosial (ancaman/desakan waktu/mengaku instansi resmi)."
                        manipulative_keywords = [w for w in ["paket", "retur", "kurir", "resi", "rekening", "blokir", "tagihan", "tilang", "pln", "jnt", "polisi", "bank"] if w in text_lower]
        else:
            # Fallback when no API Key is present
            if not force_danger:
                is_suspicious_text = any(x in text_lower for x in ["paket", "retur", "kurir", "resi", "rekening", "blokir", "tagihan", "tilang", "pln", "j&t", "jnt", "polisi", "kepolisian", "bank"])
                if is_suspicious_text:
                    risk_score = 75.0
                    risk_level = "bahaya"
                    analysis = "Teks terindikasi mencurigakan karena memuat unsur rekayasa sosial (ancaman/desakan waktu/mengaku instansi resmi seperti J&T, PLN, Bank, atau Kepolisian)."
                    manipulative_keywords = [w for w in ["paket", "retur", "kurir", "resi", "rekening", "blokir", "tagihan", "tilang", "pln", "jnt", "polisi", "bank"] if w in text_lower]

        return {
            "status": "success",
            "data": {
                "risk_level": risk_level,
                "risk_score": risk_score,
                "analysis": analysis,
                "manipulative_keywords": manipulative_keywords
            }
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Terjadi kesalahan internal pada analisis teks lanjut: {str(e)}"
        }

