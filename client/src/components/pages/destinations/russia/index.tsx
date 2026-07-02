/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Landmark, Languages, BadgeDollarSign, CalendarDays,
  FileCheck, CreditCard, Train, Globe, Palette,
  Snowflake, Flower2, Sun, Leaf,
  CheckCircle, ChevronsDown, Users, Plus, Minus,
  MapPin,
} from "lucide-react";
import HeaderFour from "../../../../layouts/headers/HeaderFour";
import FooterThree from "../../../../layouts/footers/FooterThree";
import { RUSSIA_BLOGS } from "../../../../data/russiaBlogsData";

// ─── Bilingual content ────────────────────────────────────────────────────────
const CONTENT = {
  en: {
    seoTitle: "Russia Travel Guide 2025 | Top Attractions & Tips for Saudi Tourists",
    seoDesc: "Explore Russia's top attractions from Moscow's Red Square to Lake Baikal. Complete travel guide with visa info, seasonal tips & curated itineraries for Saudi & Gulf tourists.",
    heroTitle: "Discover Russia",
    heroSubtitle: "From the golden domes of Moscow to the crystal ice of Lake Baikal",
    heroCta: "Book a Russia Tour",
    heroExplore: "Explore Attractions",
    heroScroll: "Scroll",
    heroTagline: "Discover the World",
    statsCapital: "Moscow",       statsCapitalLabel: "Capital",
    statsLang: "Russian",         statsLangLabel: "Language",
    statsCurrency: "Ruble (₽)",   statsCurrencyLabel: "Currency",
    statsSeason: "May – Sep",     statsSeasonLabel: "Best Season",
    aboutTitle: "Why Visit Russia?",
    aboutText: "Russia is the world's largest country — a vast canvas of imperial grandeur, Siberian wilderness, and world-class art. From the ornate splendor of the Kremlin and the pastel facades of St. Petersburg to the otherworldly ice of Lake Baikal, every corner reveals a new dimension of this extraordinary destination. For Saudi travelers, Russia offers a unique contrast: the warmth of its culture against the drama of its landscapes.",
    statUNESCO: "UNESCO Sites",   statSize: "World's Largest Country", statMuseums: "World-Class Museums",
    attractionsTitle: "Top Attractions", attractionsSubtitle: "Must-See Destinations",
    seasonTitle: "Best Time to Visit", seasonSubtitle: "Plan Your Perfect Trip",
    seasons: [
      { Icon: Snowflake, name: "Winter (Dec–Feb)",  desc: "Magical snow, ice festivals, Lake Baikal's crystal ice. Coldest but most atmospheric.", tag: "Snow Lover",   highlight: false },
      { Icon: Flower2,   name: "Spring (Mar–May)",  desc: "Cities awaken, parks bloom. May is perfect — warm, uncrowded, Victory Day celebrations.", tag: "Comfortable",   highlight: false },
      { Icon: Sun,       name: "Summer (Jun–Aug)",  desc: "White Nights in St. Petersburg, peak warmth, outdoor festivals. Busiest & most expensive.", tag: "Best Overall", highlight: true  },
      { Icon: Leaf,      name: "Autumn (Sep–Oct)",  desc: "Golden forests, fewer crowds, crisp air. September is a hidden gem for Russia travel.", tag: "Recommended",  highlight: false },
    ],
    foodTitle: "Must-Try Russian Cuisine", foodSubtitle: "Taste of Russia",
    foods: [
      { name: "Borscht",        desc: "Deep red beetroot soup, served with sour cream" },
      { name: "Beef Stroganoff",desc: "Tender beef in mushroom cream sauce" },
      { name: "Blini",          desc: "Thin pancakes with caviar or jam" },
      { name: "Pelmeni",        desc: "Meat-filled dumplings, the ultimate comfort food" },
      { name: "Shashlik",       desc: "Grilled skewered meat — like Gulf mashawi" },
      { name: "Medovik",        desc: "Layered honey cake, Russia's beloved dessert" },
    ],
    practicalTitle: "Practical Travel Info", practicalSubtitle: "Everything You Need to Know",
    visa:      { title: "Visa & Entry",        items: ["Saudi citizens require a visa", "E-Visa available: single-entry, 16 days", "Apply online in 4–7 business days", "Standard tourist visa via licensed operator", "Verify with Russian embassy before travel"] },
    payment:   { title: "Money & Payments",    items: ["Currency: Russian Ruble (₽)", "1 SAR ≈ 25–28 RUB (verify current rate)", "Visa/Mastercard have limited function", "Bring USD or EUR cash to exchange locally", "UnionPay cards work inside Russia"] },
    transport: { title: "Getting Around",      items: ["Metro: best for Moscow & St. Petersburg", "Sapsan train: Moscow ↔ St. Pete in 4 hrs", "Yandex Go (like Uber) for taxis", "Domestic flights for Siberia distances", "Trans-Siberian Railway for adventurers"] },
    galleryTitle: "Russia Through the Lens", gallerySubtitle: "Photo Gallery",
    blogTitle: "Russia Travel Stories", blogSubtitle: "Expert Tips & Inspiration",
    blogReadMore: "Read Article",
    faqTitle: "Frequently Asked Questions", faqSubtitle: "Got Questions? We Have Answers.",
    ctaTitle: "Ready to Explore Russia?",
    ctaText: "Our expert team crafts tailor-made Russia itineraries for Saudi & Gulf travelers — from first-time visitors to seasoned explorers.",
    ctaBtn: "View Russia Tours",
    seatsLabel: "seats remaining — book now",
    budgetTitle: "Estimated Budget (10 Days)",
    budgets: [
      { level: "Budget",    sar: "SAR 8,000 – 12,000",  desc: "Hostels, local restaurants, metro" },
      { level: "Mid-Range", sar: "SAR 18,000 – 30,000", desc: "3–4★ hotels, guided tours, dining out" },
      { level: "Luxury",    sar: "SAR 50,000+",          desc: "5★ hotels, private guides, Trans-Siberian sleeper" },
    ],
  },
  ar: {
    seoTitle: "دليل السياحة في روسيا 2025 | أفضل المعالم والنصائح للسياح السعوديين",
    seoDesc: "اكتشف أفضل معالم روسيا من الميدان الأحمر بموسكو إلى بحيرة بايكال. دليل سياحي شامل بمعلومات التأشيرة والمواسم والبرامج للمسافرين السعوديين والخليجيين.",
    heroTitle: "اكتشف روسيا",
    heroSubtitle: "من القباب الذهبية في موسكو إلى جليد بحيرة بايكال الكريستالي",
    heroCta: "احجز جولة في روسيا",
    heroExplore: "استكشف المعالم",
    heroScroll: "اسحب",
    heroTagline: "اكتشف العالم",
    statsCapital: "موسكو",           statsCapitalLabel: "العاصمة",
    statsLang: "الروسية",            statsLangLabel: "اللغة",
    statsCurrency: "الروبل (₽)",     statsCurrencyLabel: "العملة",
    statsSeason: "مايو – سبتمبر",   statsSeasonLabel: "أفضل موسم",
    aboutTitle: "لماذا تزور روسيا؟",
    aboutText: "روسيا هي أكبر دولة في العالم — لوحة شاسعة من العظمة الإمبراطورية وبراري سيبيريا وأرقى المتاحف الفنية. من بهاء الكرملين وواجهات سانت بطرسبرغ الملونة إلى جليد بحيرة بايكال الخيالي، كل زاوية تكشف بُعداً جديداً من هذه الوجهة الاستثنائية. للمسافر السعودي، تقدم روسيا تناقضاً فريداً: دفء الثقافة في مواجهة روعة الطبيعة.",
    statUNESCO: "موقع تراث عالمي",  statSize: "أكبر دولة في العالم",   statMuseums: "متحف عالمي",
    attractionsTitle: "أبرز المعالم السياحية", attractionsSubtitle: "لا تفوّتها",
    seasonTitle: "أفضل وقت للزيارة", seasonSubtitle: "خطط لرحلتك المثالية",
    seasons: [
      { Icon: Snowflake, name: "الشتاء (ديسمبر–فبراير)", desc: "ثلج ساحر ومهرجانات جليدية وألواح بحيرة بايكال الكريستالية. الأبرد لكن الأكثر سحراً.", tag: "عاشق الثلج",    highlight: false },
      { Icon: Flower2,   name: "الربيع (مارس–مايو)",      desc: "المدن تنبض والحدائق تزهر. مايو مثالي — دافئ وقليل الازدحام مع احتفالات يوم النصر.",     tag: "مريح",           highlight: false },
      { Icon: Sun,       name: "الصيف (يونيو–أغسطس)",     desc: "ليالي بيضاء في سانت بطرسبرغ ومهرجانات صيفية. أكثر الفترات ازدحاماً وتكلفةً.",          tag: "الأفضل عموماً",  highlight: true  },
      { Icon: Leaf,      name: "الخريف (سبتمبر–أكتوبر)",  desc: "غابات ذهبية وازدحام أقل وهواء منعش. سبتمبر كنز مخفي لزيارة روسيا.",                     tag: "موصى به",        highlight: false },
    ],
    foodTitle: "لا بد من تجربتها", foodSubtitle: "نكهات روسية أصيلة",
    foods: [
      { name: "بورش",           desc: "شوربة البنجر الحمراء مع القشدة الحامضة" },
      { name: "بيف ستروغانوف",  desc: "شرائح لحم طرية بصلصة الكريمة والفطر" },
      { name: "بليني",          desc: "فطائر رقيقة مع الكافيار أو المربى" },
      { name: "بيلميني",        desc: "زلابية محشوة باللحم — طعام الراحة الروسي" },
      { name: "شاشليك",         desc: "لحم مشوي على الأسياخ — مثل مشاوينا الخليجية" },
      { name: "ميدوفيك",        desc: "كعكة العسل المطبقة — أشهر حلويات روسيا" },
    ],
    practicalTitle: "معلومات السفر العملية", practicalSubtitle: "كل ما تحتاج معرفته",
    visa:      { title: "التأشيرة والدخول",  items: ["المواطنون السعوديون يحتاجون تأشيرة", "تأشيرة إلكترونية: دخولة واحدة لمدة 16 يوماً", "التقديم أونلاين في 4–7 أيام عمل", "تأشيرة سياحية عبر وكالة معتمدة", "تحقق من السفارة الروسية قبل السفر"] },
    payment:   { title: "العملة والمدفوعات", items: ["العملة: الروبل الروسي (₽)", "1 ريال ≈ 25–28 روبل (تحقق من السعر الحالي)", "بطاقات فيزا وماستركارد محدودة الاستخدام", "احضر دولارات أو يوروهات نقداً للصرف", "بطاقات يونيون باي تعمل داخل روسيا"] },
    transport: { title: "التنقل داخل روسيا", items: ["المترو: الأفضل في موسكو وسانت بطرسبرغ", "قطار سابسان: موسكو ↔ سانت بطرسبرغ في 4 ساعات", "تطبيق يانديكس Go للتاكسي", "رحلات جوية داخلية للمسافات السيبيرية", "قطار عبر سيبيريا للمغامرين"] },
    galleryTitle: "روسيا من خلال العدسة", gallerySubtitle: "معرض الصور",
    blogTitle: "قصص السفر إلى روسيا", blogSubtitle: "نصائح وإلهام من الخبراء",
    blogReadMore: "اقرأ المقال",
    faqTitle: "الأسئلة الشائعة", faqSubtitle: "عندك سؤال؟ عندنا الجواب.",
    ctaTitle: "مستعد لاكتشاف روسيا؟",
    ctaText: "فريقنا المتخصص يصمم برامج سياحية مخصصة لروسيا للمسافرين السعوديين والخليجيين — من المبتدئين إلى المخضرمين.",
    ctaBtn: "عرض جولات روسيا",
    seatsLabel: "مقعد متبقي — احجز الآن",
    budgetTitle: "الميزانية التقديرية (10 أيام)",
    budgets: [
      { level: "اقتصادي", sar: "8,000 – 12,000 ريال",  desc: "هوستل ومطاعم محلية ومترو" },
      { level: "متوسط",   sar: "18,000 – 30,000 ريال", desc: "فنادق 3–4 نجوم وجولات مرشدة" },
      { level: "فاخر",    sar: "50,000+ ريال",           desc: "فنادق 5 نجوم ومرشدين خاصين وقطار عبر سيبيريا" },
    ],
  },
};

