import { Surah, Reciter, Collection, AmbientSound, Tafsir } from '@/types/quran';

export const SURAHS: Surah[] = [
  { number: 1, name: "الفاتحة", englishName: "Al-Fatihah", englishNameTranslation: "The Opening", numberOfAyahs: 7, revelationType: "Meccan" },
  { number: 2, name: "البقرة", englishName: "Al-Baqarah", englishNameTranslation: "The Cow", numberOfAyahs: 286, revelationType: "Medinan" },
  { number: 3, name: "آل عمران", englishName: "Ali 'Imran", englishNameTranslation: "Family of Imran", numberOfAyahs: 200, revelationType: "Medinan" },
  { number: 4, name: "النساء", englishName: "An-Nisa", englishNameTranslation: "The Women", numberOfAyahs: 176, revelationType: "Medinan" },
  { number: 5, name: "المائدة", englishName: "Al-Ma'idah", englishNameTranslation: "The Table Spread", numberOfAyahs: 120, revelationType: "Medinan" },
  { number: 6, name: "الأنعام", englishName: "Al-An'am", englishNameTranslation: "The Cattle", numberOfAyahs: 165, revelationType: "Meccan" },
  { number: 7, name: "الأعراف", englishName: "Al-A'raf", englishNameTranslation: "The Heights", numberOfAyahs: 206, revelationType: "Meccan" },
  { number: 8, name: "الأنفال", englishName: "Al-Anfal", englishNameTranslation: "The Spoils of War", numberOfAyahs: 75, revelationType: "Medinan" },
  { number: 9, name: "التوبة", englishName: "At-Tawbah", englishNameTranslation: "The Repentance", numberOfAyahs: 129, revelationType: "Medinan" },
  { number: 10, name: "يونس", englishName: "Yunus", englishNameTranslation: "Jonah", numberOfAyahs: 109, revelationType: "Meccan" },
  { number: 11, name: "هود", englishName: "Hud", englishNameTranslation: "Hud", numberOfAyahs: 123, revelationType: "Meccan" },
  { number: 12, name: "يوسف", englishName: "Yusuf", englishNameTranslation: "Joseph", numberOfAyahs: 111, revelationType: "Meccan" },
  { number: 13, name: "الرعد", englishName: "Ar-Ra'd", englishNameTranslation: "The Thunder", numberOfAyahs: 43, revelationType: "Medinan" },
  { number: 14, name: "ابراهيم", englishName: "Ibrahim", englishNameTranslation: "Abraham", numberOfAyahs: 52, revelationType: "Meccan" },
  { number: 15, name: "الحجر", englishName: "Al-Hijr", englishNameTranslation: "The Rocky Tract", numberOfAyahs: 99, revelationType: "Meccan" },
  { number: 16, name: "النحل", englishName: "An-Nahl", englishNameTranslation: "The Bee", numberOfAyahs: 128, revelationType: "Meccan" },
  { number: 17, name: "الإسراء", englishName: "Al-Isra", englishNameTranslation: "The Night Journey", numberOfAyahs: 111, revelationType: "Meccan" },
  { number: 18, name: "الكهف", englishName: "Al-Kahf", englishNameTranslation: "The Cave", numberOfAyahs: 110, revelationType: "Meccan" },
  { number: 19, name: "مريم", englishName: "Maryam", englishNameTranslation: "Mary", numberOfAyahs: 98, revelationType: "Meccan" },
  { number: 20, name: "طه", englishName: "Taha", englishNameTranslation: "Ta-Ha", numberOfAyahs: 135, revelationType: "Meccan" },
  { number: 21, name: "الأنبياء", englishName: "Al-Anbiya", englishNameTranslation: "The Prophets", numberOfAyahs: 112, revelationType: "Meccan" },
  { number: 22, name: "الحج", englishName: "Al-Hajj", englishNameTranslation: "The Pilgrimage", numberOfAyahs: 78, revelationType: "Medinan" },
  { number: 23, name: "المؤمنون", englishName: "Al-Mu'minun", englishNameTranslation: "The Believers", numberOfAyahs: 118, revelationType: "Meccan" },
  { number: 24, name: "النور", englishName: "An-Nur", englishNameTranslation: "The Light", numberOfAyahs: 64, revelationType: "Medinan" },
  { number: 25, name: "الفرقان", englishName: "Al-Furqan", englishNameTranslation: "The Criterion", numberOfAyahs: 77, revelationType: "Meccan" },
  { number: 26, name: "الشعراء", englishName: "Ash-Shu'ara", englishNameTranslation: "The Poets", numberOfAyahs: 227, revelationType: "Meccan" },
  { number: 27, name: "النمل", englishName: "An-Naml", englishNameTranslation: "The Ant", numberOfAyahs: 93, revelationType: "Meccan" },
  { number: 28, name: "القصص", englishName: "Al-Qasas", englishNameTranslation: "The Stories", numberOfAyahs: 88, revelationType: "Meccan" },
  { number: 29, name: "العنكبوت", englishName: "Al-'Ankabut", englishNameTranslation: "The Spider", numberOfAyahs: 69, revelationType: "Meccan" },
  { number: 30, name: "الروم", englishName: "Ar-Rum", englishNameTranslation: "The Romans", numberOfAyahs: 60, revelationType: "Meccan" },
  { number: 31, name: "لقمان", englishName: "Luqman", englishNameTranslation: "Luqman", numberOfAyahs: 34, revelationType: "Meccan" },
  { number: 32, name: "السجدة", englishName: "As-Sajdah", englishNameTranslation: "The Prostration", numberOfAyahs: 30, revelationType: "Meccan" },
  { number: 33, name: "الأحزاب", englishName: "Al-Ahzab", englishNameTranslation: "The Combined Forces", numberOfAyahs: 73, revelationType: "Medinan" },
  { number: 34, name: "سبإ", englishName: "Saba", englishNameTranslation: "Sheba", numberOfAyahs: 54, revelationType: "Meccan" },
  { number: 35, name: "فاطر", englishName: "Fatir", englishNameTranslation: "Originator", numberOfAyahs: 45, revelationType: "Meccan" },
  { number: 36, name: "يس", englishName: "Ya-Sin", englishNameTranslation: "Ya Sin", numberOfAyahs: 83, revelationType: "Meccan" },
  { number: 37, name: "الصافات", englishName: "As-Saffat", englishNameTranslation: "Those Who Set The Ranks", numberOfAyahs: 182, revelationType: "Meccan" },
  { number: 38, name: "ص", englishName: "Sad", englishNameTranslation: "The Letter Saad", numberOfAyahs: 88, revelationType: "Meccan" },
  { number: 39, name: "الزمر", englishName: "Az-Zumar", englishNameTranslation: "The Troops", numberOfAyahs: 75, revelationType: "Meccan" },
  { number: 40, name: "غافر", englishName: "Ghafir", englishNameTranslation: "The Forgiver", numberOfAyahs: 85, revelationType: "Meccan" },
  { number: 41, name: "فصلت", englishName: "Fussilat", englishNameTranslation: "Explained in Detail", numberOfAyahs: 54, revelationType: "Meccan" },
  { number: 42, name: "الشورى", englishName: "Ash-Shura", englishNameTranslation: "The Consultation", numberOfAyahs: 53, revelationType: "Meccan" },
  { number: 43, name: "الزخرف", englishName: "Az-Zukhruf", englishNameTranslation: "The Ornaments of Gold", numberOfAyahs: 89, revelationType: "Meccan" },
  { number: 44, name: "الدخان", englishName: "Ad-Dukhan", englishNameTranslation: "The Smoke", numberOfAyahs: 59, revelationType: "Meccan" },
  { number: 45, name: "الجاثية", englishName: "Al-Jathiyah", englishNameTranslation: "The Crouching", numberOfAyahs: 37, revelationType: "Meccan" },
  { number: 46, name: "الأحقاف", englishName: "Al-Ahqaf", englishNameTranslation: "The Wind-Curved Sandhills", numberOfAyahs: 35, revelationType: "Meccan" },
  { number: 47, name: "محمد", englishName: "Muhammad", englishNameTranslation: "Muhammad", numberOfAyahs: 38, revelationType: "Medinan" },
  { number: 48, name: "الفتح", englishName: "Al-Fath", englishNameTranslation: "The Victory", numberOfAyahs: 29, revelationType: "Medinan" },
  { number: 49, name: "الحجرات", englishName: "Al-Hujurat", englishNameTranslation: "The Rooms", numberOfAyahs: 18, revelationType: "Medinan" },
  { number: 50, name: "ق", englishName: "Qaf", englishNameTranslation: "The Letter Qaf", numberOfAyahs: 45, revelationType: "Meccan" },
  { number: 51, name: "الذاريات", englishName: "Adh-Dhariyat", englishNameTranslation: "The Winnowing Winds", numberOfAyahs: 60, revelationType: "Meccan" },
  { number: 52, name: "الطور", englishName: "At-Tur", englishNameTranslation: "The Mount", numberOfAyahs: 49, revelationType: "Meccan" },
  { number: 53, name: "النجم", englishName: "An-Najm", englishNameTranslation: "The Star", numberOfAyahs: 62, revelationType: "Meccan" },
  { number: 54, name: "القمر", englishName: "Al-Qamar", englishNameTranslation: "The Moon", numberOfAyahs: 55, revelationType: "Meccan" },
  { number: 55, name: "الرحمن", englishName: "Ar-Rahman", englishNameTranslation: "The Beneficent", numberOfAyahs: 78, revelationType: "Medinan" },
  { number: 56, name: "الواقعة", englishName: "Al-Waqi'ah", englishNameTranslation: "The Inevitable", numberOfAyahs: 96, revelationType: "Meccan" },
  { number: 57, name: "الحديد", englishName: "Al-Hadid", englishNameTranslation: "The Iron", numberOfAyahs: 29, revelationType: "Medinan" },
  { number: 58, name: "المجادلة", englishName: "Al-Mujadila", englishNameTranslation: "The Pleading Woman", numberOfAyahs: 22, revelationType: "Medinan" },
  { number: 59, name: "الحشر", englishName: "Al-Hashr", englishNameTranslation: "The Exile", numberOfAyahs: 24, revelationType: "Medinan" },
  { number: 60, name: "الممتحنة", englishName: "Al-Mumtahanah", englishNameTranslation: "She that is to be examined", numberOfAyahs: 13, revelationType: "Medinan" },
  { number: 61, name: "الصف", englishName: "As-Saff", englishNameTranslation: "The Ranks", numberOfAyahs: 14, revelationType: "Medinan" },
  { number: 62, name: "الجمعة", englishName: "Al-Jumu'ah", englishNameTranslation: "The Congregation", numberOfAyahs: 11, revelationType: "Medinan" },
  { number: 63, name: "المنافقون", englishName: "Al-Munafiqun", englishNameTranslation: "The Hypocrites", numberOfAyahs: 11, revelationType: "Medinan" },
  { number: 64, name: "التغابن", englishName: "At-Taghabun", englishNameTranslation: "The Mutual Disillusion", numberOfAyahs: 18, revelationType: "Medinan" },
  { number: 65, name: "الطلاق", englishName: "At-Talaq", englishNameTranslation: "The Divorce", numberOfAyahs: 12, revelationType: "Medinan" },
  { number: 66, name: "التحريم", englishName: "At-Tahrim", englishNameTranslation: "The Prohibition", numberOfAyahs: 12, revelationType: "Medinan" },
  { number: 67, name: "الملك", englishName: "Al-Mulk", englishNameTranslation: "The Sovereignty", numberOfAyahs: 30, revelationType: "Meccan" },
  { number: 68, name: "القلم", englishName: "Al-Qalam", englishNameTranslation: "The Pen", numberOfAyahs: 52, revelationType: "Meccan" },
  { number: 69, name: "الحاقة", englishName: "Al-Haqqah", englishNameTranslation: "The Reality", numberOfAyahs: 52, revelationType: "Meccan" },
  { number: 70, name: "المعارج", englishName: "Al-Ma'arij", englishNameTranslation: "The Ascending Stairways", numberOfAyahs: 44, revelationType: "Meccan" },
  { number: 71, name: "نوح", englishName: "Nuh", englishNameTranslation: "Noah", numberOfAyahs: 28, revelationType: "Meccan" },
  { number: 72, name: "الجن", englishName: "Al-Jinn", englishNameTranslation: "The Jinn", numberOfAyahs: 28, revelationType: "Meccan" },
  { number: 73, name: "المزمل", englishName: "Al-Muzzammil", englishNameTranslation: "The Enshrouded One", numberOfAyahs: 20, revelationType: "Meccan" },
  { number: 74, name: "المدثر", englishName: "Al-Muddaththir", englishNameTranslation: "The Cloaked One", numberOfAyahs: 56, revelationType: "Meccan" },
  { number: 75, name: "القيامة", englishName: "Al-Qiyamah", englishNameTranslation: "The Resurrection", numberOfAyahs: 40, revelationType: "Meccan" },
  { number: 76, name: "الانسان", englishName: "Al-Insan", englishNameTranslation: "Man", numberOfAyahs: 31, revelationType: "Medinan" },
  { number: 77, name: "المرسلات", englishName: "Al-Mursalat", englishNameTranslation: "The Emissaries", numberOfAyahs: 50, revelationType: "Meccan" },
  { number: 78, name: "النبإ", englishName: "An-Naba", englishNameTranslation: "The Tidings", numberOfAyahs: 40, revelationType: "Meccan" },
  { number: 79, name: "النازعات", englishName: "An-Nazi'at", englishNameTranslation: "Those who drag forth", numberOfAyahs: 46, revelationType: "Meccan" },
  { number: 80, name: "عبس", englishName: "'Abasa", englishNameTranslation: "He Frowned", numberOfAyahs: 42, revelationType: "Meccan" },
  { number: 81, name: "التكوير", englishName: "At-Takwir", englishNameTranslation: "The Overthrowing", numberOfAyahs: 29, revelationType: "Meccan" },
  { number: 82, name: "الإنفطار", englishName: "Al-Infitar", englishNameTranslation: "The Cleaving", numberOfAyahs: 19, revelationType: "Meccan" },
  { number: 83, name: "المطففين", englishName: "Al-Mutaffifin", englishNameTranslation: "The Defrauding", numberOfAyahs: 36, revelationType: "Meccan" },
  { number: 84, name: "الإنشقاق", englishName: "Al-Inshiqaq", englishNameTranslation: "The Splitting Open", numberOfAyahs: 25, revelationType: "Meccan" },
  { number: 85, name: "البروج", englishName: "Al-Buruj", englishNameTranslation: "The Mansions of the Stars", numberOfAyahs: 22, revelationType: "Meccan" },
  { number: 86, name: "الطارق", englishName: "At-Tariq", englishNameTranslation: "The Nightcomer", numberOfAyahs: 17, revelationType: "Meccan" },
  { number: 87, name: "الأعلى", englishName: "Al-A'la", englishNameTranslation: "The Most High", numberOfAyahs: 19, revelationType: "Meccan" },
  { number: 88, name: "الغاشية", englishName: "Al-Ghashiyah", englishNameTranslation: "The Overwhelming", numberOfAyahs: 26, revelationType: "Meccan" },
  { number: 89, name: "الفجر", englishName: "Al-Fajr", englishNameTranslation: "The Dawn", numberOfAyahs: 30, revelationType: "Meccan" },
  { number: 90, name: "البلد", englishName: "Al-Balad", englishNameTranslation: "The City", numberOfAyahs: 20, revelationType: "Meccan" },
  { number: 91, name: "الشمس", englishName: "Ash-Shams", englishNameTranslation: "The Sun", numberOfAyahs: 15, revelationType: "Meccan" },
  { number: 92, name: "الليل", englishName: "Al-Layl", englishNameTranslation: "The Night", numberOfAyahs: 21, revelationType: "Meccan" },
  { number: 93, name: "الضحى", englishName: "Ad-Duha", englishNameTranslation: "The Morning Hours", numberOfAyahs: 11, revelationType: "Meccan" },
  { number: 94, name: "الشرح", englishName: "Ash-Sharh", englishNameTranslation: "The Relief", numberOfAyahs: 8, revelationType: "Meccan" },
  { number: 95, name: "التين", englishName: "At-Tin", englishNameTranslation: "The Fig", numberOfAyahs: 8, revelationType: "Meccan" },
  { number: 96, name: "العلق", englishName: "Al-'Alaq", englishNameTranslation: "The Clot", numberOfAyahs: 19, revelationType: "Meccan" },
  { number: 97, name: "القدر", englishName: "Al-Qadr", englishNameTranslation: "The Power", numberOfAyahs: 5, revelationType: "Meccan" },
  { number: 98, name: "البينة", englishName: "Al-Bayyinah", englishNameTranslation: "The Clear Proof", numberOfAyahs: 8, revelationType: "Medinan" },
  { number: 99, name: "الزلزلة", englishName: "Az-Zalzalah", englishNameTranslation: "The Earthquake", numberOfAyahs: 8, revelationType: "Medinan" },
  { number: 100, name: "العاديات", englishName: "Al-'Adiyat", englishNameTranslation: "The Courser", numberOfAyahs: 11, revelationType: "Meccan" },
  { number: 101, name: "القارعة", englishName: "Al-Qari'ah", englishNameTranslation: "The Calamity", numberOfAyahs: 11, revelationType: "Meccan" },
  { number: 102, name: "التكاثر", englishName: "At-Takathur", englishNameTranslation: "The Rivalry in World Increase", numberOfAyahs: 8, revelationType: "Meccan" },
  { number: 103, name: "العصر", englishName: "Al-'Asr", englishNameTranslation: "The Declining Day", numberOfAyahs: 3, revelationType: "Meccan" },
  { number: 104, name: "الهمزة", englishName: "Al-Humazah", englishNameTranslation: "The Traducer", numberOfAyahs: 9, revelationType: "Meccan" },
  { number: 105, name: "الفيل", englishName: "Al-Fil", englishNameTranslation: "The Elephant", numberOfAyahs: 5, revelationType: "Meccan" },
  { number: 106, name: "قريش", englishName: "Quraysh", englishNameTranslation: "Quraysh", numberOfAyahs: 4, revelationType: "Meccan" },
  { number: 107, name: "الماعون", englishName: "Al-Ma'un", englishNameTranslation: "The Small Kindnesses", numberOfAyahs: 7, revelationType: "Meccan" },
  { number: 108, name: "الكوثر", englishName: "Al-Kawthar", englishNameTranslation: "The Abundance", numberOfAyahs: 3, revelationType: "Meccan" },
  { number: 109, name: "الكافرون", englishName: "Al-Kafirun", englishNameTranslation: "The Disbelievers", numberOfAyahs: 6, revelationType: "Meccan" },
  { number: 110, name: "النصر", englishName: "An-Nasr", englishNameTranslation: "The Divine Support", numberOfAyahs: 3, revelationType: "Medinan" },
  { number: 111, name: "المسد", englishName: "Al-Masad", englishNameTranslation: "The Palm Fibre", numberOfAyahs: 5, revelationType: "Meccan" },
  { number: 112, name: "الإخلاص", englishName: "Al-Ikhlas", englishNameTranslation: "The Sincerity", numberOfAyahs: 4, revelationType: "Meccan" },
  { number: 113, name: "الفلق", englishName: "Al-Falaq", englishNameTranslation: "The Daybreak", numberOfAyahs: 5, revelationType: "Meccan" },
  { number: 114, name: "الناس", englishName: "An-Nas", englishNameTranslation: "Mankind", numberOfAyahs: 6, revelationType: "Meccan" },
];

