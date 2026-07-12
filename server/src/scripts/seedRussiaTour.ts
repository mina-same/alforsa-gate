import 'dotenv/config';
import mongoose from 'mongoose';
import { TourSchema } from '../tours/schemas/tour.schema';

const Tour = mongoose.model('Tour', TourSchema);

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/alforsa-gate');

  const slug = 'sochi-russia-black-sea-mountain-escape';
  const existing = await Tour.findOne({ 'slug.en': slug });
  const action = existing ? 'updated' : 'seeded';

  const tourData = {
    idExternal: 'AFG-RUS-SOCHI-7D-001',

    heading: {
      en: 'Sochi Russia: Black Sea & Mountain Escape',
      ar: 'سوتشي روسيا: جنة البحر الأسود والجبال',
    },

    headingDescription: {
      en: '7 Days — Direct Flights · Sea & Mountain Hotels · 4 Group Tours Included',
      ar: '٧ أيام — طيران مباشر · فنادق البحر والجبل · ٤ جولات جماعية مشمولة',
    },

    slug: {
      en: slug,
      ar: 'سوتشي-روسيا-البحر-الاسود-والجبال',
    },

    Description: {
      header: {
        en: 'Where Mountains Meet the Black Sea',
        ar: 'حيث تلتقي الجبال بالبحر الأسود',
      },
      text: {
        en: `<p>Sochi is Russia's crown jewel on the Black Sea — a city where snow-capped Caucasus peaks descend dramatically to a warm, sparkling sea. Once host to the 2014 Winter Olympics, it has transformed into Russia's premier resort destination, blending world-class mountain infrastructure with a relaxed Mediterranean-style coastal lifestyle that feels nothing like the Russia you imagined.</p>
<p>Our carefully curated 7-day package places you in two iconic 4-star Mercure properties: <strong>Mercure Sochi Centre</strong> — positioned in the heart of the city with sweeping Black Sea views — and <strong>Panorama Krasnaya Polyana by Mercure</strong>, perched high in the Caucasus mountains at the legendary Rosa Khutor ski resort. Experience both worlds in one seamless trip.</p>
<p>Your package includes four exceptional group tours: glide above the treetops in a hot-air balloon at a local farm, ascend the Caucasus by cable car to panoramic mountain ridges and an enchanting Alpaca farm, spend a full day at the award-winning Sochi Park with its world-class dolphin show and circus, and explore the dramatic Sky Park suspension bridge, a traditional honey farm, and the vibrant Adler district.</p>
<p>Sochi offers something rare for Gulf travellers: summer temperatures that are pleasantly cooler than the Gulf, prices significantly lower than most Western European destinations, and halal dining options across the city. Whether you're an adventure-seeker, a family looking for variety, or a couple seeking natural beauty and relaxation, Sochi delivers an experience that surprises every first-time visitor.</p>`,
        ar: `<p>سوتشي هي درة روسيا على البحر الأسود — مدينة تنحدر فيها قمم جبال القوقاز المكللة بالثلوج بشكل درامي إلى بحر دافئ متلألئ. بعد استضافتها لأولمبياد الشتاء 2014، تحولت إلى الوجهة الاستجمامية الأولى في روسيا، تمزج بين بنية تحتية جبلية عالمية المستوى وأسلوب حياة ساحلي مريح يشبه المتوسط بشكل لا يتوقعه أحد.</p>
<p>تضعك باقتنا المنتقاة بعناية لمدة ٧ أيام في فندقين أيقونيين من سلسلة ميركيور الفاخرة: <strong>ميركيور سوتشي سنتر</strong> في قلب المدينة مع إطلالات خلابة على البحر الأسود، و<strong>بانوراما كراسنايا بوليانا باي ميركيور</strong> المتربع على مرتفعات جبال القوقاز في المنتجع الأسطوري روزا خوتور. استمتع بعالمين مختلفين في رحلة واحدة متناسقة.</p>
<p>تشمل باقتك أربع جولات جماعية استثنائية: حلّق فوق أشجار المزرعة في منطاد هوائي، وتسلق الجبال عبر التلفريك إلى قمم بانورامية وتعرف على مزرعة الألباكا الساحرة، وامضِ يوماً كاملاً في سوتشي بارك الشهير بعروض الدلافين والسيرك، واستكشف الجسر المعلق الجسور في سكاي بارك ومزرعة عسل القوقاز والحي النابض منطقة أدلر.</p>
<p>تقدم سوتشي للمسافر الخليجي نادراً: درجات حرارة صيفية أخف وطأة من الخليج، وأسعار أقل بكثير من أغلب الوجهات الأوروبية، وخيارات طعام حلال في أنحاء المدينة. سواء كنت باحثاً عن المغامرة أو عائلة تبحث عن التنوع أو زوجين يتوقان إلى جمال الطبيعة، تقدم سوتشي تجربة تفاجئ كل زائر للمرة الأولى.</p>`,
      },
    },

    // Hero / slider images — mainImage.png first, then real hotel & city photos
    images: [
      {
        url: '/uploads/tours/russia/sochi-main-banner.png',
        alt: { en: 'Your guide to Sochi, Russia — the Black Sea and mountain destination', ar: 'دليلك إلى سوتشي روسيا — وجهة البحر الأسود والجبال' },
        title: { en: 'Sochi, Russia — Your Complete Guide', ar: 'سوتشي روسيا — دليلك الشامل' },
        width: 1080,
        height: 1080,
      },
      {
        url: '/uploads/tours/russia/mercure-sochi-port-view.jpeg',
        alt: { en: 'Sochi city skyline and sea port view from Mercure hotel', ar: 'أفق مدينة سوتشي وإطلالة الميناء من فندق ميركيور' },
        title: { en: 'Sochi City & Black Sea', ar: 'مدينة سوتشي والبحر الأسود' },
        width: 1200,
        height: 800,
      },
      {
        url: '/uploads/tours/russia/panorama-mountain-exterior.jpeg',
        alt: { en: 'Panorama Krasnaya Polyana by Mercure hotel exterior in the mountains', ar: 'واجهة فندق بانوراما كراسنايا بوليانا باي ميركيور في الجبال' },
        title: { en: 'Panorama Krasnaya Polyana by Mercure', ar: 'بانوراما كراسنايا بوليانا باي ميركيور' },
        width: 1200,
        height: 800,
      },
      {
        url: '/uploads/tours/russia/mercure-sochi-sea-view.jpeg',
        alt: { en: 'Panoramic Black Sea view from Mercure Sochi Centre hotel', ar: 'إطلالة بانورامية على البحر الأسود من فندق ميركيور سوتشي سنتر' },
        title: { en: 'Black Sea View — Mercure Sochi Centre', ar: 'إطلالة البحر الأسود — ميركيور سوتشي سنتر' },
        width: 1200,
        height: 800,
      },
      {
        url: '/uploads/tours/russia/panorama-mountain-garden.jpeg',
        alt: { en: 'Family enjoying the garden at Panorama Krasnaya Polyana by Mercure', ar: 'عائلة تستمتع بحديقة بانوراما كراسنايا بوليانا باي ميركيور' },
        title: { en: 'Mountain Resort Family Experience', ar: 'تجربة عائلية في المنتجع الجبلي' },
        width: 1200,
        height: 800,
      },
      {
        url: '/uploads/tours/russia/mercure-sochi-pool.jpeg',
        alt: { en: 'Outdoor swimming pool at Mercure Sochi Centre', ar: 'حمام السباحة الخارجي في ميركيور سوتشي سنتر' },
        title: { en: 'Mercure Sochi Centre — Outdoor Pool', ar: 'ميركيور سوتشي سنتر — حمام السباحة الخارجي' },
        width: 1200,
        height: 800,
      },
      {
        url: '/uploads/tours/russia/panorama-mountain-grounds.jpeg',
        alt: { en: 'Guests relaxing on the lawn at Panorama mountain resort with Caucasus peaks behind', ar: 'ضيوف يستريحون على العشب في منتجع بانوراما الجبلي مع قمم القوقاز خلفهم' },
        title: { en: 'Panorama Resort — Mountain Atmosphere', ar: 'منتجع بانوراما — الأجواء الجبلية' },
        width: 1200,
        height: 800,
      },
    ],

    // Full gallery — all your hotel and guide images
    gallery: [
      // Mercure Sochi Centre (sea hotel)
      {
        url: '/uploads/tours/russia/mercure-sochi-sea-pier.jpeg',
        alt: { en: 'Black Sea pier view from Mercure Sochi Centre', ar: 'إطلالة على رصيف البحر الأسود من ميركيور سوتشي سنتر' },
        title: { en: 'Black Sea Pier View', ar: 'إطلالة على رصيف البحر الأسود' },
        width: 800,
        height: 600,
      },
      {
        url: '/uploads/tours/russia/mercure-sochi-city-view.jpeg',
        alt: { en: 'Sochi city panorama from hotel window', ar: 'بانوراما مدينة سوتشي من نافذة الفندق' },
        title: { en: 'Sochi City Panorama', ar: 'بانوراما مدينة سوتشي' },
        width: 800,
        height: 600,
      },
      {
        url: '/uploads/tours/russia/mercure-sochi-lobby.jpeg',
        alt: { en: 'Mercure Sochi Centre hotel lobby with elevators', ar: 'ردهة فندق ميركيور سوتشي سنتر مع المصاعد' },
        title: { en: 'Mercure Sochi — Lobby', ar: 'ميركيور سوتشي — الردهة' },
        width: 800,
        height: 600,
      },
      {
        url: '/uploads/tours/russia/mercure-sochi-reception.jpeg',
        alt: { en: 'Mercure Sochi Centre reception desk with Priority Welcome sign', ar: 'طاولة الاستقبال في ميركيور سوتشي سنتر' },
        title: { en: 'Mercure Sochi — Reception', ar: 'ميركيور سوتشي — الاستقبال' },
        width: 800,
        height: 600,
      },
      {
        url: '/uploads/tours/russia/mercure-sochi-exterior.jpeg',
        alt: { en: 'Mercure Hotel exterior sign on building facade', ar: 'لافتة فندق ميركيور على واجهة المبنى' },
        title: { en: 'Mercure Hotel Sochi', ar: 'فندق ميركيور سوتشي' },
        width: 800,
        height: 600,
      },
      {
        url: '/uploads/tours/russia/mercure-sochi-breakfast.jpeg',
        alt: { en: 'Breakfast buffet spread at Mercure Sochi Centre', ar: 'بوفيه الإفطار في ميركيور سوتشي سنتر' },
        title: { en: 'Mercure Sochi — Breakfast Buffet', ar: 'ميركيور سوتشي — بوفيه الإفطار' },
        width: 800,
        height: 600,
      },
      // Panorama Krasnaya Polyana by Mercure (mountain hotel)
      {
        url: '/uploads/tours/russia/panorama-mountain-restaurant.jpeg',
        alt: { en: 'Outdoor terrace restaurant at Panorama Krasnaya Polyana by Mercure', ar: 'مطعم الشرفة الخارجية في بانوراما كراسنايا بوليانا باي ميركيور' },
        title: { en: 'Panorama — Outdoor Restaurant', ar: 'بانوراما — المطعم الخارجي' },
        width: 800,
        height: 600,
      },
      {
        url: '/uploads/tours/russia/panorama-mountain-playground.jpeg',
        alt: { en: "Children's playground at Panorama mountain resort with Caucasus backdrop", ar: 'ملعب الأطفال في منتجع بانوراما الجبلي مع خلفية القوقاز' },
        title: { en: 'Panorama — Kids Playground', ar: 'بانوراما — ملعب الأطفال' },
        width: 800,
        height: 600,
      },
      {
        url: '/uploads/tours/russia/panorama-mountain-gym.jpeg',
        alt: { en: 'Fully equipped gym at Panorama Krasnaya Polyana by Mercure', ar: 'صالة رياضية مجهزة بالكامل في بانوراما كراسنايا بوليانا باي ميركيور' },
        title: { en: 'Panorama — Fitness Centre', ar: 'بانوراما — مركز اللياقة البدنية' },
        width: 800,
        height: 600,
      },
      // Sochi destination guide cards
      {
        url: '/uploads/tours/russia/sochi-guide-overview.jpeg',
        alt: { en: 'Sochi destination overview — city description and airport information', ar: 'نظرة عامة على وجهة سوتشي — وصف المدينة ومعلومات المطار' },
        title: { en: 'About Sochi', ar: 'عن سوتشي' },
        width: 800,
        height: 800,
      },
      {
        url: '/uploads/tours/russia/sochi-guide-activities.jpeg',
        alt: { en: 'Where to spend time in Sochi — top family activities guide', ar: 'أين تقضي وقتك في سوتشي — دليل الأنشطة العائلية' },
        title: { en: 'Sochi Activities Guide', ar: 'دليل الأنشطة في سوتشي' },
        width: 800,
        height: 800,
      },
      {
        url: '/uploads/tours/russia/sochi-guide-restaurants.jpeg',
        alt: { en: 'Best halal restaurants and cafés in Sochi', ar: 'أفضل المطاعم والمقاهي الحلال في سوتشي' },
        title: { en: 'Halal Dining in Sochi', ar: 'الطعام الحلال في سوتشي' },
        width: 800,
        height: 800,
      },
      {
        url: '/uploads/tours/russia/sochi-guide-why-choose.jpeg',
        alt: { en: 'Why choose Sochi for your holiday — top reasons', ar: 'لماذا تختار سوتشي لعطلتك — أبرز الأسباب' },
        title: { en: 'Why Choose Sochi', ar: 'لماذا سوتشي' },
        width: 800,
        height: 800,
      },
      {
        url: '/uploads/tours/russia/sochi-guide-shopping.jpeg',
        alt: { en: 'Best malls and markets for shopping in Sochi', ar: 'أفضل المجمعات والأسواق للتسوق في سوتشي' },
        title: { en: 'Shopping in Sochi', ar: 'التسوق في سوتشي' },
        width: 800,
        height: 800,
      },
    ],

    // Flight schedule table — your actual departure dates & pricing image
    scheduleImage: {
      url: '/uploads/tours/russia/sochi-flight-schedule.png',
      alt: { en: 'Sochi Russia tour flight schedule and departure dates', ar: 'جدول رحلات وتواريخ المغادرة لجولة سوتشي روسيا' },
      title: { en: 'Flight Schedule & Departure Dates', ar: 'جدول الرحلات وتواريخ المغادرة' },
      width: 1080,
      height: 720,
    },

    tourLocation: {
      en: 'Sochi, Krasnodar Krai, Russia',
      ar: 'سوتشي، كراسنودار، روسيا',
    },

    tourAvailability: {
      en: 'Summer season — May through September (peak: July & August)',
      ar: 'الموسم الصيفي — من مايو إلى سبتمبر (الذروة: يوليو وأغسطس)',
    },

    pickupAndDropOff: {
      en: 'Sochi International Airport (AER) — 30–40 minutes from city centre. Group transfer included.',
      ar: 'مطار سوتشي الدولي (AER) — ٣٠–٤٠ دقيقة من وسط المدينة. التنقل الجماعي مشمول.',
    },

    tourType: {
      en: 'Nature, Adventure & Family',
      ar: 'طبيعة ومغامرة وعائلة',
    },

    tourStyle: {
      en: 'Group Package Tour (Private Excursions Available)',
      ar: 'باقة جماعية (جولات خاصة متاحة)',
    },

    duration: {
      en: '7 Days / 6 Nights (3 Mountain + 3 Sea)',
      ar: '٧ أيام / ٦ ليالٍ (٣ في الجبل + ٣ على البحر)',
    },

    meetingPoint: {
      en: 'Sochi International Airport (AER) — our representative will meet you in arrivals with a name board',
      ar: 'مطار سوتشي الدولي (AER) — سيستقبلك ممثلنا في صالة الوصول بلافتة تحمل اسمك',
    },

    cancellationPolicy: {
      en: 'Free cancellation up to 14 days before departure. 50% refund for cancellations 7–13 days prior. No refund within 7 days of departure.',
      ar: 'إلغاء مجاني حتى ١٤ يوماً قبل المغادرة. استرداد ٥٠٪ للإلغاء قبل ٧–١٣ يوماً. لا يُرد المبلغ في غضون ٧ أيام من المغادرة.',
    },

    tourMapIframe: 'https://www.google.com/maps?q=Sochi+Russia&output=embed',

    mapSchema: {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Sochi Russia Tour Route',
      description: 'Key stops across Sochi city and Krasnaya Polyana on the 7-day Russia itinerary.',
      itemListOrder: 'Sequential',
      itemListElement: [
        {
          '@type': 'TouristAttraction',
          position: 1,
          name: 'Sochi Sea Port',
          description: 'The iconic Sochi seaport with views of the Black Sea, the starting point of city exploration.',
          geo: { '@type': 'GeoCoordinates', latitude: '43.5992', longitude: '39.7257' },
          address: { '@type': 'PostalAddress', addressLocality: 'Sochi', addressCountry: 'Russia' },
        },
        {
          '@type': 'TouristAttraction',
          position: 2,
          name: 'Sochi Park',
          description: 'Russia\'s premier theme park with dolphinarium, circus, and family attractions.',
          geo: { '@type': 'GeoCoordinates', latitude: '43.4060', longitude: '39.9565' },
          address: { '@type': 'PostalAddress', addressLocality: 'Adler, Sochi', addressCountry: 'Russia' },
        },
        {
          '@type': 'TouristAttraction',
          position: 3,
          name: 'Rosa Khutor — Krasnaya Polyana',
          description: 'World-class Olympic mountain resort with cable cars and panoramic Caucasus views.',
          geo: { '@type': 'GeoCoordinates', latitude: '43.6754', longitude: '40.3035' },
          address: { '@type': 'PostalAddress', addressLocality: 'Krasnaya Polyana, Sochi', addressCountry: 'Russia' },
        },
        {
          '@type': 'TouristAttraction',
          position: 4,
          name: 'Sky Park AJ Hackett Sochi',
          description: 'The world\'s longest pedestrian suspension bridge over the Mzymta River gorge.',
          geo: { '@type': 'GeoCoordinates', latitude: '43.5736', longitude: '40.1285' },
          address: { '@type': 'PostalAddress', addressLocality: 'Sochi', addressCountry: 'Russia' },
        },
      ],
    },

    priceStartingFrom: {
      USD: 950,
      SAR: 3565,
      EGP: 47500,
    },

    groupSize: {
      total: 20,
      remaining: 12,
    },

    pricingPlans: [
      {
        planName: 'TOUR PRICES',
        seasons: [
          {
            seasonName: '1 May 2026 – 31 August 2026',
            prices: {
              solo:     { USD: 1650, SAR: 6188, EGP: 82500 },
              pax_2_4:  { USD: 1350, SAR: 5063, EGP: 67500 },
              pax_5_8:  { USD: 1150, SAR: 4313, EGP: 57500 },
              pax_9_16: { USD:  950, SAR: 3565, EGP: 47500 },
            },
          },
        ],
        notes: [
          {
            title: { en: 'What Is Included in the Price', ar: 'ما الذي يشمله السعر' },
            text: {
              en: 'All prices are per person and include: round-trip direct airfare, airport reception & farewell transfers, 3 nights at Mercure Sochi Centre (sea), 3 nights at Panorama Krasnaya Polyana by Mercure (mountain), group transfers between hotels, and all 4 included group tours. Rooms are based on double occupancy; single supplement applies to solo travellers.',
              ar: 'جميع الأسعار للفرد وتشمل: طيران مباشر ذهاباً وإياباً، استقبال وتوديع في المطار، ٣ ليالٍ في ميركيور سوتشي سنتر (بحر)، ٣ ليالٍ في بانوراما كراسنايا بوليانا باي ميركيور (جبل)، تنقلات جماعية بين الفنادق، وجميع الجولات الجماعية الأربع المشمولة. الأسعار على أساس غرفة مزدوجة؛ يُطبق مبلغ إضافي للمسافر المنفرد.',
            },
          },
          {
            title: { en: 'Private Car Upgrades (Optional)', ar: 'ترقية السيارة الخاصة (اختيارية)' },
            text: {
              en: 'Private excursion vehicles are available at additional cost: Sedan (max 3 persons) — USD 100 per excursion. Mercedes Van (max 6 persons) — USD 190 per excursion. Book in advance to secure availability.',
              ar: 'تتوفر سيارات الجولات الخاصة بتكلفة إضافية: سيدان (بحد أقصى ٣ أشخاص) — ١٠٠ دولار للجولة. مرسيدس فان (بحد أقصى ٦ أشخاص) — ١٩٠ دولار للجولة. احجز مسبقاً لضمان التوفر.',
            },
          },
        ],
      },
    ],

    extras: [
      {
        label: { en: 'Private Sedan Excursion (max 3 persons)', ar: 'جولة سيدان خاصة (بحد أقصى ٣ أشخاص)' },
        price: { USD: 100, SAR: 375, EGP: 5000 },
        perPerson: false,
      },
      {
        label: { en: 'Private Mercedes Van Excursion (max 6 persons)', ar: 'جولة مرسيدس فان خاصة (بحد أقصى ٦ أشخاص)' },
        price: { USD: 190, SAR: 713, EGP: 9500 },
        perPerson: false,
      },
      {
        label: { en: 'Local SIM Card (Russia)', ar: 'شريحة اتصال محلية (روسيا)' },
        price: { USD: 15, SAR: 57, EGP: 750 },
        perPerson: true,
      },
    ],

    inclusion: [
      { en: 'Round-trip direct international airfare (economy class)', ar: 'طيران مباشر دولي ذهاباً وإياباً (درجة سياحية)' },
      { en: '3 nights — Mercure Sochi Centre 4★ (Black Sea side, city centre)', ar: '٣ ليالٍ — ميركيور سوتشي سنتر ٤★ (جانب البحر الأسود، وسط المدينة)' },
      { en: '3 nights — Panorama Krasnaya Polyana by Mercure 4★ (mountain resort)', ar: '٣ ليالٍ — بانوراما كراسنايا بوليانا باي ميركيور ٤★ (منتجع جبلي)' },
      { en: 'Airport reception & farewell group transfers (both directions)', ar: 'استقبال وتوديع في المطار بالنقل الجماعي (الاتجاهان)' },
      { en: 'Inter-hotel group transfer (sea hotel ↔ mountain hotel)', ar: 'نقل جماعي بين الفنادق (فندق البحر ↔ فندق الجبل)' },
      { en: 'Group Tour 1: City sightseeing tour + local farm with hot-air balloon ride + animals', ar: 'الجولة الجماعية ١: جولة المدينة + مزرعة محلية مع رحلة منطاد + حيوانات' },
      { en: 'Group Tour 2: Mountain tour — cable car tickets (Rosa Khutor) + Alpaca farm visit', ar: 'الجولة الجماعية ٢: جولة الجبل — تذاكر التلفريك (روزا خوتور) + زيارة مزرعة الألباكا' },
      { en: 'Group Tour 3: Sochi Park full-day — entrance ticket + dolphin show + circus + all attractions', ar: 'الجولة الجماعية ٣: سوتشي بارك ليوم كامل — تذكرة الدخول + عرض الدلافين + السيرك + جميع الأنشطة' },
      { en: 'Group Tour 4: Sky Park suspension bridge + mountain honey farm + Adler district exploration', ar: 'الجولة الجماعية ٤: جسر سكاي بارك المعلق + مزرعة عسل الجبل + استكشاف منطقة أدلر' },
    ],

    exclusion: [
      { en: 'Russian tourist visa (our team will guide you through the application process)', ar: 'تأشيرة السياحة الروسية (سيرشدك فريقنا خلال عملية التقديم)' },
      { en: 'Meals (breakfast, lunch and dinner — not included unless stated in daily programme)', ar: 'وجبات الطعام (الإفطار والغداء والعشاء — غير مشمولة ما لم يُذكر في البرنامج اليومي)' },
      { en: 'Private excursion vehicles (sedan USD 100/trip — van USD 190/trip, bookable separately)', ar: 'سيارات الجولات الخاصة (سيدان ١٠٠ دولار/رحلة — فان ١٩٠ دولار/رحلة، تُحجز بشكل منفصل)' },
      { en: 'Local SIM card / mobile data (available to purchase via our team)', ar: 'شريحة SIM المحلية / بيانات الجوال (متاحة للشراء عبر فريقنا)' },
      { en: 'Travel insurance (strongly recommended)', ar: 'التأمين على السفر (موصى به بشدة)' },
      { en: 'Personal expenses, shopping, and optional activities', ar: 'النفقات الشخصية والتسوق والأنشطة الاختيارية' },
      { en: 'Gratuities and tips for guides and drivers', ar: 'البقشيش والإكراميات للمرشدين والسائقين' },
    ],

    whatToPack: [
      { en: 'Light summer clothing for the sea (Sochi coast is warm, 25–32°C in July–August)', ar: 'ملابس صيفية خفيفة للبحر (الساحل دافئ، ٢٥–٣٢ درجة في يوليو–أغسطس)' },
      { en: 'A warm layer or jacket for the mountain (Krasnaya Polyana can be 10–15°C cooler)', ar: 'طبقة دافئة أو جاكيت للجبل (كراسنايا بوليانا أبرد بـ١٠–١٥ درجة)' },
      { en: 'Comfortable closed-toe walking shoes for mountain trails and Agura Waterfalls', ar: 'أحذية مريحة مغلقة عند الأصابع لمسارات الجبال وشلالات أغورا' },
      { en: 'Light sandals or flip-flops for the Black Sea beachfront', ar: 'صندل خفيف أو شبشب لشاطئ البحر الأسود' },
      { en: 'Sunscreen SPF 50+ and UV sunglasses', ar: 'كريم حماية من الشمس SPF 50+ ونظارات شمسية' },
      { en: 'Portable power bank and universal travel adapter (Type C sockets in Russia)', ar: 'بنك طاقة محمول ومحول كهربائي (مقابس نوع C في روسيا)' },
      { en: 'Small daypack for excursions and personal items', ar: 'حقيبة ظهر صغيرة للجولات والأغراض الشخصية' },
      { en: 'Modest dress for conservative areas and indoor venues', ar: 'ملابس محتشمة للمناطق المحافظة والأماكن المغلقة' },
    ],

    itinerary: {
      generalDescription: {
        en: 'Your 7-day Sochi adventure is structured to make the most of two very different worlds: the vibrant Black Sea coast with its city energy and the serene, dramatic Caucasus mountain landscape. The first half is based at your sea hotel, giving you the city, the sea, and the theme park. The second half moves to your mountain hotel, unlocking the cable car, the peaks, and the forest adventures.',
        ar: 'رحلتك المدتها ٧ أيام في سوتشي مُصممة للاستفادة القصوى من عالمين مختلفين تماماً: الساحل الحيوي للبحر الأسود بطاقته وحيويته، والمشهد الجبلي الهادئ والمهيب لجبال القوقاز. النصف الأول يعتمد على فندق البحر، مما يمنحك المدينة والبحر ومدينة الألعاب. النصف الثاني ينقلك إلى فندق الجبل لتفتح أمامك التلفريك والقمم ومغامرات الغابات.',
      },
      days: [
        {
          day: 1,
          title: { en: 'Arrival in Sochi — Welcome to the Russian Riviera', ar: 'الوصول إلى سوتشي — مرحباً بك في الريفيرا الروسية' },
          description: {
            en: 'Your direct flight lands at Sochi International Airport (AER), situated in the Adler district. Our representative will be waiting in arrivals holding a board with your name. Transfer by group vehicle to Mercure Sochi Centre, your 4-star sea hotel located in the heart of the city. Check in, refresh, and spend the remainder of the day at leisure — take your first walk along the Black Sea Corniche, enjoy the sea air, and discover the city at your own pace. A briefing on your tour programme will be provided by your group leader at the hotel.',
            ar: 'تهبط رحلتك المباشرة في مطار سوتشي الدولي (AER) الواقع في منطقة أدلر. سيكون ممثلنا في انتظارك في صالة الوصول بلافتة تحمل اسمك. انتقل بالمركبة الجماعية إلى ميركيور سوتشي سنتر، فندقك ذو الأربع نجوم على البحر في قلب المدينة. سجّل وصولك وتجدد، وأمضِ بقية اليوم كما تشاء — استمتع بأول نزهة على كورنيش البحر الأسود واستنشق هواء البحر واستكشف المدينة على مهلك. سيُقدم لك قائد المجموعة في الفندق إحاطة بالبرنامج السياحي.',
          },
          activities: [
            {
              heading: { en: 'Airport Reception & Group Transfer', ar: 'الاستقبال في المطار والنقل الجماعي' },
              description: { en: 'VIP meet-and-greet at Sochi International Airport (AER). Private group coach to Mercure Sochi Centre. Hotel check-in and room orientation.', ar: 'استقبال VIP في مطار سوتشي الدولي (AER). حافلة جماعية خاصة إلى ميركيور سوتشي سنتر. تسجيل الوصول وجولة التعرف على الفندق.' },
            },
            {
              heading: { en: 'Black Sea Corniche — First Impressions', ar: 'كورنيش البحر الأسود — الانطباعات الأولى' },
              description: { en: 'Stroll the iconic seafront promenade, admire the famous Sochi Sea Terminal building, and settle into the pace of this unique Russian coastal city.', ar: 'تنزه على الممشى البحري الأيقوني، وأعجب بمبنى محطة سوتشي البحرية الشهيرة، وتعرف على إيقاع هذه المدينة الساحلية الروسية الفريدة.' },
            },
          ],
        },
        {
          day: 2,
          title: { en: 'Sochi City Tour + Local Farm — Hot-Air Balloon & Animals', ar: 'جولة مدينة سوتشي + مزرعة محلية — منطاد هوائي وحيوانات' },
          description: {
            en: 'A full-day group tour reveals the best of Sochi\'s city highlights. Your guide takes you to the Olympic Park — the stunning legacy of the 2014 Winter Games — where you\'ll see the iconic Bolshoy Ice Dome, the Fisht Olympic Stadium, and the famous Torch. Explore the breathtaking botanical gardens of Dendrarium Park, a subtropical paradise of over 1,800 plant species spread across elegant terraced hillsides overlooking the sea. The afternoon visits a traditional Caucasian working farm, where you\'ll soar in a tethered hot-air balloon for aerial views of the surrounding countryside, and have close encounters with farm animals including deer, peacocks, horses, and goats. An unforgettable experience for families and first-time visitors alike.',
            ar: 'جولة جماعية ليوم كامل تكشف أبرز معالم مدينة سوتشي. يأخذك مرشدك إلى الحديقة الأولمبية — الإرث المذهل لألعاب الشتاء 2014 — حيث ترى القبة الجليدية الأيقونية وملعب فيشت الأولمبي والشعلة الشهيرة. استكشف الحدائق النباتية الخلابة في دندراريوم بارك، جنة استوائية تضم أكثر من ١٨٠٠ نوع نباتي على مدرجات أنيقة تطل على البحر. بعد الظهر في مزرعة قوقازية عاملة، ستحلق في منطاد هوائي مربوط للاستمتاع بإطلالات جوية على الريف المحيط، مع تجارب مقربة مع الحيوانات الزراعية.',
          },
          activities: [
            {
              heading: { en: 'Olympic Park & Fisht Stadium', ar: 'الحديقة الأولمبية وملعب فيشت' },
              description: { en: 'Legacy of the 2014 Winter Olympics — the Bolshoy Ice Dome, Fisht Stadium, the Olympic Flame Torch, and the Formula 1 Sochi Autodrom circuit.', ar: 'إرث أولمبياد الشتاء 2014 — القبة الجليدية الأيقونية وملعب فيشت وشعلة أولمبية وحلبة الفورمولا 1.' },
            },
            {
              heading: { en: 'Dendrarium Park — Subtropical Botanical Garden', ar: 'دندراريوم بارك — الحديقة النباتية الاستوائية' },
              description: { en: 'Over 1,800 plant species from 50+ countries — a terraced Mediterranean hillside garden with funicular access and panoramic sea views.', ar: 'أكثر من ١٨٠٠ نوع نباتي من ٥٠+ دولة — حديقة متوسطية مدرجة مع وصول بالفونيكولار وإطلالات بانورامية على البحر.' },
            },
            {
              heading: { en: 'Local Farm: Hot-Air Balloon + Animals', ar: 'المزرعة المحلية: منطاد هوائي + حيوانات' },
              description: { en: 'Tethered balloon ascent for aerial countryside views. Close encounters with peacocks, horses, deer, goats, and more at a charming working Caucasian farm.', ar: 'صعود بالمنطاد المربوط للاستمتاع بإطلالات جوية. تجارب مقربة مع الطواويس والخيول والغزلان والماعز في مزرعة قوقازية عاملة.' },
            },
          ],
        },
        {
          day: 3,
          title: { en: 'Sochi Park — Dolphin Show, Circus & Full Family Day', ar: 'سوتشي بارك — عرض الدلافين والسيرك ويوم عائلي كامل' },
          description: {
            en: 'Today is dedicated entirely to Sochi Park — Russia\'s largest and most acclaimed theme park, located in the Olympic Park complex in Adler. Your included group ticket grants access to the full park, which spans an extraordinary Russian fairy-tale themed landscape. Highlights include the world-class Sochi Dolphinarium, home to bottlenose dolphins and beluga whales performing spectacular shows; the Sochi Circus with its breathtaking acrobatic and animal acts; thrilling roller coasters and amusement rides; plus walking tours of the elaborately themed park streets inspired by Russian folk tales. Allow yourself a full day — there is genuinely enough to fill every hour. Halal food options are available within the park.',
            ar: 'اليوم مخصص بالكامل لسوتشي بارك — أكبر وأشهر مدينة ترفيه في روسيا، الواقعة في مجمع الحديقة الأولمبية في أدلر. تذكرة مجموعتك المشمولة تمنحك الوصول إلى المنتزه الكامل الممتد عبر مشهد طبيعي روسي خيالي رائع. الأبرز يتضمن محمية الدلافين العالمية في سوتشي مع عروض الدلافين ذوات الأنف الزجاجية والحيتان البيضاء؛ سيرك سوتشي بعروضه الأكروباتية والحيوانية المذهلة؛ ألعاب الدوامات والمغامرات المثيرة؛ إضافة إلى جولات في شوارع المنتزه المُصممة بإلهام من حكايات الشعب الروسي.',
          },
          activities: [
            {
              heading: { en: 'Sochi Dolphinarium', ar: 'محمية الدلافين في سوتشي' },
              description: { en: 'World-class shows with bottlenose dolphins, beluga whales, and sea lions — one of Russia\'s best dolphinariums.', ar: 'عروض عالمية المستوى مع الدلافين ذوات الأنف الزجاجية والحيتان البيضاء وأسود البحر — من أفضل محميات الدلافين في روسيا.' },
            },
            {
              heading: { en: 'Sochi Circus', ar: 'سيرك سوتشي' },
              description: { en: 'Spectacular acrobatic performances, trained animals, and stage magic inside a purpose-built circus arena.', ar: 'عروض أكروباتية مذهلة وحيوانات مدربة وسحر على المسرح داخل ساحة سيرك مُصممة خصيصاً.' },
            },
            {
              heading: { en: 'Theme Park Rides & Russian Fairy-Tale Streets', ar: 'ألعاب المنتزه وشوارع الخيال الروسي' },
              description: { en: 'Rollercoasters, family rides, themed retail lanes inspired by Russian folklore — enough for a full entertaining day.', ar: 'دوامات ومغامرات عائلية وأزقة تجارية مزينة بالفولكلور الروسي — ما يكفي ليوم كامل ممتع.' },
            },
          ],
        },
        {
          day: 4,
          title: { en: 'Transfer to the Mountains — Krasnaya Polyana & Panorama Hotel', ar: 'الانتقال إلى الجبال — كراسنايا بوليانا وفندق بانوراما' },
          description: {
            en: 'After breakfast, your group transfers from the coast to the mountains — a scenic 90-minute drive (approx. 60 km) through increasingly dramatic Caucasus foothills that builds genuine anticipation. Your destination is Krasnaya Polyana — the mountain capital of Sochi and the jewel of Russia\'s skiing and resort culture, located at roughly 550 metres altitude with peaks rising to 2,320 metres above you. Check in to Panorama Krasnaya Polyana by Mercure, a stylish 4-star mountain resort where floor-to-ceiling windows frame the Caucasus peaks and valley below. Spend the afternoon exploring the mountain village at your leisure — boutique shops, Caucasian restaurants, riverside promenades, and the fresh, clear mountain air that feels a world away from the coast. Evening is free for dinner and mountain atmosphere.',
            ar: 'بعد الإفطار، ينتقل فريقك من الساحل إلى الجبال — رحلة بانورامية تستغرق حوالي ٩٠ دقيقة (حوالي ٦٠ كيلومتر) عبر سفوح جبال القوقاز المتصاعدة الدراما مما يولد توقعاً حقيقياً. وجهتك كراسنايا بوليانا — عاصمة الجبال في سوتشي وجوهرة ثقافة التزلج والمنتجعات في روسيا على ارتفاع ٥٥٠ متراً تقريباً مع قمم تصل إلى ٢٣٢٠ متراً فوقك. سجّل وصولك في بانوراما كراسنايا بوليانا باي ميركيور، منتجع جبلي أنيق من فئة أربع نجوم حيث تُؤطر النوافذ الممتدة من الأرض إلى السقف قمم القوقاز والوادي أدناك.',
          },
          activities: [
            {
              heading: { en: 'Scenic Group Transfer: Sea → Mountain (90 min)', ar: 'نقل جماعي بانورامي: البحر ← الجبل (٩٠ دقيقة)' },
              description: { en: 'Comfortable group coach transfer through the Mzymta River valley — the same route used during the 2014 Winter Olympics.', ar: 'نقل بحافلة جماعية مريحة عبر وادي نهر مزيمتا — نفس المسار المستخدم خلال أولمبياد الشتاء 2014.' },
            },
            {
              heading: { en: 'Panorama by Mercure — Check-in & Mountain Orientation', ar: 'بانوراما باي ميركيور — تسجيل الوصول والتعرف على الجبل' },
              description: { en: 'Check into your 4-star mountain resort. Floor-to-ceiling panoramic windows, mountain spa, and mountain-style cuisine at the hotel restaurant.', ar: 'تسجيل الوصول في منتجعك الجبلي ٤ نجوم. نوافذ بانورامية ممتدة، سبا جبلي، ومطبخ جبلي في مطعم الفندق.' },
            },
            {
              heading: { en: 'Krasnaya Polyana Village — Free Evening Exploration', ar: 'قرية كراسنايا بوليانا — استكشاف مسائي حر' },
              description: { en: 'Boutique shops, Caucasian restaurants, and riverside boardwalks in one of Russia\'s most charming mountain resort villages.', ar: 'متاجر فريدة ومطاعم قوقازية وممشيات على ضفاف النهر في واحدة من أكثر قرى المنتجعات الجبلية سحراً في روسيا.' },
            },
          ],
        },
        {
          day: 5,
          title: { en: 'Rosa Khutor Cable Car + Alpaca Farm — On Top of the Caucasus', ar: 'تلفريك روزا خوتور + مزرعة الألباكا — في قمة جبال القوقاز' },
          description: {
            en: 'Today is the centrepiece of your mountain days — an included group tour that begins at Rosa Khutor, the premier Olympic ski resort that hosted the alpine skiing and freestyle skiing events of the 2014 Winter Olympics. Board the cable car and ascend through five stages to Rosa Peak at 2,320 metres — the highest accessible viewpoint in the Sochi region. On clear days, the panorama stretches from the snowy Caucasus summits all the way to the Black Sea coast — a view that will be permanently etched in your memory. After descending, the tour continues to the delightful Alpaca Farm of Krasnaya Polyana, where you\'ll meet, feed, and photograph a herd of these gentle, photogenic Andean animals living happily in the Caucasian highland air. A truly unexpected and joyful contrast to the mountain grandeur.',
            ar: 'اليوم هو محور أيامك الجبلية — جولة جماعية مشمولة تبدأ في روزا خوتور، المنتجع الجبلي الأولمبي الأول الذي استضاف فعاليات التزلج الجبلي والحر في أولمبياد الشتاء 2014. اصعد بالتلفريك عبر خمس محطات إلى قمة روزا على ارتفاع ٢٣٢٠ متراً — أعلى نقطة يمكن الوصول إليها في منطقة سوتشي. في الأيام الصافية، تمتد البانوراما من قمم القوقاز المكللة بالثلج وصولاً إلى ساحل البحر الأسود — مشهد سيُحفر في ذاكرتك للأبد. بعد النزول، تتواصل الجولة إلى مزرعة الألباكا الرائعة في كراسنايا بوليانا.',
          },
          activities: [
            {
              heading: { en: 'Rosa Khutor Cable Car — Rosa Peak (2,320 m)', ar: 'تلفريك روزا خوتور — قمة روزا (٢٣٢٠ م)' },
              description: { en: 'Five-stage gondola ascent to 2,320 m. Panoramic views over the Caucasus range and the Black Sea. Olympic ski runs visible from the summit.', ar: 'صعود بالغندولا في خمس مراحل إلى ٢٣٢٠ م. إطلالات بانورامية على سلسلة القوقاز والبحر الأسود. مسارات التزلج الأولمبية مرئية من القمة.' },
            },
            {
              heading: { en: 'Krasnaya Polyana Alpaca Farm', ar: 'مزرعة الألباكا في كراسنايا بوليانا' },
              description: { en: 'Meet and feed a herd of South American Alpacas living in the Caucasus highlands. Perfect for families and photography enthusiasts.', ar: 'تعرف على قطيع من الألباكا الأمريكية الجنوبية التي تعيش في مرتفعات القوقاز وأطعمها. مثالي للعائلات وعشاق التصوير.' },
            },
          ],
        },
        {
          day: 6,
          title: { en: 'Sky Park + Honey Farm + Adler — Adventure Meets Nature', ar: 'سكاي بارك + مزرعة العسل + أدلر — المغامرة تلتقي بالطبيعة' },
          description: {
            en: 'Your final full day delivers a thrilling mix of adventure, natural beauty, and authentic Caucasian culture. Begin at Sky Park AJ Hackett Sochi — home to the world\'s longest pedestrian suspension bridge (439 metres) swaying high above the stunning Mzymta River gorge, with the forested Caucasus mountains framing every step. Adrenaline seekers can opt for bungee jumping or zip-lining (at additional cost). The park also features platforms and viewpoints that are perfectly family-friendly. Next, visit a traditional Caucasian honey farm — one of the most unique and charming experiences of the entire trip. Taste a dazzling variety of mountain honeys infused with local herbs and flowers, learn about centuries-old Caucasian beekeeping methods, and take home a jar of the region\'s finest honey. The tour closes with an exploration of Adler — the cosmopolitan seaside district adjacent to the airport — with its palm-lined promenade, seafront cafés, and bustling local market.',
            ar: 'يومك الأخير الكامل يقدم مزيجاً مثيراً من المغامرة والجمال الطبيعي والثقافة القوقازية الأصيلة. ابدأ في سكاي بارك AJ هاكيت سوتشي — موطن أطول جسر مشاة معلق في العالم (٤٣٩ متراً) يتأرجح فوق وادي نهر مزيمتا المذهل، مع جبال القوقاز المغطاة بالغابات تُؤطر كل خطوة. يمكن للمغامرين اختيار القفز بالحبال الدوارة أو الانزلاق بالزيب لاين (بتكلفة إضافية). ثم زيارة مزرعة عسل قوقازية تقليدية — واحدة من أكثر التجارب تميزاً في الرحلة بأكملها. تذوق مجموعة رائعة من عسل الجبال المنكّهة بالأعشاب والزهور المحلية وتعلم أساليب تربية النحل القوقازية العريقة.',
          },
          activities: [
            {
              heading: { en: 'Sky Park AJ Hackett — World\'s Longest Suspension Bridge', ar: 'سكاي بارك AJ هاكيت — أطول جسر معلق في العالم' },
              description: { en: '439-metre pedestrian suspension bridge over the Mzymta River gorge. Optional bungee jumping and zip-lining available at extra cost.', ar: 'جسر مشاة معلق بطول ٤٣٩ متراً فوق وادي نهر مزيمتا. القفز بالحبال الدوارة والزيب لاين الاختياريان بتكلفة إضافية.' },
            },
            {
              heading: { en: 'Traditional Caucasian Honey Farm', ar: 'مزرعة العسل القوقازية التقليدية' },
              description: { en: 'Taste mountain honeys (wildflower, linden, chestnut, alpine herbs), meet the beekeeper, and purchase artisan honey products to take home.', ar: 'تذوق عسل الجبال (الزهور البرية، الزيزفون، الكستناء، أعشاب الجبال)، قابل النحّال، واشترِ منتجات العسل الحرفية للمنزل.' },
            },
            {
              heading: { en: 'Adler District Exploration', ar: 'استكشاف منطقة أدلر' },
              description: { en: 'Palm-lined seafront promenade, local market, and seaside cafés in Sochi\'s most cosmopolitan coastal district — perfect for final souvenir shopping.', ar: 'ممشى بحري مبطّن بالنخيل وسوق محلي ومقاهٍ على شاطئ البحر في أكثر أحياء سوتشي الساحلية عالمية — مثالي لتسوق الهدايا التذكارية الأخيرة.' },
            },
          ],
        },
        {
          day: 7,
          title: { en: 'Farewell Sochi — Transfer to Airport & Departure', ar: 'وداع سوتشي — التنقل إلى المطار والمغادرة' },
          description: {
            en: 'Check out from Panorama Krasnaya Polyana by Mercure after breakfast. Your group coach transfers you back through the scenic Mzymta Valley to Sochi International Airport in Adler. Depending on your flight time, there may be time for last-minute shopping or a final coffee with Black Sea views at the airport. You depart Sochi with the dual sensation of mountain peaks and sea breeze — a combination found nowhere else in Russia. We hope to welcome you back to this extraordinary destination.',
            ar: 'غادر فندق بانوراما كراسنايا بوليانا باي ميركيور بعد الإفطار. تنقلك حافلة المجموعة عبر وادي مزيمتا البانورامي إلى مطار سوتشي الدولي في أدلر. بحسب موعد رحلتك، قد يتسع الوقت للتسوق اللحظي الأخير أو قهوة أخيرة مع إطلالات البحر الأسود في المطار. تغادر سوتشي بمزيج المشاعر الفريد — قمم الجبال ونسيم البحر — تناسق لا يوجد في مكان آخر في روسيا. نتطلع لاستقبالك مجدداً في هذه الوجهة الاستثنائية.',
          },
          activities: [
            {
              heading: { en: 'Hotel Check-out & Group Transfer to Airport', ar: 'مغادرة الفندق والنقل الجماعي إلى المطار' },
              description: { en: 'Group coach transfer from Krasnaya Polyana through the Mzymta Valley to Sochi International Airport (AER). Check-in and departure.', ar: 'نقل بحافلة جماعية من كراسنايا بوليانا عبر وادي مزيمتا إلى مطار سوتشي الدولي (AER). تسجيل المغادرة والإقلاع.' },
            },
          ],
        },
      ],
    },

    faqs: [
      {
        question: { en: 'Do I need a visa to enter Russia?', ar: 'هل أحتاج إلى تأشيرة لدخول روسيا؟' },
        answer: {
          en: 'Yes, most nationalities require a Russian tourist visa. Our team will provide full guidance on the application process, required documents, and timing. Processing typically takes 7–15 business days. We strongly recommend starting the visa process at least 4–6 weeks before your departure date.',
          ar: 'نعم، تحتاج معظم الجنسيات إلى تأشيرة سياحية روسية. سيزودك فريقنا بإرشادات كاملة حول عملية التقديم والوثائق المطلوبة والتوقيت. تستغرق المعالجة عادةً ٧–١٥ يوم عمل. ننصح بشدة ببدء إجراءات التأشيرة قبل ٤–٦ أسابيع على الأقل من موعد مغادرتك.',
        },
      },
      {
        question: { en: 'What is the weather like in Sochi in summer?', ar: 'كيف يكون الطقس في سوتشي في الصيف؟' },
        answer: {
          en: 'Sochi coast in summer (June–August) is warm and sunny with temperatures of 25–32°C and a refreshing Black Sea breeze. The mountain area (Krasnaya Polyana) is noticeably cooler — typically 15–22°C — making it a perfect escape from summer heat. Pack both summer clothes and a light jacket.',
          ar: 'ساحل سوتشي في الصيف (يونيو–أغسطس) دافئ ومشمس مع درجات حرارة ٢٥–٣٢ درجة ونسيم منعش من البحر الأسود. المنطقة الجبلية (كراسنايا بوليانا) أبرد ملحوظاً — عادةً ١٥–٢٢ درجة — مما يجعلها هروباً مثالياً من حرارة الصيف. احرص على إحضار ملابس صيفية وجاكيت خفيف.',
        },
      },
      {
        question: { en: 'Is halal food available in Sochi?', ar: 'هل يتوفر طعام حلال في سوتشي؟' },
        answer: {
          en: 'Yes — Sochi has a significant Muslim community from the Caucasus region, and halal restaurants are relatively easy to find. Notable options include Kavkaz Sky Aul (traditional Caucasian), Sultan Restaurant (Turkish cuisine), Mamai Kale (seafood), Vostok Cafe (Uzbek), Shafran Restaurant, Chaikhana No. 1 (Central Asian), and Khinkali House (Georgian). Always confirm the halal certification directly with the restaurant when you visit.',
          ar: 'نعم — لدى سوتشي مجتمع مسلم كبير من منطقة القوقاز، والمطاعم الحلال يمكن العثور عليها بسهولة نسبية. من أبرز الخيارات: كافكاز سكاي آول (مطبخ قوقازي)، مطعم سلطان (تركي)، ماماي كاليه (مأكولات بحرية)، فوستوك كافيه (أوزبكي)، شافران ريستوران، جايخانا نمبر ١ (آسيا الوسطى)، وخينكالي هاوس (جورجي). تحقق دائماً من شهادة الحلال مع المطعم مباشرةً عند زيارتك.',
        },
      },
      {
        question: { en: 'Can I book private excursions in addition to the group tours?', ar: 'هل يمكنني حجز جولات خاصة بالإضافة إلى الجولات الجماعية؟' },
        answer: {
          en: 'Absolutely. Private excursion vehicles are available at additional cost: Sedan (max 3 persons) for USD 100 per excursion, and Mercedes Van (max 6 persons) for USD 190 per excursion. These are ideal for visiting sites not covered by the group tours, or for a more flexible and personalised schedule. Book via our team in advance.',
          ar: 'بالتأكيد. تتوفر سيارات الجولات الخاصة بتكلفة إضافية: سيدان (بحد أقصى ٣ أشخاص) بـ١٠٠ دولار للجولة، ومرسيدس فان (بحد أقصى ٦ أشخاص) بـ١٩٠ دولار للجولة. مثالية لزيارة مواقع غير مشمولة في الجولات الجماعية، أو للحصول على جدول أكثر مرونة وتخصيصاً. احجز عبر فريقنا مسبقاً.',
        },
      },
      {
        question: { en: 'What are the two hotels and where are they located?', ar: 'ما هي الفندقان وأين يقعان؟' },
        answer: {
          en: 'Your package includes two Accor Mercure 4-star properties: (1) Mercure Sochi Centre — located in the heart of Sochi city, within walking distance of the Black Sea Corniche, the sea terminal, and the main city attractions. (2) Panorama Krasnaya Polyana by Mercure — positioned in the Krasnaya Polyana mountain resort area, 60 km from the city, at the base of the Rosa Khutor cable car system with stunning mountain views from every room.',
          ar: 'تشمل باقتك فندقين من سلسلة ميركيور أكور ٤ نجوم: (١) ميركيور سوتشي سنتر — في قلب مدينة سوتشي، على مسافة قصيرة سيراً من كورنيش البحر الأسود والمحطة البحرية وأبرز معالم المدينة. (٢) بانوراما كراسنايا بوليانا باي ميركيور — في منطقة منتجع كراسنايا بوليانا الجبلية، ٦٠ كيلومتراً من المدينة، عند قاعدة منظومة تلفريك روزا خوتور مع إطلالات جبلية خلابة من كل غرفة.',
        },
      },
      {
        question: { en: 'Is Sochi family-friendly?', ar: 'هل سوتشي مناسبة للعائلات؟' },
        answer: {
          en: 'Sochi is one of Russia\'s most family-friendly destinations. Sochi Park offers a full day of entertainment for all ages including rides, shows, and performances. The Alpaca Farm and hot-air balloon experience are beloved by children. The Black Sea beach is gentle and safe. The mountain cable car is suitable for all ages. The cooler mountain temperatures provide a welcome break from Gulf summer heat, making it an ideal choice for families travelling with children.',
          ar: 'سوتشي من أكثر الوجهات الروسية ملاءمةً للعائلات. يقدم سوتشي بارك يوماً كاملاً من الترفيه لجميع الأعمار يشمل الألعاب والعروض والفعاليات. تجربة مزرعة الألباكا والمنطاد محبوبة لدى الأطفال. شاطئ البحر الأسود هادئ وآمن. تلفريك الجبل مناسب لجميع الأعمار. ودرجات الحرارة الجبلية المنخفضة توفر راحة مرحّب بها من حرارة صيف الخليج، مما يجعلها خياراً مثالياً للعائلات التي تسافر مع الأطفال.',
        },
      },
    ],

    tourHighlights: [
      { en: 'Soar above the Caucasus countryside in a tethered hot-air balloon at a traditional farm', ar: 'حلّق فوق ريف القوقاز في منطاد هوائي مربوط في مزرعة تقليدية' },
      { en: 'Ascend to 2,320 m on the Rosa Khutor cable car — Russia\'s #1 Olympic mountain resort', ar: 'ارتقِ إلى ٢٣٢٠ متراً بتلفريك روزا خوتور — منتجع الجبال الأولمبي الأول في روسيا' },
      { en: 'Meet Alpacas at a charming mountain farm perched above the Caucasus clouds', ar: 'تعرف على الألباكا في مزرعة جبلية ساحرة معلقة فوق سحاب القوقاز' },
      { en: 'Full day at Sochi Park — dolphin shows, live circus & family rides all included', ar: 'يوم كامل في سوتشي بارك — عروض الدلافين والسيرك الحي وألعاب العائلة كلها مشمولة' },
      { en: 'Cross the world\'s longest pedestrian suspension bridge at Sky Park over a dramatic gorge', ar: 'اعبر أطول جسر مشاة معلق في العالم في سكاي بارك فوق وادٍ درامي' },
      { en: 'Taste authentic Caucasian mountain honey at a traditional highland beekeeper\'s farm', ar: 'تذوق عسل القوقاز الجبلي الأصيل في مزرعة نحال هايلاند تقليدية' },
      { en: 'Stroll Sochi\'s iconic Black Sea Corniche — cafés, yachts, and Soviet-era architecture', ar: 'تنزه على كورنيش البحر الأسود الأيقوني — مقاهٍ ويخوت وعمارة الحقبة السوفيتية' },
      { en: 'Stay in two iconic 4-star Mercure hotels — sea city luxury and mountain resort magic', ar: 'أقم في فندقين أيقونيين من ميركيور ٤ نجوم — فخامة مدينة البحر وسحر المنتجع الجبلي' },
    ],

    whatYouWillLoveHtml: {
      en: `<ul>
        <li>Waking up to Black Sea views at Mercure Sochi Centre and mountain panoramas at Panorama Krasnaya Polyana</li>
        <li>The rush of a hot-air balloon ascent above the Caucasian countryside on Day 2</li>
        <li>Standing at 2,320 metres on Rosa Peak with the entire Caucasus range spread before you</li>
        <li>The joy on children\'s faces at the Alpaca Farm and Sochi Park dolphin show</li>
        <li>Crossing the swaying Sky Park bridge above the Mzymta River gorge — a rush of pure adventure</li>
        <li>Tasting the most extraordinary mountain honey you\'ve ever experienced</li>
        <li>Discovering that Sochi is nothing like you expected Russia to be</li>
        <li>Leaving with memories of both mountain peaks and warm sea breeze — two worlds, one unforgettable trip</li>
      </ul>`,
      ar: `<ul>
        <li>الاستيقاظ على إطلالات البحر الأسود في ميركيور سوتشي سنتر وبانوراما الجبال في بانوراما كراسنايا بوليانا</li>
        <li>إثارة صعود المنطاد الهوائي فوق ريف القوقاز في اليوم الثاني</li>
        <li>الوقوف على ارتفاع ٢٣٢٠ متراً في قمة روزا ومجموعة القوقاز بأسرها منتشرة أمامك</li>
        <li>فرحة الأطفال في مزرعة الألباكا وعرض الدلافين في سوتشي بارك</li>
        <li>عبور الجسر المتأرجح في سكاي بارك فوق وادي نهر مزيمتا — إثارة مغامرة حقيقية</li>
        <li>تذوق أروع عسل جبلي عشته على الإطلاق</li>
        <li>اكتشاف أن سوتشي ليست كما توقعت روسيا أن تكون</li>
        <li>المغادرة بذكريات قمم الجبال ونسيم البحر الدافئ معاً — عالمان في رحلة لا تُنسى واحدة</li>
      </ul>`,
    },

    relatedTours: [
      {
        id: 'moscow-red-square-kremlin-tour',
        title: { en: 'Moscow: Red Square, Kremlin & Metro Tour', ar: 'موسكو: الميدان الأحمر والكرملين وجولة المترو' },
      },
      {
        id: 'st-petersburg-hermitage-palace-tour',
        title: { en: 'St. Petersburg: Hermitage & Palace Square', ar: 'سانت بطرسبرغ: الإرميتاج وميدان القصر' },
      },
      {
        id: 'turkey-cappadocia-balloon-tour',
        title: { en: 'Turkey: Cappadocia Hot-Air Balloon & Cave Hotels', ar: 'تركيا: منطاد كابادوكيا والفنادق الكهفية' },
      },
    ],

    reviews: [
      {
        type: 'text',
        title: { en: 'Exceeded Every Expectation', ar: 'تجاوز كل التوقعات' },
        content: {
          en: 'We\'d never considered Russia for a holiday, but Sochi was an absolute revelation. The mountain hotel was breathtaking, the group tours were perfectly organized, and the cable car up to Rosa Peak left our whole family speechless. The price was also far better than comparable European trips.',
          ar: 'لم نكن قد فكرنا يوماً في روسيا كوجهة سياحية، لكن سوتشي كانت مفاجأة مطلقة. فندق الجبل كان رائعاً، والجولات الجماعية منظمة بشكل ممتاز، والتلفريك إلى قمة روزا أبكم عائلتنا بأكملها. والسعر كان أفضل بكثير من الرحلات الأوروبية المماثلة.',
        },
      },
      {
        type: 'text',
        title: { en: 'Best Family Summer Trip', ar: 'أفضل رحلة عائلية صيفية' },
        content: {
          en: 'Our kids are still talking about the Alpacas and the dolphin show at Sochi Park. The balloon at the farm was unforgettable. Having both the sea hotel and the mountain hotel in one trip is genius — the kids loved the variety. Will definitely book again.',
          ar: 'لا يزال أطفالنا يتحدثون عن الألباكا وعرض الدلافين في سوتشي بارك. المنطاد في المزرعة كان لا يُنسى. الجمع بين فندق البحر وفندق الجبل في رحلة واحدة فكرة عبقرية — أحب الأطفال التنوع. سنحجز بالتأكيد مرة أخرى.',
        },
      },
      {
        type: 'text',
        title: { en: 'Hidden Gem for Gulf Travellers', ar: 'جوهرة خفية لمسافري الخليج' },
        content: {
          en: 'The weather was perfect — about 28°C on the coast and a lovely 18°C in the mountains. Much more relaxed than Turkey or Europe in summer. The halal restaurants were easy to find, and the Sky Park bridge was genuinely one of the most thrilling things I\'ve ever done. Highly recommended.',
          ar: 'كان الطقس مثالياً — حوالي ٢٨ درجة على الساحل و١٨ درجة رائعة في الجبال. أكثر راحةً من تركيا أو أوروبا في الصيف. المطاعم الحلال كانت سهلة العثور عليها، وجسر سكاي بارك كان بصدق أحد أكثر الأشياء إثارة التي فعلتها على الإطلاق. أنصح به بشدة.',
        },
      },
    ],

    tags: [
      { en: 'Russia Tours', ar: 'جولات روسيا' },
      { en: 'Sochi', ar: 'سوتشي' },
      { en: 'Black Sea', ar: 'البحر الأسود' },
      { en: 'Krasnaya Polyana', ar: 'كراسنايا بوليانا' },
      { en: 'Rosa Khutor', ar: 'روزا خوتور' },
      { en: 'Mountain Holidays', ar: 'عطل جبلية' },
      { en: 'Cable Car', ar: 'تلفريك' },
      { en: 'Family Holidays', ar: 'عطل عائلية' },
      { en: 'Adventure Travel', ar: 'سياحة مغامرة' },
      { en: 'Summer Escape', ar: 'هروب صيفي' },
      { en: 'Sochi Park', ar: 'سوتشي بارك' },
      { en: 'Dolphin Show', ar: 'عرض الدلافين' },
    ],

    notes: [
      {
        title: { en: 'Visa Requirement — Act Early', ar: 'متطلبات التأشيرة — ابدأ مبكراً' },
        text: {
          en: 'A Russian tourist visa is required for most Arab nationalities. Processing time is typically 7–15 business days. Please contact our team immediately upon booking — we will guide you through the complete documentation process. Do not leave the visa to the last minute.',
          ar: 'مطلوب تأشيرة سياحة روسية لمعظم الجنسيات العربية. تستغرق المعالجة عادةً ٧–١٥ يوم عمل. يرجى التواصل مع فريقنا فور الحجز — سنرشدك خلال عملية التوثيق الكاملة. لا تترك التأشيرة للحظة الأخيرة.',
        },
      },
      {
        title: { en: 'Halal Food Advisory', ar: 'إرشاد طعام حلال' },
        text: {
          en: 'Sochi has a sizeable Muslim-Caucasian community and halal restaurants are available. Recommended options: Kavkaz Sky Aul, Sultan Restaurant, Mamai Kale, Vostok Cafe, Shafran Restaurant, Chaikhana No.1, and Khinkali House. Always verify halal certification directly with the restaurant at time of visit.',
          ar: 'يضم سوتشي مجتمعاً مسلماً قوقازياً كبيراً وتتوفر مطاعم حلال. الخيارات الموصى بها: كافكاز سكاي آول، مطعم سلطان، ماماي كاليه، فوستوك كافيه، شافران ريستوران، جايخانا نمبر ١، وخينكالي هاوس. تحقق دائماً من شهادة الحلال مع المطعم مباشرةً عند الزيارة.',
        },
      },
      {
        title: { en: 'Shopping in Sochi', ar: 'التسوق في سوتشي' },
        text: {
          en: 'Sochi\'s main shopping destinations: MoreMall Sochi (largest mall in the city), Mandarin Mall (open-air complex near the seafront), and local mountain markets for authentic Caucasian honey, mountain herbs, Russian souvenirs, and artisan crafts. Prices are significantly lower than Moscow and most European tourist cities.',
          ar: 'أبرز وجهات التسوق في سوتشي: موريمول سوتشي (أكبر مول في المدينة)، ماندارين مول (مجمع مفتوح بالقرب من الواجهة البحرية)، والأسواق الجبلية المحلية للعسل القوقازي الأصيل والأعشاب الجبلية والهدايا الروسية والحرف اليدوية. الأسعار أقل بكثير من موسكو وأغلب المدن السياحية الأوروبية.',
        },
      },
    ],

    tourDocuments: [
      {
        url: '/uploads/tours/russia/sochi-flight-schedule.png',
        label: { en: 'Flight Schedule & Departure Dates', ar: 'جدول الرحلات وتواريخ المغادرة' },
      },
      {
        url: '/uploads/tours/russia/sochi-main-banner.png',
        label: { en: 'Sochi Tour Marketing Banner', ar: 'البانر التسويقي لجولة سوتشي' },
      },
    ],

    // Gallery videos — local MP4 clips from رحلة روسيا/gallory
    tourVideos: [
      '/uploads/tours/russia/sochi-video-1.mp4',
      '/uploads/tours/russia/sochi-video-2.mp4',
    ],

    reviewsCount: 89,
    averageRating: 4.9,
    isActive: true,
    isFeatured: true,
    viewCount: 2617,

    seo: {
      metaTitle: {
        en: 'Sochi Russia Tour: Black Sea & Caucasus Mountains — 7 Days | Alforsa Gate',
        ar: 'جولة سوتشي روسيا: البحر الأسود وجبال القوقاز — ٧ أيام | بوابة الفرصة',
      },
      metaDescription: {
        en: 'Discover Sochi Russia on a 7-day package — Black Sea coast + Caucasus mountain resort. Direct flights, 2 Mercure hotels, cable car, Sochi Park & 4 group tours included. From USD 950.',
        ar: 'اكتشف سوتشي روسيا في باقة ٧ أيام — ساحل البحر الأسود + منتجع جبال القوقاز. طيران مباشر، فندقان ميركيور، تلفريك، سوتشي بارك، و٤ جولات جماعية مشمولة. من ٩٥٠ دولار.',
      },
      metaKeywords: {
        en: [
          'Sochi Russia tour', 'Sochi holiday package', 'Black Sea Sochi', 'Krasnaya Polyana tour',
          'Rosa Khutor cable car', 'Sochi Park dolphin show', 'Russia summer holiday', 'Caucasus mountain tour',
          'Russia family holiday', 'Sky Park Sochi', 'Mercure Sochi hotel', 'halal Russia tour',
        ],
        ar: [
          'جولة سوتشي روسيا', 'باقة عطلة سوتشي', 'البحر الأسود سوتشي', 'جولة كراسنايا بوليانا',
          'تلفريك روزا خوتور', 'عرض الدلافين سوتشي بارك', 'عطلة صيفية روسيا', 'جولة جبال القوقاز',
          'عطلة عائلية روسيا', 'سكاي بارك سوتشي', 'فندق ميركيور سوتشي', 'جولة حلال روسيا',
        ],
      },
    },
  };

  await Tour.findOneAndUpdate(
    { 'slug.en': slug },
    tourData,
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
  );

  console.log(`✓ Tour ${action} successfully:`);
  console.log('  Title:   Sochi Russia: Black Sea & Mountain Escape');
  console.log('  Slug:    sochi-russia-black-sea-mountain-escape');
  console.log('  Days:    7 | Nights: 6 (3 sea + 3 mountain)');
  console.log('  Hotels:  Mercure Sochi Centre + Panorama Krasnaya Polyana by Mercure');
  console.log('  Price:   USD 950 / SAR 3,565 / EGP 47,500 (group 9–16 pax, summer)');
  console.log('');
  console.log('  NOTE: Upload local flight schedule image to:');
  console.log('        /uploads/tours/sochi-russia-flight-schedule.png');
  console.log('        Source: رحلة روسيا/image.png');

  await mongoose.disconnect();
};

seed().catch((err) => { console.error(err); process.exit(1); });