const ATTRACTIONS = [
  { id: 1, img: "https://images.unsplash.com/photo-1513326738677-b964603b136d?w=800&q=80",
    city: { en: "Moscow", ar: "موسكو" },
    en: { name: "Red Square",           desc: "The iconic heart of Moscow — flanked by the Kremlin, St. Basil's Cathedral, and Lenin's Mausoleum. A UNESCO World Heritage Site that has witnessed centuries of Russian history." },
    ar: { name: "الميدان الأحمر",       desc: "قلب موسكو الأيقوني يحده الكرملين وكاتدرائية القديس باسيل وضريح لينين. موقع مدرج على قائمة التراث العالمي لليونسكو." } },
  { id: 2, img: "https://images.unsplash.com/photo-1548534786-0a56ce8d8f43?w=800&q=80",
    city: { en: "Moscow", ar: "موسكو" },
    en: { name: "The Kremlin",           desc: "Russia's fortified seat of power, housing palaces, cathedrals, the Armoury Museum with crown jewels, and the famous Tsar Bell." },
    ar: { name: "الكرملين",              desc: "مقر السلطة الروسية المحصّن، يضم القصور والكاتدرائيات ومتحف الأسلحة والجرس القيصري الشهير." } },
  { id: 3, img: "https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?w=800&q=80",
    city: { en: "St. Petersburg", ar: "سانت بطرسبرغ" },
    en: { name: "The Hermitage Museum",  desc: "One of the world's largest art museums in the Winter Palace. Over three million items including works by Rembrandt and Leonardo da Vinci." },
    ar: { name: "متحف الإرميتاج",        desc: "أحد أكبر المتاحف الفنية في العالم داخل قصر الشتاء. أكثر من ثلاثة ملايين قطعة تشمل أعمال رامبرانت وليوناردو دافنشي." } },
  { id: 4, img: "https://images.unsplash.com/photo-1551966775-a4ddc8df052b?w=800&q=80",
    city: { en: "Siberia", ar: "سيبيريا" },
    en: { name: "Lake Baikal",           desc: "World's deepest lake containing 20% of Earth's fresh water. In winter its ice forms a surreal 636 km turquoise crystal sheet." },
    ar: { name: "بحيرة بايكال",          desc: "أعمق بحيرة في العالم وتحتوي 20٪ من المياه العذبة. في الشتاء يتحول جليدها إلى لوح كريستالي فيروزي يمتد 636 كم." } },
  { id: 5, img: "https://images.unsplash.com/photo-1568464333934-67a35f59c98b?w=800&q=80",
    city: { en: "St. Petersburg", ar: "سانت بطرسبرغ" },
    en: { name: "Peterhof Palace",       desc: "The 'Russian Versailles' — a UNESCO-listed estate with over 150 fountains and golden statues cascading toward the Gulf of Finland." },
    ar: { name: "قصر بيترهوف",           desc: "«فرساي الروسية» — مجمع قصر مدرج في اليونسكو مع أكثر من 150 نافورة وتماثيل ذهبية تتدفق نحو خليج فنلندا." } },
  { id: 6, img: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=800&q=80",
    city: { en: "Moscow → Vladivostok", ar: "موسكو ← فلاديفوستوك" },
    en: { name: "Trans-Siberian Railway",desc: "World's longest railway at 9,289 km across 8 time zones, steppes, Siberian forests, and remote villages. A true bucket-list journey." },
    ar: { name: "قطار عبر سيبيريا",      desc: "أطول سكة حديدية في العالم (9,289 كم) عابرة 8 مناطق زمنية عبر السهول والغابات السيبيرية والقرى النائية." } },
];