export const RECITERS: Reciter[] = [
  {
    id: "yasser-al-dosari-sa",
    name: "ياسر الدوسري",
    englishName: "Yasser Al-Dosari",
    country: "Saudi Arabia",
    style: "Hafs A'n Assem - Murattal",
    avatar: "/images/reciters/yasser-al-dosari-sa.jpg",
    serverUrl: "https://cdn.mp3quran.net/audio/yasser-dosari/r1/",
    featured: true,
    tags: ["popular", "emotional", "saudi"]
  },
  {
    id: "mishary-alafasy-kw",
    name: "مشاري راشد العفاسي",
    englishName: "Mishary Rashid Alafasy",
    country: "Kuwait",
    style: "Hafs A'n Assem - Murattal",
    avatar: "/images/reciters/mishary-alafasy-kw.jpg",
    serverUrl: "https://cdn.mp3quran.net/audio/mishary-alafasy/r1/",
    featured: true,
    tags: ["popular", "focus", "kuwait"]
  },
  {
    id: "abdul-basit-abdul-samad-eg",
    name: "عبد الباسط عبد الصمد",
    englishName: "Abdul Basit Abdul Samad",
    country: "Egypt",
    style: "Hafs A'n Assem - Mujawwad",
    avatar: "/images/reciters/abdul-basit-abdul-samad-eg.jpg",
    serverUrl: "https://cdn.mp3quran.net/audio/abdulbasit-abdulsamad/r3/",
    featured: true,
    tags: ["tajwid", "classic", "egypt"]
  },
  {
    id: "mahmoud-khalil-al-husary-eg",
    name: "محمود خليل الحصري",
    englishName: "Mahmoud Khalil Al-Husary",
    country: "Egypt",
    style: "Hafs A'n Assem - Murattal",
    avatar: "/images/reciters/mahmoud-khalil-al-husary-eg.jpg",
    serverUrl: "https://cdn.mp3quran.net/audio/mahmoud-husary/r1/",
    featured: true,
    tags: ["tajwid", "classic", "egypt"]
  },
  {
    id: "muhammad-siddiq-al-minshawi-eg",
    name: "محمد صديق المنشاوي",
    englishName: "Muhammad Siddiq Al-Minshawi",
    country: "Egypt",
    style: "Hafs A'n Assem - Murattal",
    avatar: "/images/reciters/muhammad-siddiq-al-minshawi-eg.jpg",
    serverUrl: "https://cdn.mp3quran.net/audio/muhammad-minshawi/r1/",
    featured: true,
    tags: ["tajwid", "emotional", "egypt"]
  },
  {
    id: "maher-al-muaiqly-sa",
    name: "ماهر المعيقلي",
    englishName: "Maher Al-Muaiqly",
    country: "Saudi Arabia",
    style: "Hafs A'n Assem - Murattal",
    avatar: "/images/reciters/maher-al-muaiqly-sa.jpg",
    serverUrl: "https://cdn.mp3quran.net/audio/maher-muaiqly/r1/",
    featured: true,
    tags: ["popular", "makkah", "saudi"]
  },
  {
    id: "abdur-rahman-as-sudais-sa",
    name: "عبد الرحمن السديس",
    englishName: "Abdul Rahman Al-Sudais",
    country: "Saudi Arabia",
    style: "Hafs A'n Assem - Murattal",
    avatar: "/images/reciters/abdur-rahman-as-sudais-sa.jpg",
    serverUrl: "https://server11.mp3quran.net/sds/",
    tags: ["popular", "makkah", "saudi"]
  },
  {
    id: "saud-al-shuraim-sa",
    name: "سعود الشريم",
    englishName: "Saud Al-Shuraim",
    country: "Saudi Arabia",
    style: "Hafs A'n Assem - Murattal",
    avatar: "/images/reciters/saud-al-shuraim-sa.jpg",
    serverUrl: "https://server7.mp3quran.net/shur/",
    tags: ["popular", "makkah", "saudi"]
  },
  {
    id: "saad-al-ghamdi-sa",
    name: "سعد الغامدي",
    englishName: "Saad Al-Ghamdi",
    country: "Saudi Arabia",
    style: "Hafs A'n Assem - Murattal",
    avatar: "/images/reciters/saad-al-ghamdi-sa.jpg",
    serverUrl: "https://server7.mp3quran.net/s_gmd/",
    tags: ["popular", "ruqia", "saudi"]
  },
  {
    id: "abu-bakr-al-shatri-sa",
    name: "أبو بكر الشاطري",
    englishName: "Abu Bakr Al-Shatri",
    country: "Saudi Arabia",
    style: "Hafs A'n Assem - Murattal",
    avatar: "/images/reciters/abu-bakr-al-shatri-sa.jpg",
    serverUrl: "https://server11.mp3quran.net/shatri/",
    tags: ["popular", "emotional", "saudi"]
  },
  {
    id: "nasser-al-qatami-sa",
    name: "ناصر القطامي",
    englishName: "Nasser Al-Qatami",
    country: "Saudi Arabia",
    style: "Hafs A'n Assem - Murattal",
    avatar: "/images/reciters/nasser-al-qatami-sa.jpg",
    serverUrl: "https://server6.mp3quran.net/qtm/",
    tags: ["emotional", "saudi"]
  },
  {
    id: "fares-abbad-ye",
    name: "فارس عباد",
    englishName: "Fares Abbad",
    country: "Yemen",
    style: "Hafs A'n Assem - Murattal",
    avatar: "/images/reciters/fares-abbad-ye.jpg",
    serverUrl: "https://server8.mp3quran.net/frs_a/",
    tags: ["ruqia", "yemen"]
  },
  {
    id: "ayman-rushdi-suwaid-sy",
    name: "أيمن رشدي سويد",
    englishName: "Ayman Rushdi Suwaid",
    country: "Syria",
    style: "Hafs A'n Assem - Tajwid",
    avatar: "/images/reciters/ayman-rushdi-suwaid-sy.jpg",
    serverUrl: "https://server10.mp3quran.net/suwaid/",
    tags: ["tajwid", "syria"]
  },
  {
    id: "mahmoud-ali-al-banna-eg",
    name: "محمود علي البنا",
    englishName: "Mahmoud Ali Al-Banna",
    country: "Egypt",
    style: "Hafs A'n Assem - Murattal",
    avatar: "/images/reciters/mahmoud-ali-al-banna-eg.jpg",
    serverUrl: "https://server8.mp3quran.net/bna/",
    tags: ["tajwid", "classic", "egypt"]
  }
];

