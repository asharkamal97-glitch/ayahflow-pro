import urllib.request
import zipfile
import os
import shutil
import time

target_dir = r"C:\Users\ashar\.jdks\jdk-21"
zip_path = r"C:\Users\ashar\.jdks\jdk-21.zip"
os.makedirs(r"C:\Users\ashar\.jdks", exist_ok=True)

url = "https://aka.ms/download-jdk/microsoft-jdk-21.0.6-windows-x64.zip"

if not os.path.exists(target_dir) or not os.path.exists(os.path.join(target_dir, "bin", "java.exe")):
    print("Downloading OpenJDK 21...")
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    start_time = time.time()
    
    with urllib.request.urlopen(req) as resp, open(zip_path, 'wb') as out_f:
        total = int(resp.headers.get('Content-Length', 0))
        downloaded = 0
        last_print = 0
        while True:
            chunk = resp.read(1024 * 1024)
            if not chunk:
                break
            out_f.write(chunk)
            downloaded += len(chunk)
            if downloaded - last_print > 15 * 1024 * 1024:
                last_print = downloaded
                pct = (downloaded / total * 100) if total else 0
                print(f"Downloaded {downloaded // (1024*1024)}MB / {total // (1024*1024)}MB ({pct:.1f}%)")
    
    print(f"Download completed in {time.time() - start_time:.1f}s. Extracting...")
    
    extract_temp = r"C:\Users\ashar\.jdks\temp_jdk21"
    os.makedirs(extract_temp, exist_ok=True)
    with zipfile.ZipFile(zip_path, 'r') as z:
        z.extractall(extract_temp)
    
    # Locate the inner root folder (e.g. jdk-21.0.6+7)
    inner_folders = [os.path.join(extract_temp, d) for d in os.listdir(extract_temp) if os.path.isdir(os.path.join(extract_temp, d))]
    source_root = inner_folders[0] if inner_folders else extract_temp
    
    if os.path.exists(target_dir):
        shutil.rmtree(target_dir, ignore_errors=True)
    shutil.move(source_root, target_dir)
    shutil.rmtree(extract_temp, ignore_errors=True)
    if os.path.exists(zip_path):
        os.remove(zip_path)
    
    print("Extraction completed.")

java_bin = os.path.join(target_dir, "bin", "java.exe")
print("Verified Java binary:", java_bin, "Exists:", os.path.exists(java_bin))