const FAQS = [
  { en: { q: "Do Saudi citizens need a visa to visit Russia?",          a: "Yes. Saudi citizens require a visa. Russia offers an e-visa (single-entry, 16 days) applied online in 4–7 business days (~USD $52). For longer stays, apply via a licensed Russian tour operator. Always confirm with the Russian embassy in Riyadh before travel." },
    ar: { q: "هل يحتاج المواطنون السعوديون إلى تأشيرة لزيارة روسيا؟", a: "نعم. يحتاجون تأشيرة. تتيح روسيا تأشيرة إلكترونية (دخولة واحدة، 16 يوماً) تُقدَّم أونلاين في 4–7 أيام عمل (حوالي 52 دولاراً). للإقامات الأطول، تقدم عبر وكالة سفر روسية معتمدة. تحقق دائماً من السفارة الروسية بالرياض قبل السفر." } },
  { en: { q: "Is Russia safe for Arab and Muslim tourists?",             a: "Moscow and St. Petersburg are generally safe for tourists with low violent crime in tourist areas. Arab and Muslim visitors are welcomed respectfully. Russia has significant Muslim communities, especially in Tatarstan. Check your government's travel advisories before departure." },
    ar: { q: "هل روسيا آمنة للسياح العرب والمسلمين؟",                  a: "موسكو وسانت بطرسبرغ آمنتان بشكل عام مع معدلات جريمة منخفضة في المناطق السياحية. يُرحَّب بالزوار العرب والمسلمين باحترام. روسيا لديها مجتمعات مسلمة كبيرة في تتارستان وشمال القوقاز. راجع تحذيرات سفر حكومتك قبل المغادرة." } },
  { en: { q: "Are there halal food options in Russia?",                  a: "Yes — halal food is widely available in Moscow and St. Petersburg, which have sizeable Muslim communities and mosques. Dedicated halal restaurants exist, many fast-food chains offer halal menus, and supermarkets carry halal-certified meat. In smaller cities, vegetarian dishes are a reliable alternative." },
    ar: { q: "هل يتوفر طعام حلال في روسيا؟",                           a: "نعم — الطعام الحلال متوفر على نطاق واسع في موسكو وسانت بطرسبرغ. توجد مطاعم حلال مخصصة وكثير من سلاسل الوجبات السريعة تقدم قوائم حلال. في المدن الأصغر، الأطباق النباتية بديل موثوق." } },
  { en: { q: "Can I use my Saudi bank card in Russia?",                  a: "Most Visa and Mastercard cards issued outside Russia have limited functionality since 2022. Bring USD or EUR cash to exchange at Russian banks or licensed bureaus (avoid airports — poor rates). UnionPay cards currently work inside Russia." },
    ar: { q: "هل يمكنني استخدام بطاقتي المصرفية السعودية في روسيا؟",   a: "معظم بطاقات فيزا وماستركارد الصادرة خارج روسيا محدودة منذ 2022. احضر دولارات أو يوروهات للصرف في البنوك الروسية أو مكاتب الصرافة المرخصة (تجنب المطارات). بطاقات يونيون باي تعمل حالياً في روسيا." } },
  { en: { q: "What is the best time for Saudi tourists to visit Russia?", a: "Two ideal windows: May–June for warm weather and St. Petersburg's White Nights (near-24-hour daylight). December–January for a magical winter snow experience with Christmas markets and grand New Year celebrations. September offers golden autumn foliage with fewer crowds." },
    ar: { q: "ما أفضل وقت للسياح السعوديين لزيارة روسيا؟",             a: "فترتان مثاليتان: مايو–يونيو للطقس الدافئ وليالي سانت بطرسبرغ البيضاء. ديسمبر–يناير لتجربة شتوية ثلجية ساحرة مع احتفالات رأس السنة. سبتمبر أوراق خريف ذهبية وازدحام أقل." } },
  { en: { q: "How many days do I need for a Russia trip?",               a: "For a first visit covering Moscow and St. Petersburg, allow 7–10 days minimum. To add Lake Baikal, plan 12–14 days. A Trans-Siberian journey or Kamchatka experience requires 2–3 weeks. We offer tailored itineraries from 7 to 21 days." },
    ar: { q: "كم من الأيام أحتاج لرحلة روسيا؟",                        a: "لأول زيارة تشمل موسكو وسانت بطرسبرغ، خصّص 7–10 أيام. لإضافة بحيرة بايكال، خطط لـ 12–14 يوماً. رحلة قطار عبر سيبيريا تحتاج 2–3 أسابيع. نقدم برامج من 7 إلى 21 يوماً." } },
];