export const COLLECTIONS: Collection[] = [
  {
    id: "focus-work",
    slug: "focus-work",
    title: "Focus & Work",
    subtitle: "Calm, steady recitations for deep cognitive focus",
    description: "Serene and measured recitations to help maintain tranquility, barakah, and flow during study and work.",
    coverGradient: "from-blue-600 via-indigo-900 to-black",
    reciterId: "mishary-alafasy-kw",
    surahNumbers: [18, 36, 55, 56, 67],
    category: "curated"
  },
  {
    id: "most-beautiful-recitations",
    slug: "most-beautiful-recitations",
    title: "Most Beautiful Recitations",
    subtitle: "Heart-touching melodic recitations from global masters",
    description: "The most listened to and spiritually uplifting Quranic recitations worldwide.",
    coverGradient: "from-pink-600 via-rose-950 to-black",
    reciterId: "yasser-al-dosari-sa",
    surahNumbers: [1, 12, 19, 55, 67, 78, 89],
    category: "curated"
  },
  {
    id: "sleep-mode",
    slug: "sleep-mode",
    title: "Sleep Mode",
    subtitle: "Gentle evening recitations for peaceful rest",
    description: "Low-tempo, peaceful recitations designed for evening winding down and restful sleep.",
    coverGradient: "from-blue-900 via-purple-950 to-black",
    reciterId: "mahmoud-khalil-al-husary-eg",
    surahNumbers: [32, 67, 73, 76, 112, 113, 114],
    category: "mood"
  },
  {
    id: "duaa-ruqia",
    slug: "duaa-ruqia",
    title: "Duaa & Ruqia",
    subtitle: "Protective Surahs, healing verses, and Duas",
    description: "Verses for spiritual protection, shifa, and seeking Allah's guidance and mercy.",
    coverGradient: "from-emerald-700 via-teal-950 to-black",
    reciterId: "fares-abbad-ye",
    surahNumbers: [1, 2, 36, 112, 113, 114],
    category: "curated"
  },
  {
    id: "emotional-recitations",
    slug: "emotional-recitations",
    title: "Emotional Recitations",
    subtitle: "Reverent, tearful recitations that move the soul",
    description: "Profound Quranic verses recited with deep contemplation and reverence.",
    coverGradient: "from-amber-600 via-red-950 to-black",
    reciterId: "muhammad-siddiq-al-minshawi-eg",
    surahNumbers: [14, 19, 20, 21, 50, 75],
    category: "mood"
  },
  {
    id: "best-for-tajwid",
    slug: "tajwid",
    title: "Best for Tajwid",
    subtitle: "Flawless pronunciation and articulation for learners",
    description: "Standard reference recitations recognized by scholars for precision in Tajweed rules.",
    coverGradient: "from-cyan-700 via-blue-950 to-black",
    reciterId: "mahmoud-khalil-al-husary-eg",
    surahNumbers: [1, 2, 3, 18, 36, 67, 114],
    category: "tajwid"
  },
  {
    id: "yasser-al-dosari-special",
    slug: "yasser-al-dosari-special",
    title: "Yasser Al-Dosari Masterpieces",
    subtitle: "Powerful and revered Haram recitations",
    description: "The most iconic recitations led at the Grand Mosque in Makkah by Sheikh Dr. Yasser Al-Dosari.",
    coverGradient: "from-amber-700 via-amber-950 to-black",
    reciterId: "yasser-al-dosari-sa",
    surahNumbers: [1, 2, 12, 19, 53, 54, 55, 56, 67, 85, 87, 88],
    category: "reciter-special"
  }
];

