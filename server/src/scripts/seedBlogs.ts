import 'dotenv/config';
import mongoose from 'mongoose';
import { BlogSchema } from '../blogs/schemas/blog.schema';

const Blog = mongoose.model('Blog', BlogSchema);

const blogs = [
  // ─── 1. Moscow 7-Day Guide ────────────────────────────────────────────────
  {
    slug: 'moscow-7-day-guide-saudi-travelers',
    title: {
      en: 'Moscow in 7 Days: The Ultimate 2026 Guide for Saudi Travelers',
      ar: 'موسكو في 7 أيام: الدليل الشامل للمسافرين السعوديين 2026',
    },
    excerpt: {
      en: 'From Red Square to the Golden Ring, discover the perfect week-long Moscow itinerary crafted exclusively for Saudi & Gulf travelers — with halal tips, budget breakdowns & hidden gems.',
      ar: 'من الميدان الأحمر إلى الحلقة الذهبية، اكتشف أفضل برنامج سياحي لأسبوع في موسكو صُمِّم خصيصاً للمسافرين السعوديين والخليجيين.',
    },
    body: {
      en: '<p>Moscow is one of those cities that stops you mid-stride. This 7-day guide is your blueprint for experiencing Moscow at its absolute finest — from the Kremlin and Red Square to the Golden Ring day trips and Izmailovo Market.</p>',
      ar: '<p>موسكو — قلب روسيا النابض — من أكثر المدن إثارةً في العالم. هذا الدليل يضع بين يديك خارطة طريق لأسبوع لا يُنسى في العاصمة الروسية.</p>',
    },
    coverImage: 'https://images.unsplash.com/photo-1547448415-e9f5b28e570d?w=1200&q=85',
    author: 'Alforsa Travel Team',
    publishedAt: new Date('2026-07-15'),
    readTime: 12,
    tags: ['Moscow', 'Russia', 'Itinerary', 'Saudi Travelers', 'Travel Tips', 'Halal Travel'],
    destinationSlugs: ['russia'],
    isPublished: true,
    isFeatured: true,
    seoTitle: {
      en: 'Moscow 7-Day Guide for Saudi Travelers 2026 | Alforsa Gate',
      ar: 'دليل موسكو 7 أيام للمسافرين السعوديين 2026 | ألفرسا',
    },
    seoDescription: {
      en: 'Complete 7-day Moscow itinerary for Saudi tourists: Kremlin, Red Square, metro tour, Arbat Street, Golden Ring day trip, halal restaurants & practical tips for 2026.',
      ar: 'برنامج سياحي كامل لمدة 7 أيام في موسكو للسياح السعوديين: الكرملين، الميدان الأحمر، مترو موسكو، شارع أربات، ومطاعم حلال 2026.',
    },
    seoKeywords: {
      en: 'Moscow itinerary Saudi travelers, Moscow 7 days, halal Moscow, Russia travel guide 2026, Kremlin tour, Red Square, Moscow tips',
      ar: 'برنامج موسكو للسعوديين، موسكو 7 أيام، موسكو حلال، دليل روسيا 2026، الكرملين، الميدان الأحمر',
    },
    seoImage: 'https://images.unsplash.com/photo-1547448415-e9f5b28e570d?w=1200&q=85',
  },

  // ─── 2. St. Petersburg White Nights ──────────────────────────────────────
  {
    slug: 'st-petersburg-white-nights-guide',
    title: {
      en: "St. Petersburg White Nights: Russia's Most Magical Summer Phenomenon",
      ar: 'الليالي البيضاء في سانت بطرسبرغ: أسحر ظاهرة صيفية في روسيا',
    },
    excerpt: {
      en: 'Experience nearly 24-hour daylight, drawbridge spectacles, world-class ballet, and the Hermitage at its most enchanting — St. Petersburg in June is a bucket-list experience unlike any other.',
      ar: 'استمتع بضوء النهار الممتد 24 ساعة تقريباً، وجسور السحب الليلية، والباليه العالمي والإرميتاج في أبهى حلته — سانت بطرسبرغ في يونيو تجربة لا تُنسى.',
    },
    body: {
      en: '<p>Between June 11 and July 2 each year, St. Petersburg barely sees darkness. This guide covers the Hermitage, Peterhof Palace, midnight drawbridges, the Mariinsky Theatre, and everything you need to make the most of the White Nights.</p>',
      ar: '<p>بين 11 يونيو و2 يوليو من كل عام، تعيش سانت بطرسبرغ ظاهرة فلكية نادرة: الشمس لا تغيب تماماً. هذا الدليل يغطي الإرميتاج، بيترهوف، جسور السحب والمسرح الماريينسكي.</p>',
    },
    coverImage: 'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?w=1200&q=85',
    author: 'Alforsa Travel Team',
    publishedAt: new Date('2026-07-22'),
    readTime: 10,
    tags: ['St. Petersburg', 'White Nights', 'Hermitage', 'Russia Summer', 'Peterhof', 'Travel Guide'],
    destinationSlugs: ['russia'],
    isPublished: true,
    isFeatured: false,
    seoTitle: {
      en: "St. Petersburg White Nights Guide 2026 | Alforsa Gate",
      ar: 'دليل الليالي البيضاء في سانت بطرسبرغ 2026 | ألفرسا',
    },
    seoDescription: {
      en: "Complete guide to St. Petersburg White Nights 2026: Hermitage Museum, Peterhof Palace, drawbridges at midnight, Mariinsky Theatre, canal boat tours & tips for Saudi travelers.",
      ar: 'دليل شامل لليالي البيضاء في سانت بطرسبرغ 2026: الإرميتاج، بيترهوف، جسور السحب وجولات القنوات للمسافرين السعوديين.',
    },
    seoKeywords: {
      en: 'St Petersburg White Nights, Hermitage Museum, Peterhof Palace, Russia summer travel, midnight drawbridges, Mariinsky Theatre',
      ar: 'الليالي البيضاء سانت بطرسبرغ، الإرميتاج، بيترهوف، روسيا صيفاً، جسور السحب',
    },
    seoImage: 'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?w=1200&q=85',
  },

  // ─── 3. Lake Baikal Winter ────────────────────────────────────────────────
  {
    slug: 'lake-baikal-winter-experience',
    title: {
      en: "Lake Baikal in Winter: Walking on the World's Deepest Lake",
      ar: 'بحيرة بايكال في الشتاء: المشي على أعمق بحيرة في العالم',
    },
    excerpt: {
      en: "Drive across frozen turquoise ice, sleep in ice hotels, witness kilometre-long ice cracks thunder across the surface — Lake Baikal in February is one of earth's last truly wild spectacles.",
      ar: 'قُد سيارتك عبر جليد فيروزي صافٍ، نَم في فنادق الجليد، وشاهد تشققات البحيرة الرهيبة — بحيرة بايكال في فبراير تجربة لا مثيل لها.',
    },
    body: {
      en: '<p>There is nowhere else on earth quite like Lake Baikal in winter. The world\'s deepest lake holds 20% of all unfrozen fresh water on the planet. Every February, this colossal body of water transforms into a surreal ice sheet stretching 636 kilometres.</p>',
      ar: '<p>لا يوجد مكان آخر في العالم مثل بحيرة بايكال في الشتاء. أعمق بحيرة في العالم تتحول كل فبراير إلى صفيحة جليدية فيروزية شفافة تمتد 636 كيلومتراً.</p>',
    },
    coverImage: 'https://images.unsplash.com/photo-1551966775-a4ddc8df052b?w=1200&q=85',
    author: 'Alforsa Travel Team',
    publishedAt: new Date('2026-08-05'),
    readTime: 11,
    tags: ['Lake Baikal', 'Russia Winter', 'Siberia', 'Ice Travel', 'Adventure', 'Bucket List'],
    destinationSlugs: ['russia'],
    isPublished: true,
    isFeatured: false,
    seoTitle: {
      en: 'Lake Baikal Winter Guide 2026: Ice Walks, Caves & Adventures | Alforsa',
      ar: 'دليل بحيرة بايكال الشتوي 2026: المشي على الجليد والكهوف | ألفرسا',
    },
    seoDescription: {
      en: "Lake Baikal winter guide 2026: how to get there from Moscow, ice walks, hovercraft tours, ice caves, dog sledding, Buryat culture & best February travel tips for Saudi visitors.",
      ar: 'دليل بحيرة بايكال الشتوي 2026: كيف تصل من موسكو، المشي على الجليد، كهوف الجليد، وأفضل نصائح السفر لفبراير.',
    },
    seoKeywords: {
      en: 'Lake Baikal winter, Baikal ice walk, Olkhon Island, Irkutsk travel, Siberia adventure, Russia winter travel 2026',
      ar: 'بحيرة بايكال شتاء، المشي على جليد بايكال، جزيرة أولخون، إيركوتسك، سيبيريا مغامرة',
    },
    seoImage: 'https://images.unsplash.com/photo-1551966775-a4ddc8df052b?w=1200&q=85',
  },

  // ─── 4. Trans-Siberian Railway ────────────────────────────────────────────
  {
    slug: 'trans-siberian-railway-ultimate-guide',
    title: {
      en: 'Trans-Siberian Railway: The Epic Journey Every Saudi Traveler Must Know',
      ar: 'قطار عبر سيبيريا: الرحلة الأسطورية التي يجب على كل مسافر سعودي معرفتها',
    },
    excerpt: {
      en: "9,289 kilometres, 8 time zones, 14 days across the full breadth of the earth's largest country — the Trans-Siberian Railway is the greatest train journey in the world, and it's more accessible than you think.",
      ar: '9,289 كيلومتراً عبر 8 مناطق زمنية وأعظم رحلة قطار في التاريخ — قطار عبر سيبيريا أكثر سهولاً مما تتخيل.',
    },
    body: {
      en: '<p>The Trans-Siberian Railway is, without exaggeration, the greatest land journey on earth. At 9,289 kilometres from Moscow to Vladivostok on the Pacific coast, it spans 8 time zones and crosses the full breadth of Russia.</p>',
      ar: '<p>قطار عبر سيبيريا هو الرحلة البرية الأعظم في تاريخ البشرية. 9,289 كيلومتراً من موسكو إلى فلاديفوستوك على المحيط الهادي، عابراً 8 مناطق زمنية وغابات سيبيريا اللانهائية.</p>',
    },
    coverImage: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=1200&q=85',
    author: 'Alforsa Travel Team',
    publishedAt: new Date('2026-08-12'),
    readTime: 14,
    tags: ['Trans-Siberian', 'Train Travel', 'Russia', 'Adventure', 'Bucket List', 'Siberia'],
    destinationSlugs: ['russia'],
    isPublished: true,
    isFeatured: false,
    seoTitle: {
      en: 'Trans-Siberian Railway Guide for Saudi Travelers 2026 | Alforsa',
      ar: 'دليل قطار عبر سيبيريا للمسافرين السعوديين 2026 | ألفرسا',
    },
    seoDescription: {
      en: "Trans-Siberian Railway guide for Saudi travelers 2026: three routes, how to book, which class to choose, key stops, halal food on board & total cost in SAR.",
      ar: 'دليل قطار عبر سيبيريا للمسافرين السعوديين 2026: المسارات الثلاثة، كيفية الحجز، الدرجات والتكلفة الإجمالية.',
    },
    seoKeywords: {
      en: 'Trans-Siberian Railway, Russia train journey, Moscow Vladivostok, Trans-Mongolian, Russia travel 2026, halal train travel',
      ar: 'قطار عبر سيبيريا، رحلة قطار روسيا، موسكو فلاديفوستوك، عبر منغوليا، روسيا 2026',
    },
    seoImage: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=1200&q=85',
  },

  // ─── 5. Halal Food Russia ─────────────────────────────────────────────────
  {
    slug: 'halal-food-russia-muslim-travelers',
    title: {
      en: "Halal Food in Russia 2026: The Complete Muslim Traveler's Guide",
      ar: 'الطعام الحلال في روسيا 2026: الدليل الشامل للمسافر المسلم',
    },
    excerpt: {
      en: "Russia has one of the world's largest Muslim populations — 20+ million. From Moscow's renowned Barashka to Kazan's ancient Tatar cuisine, halal dining in Russia is richer and more available than anywhere else in Europe.",
      ar: 'روسيا تضم أكثر من 20 مليون مسلم — من مطعم باراشكا الشهير في موسكو إلى مطبخ قازان التتاري العريق، الطعام الحلال في روسيا أوفر وأغنى مما تتوقع.',
    },
    body: {
      en: '<p>Russia is home to over 20 million Muslims — the second-largest religious group in the country — making it one of the most Muslim-friendly destinations in Europe or Asia. This guide covers everything you need to eat well, pray comfortably, and travel with confidence.</p>',
      ar: '<p>روسيا موطن لأكثر من 20 مليون مسلم. هذا الدليل يغطي كل ما تحتاجه للأكل الحلال والصلاة بارتياح والسفر بثقة في روسيا.</p>',
    },
    coverImage: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1200&q=85',
    author: 'Alforsa Travel Team',
    publishedAt: new Date('2026-08-20'),
    readTime: 9,
    tags: ['Halal Food', 'Muslim Travel', 'Russia', 'Moscow Restaurants', 'Islamic Tourism', 'Kazan'],
    destinationSlugs: ['russia'],
    isPublished: true,
    isFeatured: true,
    seoTitle: {
      en: "Halal Food in Russia 2026: Complete Muslim Traveler's Guide | Alforsa",
      ar: 'الطعام الحلال في روسيا 2026: دليل المسافر المسلم الشامل | ألفرسا',
    },
    seoDescription: {
      en: "Halal food guide Russia 2026: best halal restaurants in Moscow & St. Petersburg, Kazan's Tatar cuisine, apps to find halal food, prayer facilities & tips for Muslim Saudi travelers.",
      ar: 'دليل الطعام الحلال في روسيا 2026: أفضل المطاعم في موسكو وسانت بطرسبرغ وقازان، تطبيقات البحث عن الطعام الحلال وأماكن الصلاة.',
    },
    seoKeywords: {
      en: 'halal food Russia, Muslim travel Russia, halal Moscow, halal St Petersburg, Kazan halal, Islamic tourism Russia 2026',
      ar: 'طعام حلال روسيا، سياحة إسلامية روسيا، حلال موسكو، قازان حلال، مسافر مسلم روسيا 2026',
    },
    seoImage: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1200&q=85',
  },
];

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/alforsa-gate');
  console.log('Connected to MongoDB');

  let created = 0;
  let updated = 0;

  for (const blog of blogs) {
    const existing = await Blog.findOne({ slug: blog.slug });
    if (existing) {
      await Blog.findByIdAndUpdate(existing._id, { $set: blog });
      console.log(`  updated: ${blog.slug}`);
      updated++;
    } else {
      await Blog.create(blog);
      console.log(`  created: ${blog.slug}`);
      created++;
    }
  }

  console.log(`\nDone — ${created} created, ${updated} updated`);
  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