const JSON_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "TouristDestination", "name": "Russia", "alternateName": "Russian Federation",
      "description": "Russia offers an extraordinary blend of imperial history, world-class art, dramatic Siberian wilderness, and iconic landmarks including Red Square, the Kremlin, and Lake Baikal.",
      "image": "https://images.unsplash.com/photo-1513326738677-b964603b136d?w=1200&q=80",
      "geo": { "@type": "GeoCoordinates", "latitude": "61.524", "longitude": "105.318" },
      "includesAttraction": ATTRACTIONS.map(a => ({ "@type": "TouristAttraction", "name": a.en.name, "description": a.en.desc })),
    },
    { "@type": "FAQPage", "mainEntity": FAQS.map(f => ({ "@type": "Question", "name": f.en.q, "acceptedAnswer": { "@type": "Answer", "text": f.en.a } })) },
    { "@type": "BreadcrumbList", "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "/" },
      { "@type": "ListItem", "position": 2, "name": "Destinations" },
      { "@type": "ListItem", "position": 3, "name": "Russia" },
    ]},
  ],
});

const GALLERY = [
  { src: "https://images.unsplash.com/photo-1513326738677-b964603b136d?w=900&q=80", span: "wide", alt: { en: "Red Square, Moscow", ar: "الميدان الأحمر، موسكو" } },
  { src: "https://images.unsplash.com/photo-1548534786-0a56ce8d8f43?w=700&q=80", span: "tall", alt: { en: "The Kremlin", ar: "الكرملين" } },
  { src: "https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?w=700&q=80", span: "normal", alt: { en: "Hermitage Museum", ar: "متحف الإرميتاج" } },
  { src: "https://images.unsplash.com/photo-1551966775-a4ddc8df052b?w=700&q=80", span: "normal", alt: { en: "Lake Baikal", ar: "بحيرة بايكال" } },
  { src: "https://images.unsplash.com/photo-1568464333934-67a35f59c98b?w=700&q=80", span: "wide", alt: { en: "Peterhof Palace", ar: "قصر بيترهوف" } },
  { src: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=700&q=80", span: "normal", alt: { en: "Trans-Siberian Railway", ar: "قطار عبر سيبيريا" } },
  { src: "https://images.unsplash.com/photo-1547448415-e9f5b28e570d?w=700&q=80", span: "normal", alt: { en: "Saint Basil's Cathedral", ar: "كاتدرائية القديس باسيل" } },
];

const PRIMARY = "var(--tg-theme-primary, #0a5c44)";
const FOOD_COLORS = ["#e8f4f0", "#fdf3e8", "#eef0fd", "#fdeaea", "#e8f8ea", "#fdf7e8"];
const FOOD_EMOJIS = ["🍲", "🥩", "🥞", "🥟", "🍢", "🍰"];
const BUDGET_COLORS = ["#6c757d", PRIMARY, "#c0a000"];

// ─── Component ────────────────────────────────────────────────────────────────
const RussiaDestination = () => {
  const { i18n } = useTranslation();
  const lang = (i18n.language?.startsWith("ar") ? "ar" : "en") as "en" | "ar";
  const isRtl = lang === "ar";
  const c = CONTENT[lang];
  const dir = isRtl ? "rtl" : "ltr";

  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const closeLightbox = useCallback(() => setLightbox(null), []);

  return (
    <>
      <style>{`
        .russia-gallery { display: grid; grid-template-columns: repeat(4, 1fr); grid-auto-rows: 200px; gap: 12px; }
        @media (max-width: 767px) {
          .russia-gallery { grid-template-columns: repeat(2, 1fr); grid-auto-rows: 150px; }
          .russia-gallery > div[style*="span 2"] { grid-column: span 1 !important; }
          .russia-gallery > div[style*="span 2"][style*="row"] { grid-row: span 1 !important; }
        }
      `}</style>
      <Helmet>
        <html lang={lang} dir={dir} />
        <title>{c.seoTitle}</title>
        <meta name="description" content={c.seoDesc} />
        <meta name="robots" content="index, follow" />
        <meta name="keywords" content="Russia travel guide, Moscow tourism, St Petersburg, Lake Baikal, Saudi Arabia tourists Russia, دليل السياحة في روسيا, رحلات روسيا" />
        <meta property="og:title" content={c.seoTitle} />
        <meta property="og:description" content={c.seoDesc} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://images.unsplash.com/photo-1513326738677-b964603b136d?w=1200&q=80" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="/destination/russia" />
        <script type="application/ld+json">{JSON_LD}</script>
      </Helmet>

      <HeaderFour isTransparent={true}/>

      <main>
        {/* ── HERO ── */}
        <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", position: "relative",
          background: `linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.7) 100%), url('https://images.unsplash.com/photo-1513326738677-b964603b136d?w=1920&q=80') center/cover no-repeat` }}>
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8 text-center">
                <div style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)", borderRadius: 20, padding: "48px 40px", color: "#fff", direction: dir }}>
                  <span style={{ fontSize: 12, letterSpacing: 3, textTransform: "uppercase", opacity: 0.75, display: "block", marginBottom: 16 }}>🇷🇺 {c.heroTagline}</span>
                  <h1 style={{ fontSize: "clamp(38px,6vw,76px)", fontWeight: 800, lineHeight: 1.1, marginBottom: 18, color: "#fff" }}>{c.heroTitle}</h1>
                  <p style={{ fontSize: 17, opacity: 0.85, maxWidth: 520, margin: "0 auto 32px" }}>{c.heroSubtitle}</p>
                  <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
                    <Link to="/tour-grid-2" className="tg-btn" style={{ background: PRIMARY, color: "#fff", borderColor: "transparent", padding: "14px 32px", borderRadius: 100 }}>{c.heroCta}</Link>
                    <a href="#attractions" style={{ color: "#fff", border: "1.5px solid rgba(255,255,255,0.6)", padding: "14px 32px", borderRadius: 100, textDecoration: "none", fontSize: 15 }}>{c.heroExplore}</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div style={{ position: "absolute", bottom: 30, left: "50%", transform: "translateX(-50%)", color: "rgba(255,255,255,0.6)", textAlign: "center" }}>
            <div style={{ width: 1, height: 40, background: "rgba(255,255,255,0.4)", margin: "0 auto 8px" }} />
            <ChevronsDown size={18} style={{ display: "block", margin: "0 auto 4px" }} />
            <span style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase" }}>{c.heroScroll}</span>
          </div>
        </section>

        {/* ── QUICK FACTS ── */}
        <section style={{ background: PRIMARY, padding: "28px 0" }}>
          <div className="container">
            <div className="row text-center" style={{ color: "#fff" }}>
              {[
                { label: c.statsCapitalLabel, value: c.statsCapital,    Icon: Landmark },
                { label: c.statsLangLabel,    value: c.statsLang,       Icon: Languages },
                { label: c.statsCurrencyLabel,value: c.statsCurrency,   Icon: BadgeDollarSign },
                { label: c.statsSeasonLabel,  value: c.statsSeason,     Icon: CalendarDays },
              ].map((s, i) => (
                <div key={i} className="col-6 col-md-3" style={{ padding: "10px 0", borderRight: i < 3 ? "1px solid rgba(255,255,255,0.2)" : "none" }}>
                  <s.Icon size={22} style={{ opacity: 0.8, marginBottom: 6 }} />
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{s.value}</div>
                  <div style={{ fontSize: 11, opacity: 0.75, textTransform: "uppercase", letterSpacing: 1 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── ABOUT ── */}
        <section className="pt-80 pb-60" style={{ background: "#fff" }}>
          <div className="container">
            <div className="row align-items-center" style={{ direction: dir }}>
              <div className="col-lg-6 mb-30">
                <img src="https://images.unsplash.com/photo-1547448415-e9f5b28e570d?w=800&q=80" alt="Saint Basil's Cathedral"
                  style={{ width: "100%", borderRadius: 16, boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}
                  onError={(e: any) => { e.target.style.display = "none"; }} />
              </div>
              <div className={`col-lg-6 mb-30 ${isRtl ? "pe-lg-5" : "ps-lg-5"}`}>
                <h5 className="tg-section-subtitle mb-15">🇷🇺 Russia</h5>
                <h2 className="mb-20">{c.aboutTitle}</h2>
                <p style={{ fontSize: 16, lineHeight: 1.8, color: "#555", marginBottom: 28 }}>{c.aboutText}</p>
                <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
                  {[
                    { Icon: Landmark, label: c.statUNESCO,  val: "29" },
                    { Icon: Globe,    label: c.statSize,     val: "1st" },
                    { Icon: Palette,  label: c.statMuseums,  val: "700+" },
                  ].map((s, i) => (
                    <div key={i} style={{ textAlign: "center" }}>
                      <s.Icon size={22} style={{ color: PRIMARY, marginBottom: 4 }} />
                      <div style={{ fontSize: 22, fontWeight: 800, color: PRIMARY }}>{s.val}</div>
                      <div style={{ fontSize: 11, color: "#888" }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── ATTRACTIONS ── */}
        <section id="attractions" className="tg-grey-bg pt-80 pb-50">
          <div className="container">
            <div className="col-12 text-center mb-40">
              <h5 className="tg-section-subtitle mb-15">{c.attractionsSubtitle}</h5>
              <h2>{c.attractionsTitle}</h2>
            </div>
            <div className="row">
              {ATTRACTIONS.map((item) => {
                const txt = item[lang];
                return (
                  <div key={item.id} className="col-lg-4 col-md-6 mb-30">
                    <div style={{ borderRadius: 16, overflow: "hidden", background: "#fff", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", height: "100%", direction: dir }}>
                      <div style={{ height: 220, overflow: "hidden", position: "relative" }}>
                        <img src={item.img} alt={txt.name}
                          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s" }}
                          onMouseOver={(e: any) => e.target.style.transform = "scale(1.05)"}
                          onMouseOut={(e: any)  => e.target.style.transform = "scale(1)"}
                          onError={(e: any) => { e.target.src = "/assets/img/destination/des.jpg"; }} />
                        <span style={{ position: "absolute", top: 12, [isRtl ? "right" : "left"]: 12, background: "rgba(0,0,0,0.55)", color: "#fff", fontSize: 11, padding: "3px 10px", borderRadius: 100, backdropFilter: "blur(4px)", display: "flex", alignItems: "center", gap: 4 }}>
                          <MapPin size={11} /> {item.city[lang]}
                        </span>
                      </div>
                      <div style={{ padding: "20px 22px" }}>
                        <h4 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{txt.name}</h4>
                        <p style={{ fontSize: 14, color: "#666", lineHeight: 1.7, margin: 0 }}>{txt.desc}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── BEST TIME ── */}
        <section className="pt-80 pb-50" style={{ background: "#fff" }}>
          <div className="container">
            <div className="col-12 text-center mb-40">
              <h5 className="tg-section-subtitle mb-15">{c.seasonSubtitle}</h5>
              <h2>{c.seasonTitle}</h2>
            </div>
            <div className="row">
              {c.seasons.map((s, i) => (
                <div key={i} className="col-lg-3 col-md-6 mb-25">
                  <div style={{ background: s.highlight ? PRIMARY : "#f8f9ff", borderRadius: 16, padding: "28px 22px", textAlign: "center", height: "100%",
                    color: s.highlight ? "#fff" : "inherit", boxShadow: s.highlight ? `0 8px 30px rgba(10,92,68,0.25)` : "0 2px 12px rgba(0,0,0,0.06)", direction: dir }}>
                    <div style={{ marginBottom: 12, color: s.highlight ? "#fff" : PRIMARY }}><s.Icon size={36} /></div>
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5,
                      background: s.highlight ? "rgba(255,255,255,0.2)" : PRIMARY, color: "#fff",
                      padding: "3px 12px", borderRadius: 100, display: "inline-block", marginBottom: 12 }}>{s.tag}</span>
                    <h5 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>{s.name}</h5>
                    <p style={{ fontSize: 13, lineHeight: 1.7, opacity: s.highlight ? 0.9 : 0.7, margin: 0 }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── BUDGET ── */}
        <section className="tg-grey-bg pt-80 pb-50">
          <div className="container">
            <div className="col-12 text-center mb-40"><h2>{c.budgetTitle}</h2></div>
            <div className="row justify-content-center">
              {c.budgets.map((b, i) => (
                <div key={i} className="col-lg-4 col-md-6 mb-25">
                  <div style={{ background: "#fff", borderRadius: 16, padding: "28px 24px", boxShadow: "0 4px 20px rgba(0,0,0,0.07)", direction: dir, borderTop: `4px solid ${BUDGET_COLORS[i]}` }}>
                    <h5 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{b.level}</h5>
                    <div style={{ fontSize: 22, fontWeight: 800, color: PRIMARY, marginBottom: 8 }}>{b.sar}</div>
                    <p style={{ fontSize: 13, color: "#777", margin: 0 }}>{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CUISINE ── */}
        <section className="pt-80 pb-50" style={{ background: "#fff" }}>
          <div className="container">
            <div className="col-12 text-center mb-40">
              <h5 className="tg-section-subtitle mb-15">{c.foodSubtitle}</h5>
              <h2>{c.foodTitle}</h2>
            </div>
            <div className="row">
              {c.foods.map((f, i) => (
                <div key={i} className="col-lg-2 col-md-4 col-6 mb-25">
                  <div style={{ background: FOOD_COLORS[i], borderRadius: 14, padding: "22px 16px", textAlign: "center", height: "100%", direction: dir }}>
                    <div style={{ fontSize: 38, lineHeight: 1, marginBottom: 12 }}>{FOOD_EMOJIS[i]}</div>
                    <h6 style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{f.name}</h6>
                    <p style={{ fontSize: 12, color: "#666", margin: 0, lineHeight: 1.5 }}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── GALLERY ── */}
        <section className="tg-grey-bg pt-80 pb-50">
          <div className="container">
            <div className="col-12 text-center mb-40">
              <h5 className="tg-section-subtitle mb-15">{c.gallerySubtitle}</h5>
              <h2>{c.galleryTitle}</h2>
            </div>
            <div className="russia-gallery">
              {GALLERY.map((img, i) => (
                <div
                  key={i}
                  onClick={() => setLightbox(i)}
                  style={{
                    gridColumn: img.span === "wide" ? "span 2" : "span 1",
                    gridRow: img.span === "tall" ? "span 2" : "span 1",
                    borderRadius: 14, overflow: "hidden", cursor: "pointer", position: "relative",
                  }}
                >
                  <img
                    src={img.src}
                    alt={img.alt[lang]}
                    style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }}
                    onMouseOver={(e: any) => { e.currentTarget.style.transform = "scale(1.06)"; }}
                    onMouseOut={(e: any) => { e.currentTarget.style.transform = "scale(1)"; }}
                    onError={(e: any) => { e.currentTarget.src = "/assets/img/destination/des.jpg"; }}
                  />
                  <div style={{
                    position: "absolute", inset: 0, background: "rgba(0,0,0,0)", transition: "background 0.3s",
                    display: "flex", alignItems: "flex-end", padding: 14,
                  }}
                    onMouseOver={(e: any) => { e.currentTarget.style.background = "rgba(0,0,0,0.35)"; }}
                    onMouseOut={(e: any) => { e.currentTarget.style.background = "rgba(0,0,0,0)"; }}
                  >
                    <span style={{
                      color: "#fff", fontSize: 12, fontWeight: 600, opacity: 0,
                      transition: "opacity 0.3s", background: "rgba(0,0,0,0.5)",
                      padding: "3px 10px", borderRadius: 100, backdropFilter: "blur(4px)",
                    }}
                      onMouseOver={(e: any) => { e.currentTarget.style.opacity = "1"; }}
                    >
                      {img.alt[lang]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── LIGHTBOX ── */}
        {lightbox !== null && (
          <div
            onClick={closeLightbox}
            style={{
              position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 9999,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <button
              onClick={closeLightbox}
              style={{
                position: "absolute", top: 20, right: 24, background: "none", border: "none",
                color: "#fff", fontSize: 32, cursor: "pointer", lineHeight: 1,
              }}
            >×</button>
            <button
              onClick={(e) => { e.stopPropagation(); setLightbox((lightbox - 1 + GALLERY.length) % GALLERY.length); }}
              style={{ position: "absolute", left: 20, background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", fontSize: 28, width: 48, height: 48, borderRadius: "50%", cursor: "pointer" }}
            >‹</button>
            <img
              src={GALLERY[lightbox].src.replace("w=700", "w=1400").replace("w=900", "w=1400")}
              alt={GALLERY[lightbox].alt[lang]}
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: "90vw", maxHeight: "85vh", objectFit: "contain", borderRadius: 12 }}
              onError={(e: any) => { e.currentTarget.src = "/assets/img/destination/des.jpg"; }}
            />
            <button
              onClick={(e) => { e.stopPropagation(); setLightbox((lightbox + 1) % GALLERY.length); }}
              style={{ position: "absolute", right: 20, background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", fontSize: 28, width: 48, height: 48, borderRadius: "50%", cursor: "pointer" }}
            >›</button>
          </div>
        )}

        {/* ── PRACTICAL INFO ── */}
        <section className="tg-grey-bg pt-80 pb-50">
          <div className="container">
            <div className="col-12 text-center mb-40">
              <h5 className="tg-section-subtitle mb-15">{c.practicalSubtitle}</h5>
              <h2>{c.practicalTitle}</h2>
            </div>
            <div className="row">
              {([
                { data: c.visa,      Icon: FileCheck  },
                { data: c.payment,   Icon: CreditCard },
                { data: c.transport, Icon: Train      },
              ] as const).map(({ data, Icon }, i) => (
                <div key={i} className="col-lg-4 mb-30">
                  <div style={{ background: "#fff", borderRadius: 16, padding: "28px 24px", boxShadow: "0 4px 20px rgba(0,0,0,0.07)", height: "100%", direction: dir }}>
                    <div style={{ width: 56, height: 56, borderRadius: 14, background: "#f0f7f4", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
                      <Icon size={26} style={{ color: PRIMARY }} />
                    </div>
                    <h4 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>{data.title}</h4>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                      {data.items.map((item, j) => (
                        <li key={j} style={{ fontSize: 14, color: "#555", padding: "7px 0", borderBottom: j < data.items.length - 1 ? "1px solid #f0f0f0" : "none",
                          display: "flex", alignItems: "flex-start", gap: 8, flexDirection: isRtl ? "row-reverse" : "row" }}>
                          <CheckCircle size={14} style={{ color: PRIMARY, flexShrink: 0, marginTop: 3 }} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section style={{ background: `linear-gradient(135deg, #071220 0%, #0d2b4e 100%)`, padding: "80px 0", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: `url('https://images.unsplash.com/photo-1548534786-0a56ce8d8f43?w=1200&q=60')`, backgroundSize: "cover", backgroundPosition: "center", opacity: 0.1 }} />
          <div className="container" style={{ position: "relative", zIndex: 1 }}>
            <div className="row justify-content-center text-center" style={{ direction: dir }}>
              <div className="col-lg-7">
                <h2 style={{ color: "#fff", marginBottom: 16, fontSize: "clamp(28px,4vw,42px)" }}>{c.ctaTitle}</h2>
                <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 16, marginBottom: 32 }}>{c.ctaText}</p>
                <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", alignItems: "center" }}>
                  <Link to="/tour-grid-2" className="tg-btn" style={{ background: PRIMARY, color: "#fff", borderColor: "transparent", padding: "14px 36px", borderRadius: 100, fontSize: 15, fontWeight: 600 }}>
                    {c.ctaBtn}
                  </Link>
                  <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                    <Users size={16} style={{ color: "#f4c542" }} />
                    <span style={{ color: "#f4c542", fontWeight: 800, fontSize: 18 }}>30</span>
                    {c.seatsLabel}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── RUSSIA BLOGS ── */}
        <section className="tg-grey-bg pt-80 pb-50">
          <div className="container">
            <div className="col-12 text-center mb-40">
              <h5 className="tg-section-subtitle mb-15">{c.blogSubtitle}</h5>
              <h2>{c.blogTitle}</h2>
            </div>
            <div className="row">
              {RUSSIA_BLOGS.map((blog) => {
                const langPrefix = lang === "ar" ? "/ar" : "/en";
                return (
                  <div key={blog.slug} className="col-xl-4 col-lg-6 col-md-6 mb-30">
                    <div className="tg-blog-item tg-blog-2-item">
                      <div className="tg-blog-thumb p-relative fix mb-20">
                        <Link to={`${langPrefix}/russia-blog/${blog.slug}`}>
                          <img className="w-100" src={blog.coverImage} alt={blog.title[lang]}
                            onError={(e: any) => { e.currentTarget.src = "/assets/img/destination/des.jpg"; }} />
                        </Link>
                        <span className="tg-blog-tag p-absolute">{blog.tags[lang][0]}</span>
                      </div>
                      <div className="tg-blog-content p-relative">
                        <h3 className="tg-blog-title">
                          <Link to={`${langPrefix}/russia-blog/${blog.slug}`}>{blog.title[lang]}</Link>
                        </h3>
                        <div className="tg-blog-date mb-10">
                          <span className="mr-20">
                            <i className="fa-light fa-calendar"></i>
                            {new Date(blog.publishedAt).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US", { year: "numeric", month: "short", day: "numeric" })}
                          </span>
                          <span>
                            <i className="fa-regular fa-clock"></i>
                            {blog.readTime} {lang === "ar" ? "دق قراءة" : "min read"}
                          </span>
                        </div>
                        <p className="tg-blog-text mb-0">{blog.excerpt[lang]}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="pt-80 pb-100" style={{ background: "#fff", position: "relative", zIndex: 1 }}>
          <div className="container">
            <div className="col-12 text-center mb-40">
              <h5 className="tg-section-subtitle mb-15">{c.faqSubtitle}</h5>
              <h2>{c.faqTitle}</h2>
            </div>
            <div className="row justify-content-center">
              <div className="col-lg-8">
                {FAQS.map((faq, i) => {
                  const f = faq[lang];
                  const isOpen = openFaq === i;
                  return (
                    <div key={i} style={{ borderBottom: "1px solid #eee", direction: dir }}>
                      <button onClick={() => setOpenFaq(isOpen ? null : i)}
                        style={{ width: "100%", background: "none", border: "none", padding: "20px 0", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", textAlign: isRtl ? "right" : "left", gap: 12 }}>
                        <span style={{ fontSize: 16, fontWeight: 600, color: isOpen ? PRIMARY : "#222", flex: 1 }}>{f.q}</span>
                        <span style={{ flexShrink: 0, color: PRIMARY, transition: "transform 0.2s" }}>
                          {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                        </span>
                      </button>
                      {isOpen && (
                        <div style={{ paddingBottom: 20, fontSize: 15, color: "#555", lineHeight: 1.8 }}>{f.a}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </main>

      <FooterThree />
    </>
  );
};

export default RussiaDestination;