export const AMBIENT_SOUNDS: AmbientSound[] = [
  {
    id: "calm-rain",
    name: "Calm Rain",
    description: "Soft raindrops falling on leaves",
    icon: "CloudRain",
    badge: "Popular",
    audioUrl: "/audio/calm_rain.mp3"
  },
  {
    id: "calm-bonfire",
    name: "Gentle Bonfire",
    description: "Warm soothing crackles of burning wood",
    icon: "Flame",
    badge: "Cozy",
    audioUrl: "/audio/calm_bonfire.mp3"
  },
  {
    id: "calm-river",
    name: "Calm River",
    description: "Continuous peaceful flowing freshwater stream",
    icon: "Droplets",
    badge: "Peaceful",
    audioUrl: "/audio/calm_river.mp3"
  },
  {
    id: "morning-birds",
    name: "Morning Birds",
    description: "Chirping forest birds at Fajr dawn",
    icon: "SunMedium",
    badge: "Fajr",
    audioUrl: "/audio/morning_birds.mp3"
  },
  {
    id: "light-wind",
    name: "Light Wind",
    description: "Gentle breeze passing through mountain valleys",
    icon: "Wind",
    badge: "Subtle",
    audioUrl: "/audio/light_wind.mp3"
  },
  {
    id: "wave-effect",
    name: "Ocean Waves",
    description: "Rhythmic gentle sea waves lapping on the shore",
    icon: "Waves",
    badge: "Deep",
    audioUrl: "/audio/wave_effect.mp3"
  },
  {
    id: "cat-purring",
    name: "Cat Purring",
    description: "Deep soothing rhythmic cat purring",
    icon: "Sparkles",
    badge: "Gentle",
    audioUrl: "/audio/cat_puring.mp3"
  },
  {
    id: "thunder-rain-mix",
    name: "Thunder & Rain",
    description: "Atmospheric rolling thunderstorm mixed with steady rainfall",
    icon: "CloudLightning",
    badge: "Intense",
    audioUrl: "/audio/thunder_rain_mix.ogg"
  },
  {
    id: "thunderbolt",
    name: "Thunderbolt",
    description: "Deep, reverberating distant thunderclaps across the sky",
    icon: "Zap",
    badge: "Raw",
    audioUrl: "/audio/thunderbolt.ogg"
  }
];

