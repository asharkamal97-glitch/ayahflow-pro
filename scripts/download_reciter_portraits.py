import urllib.request
import os
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

out_dir = r"c:\Users\ashar\Downloads\REA\quranify\public\images\reciters"
os.makedirs(out_dir, exist_ok=True)

reciters_map = {
    "yasser-al-dosari-sa": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Yasser_Al-Dosari_%28cropped%29.jpg/800px-Yasser_Al-Dosari_%28cropped%29.jpg",
        "https://www.assabile.com/media/portraits/161-200.webp"
    ],
    "mishary-alafasy-kw": [
        "https://upload.wikimedia.org/wikipedia/commons/2/24/%D0%9C%D0%B8%D1%88%D0%B0%D1%80%D0%B8_%D0%A0%D0%B0%D1%88%D0%B8%D0%B4.jpg",
        "https://www.assabile.com/media/portraits/1-200.webp"
    ],
    "abdul-basit-abdul-samad-eg": [
        "https://upload.wikimedia.org/wikipedia/commons/b/b9/Abdul_Basit_Abd_us-Samad_in_South_Africa_in_1966_%283%29_%28cropped%29.jpg",
        "https://www.assabile.com/media/portraits/2-200.webp"
    ],
    "mahmoud-khalil-al-husary-eg": [
        "https://upload.wikimedia.org/wikipedia/commons/7/70/Hussary.jpg",
        "https://www.assabile.com/media/portraits/6-200.webp"
    ],
    "muhammad-siddiq-al-minshawi-eg": [
        "https://upload.wikimedia.org/wikipedia/commons/e/ee/Elminshwey.jpg",
        "https://www.assabile.com/media/portraits/7-200.webp"
    ],
    "maher-al-muaiqly-sa": [
        "https://upload.wikimedia.org/wikipedia/commons/9/90/Maher_Al_Mueaqly.png",
        "https://www.assabile.com/media/portraits/9-200.webp"
    ],
    "abdur-rahman-as-sudais-sa": [
        "https://upload.wikimedia.org/wikipedia/commons/1/18/Abdul-Rahman_Al-Sudais_%28Cropped%2C_2011%29.jpg",
        "https://www.assabile.com/media/portraits/10-200.webp"
    ],
    "saud-al-shuraim-sa": [
        "https://upload.wikimedia.org/wikipedia/commons/1/1e/The_IMAM_of_Holy_Mosque_in_Makka_Al_Mukarramah%2C_Saudi_Arabia%2C_Sheikh_Dr._Saud_Bin_Ibrahem_Al_Shuraim_meeting_the_Vice_President%2C_Shri_Mohd._Hamid_Ansari%2C_in_New_Delhi_on_March_03%2C_2012_%28cropped%29.jpg",
        "https://www.assabile.com/media/portraits/11-200.webp"
    ],
    "saad-al-ghamdi-sa": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Saad_al_Ghamdi.jpg/800px-Saad_al_Ghamdi.jpg",
        "https://www.assabile.com/media/portraits/3-200.webp"
    ],
    "abu-bakr-al-shatri-sa": [
        "https://www.assabile.com/media/portraits/4-200.webp",
        "https://static.quran.com/reciters/4/abu-bakr-al-shatri.jpg"
    ],
    "nasser-al-qatami-sa": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/%D8%B5%D9%88%D8%B1%D8%A9_%D8%B4%D8%AE%D8%B5%D9%8A%D8%A9_%D8%A7%D9%84%D8%B4%D9%8A%D8%AE_%D9%86%D8%A7%D8%B5%D8%B1_%D8%A7%D9%84%D9%82%D8%B7%D8%A7%D9%85%D9%8A.jpg/800px-%D8%B5%D9%88%D8%B1%D8%A9_%D8%B4%D8%AE%D8%B5%D9%8A%D8%A9_%D8%A7%D9%84%D8%B4%D9%8A%D8%AE_%D9%86%D8%A7%D8%B5%D8%B1_%D8%A7%D9%84%D9%82%D8%B7%D8%A7%D9%85%D9%8A.jpg",
        "https://www.assabile.com/media/portraits/12-200.webp"
    ],
    "fares-abbad-ye": [
        "https://www.assabile.com/media/portraits/16-200.webp"
    ],
    "ayman-rushdi-suwaid-sy": [
        "https://www.assabile.com/media/portraits/88-200.webp"
    ],
    "mahmoud-ali-al-banna-eg": [
        "https://www.assabile.com/media/portraits/43-200.webp"
    ]
}

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
    'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
    'Referer': 'https://www.google.com/'
}

for rec_id, urls in reciters_map.items():
    dest_jpg = os.path.join(out_dir, f"{rec_id}.jpg")
    success = False
    for url in urls:
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, context=ctx, timeout=15) as resp:
                data = resp.read()
                if len(data) > 1000:
                    with open(dest_jpg, 'wb') as f:
                        f.write(data)
                    print(f"SUCCESS: {rec_id} ({len(data)} bytes) from {url[:45]}...")
                    success = True
                    break
        except Exception as e:
            print(f"Failed {url[:45]}: {e}")
    if not success:
        print(f"FAILED ALL URLS for {rec_id}")

print("Download complete. Files in directory:")
for f in os.listdir(out_dir):
    print(" -", f, os.path.getsize(os.path.join(out_dir, f)), "bytes")
