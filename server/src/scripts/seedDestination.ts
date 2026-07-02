/**
 * Seed script: insert Russia destination into MongoDB.
 * Run: ts-node -r tsconfig-paths/register src/scripts/seedDestination.ts
 */
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { DestinationSchema } from '../destinations/schemas/destination.schema';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/alforsa-gate';

const russiaData = {
  slug: 'russia',
  isActive: true,
  countryFlag: '🇷🇺',
  primaryColor: 'var(--tg-theme-primary, #0a5c44)',

  heroImage: 'https://images.unsplash.com/photo-1513326738677-b964603b136d?w=1920&q=80',
  name:       { en: 'Russia',  ar: 'روسيا' },
  subtitle:   { en: 'From the golden domes of Moscow to the crystal ice of Lake Baikal', ar: 'من القباب الذهبية في موسكو إلى جليد بحيرة بايكال الكريستالي' },
  heroCta:    { en: 'Book a Russia Tour',  ar: 'احجز جولة في روسيا' },
  heroExplore:{ en: 'Explore Attractions', ar: 'استكشف المعالم' },
  heroScroll: { en: 'Scroll', ar: 'اسحب' },
  heroTagline:{ en: 'Discover the World', ar: 'اكتشف العالم' },

  stats: {
    capital:    { en: 'Moscow',       ar: 'موسكو' },
    language:   { en: 'Russian',      ar: 'الروسية' },
    currency:   { en: 'Ruble (₽)',    ar: 'الروبل (₽)' },
    bestSeason: { en: 'May – Sep',    ar: 'مايو – سبتمبر' },
  },

  aboutImage: 'https://images.unsplash.com/photo-1547448415-e9f5b28e570d?w=800&q=80',
  aboutTitle: { en: 'Why Visit Russia?', ar: 'لماذا تزور روسيا؟' },
  aboutText: {
    en: "Russia is the world's largest country — a vast canvas of imperial grandeur, Siberian wilderness, and world-class art. From the ornate splendor of the Kremlin and the pastel facades of St. Petersburg to the otherworldly ice of Lake Baikal, every corner reveals a new dimension of this extraordinary destination. For Saudi travelers, Russia offers a unique contrast: the warmth of its culture against the drama of its landscapes.",
    ar: 'روسيا هي أكبر دولة في العالم — لوحة شاسعة من العظمة الإمبراطورية وبراري سيبيريا وأرقى المتاحف الفنية. من بهاء الكرملين وواجهات سانت بطرسبرغ الملونة إلى جليد بحيرة بايكال الخيالي، كل زاوية تكشف بُعداً جديداً من هذه الوجهة الاستثنائية. للمسافر السعودي، تقدم روسيا تناقضاً فريداً: دفء الثقافة في مواجهة روعة الطبيعة.',
  },
  statCounters: [
    { value: '29',   label: { en: 'UNESCO Sites',          ar: 'موقع تراث عالمي' } },
    { value: '1st',  label: { en: "World's Largest Country", ar: 'أكبر دولة في العالم' } },
    { value: '700+', label: { en: 'World-Class Museums',   ar: 'متحف عالمي' } },
  ],

  attractionsTitle:    { en: 'Top Attractions',     ar: 'أبرز المعالم السياحية' },
  attractionsSubtitle: { en: 'Must-See Destinations', ar: 'لا تفوّتها' },
  attractions: [
    { img: 'https://images.unsplash.com/photo-1513326738677-b964603b136d?w=800&q=80', city: { en: 'Moscow', ar: 'موسكو' }, name: { en: 'Red Square', ar: 'الميدان الأحمر' }, desc: { en: "The iconic heart of Moscow — flanked by the Kremlin, St. Basil's Cathedral, and Lenin's Mausoleum. A UNESCO World Heritage Site that has witnessed centuries of Russian history.", ar: 'قلب موسكو الأيقوني يحده الكرملين وكاتدرائية القديس باسيل وضريح لينين. موقع مدرج على قائمة التراث العالمي لليونسكو.' } },
    { img: 'https://images.unsplash.com/photo-1548534786-0a56ce8d8f43?w=800&q=80', city: { en: 'Moscow', ar: 'موسكو' }, name: { en: 'The Kremlin', ar: 'الكرملين' }, desc: { en: "Russia's fortified seat of power, housing palaces, cathedrals, the Armoury Museum with crown jewels, and the famous Tsar Bell.", ar: 'مقر السلطة الروسية المحصّن، يضم القصور والكاتدرائيات ومتحف الأسلحة والجرس القيصري الشهير.' } },
    { img: 'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?w=800&q=80', city: { en: 'St. Petersburg', ar: 'سانت بطرسبرغ' }, name: { en: 'The Hermitage Museum', ar: 'متحف الإرميتاج' }, desc: { en: 'One of the world\'s largest art museums in the Winter Palace. Over three million items including works by Rembrandt and Leonardo da Vinci.', ar: 'أحد أكبر المتاحف الفنية في العالم داخل قصر الشتاء. أكثر من ثلاثة ملايين قطعة تشمل أعمال رامبرانت وليوناردو دافنشي.' } },
    { img: 'https://images.unsplash.com/photo-1551966775-a4ddc8df052b?w=800&q=80', city: { en: 'Siberia', ar: 'سيبيريا' }, name: { en: 'Lake Baikal', ar: 'بحيرة بايكال' }, desc: { en: "World's deepest lake containing 20% of Earth's fresh water. In winter its ice forms a surreal 636 km turquoise crystal sheet.", ar: 'أعمق بحيرة في العالم وتحتوي 20٪ من المياه العذبة. في الشتاء يتحول جليدها إلى لوح كريستالي فيروزي يمتد 636 كم.' } },
    { img: 'https://images.unsplash.com/photo-1568464333934-67a35f59c98b?w=800&q=80', city: { en: 'St. Petersburg', ar: 'سانت بطرسبرغ' }, name: { en: 'Peterhof Palace', ar: 'قصر بيترهوف' }, desc: { en: "The 'Russian Versailles' — a UNESCO-listed estate with over 150 fountains and golden statues cascading toward the Gulf of Finland.", ar: '«فرساي الروسية» — مجمع قصر مدرج في اليونسكو مع أكثر من 150 نافورة وتماثيل ذهبية تتدفق نحو خليج فنلندا.' } },
    { img: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=800&q=80', city: { en: 'Moscow → Vladivostok', ar: 'موسكو ← فلاديفوستوك' }, name: { en: 'Trans-Siberian Railway', ar: 'قطار عبر سيبيريا' }, desc: { en: 'World\'s longest railway at 9,289 km across 8 time zones, steppes, Siberian forests, and remote villages. A true bucket-list journey.', ar: 'أطول سكة حديدية في العالم (9,289 كم) عابرة 8 مناطق زمنية عبر السهول والغابات السيبيرية والقرى النائية.' } },
  ],

  seasonTitle:    { en: 'Best Time to Visit',     ar: 'أفضل وقت للزيارة' },
  seasonSubtitle: { en: 'Plan Your Perfect Trip', ar: 'خطط لرحلتك المثالية' },
  seasons: [
    { icon: 'Snowflake', highlight: false, name: { en: 'Winter (Dec–Feb)',  ar: 'الشتاء (ديسمبر–فبراير)' }, desc: { en: 'Magical snow, ice festivals, Lake Baikal\'s crystal ice. Coldest but most atmospheric.', ar: 'ثلج ساحر ومهرجانات جليدية وألواح بحيرة بايكال الكريستالية. الأبرد لكن الأكثر سحراً.' }, tag: { en: 'Snow Lover', ar: 'عاشق الثلج' } },
    { icon: 'Flower2',   highlight: false, name: { en: 'Spring (Mar–May)',  ar: 'الربيع (مارس–مايو)' },    desc: { en: 'Cities awaken, parks bloom. May is perfect — warm, uncrowded, Victory Day celebrations.', ar: 'المدن تنبض والحدائق تزهر. مايو مثالي — دافئ وقليل الازدحام مع احتفالات يوم النصر.' }, tag: { en: 'Comfortable', ar: 'مريح' } },
    { icon: 'Sun',       highlight: true,  name: { en: 'Summer (Jun–Aug)',  ar: 'الصيف (يونيو–أغسطس)' },   desc: { en: 'White Nights in St. Petersburg, peak warmth, outdoor festivals. Busiest & most expensive.', ar: 'ليالي بيضاء في سانت بطرسبرغ ومهرجانات صيفية. أكثر الفترات ازدحاماً وتكلفةً.' }, tag: { en: 'Best Overall', ar: 'الأفضل عموماً' } },
    { icon: 'Leaf',      highlight: false, name: { en: 'Autumn (Sep–Oct)', ar: 'الخريف (سبتمبر–أكتوبر)' }, desc: { en: 'Golden forests, fewer crowds, crisp air. September is a hidden gem for Russia travel.', ar: 'غابات ذهبية وازدحام أقل وهواء منعش. سبتمبر كنز مخفي لزيارة روسيا.' }, tag: { en: 'Recommended', ar: 'موصى به' } },
  ],

  foodTitle:    { en: 'Must-Try Russian Cuisine', ar: 'لا بد من تجربتها' },
  foodSubtitle: { en: 'Taste of Russia',           ar: 'نكهات روسية أصيلة' },
  foods: [
    { emoji: '🍲', name: { en: 'Borscht',         ar: 'بورش' },           desc: { en: 'Deep red beetroot soup, served with sour cream',            ar: 'شوربة البنجر الحمراء مع القشدة الحامضة' } },
    { emoji: '🥩', name: { en: 'Beef Stroganoff', ar: 'بيف ستروغانوف' },  desc: { en: 'Tender beef in mushroom cream sauce',                       ar: 'شرائح لحم طرية بصلصة الكريمة والفطر' } },
    { emoji: '🥞', name: { en: 'Blini',            ar: 'بليني' },          desc: { en: 'Thin pancakes with caviar or jam',                          ar: 'فطائر رقيقة مع الكافيار أو المربى' } },
    { emoji: '🥟', name: { en: 'Pelmeni',          ar: 'بيلميني' },        desc: { en: 'Meat-filled dumplings, the ultimate comfort food',          ar: 'زلابية محشوة باللحم — طعام الراحة الروسي' } },
    { emoji: '🍢', name: { en: 'Shashlik',         ar: 'شاشليك' },         desc: { en: 'Grilled skewered meat — like Gulf mashawi',                 ar: 'لحم مشوي على الأسياخ — مثل مشاوينا الخليجية' } },
    { emoji: '🍰', name: { en: 'Medovik',          ar: 'ميدوفيك' },        desc: { en: "Layered honey cake, Russia's beloved dessert",              ar: 'كعكة العسل المطبقة — أشهر حلويات روسيا' } },
  ],

  budgetTitle: { en: 'Estimated Budget (10 Days)', ar: 'الميزانية التقديرية (10 أيام)' },
  budgets: [
    { level: { en: 'Budget',    ar: 'اقتصادي' }, range: { en: 'SAR 8,000 – 12,000',  ar: '8,000 – 12,000 ريال' },  desc: { en: 'Hostels, local restaurants, metro',                   ar: 'هوستل ومطاعم محلية ومترو' } },
    { level: { en: 'Mid-Range', ar: 'متوسط' },   range: { en: 'SAR 18,000 – 30,000', ar: '18,000 – 30,000 ريال' }, desc: { en: '3–4★ hotels, guided tours, dining out',               ar: 'فنادق 3–4 نجوم وجولات مرشدة' } },
    { level: { en: 'Luxury',    ar: 'فاخر' },    range: { en: 'SAR 50,000+',          ar: '50,000+ ريال' },         desc: { en: '5★ hotels, private guides, Trans-Siberian sleeper', ar: 'فنادق 5 نجوم ومرشدين خاصين وقطار عبر سيبيريا' } },
  ],

  practicalTitle:    { en: 'Practical Travel Info',      ar: 'معلومات السفر العملية' },
  practicalSubtitle: { en: 'Everything You Need to Know', ar: 'كل ما تحتاج معرفته' },
  practicalSections: [
    {
      icon: 'FileCheck',
      title: { en: 'Visa & Entry', ar: 'التأشيرة والدخول' },
      items: [
        { en: 'Saudi citizens require a visa',              ar: 'المواطنون السعوديون يحتاجون تأشيرة' },
        { en: 'E-Visa available: single-entry, 16 days',   ar: 'تأشيرة إلكترونية: دخولة واحدة لمدة 16 يوماً' },
        { en: 'Apply online in 4–7 business days',         ar: 'التقديم أونلاين في 4–7 أيام عمل' },
        { en: 'Standard tourist visa via licensed operator', ar: 'تأشيرة سياحية عبر وكالة معتمدة' },
        { en: 'Verify with Russian embassy before travel', ar: 'تحقق من السفارة الروسية قبل السفر' },
      ],
    },
    {
      icon: 'CreditCard',
      title: { en: 'Money & Payments', ar: 'العملة والمدفوعات' },
      items: [
        { en: 'Currency: Russian Ruble (₽)',                       ar: 'العملة: الروبل الروسي (₽)' },
        { en: '1 SAR ≈ 25–28 RUB (verify current rate)',          ar: '1 ريال ≈ 25–28 روبل (تحقق من السعر الحالي)' },
        { en: 'Visa/Mastercard have limited function',             ar: 'بطاقات فيزا وماستركارد محدودة الاستخدام' },
        { en: 'Bring USD or EUR cash to exchange locally',         ar: 'احضر دولارات أو يوروهات نقداً للصرف' },
        { en: 'UnionPay cards work inside Russia',                 ar: 'بطاقات يونيون باي تعمل داخل روسيا' },
      ],
    },
    {
      icon: 'Train',
      title: { en: 'Getting Around', ar: 'التنقل داخل روسيا' },
      items: [
        { en: 'Metro: best for Moscow & St. Petersburg',          ar: 'المترو: الأفضل في موسكو وسانت بطرسبرغ' },
        { en: 'Sapsan train: Moscow ↔ St. Pete in 4 hrs',        ar: 'قطار سابسان: موسكو ↔ سانت بطرسبرغ في 4 ساعات' },
        { en: 'Yandex Go (like Uber) for taxis',                  ar: 'تطبيق يانديكس Go للتاكسي' },
        { en: 'Domestic flights for Siberia distances',            ar: 'رحلات جوية داخلية للمسافات السيبيرية' },
        { en: 'Trans-Siberian Railway for adventurers',           ar: 'قطار عبر سيبيريا للمغامرين' },
      ],
    },
  ],

  faqTitle:    { en: 'Frequently Asked Questions', ar: 'الأسئلة الشائعة' },
  faqSubtitle: { en: 'Got Questions? We Have Answers.', ar: 'عندك سؤال؟ عندنا الجواب.' },
  faqs: [
    { question: { en: 'Do Saudi citizens need a visa to visit Russia?', ar: 'هل يحتاج المواطنون السعوديون إلى تأشيرة لزيارة روسيا؟' }, answer: { en: 'Yes. Saudi citizens require a visa. Russia offers an e-visa (single-entry, 16 days) applied online in 4–7 business days (~USD $52). For longer stays, apply via a licensed Russian tour operator. Always confirm with the Russian embassy in Riyadh before travel.', ar: 'نعم. يحتاجون تأشيرة. تتيح روسيا تأشيرة إلكترونية (دخولة واحدة، 16 يوماً) تُقدَّم أونلاين في 4–7 أيام عمل (حوالي 52 دولاراً). للإقامات الأطول، تقدم عبر وكالة سفر روسية معتمدة. تحقق دائماً من السفارة الروسية بالرياض قبل السفر.' } },
    { question: { en: 'Is Russia safe for Arab and Muslim tourists?', ar: 'هل روسيا آمنة للسياح العرب والمسلمين؟' }, answer: { en: 'Moscow and St. Petersburg are generally safe for tourists with low violent crime in tourist areas. Arab and Muslim visitors are welcomed respectfully. Russia has significant Muslim communities, especially in Tatarstan. Check your government\'s travel advisories before departure.', ar: 'موسكو وسانت بطرسبرغ آمنتان بشكل عام مع معدلات جريمة منخفضة في المناطق السياحية. يُرحَّب بالزوار العرب والمسلمين باحترام. روسيا لديها مجتمعات مسلمة كبيرة في تتارستان وشمال القوقاز. راجع تحذيرات سفر حكومتك قبل المغادرة.' } },
    { question: { en: 'Are there halal food options in Russia?', ar: 'هل يتوفر طعام حلال في روسيا؟' }, answer: { en: 'Yes — halal food is widely available in Moscow and St. Petersburg, which have sizeable Muslim communities and mosques. Dedicated halal restaurants exist, many fast-food chains offer halal menus, and supermarkets carry halal-certified meat. In smaller cities, vegetarian dishes are a reliable alternative.', ar: 'نعم — الطعام الحلال متوفر على نطاق واسع في موسكو وسانت بطرسبرغ. توجد مطاعم حلال مخصصة وكثير من سلاسل الوجبات السريعة تقدم قوائم حلال. في المدن الأصغر، الأطباق النباتية بديل موثوق.' } },
    { question: { en: 'Can I use my Saudi bank card in Russia?', ar: 'هل يمكنني استخدام بطاقتي المصرفية السعودية في روسيا؟' }, answer: { en: 'Most Visa and Mastercard cards issued outside Russia have limited functionality since 2022. Bring USD or EUR cash to exchange at Russian banks or licensed bureaus (avoid airports — poor rates). UnionPay cards currently work inside Russia.', ar: 'معظم بطاقات فيزا وماستركارد الصادرة خارج روسيا محدودة منذ 2022. احضر دولارات أو يوروهات للصرف في البنوك الروسية أو مكاتب الصرافة المرخصة (تجنب المطارات). بطاقات يونيون باي تعمل حالياً في روسيا.' } },
    { question: { en: 'What is the best time for Saudi tourists to visit Russia?', ar: 'ما أفضل وقت للسياح السعوديين لزيارة روسيا؟' }, answer: { en: "Two ideal windows: May–June for warm weather and St. Petersburg's White Nights (near-24-hour daylight). December–January for a magical winter snow experience with Christmas markets and grand New Year celebrations. September offers golden autumn foliage with fewer crowds.", ar: 'فترتان مثاليتان: مايو–يونيو للطقس الدافئ وليالي سانت بطرسبرغ البيضاء. ديسمبر–يناير لتجربة شتوية ثلجية ساحرة مع احتفالات رأس السنة. سبتمبر أوراق خريف ذهبية وازدحام أقل.' } },
    { question: { en: 'How many days do I need for a Russia trip?', ar: 'كم من الأيام أحتاج لرحلة روسيا؟' }, answer: { en: 'For a first visit covering Moscow and St. Petersburg, allow 7–10 days minimum. To add Lake Baikal, plan 12–14 days. A Trans-Siberian journey or Kamchatka experience requires 2–3 weeks. We offer tailored itineraries from 7 to 21 days.', ar: 'لأول زيارة تشمل موسكو وسانت بطرسبرغ، خصّص 7–10 أيام. لإضافة بحيرة بايكال، خطط لـ 12–14 يوماً. رحلة قطار عبر سيبيريا تحتاج 2–3 أسابيع. نقدم برامج من 7 إلى 21 يوماً.' } },
  ],

  gallery: [
    { url: 'https://images.unsplash.com/photo-1513326738677-b964603b136d?w=800&q=80', caption: { en: 'Red Square, Moscow', ar: 'الميدان الأحمر، موسكو' }, alt: { en: 'Red Square Moscow', ar: 'الميدان الأحمر موسكو' } },
    { url: 'https://images.unsplash.com/photo-1548534786-0a56ce8d8f43?w=800&q=80', caption: { en: 'The Kremlin at dusk', ar: 'الكرملين عند الغروب' }, alt: { en: 'Kremlin Moscow', ar: 'الكرملين موسكو' } },
    { url: 'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?w=800&q=80', caption: { en: 'The Hermitage Museum', ar: 'متحف الإرميتاج' }, alt: { en: 'Hermitage Museum', ar: 'متحف الإرميتاج' } },
    { url: 'https://images.unsplash.com/photo-1551966775-a4ddc8df052b?w=800&q=80', caption: { en: 'Lake Baikal winter ice', ar: 'جليد بحيرة بايكال شتاءً' }, alt: { en: 'Lake Baikal', ar: 'بحيرة بايكال' } },
    { url: 'https://images.unsplash.com/photo-1568464333934-67a35f59c98b?w=800&q=80', caption: { en: 'Peterhof Palace fountains', ar: 'نوافير قصر بيترهوف' }, alt: { en: 'Peterhof Palace', ar: 'قصر بيترهوف' } },
    { url: 'https://images.unsplash.com/photo-1547448415-e9f5b28e570d?w=800&q=80', caption: { en: "St. Basil's Cathedral", ar: 'كاتدرائية القديس باسيل' }, alt: { en: "St. Basil's Cathedral", ar: 'كاتدرائية القديس باسيل' } },
  ],
  galleryTitle:    { en: 'Gallery',         ar: 'معرض الصور' },
  gallerySubtitle: { en: 'Russia Through Our Lens', ar: 'روسيا من عدستنا' },

  ctaBgImage:    'https://images.unsplash.com/photo-1548534786-0a56ce8d8f43?w=1200&q=60',
  ctaTitle:      { en: 'Ready to Explore Russia?',  ar: 'مستعد لاكتشاف روسيا؟' },
  ctaText:       { en: 'Our expert team crafts tailor-made Russia itineraries for Saudi & Gulf travelers — from first-time visitors to seasoned explorers.', ar: 'فريقنا المتخصص يصمم برامج سياحية مخصصة لروسيا للمسافرين السعوديين والخليجيين — من المبتدئين إلى المخضرمين.' },
  ctaBtn:        { en: 'View Russia Tours',          ar: 'عرض جولات روسيا' },
  seatsLabel:    { en: 'seats remaining — book now', ar: 'مقعد متبقي — احجز الآن' },
  seatsRemaining: 30,

  relatedBlogs: [],

  seoTitle:       { en: 'Russia Travel Guide 2025 | Top Attractions & Tips for Saudi Tourists', ar: 'دليل السياحة في روسيا 2025 | أفضل المعالم والنصائح للسياح السعوديين' },
  seoDescription: { en: "Explore Russia's top attractions from Moscow's Red Square to Lake Baikal. Complete travel guide with visa info, seasonal tips & curated itineraries for Saudi & Gulf tourists.", ar: 'اكتشف أفضل معالم روسيا من الميدان الأحمر بموسكو إلى بحيرة بايكال. دليل سياحي شامل بمعلومات التأشيرة والمواسم والبرامج للمسافرين السعوديين والخليجيين.' },
  seoKeywords:    { en: 'Russia travel guide, Moscow tourism, St Petersburg, Lake Baikal, Saudi Arabia tourists Russia', ar: 'دليل السياحة في روسيا, رحلات روسيا, موسكو, بحيرة بايكال' },
  canonicalPath:  '/destination/russia',
};

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const DestinationModel = mongoose.model('Destination', DestinationSchema);

  const existing = await DestinationModel.findOne({ slug: 'russia' });
  if (existing) {
    await DestinationModel.findOneAndUpdate({ slug: 'russia' }, { $set: russiaData }, { new: true });
    console.log('Russia destination updated');
  } else {
    await DestinationModel.create(russiaData);
    console.log('Russia destination created');
  }

  await mongoose.disconnect();
  console.log('Done');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