export const TAFSIRS: Tafsir[] = [
  {
    id: "en-tafsir-ibn-kathir",
    name: "Tafsir Ibn Kathir",
    author: "Ismail ibn Kathir",
    language: "English"
  },
  {
    id: "ar-tafsir-muyassar",
    name: "التفسير الميسر",
    author: "نخبة من العلماء",
    language: "العربية"
  },
  {
    id: "ar-tafsir-jalalayn",
    name: "تفسير الجلالين",
    author: "جلال الدين المحلي والسيوطي",
    language: "العربية"
  },
  {
    id: "en-saheeh",
    name: "Saheeh International",
    author: "Saheeh International Translation",
    language: "English"
  }
];

export const PLAYBACK_SPEEDS = [0.5, 0.8, 1.0, 1.2, 1.5, 1.8, 2.0];

export function getSurahAudioUrl(reciter: Reciter, surahNumber: number): string {
  const padded = String(surahNumber).padStart(3, '0');
  const base = reciter.serverUrl.endsWith('/') ? reciter.serverUrl : `${reciter.serverUrl}/`;
  return `${base}${padded}.mp3`;
}

export function getCurrentTimeOfDayPeriod(): 'afterFajr' | 'morning' | 'dhuhr' | 'afternoon' | 'afterMaghrib' | 'evening' | 'lateNight' {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 7) return 'afterFajr';
  if (hour >= 7 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 15) return 'dhuhr';
  if (hour >= 15 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 20) return 'afterMaghrib';
  if (hour >= 20 && hour < 23) return 'evening';
  return 'lateNight';
}

export function getPeriodTitle(period: string): string {
  switch (period) {
    case 'afterFajr': return 'After Fajr';
    case 'morning': return 'Morning';
    case 'dhuhr': return 'Dhuhr';
    case 'afternoon': return 'Afternoon';
    case 'afterMaghrib': return 'After Maghrib';
    case 'evening': return 'Evening';
    case 'lateNight': return 'Late Night';
    default: return period;
  }
}

