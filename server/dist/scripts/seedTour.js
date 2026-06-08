"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const mongoose_1 = require("mongoose");
const tour_schema_1 = require("../tours/schemas/tour.schema");
const Tour = mongoose_1.default.model('Tour', tour_schema_1.TourSchema);
const seed = async () => {
    await mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/alforsa-gate');
    const slug = 'grand-egypt-nile-journey-cairo-luxor-aswan';
    const existing = await Tour.findOne({ 'slug.en': slug });
    const action = existing ? 'updated' : 'seeded';
    const tourData = {
        idExternal: 'AFG-EGY-NILE-8D-001',
        heading: {
            en: 'Grand Egypt Nile Journey: Cairo, Luxor & Aswan',
            ar: 'رحلة النيل المصرية الكبرى: القاهرة، الأقصر وأسوان',
        },
        headingDescription: {
            en: '8 Days of Ancient Wonders, Timeless Culture & Legendary Landscapes',
            ar: '٨ أيام من عجائب الحضارة القديمة، الثقافة الخالدة والمناظر الأسطورية',
        },
        slug: {
            en: slug,
            ar: 'رحلة-النيل-المصرية-الكبرى-القاهرة-الاقصر-اسوان',
        },
        Description: {
            header: {
                en: 'Uncover the Wonders of Ancient Egypt',
                ar: 'اكتشف عجائب مصر القديمة',
            },
            text: {
                en: `<p>Embark on the ultimate Egyptian odyssey with our Grand Egypt Nile Journey — a meticulously crafted 8-day, 7-night expedition that takes you through the very heart of one of the world's oldest and most magnificent civilisations. From the iconic silhouette of the Great Pyramids at dawn to the golden light dancing across the Nile at dusk, every moment of this tour is designed to leave you breathless.</p>
<p>Begin your adventure in <strong>Cairo</strong>, where the legendary Pyramids of Giza, the enigmatic Sphinx, and the treasure-filled Egyptian Museum await. Wander through the labyrinthine alleys of Khan el-Khalili bazaar, absorb the grandeur of the Citadel of Saladin, and breathe in centuries of history in the ancient Coptic and Islamic districts.</p>
<p>Fly south to <strong>Luxor</strong>, the world's greatest open-air museum, where you'll explore the colossal Karnak Temple Complex and the hauntingly beautiful Valley of the Kings — final resting place of Tutankhamun, Ramesses the Great, and over sixty pharaohs. Stand before the magnificent mortuary temple of Queen Hatshepsut and gaze upon the towering Colossi of Memnon.</p>
<p>Continue to <strong>Aswan</strong>, Egypt's southernmost treasure, to marvel at the engineering feat of the High Dam, pay homage at the romantic island temple of Philae, and drift across the Nile on a traditional felucca sailboat as the sun sets behind the desert dunes. A visit to a traditional Nubian village rounds out this unforgettable journey with warmth, colour, and authentic culture.</p>
<p>Your tour includes hand-picked 4-star hotels, all internal flights, a private air-conditioned coach, and the expertise of a professional licensed Egyptologist guide who will bring the stories of pharaohs, gods, and ancient builders vividly to life.</p>`,
                ar: `<p>انطلق في ملحمة مصرية لا تُنسى مع رحلة النيل المصرية الكبرى — رحلة ٨ أيام و٧ ليالٍ مصممة بعناية فائقة لتأخذك إلى قلب واحدة من أعرق الحضارات وأعظمها في تاريخ البشرية. من الصورة الأيقونية للأهرامات العظيمة عند الفجر إلى الضوء الذهبي المتراقص فوق النيل عند الغروب، كل لحظة في هذه الجولة مصممة لتبهرك وتبقى في ذاكرتك للأبد.</p>
<p>ابدأ مغامرتك في <strong>القاهرة</strong>، حيث تنتظرك أهرامات الجيزة الشهيرة وأبو الهول الغامض والمتحف المصري المليء بالكنوز. تجوّل في أزقة خان الخليلي المتشعبة، واستوعب عظمة قلعة صلاح الدين، وتنفس عبق التاريخ في الأحياء القبطية والإسلامية العتيقة.</p>
<p>اسلك الجنوب إلى <strong>الأقصر</strong>، أعظم متحف مفتوح في العالم، حيث ستستكشف مجمع معبد الكرنك الهائل وادي الملوك الساحر — المثوى الأخير لتوت عنخ آمون ورمسيس العظيم وأكثر من ستين فرعوناً. قف أمام المعبد الجنائزي الرائع للملكة حتشبسوت وأبهر بتمثالَي ممنون الشامخَين.</p>
<p>واصل رحلتك إلى <strong>أسوان</strong>، كنز مصر الجنوبي، لتتعجب من سد أسوان العالي وتزور معبد فيلة الرومانسي على جزيرته، وتنجرف فوق النيل على متن قارب الفلوكة الشراعي التقليدي بينما تغرب الشمس خلف كثبان الصحراء. تتوج الرحلة بزيارة قرية نوبية أصيلة تعبق بالدفء والألوان والثقافة الحقيقية.</p>`,
            },
        },
        images: [
            {
                url: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=1200&q=80',
                alt: {
                    en: 'Great Sphinx with the Pyramids of Giza behind',
                    ar: 'أبو الهول العظيم مع أهرامات الجيزة في الخلفية',
                },
                title: {
                    en: 'Giza Pyramids & Sphinx',
                    ar: 'أهرامات الجيزة وأبو الهول',
                },
                width: 1200,
                height: 800,
            },
            {
                url: 'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=1200&q=80',
                alt: {
                    en: 'Karnak Temple columns at sunset, Luxor',
                    ar: 'أعمدة معبد الكرنك عند الغروب في الأقصر',
                },
                title: {
                    en: 'Karnak Temple, Luxor',
                    ar: 'معبد الكرنك، الأقصر',
                },
                width: 1200,
                height: 800,
            },
            {
                url: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=1200&q=80',
                alt: {
                    en: 'Felucca sailing on the Nile River at sunset',
                    ar: 'فلوكة تبحر في نهر النيل عند الغروب',
                },
                title: {
                    en: 'Nile Felucca Sunset',
                    ar: 'غروب الفلوكة على النيل',
                },
                width: 1200,
                height: 800,
            },
            {
                url: 'https://images.unsplash.com/photo-1562832135-14a35d25edef?w=1200&q=80',
                alt: {
                    en: 'Ancient temple ruins in Luxor',
                    ar: 'آثار معبد قديم في الأقصر',
                },
                title: {
                    en: 'Luxor Ancient Temples',
                    ar: 'معابد الأقصر القديمة',
                },
                width: 1200,
                height: 800,
            },
            {
                url: 'https://images.unsplash.com/photo-1565552645632-d725f8bfc19a?w=1200&q=80',
                alt: {
                    en: 'Nile-side Nubian village near Aswan',
                    ar: 'قرية نوبية على ضفاف النيل قرب أسوان',
                },
                title: {
                    en: 'Aswan Nubian Village',
                    ar: 'قرية نوبية في أسوان',
                },
                width: 1200,
                height: 800,
            },
            {
                url: 'https://images.unsplash.com/photo-1562832135-14a35d25edef?w=1200&q=80',
                alt: {
                    en: 'Valley of the Kings entrance in Luxor',
                    ar: 'مدخل وادي الملوك في الأقصر',
                },
                title: {
                    en: 'Valley of the Kings',
                    ar: 'وادي الملوك',
                },
                width: 1200,
                height: 800,
            },
        ],
        gallery: [
            {
                url: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=800&q=80',
                alt: {
                    en: 'The Great Sphinx with pyramid behind',
                    ar: 'أبو الهول العظيم مع هرم في الخلفية',
                },
                title: {
                    en: 'The Great Sphinx',
                    ar: 'أبو الهول العظيم',
                },
                width: 800,
                height: 600,
            },
            {
                url: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80',
                alt: {
                    en: 'Egyptian Museum, Cairo golden artefacts',
                    ar: 'قطع أثرية ذهبية في المتحف المصري بالقاهرة',
                },
                title: {
                    en: 'Egyptian Museum Treasures',
                    ar: 'كنوز المتحف المصري',
                },
                width: 800,
                height: 600,
            },
            {
                url: 'https://images.unsplash.com/photo-1565552645632-d725f8bfc19a?w=800&q=80',
                alt: {
                    en: 'Nubian village on the banks of the Nile in Aswan',
                    ar: 'قرية نوبية على ضفاف النيل في أسوان',
                },
                title: {
                    en: 'Nubian Village, Aswan',
                    ar: 'القرية النوبية، أسوان',
                },
                width: 800,
                height: 600,
            },
            {
                url: 'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=800&q=80',
                alt: {
                    en: 'Ancient columns and carved stonework in Luxor',
                    ar: 'أعمدة قديمة ونقوش حجرية في الأقصر',
                },
                title: {
                    en: 'Luxor Temple Stonework',
                    ar: 'نقوش معابد الأقصر',
                },
                width: 800,
                height: 600,
            },
        ],
        tourLocation: {
            en: 'Cairo, Luxor & Aswan, Egypt',
            ar: 'القاهرة، الأقصر وأسوان، مصر',
        },
        tourAvailability: {
            en: 'Year-round — best October to April',
            ar: 'طوال العام — الأفضل من أكتوبر إلى أبريل',
        },
        pickupAndDropOff: {
            en: 'Cairo International Airport (CAI) — hotel pickup available',
            ar: 'مطار القاهرة الدولي (CAI) — خدمة النقل من الفندق متاحة',
        },
        tourType: {
            en: 'Cultural & Historical',
            ar: 'ثقافية وتاريخية',
        },
        tourStyle: {
            en: 'Guided Group Tour (Private Available)',
            ar: 'جولة جماعية مصحوبة بمرشد (خاصة متاحة)',
        },
        duration: {
            en: '8 Days / 7 Nights',
            ar: '٨ أيام / ٧ ليالٍ',
        },
        meetingPoint: {
            en: 'Cairo International Airport — our representative will meet you at arrivals with a name board',
            ar: 'مطار القاهرة الدولي — سيستقبلك ممثلنا في صالة الوصول بلافتة تحمل اسمك',
        },
        cancellationPolicy: {
            en: 'Free cancellation up to 14 days before departure. 50% refund for cancellations 7–13 days prior. No refund within 7 days of departure.',
            ar: 'إلغاء مجاني حتى ١٤ يوماً قبل المغادرة. استرداد ٥٠٪ للإلغاء قبل ٧–١٣ يوماً. لا يُرد المبلغ في غضون ٧ أيام من المغادرة.',
        },
        tourMapIframe: 'https://www.google.com/maps?q=Cairo%20Luxor%20Aswan%20Egypt&output=embed',
        mapSchema: {
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'Grand Egypt Nile Journey Route',
            description: 'Key stops across Cairo, Luxor, and Aswan on the 8-day Egypt Nile itinerary.',
            itemListOrder: 'Sequential',
            itemListElement: [
                {
                    '@type': 'TouristAttraction',
                    position: 1,
                    name: 'Giza Plateau',
                    description: 'The Great Pyramids, the Sphinx, and the Valley Temple outside Cairo.',
                    geo: { '@type': 'GeoCoordinates', latitude: '29.9792', longitude: '31.1342' },
                    address: { '@type': 'PostalAddress', addressLocality: 'Giza', addressCountry: 'Egypt' },
                },
                {
                    '@type': 'TouristAttraction',
                    position: 2,
                    name: 'Karnak Temple Complex',
                    description: 'The vast temple complex of ancient Thebes on Luxor East Bank.',
                    geo: { '@type': 'GeoCoordinates', latitude: '25.7188', longitude: '32.6573' },
                    address: { '@type': 'PostalAddress', addressLocality: 'Luxor', addressCountry: 'Egypt' },
                },
                {
                    '@type': 'TouristAttraction',
                    position: 3,
                    name: 'Philae Temple',
                    description: 'The island temple dedicated to Isis near Aswan.',
                    geo: { '@type': 'GeoCoordinates', latitude: '24.0250', longitude: '32.8841' },
                    address: { '@type': 'PostalAddress', addressLocality: 'Aswan', addressCountry: 'Egypt' },
                },
            ],
        },
        priceStartingFrom: {
            EGP: 25000,
            USD: 520,
            SAR: 1950,
        },
        groupSize: {
            total: 16,
            remaining: 8,
        },
        pricingPlans: [
            {
                planName: 'TOUR PRICES',
                seasons: [
                    {
                        seasonName: '1 September 2026 – 19 December 2026 / 6 January 2027 – 24 March 2027',
                        prices: {
                            solo: { EGP: 32000, USD: 660, SAR: 2475 },
                            pax_2_4: { EGP: 25000, USD: 520, SAR: 1950 },
                            pax_5_8: { EGP: 21000, USD: 435, SAR: 1630 },
                            pax_9_16: { EGP: 18000, USD: 375, SAR: 1405 },
                        },
                    },
                    {
                        seasonName: '20 December 2026 – 5 January 2027 / 25 March 2027 – 15 April 2027',
                        prices: {
                            solo: { EGP: 38000, USD: 790, SAR: 2960 },
                            pax_2_4: { EGP: 30000, USD: 625, SAR: 2340 },
                            pax_5_8: { EGP: 25500, USD: 530, SAR: 1985 },
                            pax_9_16: { EGP: 22000, USD: 460, SAR: 1720 },
                        },
                    },
                    {
                        seasonName: '1 May 2026 – 31 August 2026',
                        prices: {
                            solo: { EGP: 28000, USD: 580, SAR: 2180 },
                            pax_2_4: { EGP: 22500, USD: 465, SAR: 1745 },
                            pax_5_8: { EGP: 19000, USD: 395, SAR: 1480 },
                            pax_9_16: { EGP: 16500, USD: 345, SAR: 1290 },
                        },
                    },
                ],
                notes: [
                    {
                        title: { en: 'Price Includes', ar: 'السعر يشمل' },
                        text: {
                            en: 'All prices are per person and include accommodation, domestic flights, and guided tours as listed in the itinerary.',
                            ar: 'جميع الأسعار للفرد وتشمل الإقامة والرحلات الداخلية والجولات الإرشادية كما هو مذكور في البرنامج.',
                        },
                    },
                ],
            },
        ],
        tourHighlights: [
            { en: 'Stand before the Great Pyramids of Giza and the enigmatic Sphinx — icons of humanity', ar: 'قف أمام أهرامات الجيزة العظيمة وأبو الهول الغامض — أيقونات الإنسانية' },
            { en: 'Explore Karnak Temple Complex, the largest ancient religious site on Earth', ar: 'استكشف مجمع معبد الكرنك، أكبر موقع ديني قديم على وجه الأرض' },
            { en: 'Descend into the Valley of the Kings — final resting place of Tutankhamun and 62+ pharaohs', ar: 'انحدر إلى وادي الملوك — المثوى الأخير لتوت عنخ آمون وأكثر من ٦٢ فرعوناً' },
            { en: 'Sail the legendary Nile on a traditional felucca at sunset — a bucket-list experience', ar: 'أبحر في النيل الأسطوري على متن فلوكة تقليدية عند الغروب — تجربة لا تُنسى' },
            { en: 'Visit the island temple of Philae, rescued from rising waters by UNESCO', ar: 'زر معبد فيلة على جزيرته، الذي أنقذته اليونسكو من مياه السد' },
            { en: 'Immerse in authentic Nubian culture — vibrant colours, music and warm hospitality', ar: 'انغمس في الثقافة النوبية الأصيلة — ألوان نابضة وموسيقى وضيافة دافئة' },
        ],
        inclusion: [
            { en: 'All internal flights: Cairo–Luxor and Aswan–Cairo (economy class)', ar: 'جميع الرحلات الداخلية: القاهرة–الأقصر وأسوان–القاهرة (درجة سياحية)' },
            { en: '7 nights accommodation in selected 4-star hotels (twin/double occupancy)', ar: '٧ ليالٍ إقامة في فنادق ٤ نجوم مختارة (غرف مزدوجة أو توأم)' },
            { en: 'Daily breakfast at hotel + 4 group dinners as per itinerary', ar: 'وجبة إفطار يومية في الفندق + ٤ عشاء جماعي وفق البرنامج' },
            { en: 'Private air-conditioned coach for all ground transfers', ar: 'حافلة خاصة مكيفة لجميع التنقلات البرية' },
            { en: 'Licensed professional Egyptologist guide (English-speaking, full-time)', ar: 'مرشد مصري متخصص ومرخص (متحدث بالإنجليزية، طوال اليوم)' },
            { en: 'All entrance fees to sites listed in the itinerary', ar: 'جميع رسوم الدخول للمواقع المذكورة في البرنامج' },
            { en: 'Airport and hotel transfers throughout the tour', ar: 'نقل من وإلى المطار والفنادق طوال الجولة' },
            { en: 'Bottled mineral water on all tours and during transfers', ar: 'مياه معدنية في جميع الجولات وأثناء التنقلات' },
        ],
        exclusion: [
            { en: 'International airfare to/from Cairo', ar: 'تذاكر الطيران الدولية من وإلى القاهرة' },
            { en: 'Egyptian entry visa (available on arrival, approx. USD 25 — check current requirements)', ar: 'تأشيرة الدخول المصرية (متاحة عند الوصول، حوالي ٢٥ دولاراً — تحقق من المتطلبات الحالية)' },
            { en: 'Lunches and beverages not mentioned in the itinerary', ar: 'وجبات الغداء والمشروبات غير المذكورة في البرنامج' },
            { en: 'Personal travel insurance (strongly recommended)', ar: 'التأمين الشخصي على السفر (موصى به بشدة)' },
            { en: 'Gratuities and tips for guides, drivers and hotel staff', ar: 'البقشيش والإكراميات للمرشدين والسائقين وموظفي الفندق' },
        ],
        whatToPack: [
            { en: 'Lightweight, breathable cotton clothing (loose-fit recommended)', ar: 'ملابس قطنية خفيفة وتسمح بالتهوية (يُفضل الفضفاض)' },
            { en: 'Modest attire for temple visits (covered shoulders and knees)', ar: 'ملابس محتشمة لزيارة المعابد (تغطية الكتفين والركبتين)' },
            { en: 'Comfortable closed-toe walking shoes for uneven terrain', ar: 'أحذية مريحة مغلقة عند الأصابع للتضاريس الوعرة' },
            { en: 'High-SPF sunscreen (SPF 50+) and UV-protective sunglasses', ar: 'كريم واقٍ من الشمس بعامل حماية عالٍ (٥٠+) ونظارات شمسية واقية من الأشعة فوق البنفسجية' },
            { en: 'Wide-brimmed hat or light headscarf for sun protection', ar: 'قبعة ذات حافة عريضة أو وشاح خفيف للحماية من الشمس' },
            { en: 'Insect repellent (especially for Nile-side evenings)', ar: 'طارد الحشرات (خاصةً لأمسيات ضفاف النيل)' },
            { en: 'Small backpack or day bag for excursions', ar: 'حقيبة ظهر صغيرة أو حقيبة يومية للرحلات' },
            { en: 'Portable power bank and universal travel adapter', ar: 'بنك طاقة محمول ومحول كهربائي للسفر' },
        ],
        itinerary: {
            generalDescription: {
                en: 'Your 8-day journey is carefully paced to balance iconic sightseeing with genuine cultural immersion. Internal flights save precious time and keep energy levels high. All days include a comfortable, guided pace with free time built in.',
                ar: 'رحلتك لمدة ٨ أيام مُصممة بعناية لتوازن بين زيارة المواقع الأيقونية والانغماس الثقافي الحقيقي. توفر الرحلات الداخلية الوقت الثمين وتحافظ على مستوى الطاقة. تتضمن جميع الأيام وتيرة مريحة مع مرشد ووقت حر مدمج.',
            },
            days: [
                {
                    day: 1,
                    title: { en: 'Arrival in Cairo — Welcome to the Land of the Pharaohs', ar: 'الوصول إلى القاهرة — مرحباً بك في أرض الفراعنة' },
                    description: {
                        en: 'Upon arrival at Cairo International Airport, our representative will meet you in the arrivals hall holding a board with your name. Transfer to your 4-star hotel in the heart of Cairo for check-in and refreshments. In the evening, gather with your fellow travellers for a welcome orientation dinner at a traditional Egyptian restaurant, savour authentic mezze, grilled meats and local specialities, and receive your detailed tour briefing.',
                        ar: 'عند وصولك إلى مطار القاهرة الدولي، سيستقبلك ممثلنا في صالة الوصول بلافتة تحمل اسمك. انتقل إلى فندقك ذي الأربع نجوم في قلب القاهرة لتسجيل الوصول والراحة. في المساء، التقِ بزملاء رحلتك لحضور عشاء ترحيبي في مطعم مصري تقليدي، استمتع بالمازة الأصيلة والمشويات والأطباق المحلية، وتلقَّ إحاطة تفصيلية بالبرنامج.',
                    },
                    activities: [
                        {
                            heading: { en: 'Airport Welcome & Transfer', ar: 'الاستقبال في المطار والنقل' },
                            description: { en: 'VIP meet-and-greet service, private air-conditioned vehicle transfer to hotel.', ar: 'خدمة استقبال VIP، نقل خاص بسيارة مكيفة إلى الفندق.' },
                        },
                        {
                            heading: { en: 'Welcome Orientation Dinner', ar: 'عشاء الترحيب والتعارف' },
                            description: { en: 'Authentic Egyptian cuisine in a traditional Old Cairo restaurant. Meet your Egyptologist guide.', ar: 'مطبخ مصري أصيل في مطعم تقليدي في القاهرة القديمة. تعرف على مرشدك المصري المتخصص.' },
                        },
                    ],
                },
                {
                    day: 2,
                    title: { en: 'Pyramids, Sphinx & the Egyptian Museum', ar: 'الأهرامات وأبو الهول والمتحف المصري' },
                    description: {
                        en: 'Begin your Egyptian adventure at the Giza Plateau — one of the most recognisable landscapes on Earth. Stand in awe before the Great Pyramid of Khufu (Cheops), the last surviving Wonder of the Ancient World, then explore the Pyramids of Khafre and Menkaure. Face the legendary Great Sphinx, the world\'s largest monolith sculpture, before an optional camel ride across the desert sands. After lunch, head to the world-famous Egyptian Museum in Tahrir Square, home to over 120,000 artefacts including the dazzling treasures of Tutankhamun\'s tomb. End your day exploring the vibrant Khan el-Khalili bazaar, one of the oldest markets in the Arab world.',
                        ar: 'ابدأ مغامرتك المصرية في هضبة الجيزة — واحدة من أشهر المناظر على وجه الأرض. قف مذهولاً أمام الهرم الأكبر للفرعون خوفو، آخر عجائب الدنيا السبع القديمة الباقية، ثم استكشف هرمَي خفرع ومنقرع. واجه أبو الهول الأسطوري، أكبر تمثال منحوت من حجر واحد في العالم، قبل ركوب جمل اختياري عبر الرمال. بعد الغداء، توجه إلى المتحف المصري الشهير عالمياً في ميدان التحرير، الذي يضم أكثر من ١٢٠ ألف قطعة أثرية من بينها الكنوز المبهرة لمقبرة توت عنخ آمون. أنهِ يومك بالتجوال في سوق خان الخليلي الصاخب، أحد أقدم الأسواق في العالم العربي.',
                    },
                    activities: [
                        {
                            heading: { en: 'Giza Pyramids Complex', ar: 'مجمع أهرامات الجيزة' },
                            description: { en: 'Great Pyramid of Khufu, Pyramid of Khafre, Pyramid of Menkaure, and the Valley Temple.', ar: 'الهرم الأكبر لخوفو وهرم خفرع وهرم منقرع ومعبد الوادي.' },
                        },
                        {
                            heading: { en: 'The Great Sphinx', ar: 'تمثال أبو الهول الأكبر' },
                            description: { en: 'The iconic limestone statue — 73.5 m long, 20.2 m tall — guardian of the Giza necropolis.', ar: 'التمثال الجيري الأيقوني — طوله ٧٣.٥ متر وارتفاعه ٢٠.٢ متر — حارس منطقة الجيزة.' },
                        },
                        {
                            heading: { en: 'Egyptian Museum, Cairo', ar: 'المتحف المصري، القاهرة' },
                            description: { en: "Tutankhamun's gold funerary mask, Royal Mummies Hall, and the Narmer Palette among 120,000+ artefacts.", ar: 'قناع توت عنخ آمون الذهبي وقاعة المومياوات الملكية ولوحة نارمر من بين أكثر من ١٢٠ ألف قطعة.' },
                        },
                        {
                            heading: { en: "Khan el-Khalili Bazaar", ar: 'سوق خان الخليلي' },
                            description: { en: "Explore the medieval bazaar — spices, papyrus, jewellery, and artisan crafts since 1382.", ar: 'استكشف السوق الإسلامي العتيق — التوابل والبردي والمجوهرات والحرف اليدوية منذ عام ١٣٨٢.' },
                        },
                    ],
                },
                {
                    day: 3,
                    title: { en: 'Islamic & Coptic Cairo — Citadel, Al-Azhar & Old Cairo', ar: 'القاهرة الإسلامية والقبطية — القلعة والأزهر والقاهرة القديمة' },
                    description: {
                        en: 'Dedicate today to the layers of Cairo\'s living history. Begin at the Citadel of Saladin, the medieval Islamic fortification that dominates the Cairo skyline, and visit the stunning Alabaster Mosque of Muhammad Ali inside. Explore the Madrasa and Mausoleum of Sultan Hassan, a masterpiece of Mamluk architecture. After lunch in a local restaurant, venture into Old Cairo\'s Coptic quarter to visit the Hanging Church (Al-Muallaqah), one of the oldest Christian churches in Egypt, and the Cave Church of Abu Serga, said to be built on the spot where the Holy Family rested during their flight to Egypt. End the day at the historic Ben Ezra Synagogue.',
                        ar: 'خصص هذا اليوم لاستكشاف طبقات تاريخ القاهرة الحي. ابدأ بقلعة صلاح الدين، الحصن الإسلامي القروسطي الذي يهيمن على أفق القاهرة، وزر مسجد محمد علي الرائع المبني من الألابستر بداخلها. استكشف مدرسة ومقبرة السلطان حسن، تحفة فن العمارة المملوكية. بعد الغداء في مطعم محلي، تجه إلى الحي القبطي في القاهرة القديمة لزيارة الكنيسة المعلقة (المعلقة)، إحدى أقدم الكنائس المسيحية في مصر، وكنيسة أبو سرجة الكهفية التي يُقال إنها بُنيت على المكان الذي استراحت فيه العائلة المقدسة خلال رحلتها إلى مصر.',
                    },
                    activities: [
                        {
                            heading: { en: 'Citadel of Saladin & Mosque of Muhammad Ali', ar: 'قلعة صلاح الدين ومسجد محمد علي' },
                            description: { en: 'Panoramic views over Cairo from this 12th-century fortified complex.', ar: 'إطلالات بانورامية على القاهرة من هذا المجمع المحصن الذي يعود إلى القرن الثاني عشر.' },
                        },
                        {
                            heading: { en: 'Coptic Cairo — Hanging Church & Cave Church', ar: 'القاهرة القبطية — الكنيسة المعلقة وكنيسة أبو سرجة' },
                            description: { en: "Explore Egypt's rich Christian heritage in the heart of Old Cairo.", ar: 'استكشف الإرث المسيحي الغني لمصر في قلب القاهرة القديمة.' },
                        },
                    ],
                },
                {
                    day: 4,
                    title: { en: 'Fly to Luxor — Karnak Temple & Luxor Temple by Night', ar: 'الطيران إلى الأقصر — معبد الكرنك ومعبد الأقصر ليلاً' },
                    description: {
                        en: 'A short morning flight whisks you from Cairo to Luxor, the ancient city of Thebes — once the most magnificent city in the world. After settling into your hotel and lunch, prepare for an afternoon that will redefine your understanding of human ambition. The Karnak Temple Complex is not a single temple but an entire city of temples, chapels, pylons, and obelisks built over more than 2,000 years by successive pharaohs from Senusret I to Cleopatra VII. Its Great Hypostyle Hall, with 134 massive papyrus columns rising up to 23 metres high, is one of the most breathtaking architectural achievements in human history. As the sun sets and the air cools, visit the smaller but supremely elegant Luxor Temple, beautifully illuminated at night — a UNESCO World Heritage site connecting directly to Karnak via the recently excavated Avenue of Sphinxes.',
                        ar: 'رحلة صباحية قصيرة تنقلك من القاهرة إلى الأقصر، مدينة طيبة القديمة — التي كانت ذات يوم أعظم مدينة في العالم. بعد الاستقرار في فندقك وتناول الغداء، استعد لبعد ظهر سيعيد تعريفك بالطموح البشري. مجمع معبد الكرنك ليس معبداً واحداً بل مدينة كاملة من المعابد والمصليات والبوابات والمسلات بُنيت على مدى أكثر من ٢٠٠٠ عام من قِبل فراعنة متعاقبين. قاعة الأعمدة العظيمة بـ١٣٤ عموداً ضخماً على شكل البردي يصل ارتفاعها إلى ٢٣ متراً هي واحدة من أروع الإنجازات المعمارية في التاريخ البشري.',
                    },
                    activities: [
                        {
                            heading: { en: 'Morning Flight Cairo → Luxor', ar: 'رحلة صباحية القاهرة ← الأقصر' },
                            description: { en: 'Domestic flight (~1 hour). Hotel check-in and lunch upon arrival.', ar: 'رحلة داخلية (~ساعة واحدة). تسجيل وصول الفندق وتناول الغداء عند الوصول.' },
                        },
                        {
                            heading: { en: 'Karnak Temple Complex', ar: 'مجمع معبد الكرنك' },
                            description: { en: 'The Great Hypostyle Hall, Sacred Lake, Obelisk of Hatshepsut, and Avenue of Ram-headed Sphinxes.', ar: 'قاعة الأعمدة العظيمة والبحيرة المقدسة ومسلة حتشبسوت وطريق أبو الهول برأس الكبش.' },
                        },
                        {
                            heading: { en: 'Luxor Temple at Night', ar: 'معبد الأقصر ليلاً' },
                            description: { en: 'The perfectly illuminated temple built by Amenhotep III and Ramesses II — magical after dark.', ar: 'المعبد المضاء بشكل رائع الذي بناه أمنحتب الثالث ورمسيس الثاني — ساحر في الليل.' },
                        },
                    ],
                },
                {
                    day: 5,
                    title: { en: "Valley of the Kings, Queen Hatshepsut & West Bank Wonders", ar: 'وادي الملوك ومعبد الملكة حتشبسوت وعجائب الضفة الغربية' },
                    description: {
                        en: "Cross the Nile to Luxor's legendary West Bank — the realm of the dead in ancient Egyptian theology. The Valley of the Kings, a barren limestone valley in the Theban Hills, was the royal burial ground for nearly 500 years, from the 16th to the 11th century BC. Descend into the richly decorated tombs of Ramesses VI, Seti I, or Tutankhamun (optional extra) and witness the vivid artwork that has defied 3,000 years of time. Next, stand in silent admiration before the mortuary temple of Queen Hatshepsut at Deir el-Bahari — a three-tiered colonnade carved directly into the golden cliff face, considered one of the most architecturally accomplished buildings of ancient Egypt. End the West Bank tour at the Colossi of Memnon, two imposing 18-metre statues of Amenhotep III that once flanked the entrance to his magnificent but now-vanished mortuary temple.",
                        ar: 'اعبر النيل إلى الضفة الغربية الأسطورية للأقصر — مملكة الموتى في اللاهوت المصري القديم. وادي الملوك، وادٍ جيري قاحل في تلال طيبة، كان مدفناً ملكياً لما يقرب من ٥٠٠ عام، من القرن السادس عشر إلى القرن الحادي عشر قبل الميلاد. انحدر إلى المقابر المزينة بشكل رائع لرمسيس السادس وسيتي الأول أو توت عنخ آمون (رسوم إضافية اختيارية) وشاهد الأعمال الفنية الزاهية التي تحدت ٣٠٠٠ عام من الزمن.',
                    },
                    activities: [
                        {
                            heading: { en: 'Valley of the Kings', ar: 'وادي الملوك' },
                            description: { en: 'Entrance to 3 royal tombs (Tutankhamun tomb optional, extra charge). Expert Egyptologist commentary.', ar: 'دخول ٣ مقابر ملكية (مقبرة توت عنخ آمون اختيارية، رسوم إضافية). تعليق مرشد متخصص.' },
                        },
                        {
                            heading: { en: 'Temple of Hatshepsut (Deir el-Bahari)', ar: 'معبد حتشبسوت (الدير البحري)' },
                            description: { en: "Egypt's only female pharaoh — her temple is a marvel of symmetry and precision.", ar: 'المرأة الوحيدة التي حكمت مصر فرعوناً — معبدها أعجوبة في التناسق والدقة.' },
                        },
                        {
                            heading: { en: 'Colossi of Memnon', ar: 'تمثالا ممنون' },
                            description: { en: 'Two 18-metre quartzite statues that have greeted the rising sun for over 3,400 years.', ar: 'تمثالان من الكوارتز ارتفاعهما ١٨ متراً يرحبان بشروق الشمس منذ أكثر من ٣٤٠٠ عام.' },
                        },
                    ],
                },
                {
                    day: 6,
                    title: { en: 'Edfu Temple, Kom Ombo & Arrival in Aswan', ar: 'معبد إدفو وكوم أمبو والوصول إلى أسوان' },
                    description: {
                        en: 'Travel south along the fertile Nile Valley to discover two more extraordinary temples. At Edfu, visit the best-preserved ancient temple in all of Egypt — the Temple of Horus, built during the Ptolemaic period and still remarkably intact after 2,200 years. The towering pylons, carved reliefs depicting the eternal battle between Horus and Seth, and the inner sanctuary with its ancient granite statue of a falcon remain electrifying. Continue to the unique double temple of Kom Ombo, dramatically positioned on a Nile promontory, simultaneously dedicated to Sobek the crocodile god and Haroeris the falcon god. The adjacent Crocodile Museum holds dozens of mummified crocodiles once sacred to Sobek. Arrive in Aswan by late afternoon.',
                        ar: 'سافر جنوباً عبر وادي النيل الخصيب لاكتشاف معبدين استثنائيين آخرين. في إدفو، زر المعبد الأكثر اكتمالاً في مصر القديمة كلها — معبد حورس المبني في العصر البطلمي والذي لا يزال محتفظاً بشكله بشكل لافت بعد ٢٢٠٠ عام. تواصل إلى المعبد المزدوج الفريد من نوعه لكوم أمبو، المتربع بشكل دراماتيكي على نتوء فوق النيل، المخصص في آنٍ واحد لسوبك إله التمساح وهاروريس إله الصقر. يضم متحف التماسيح المجاور عشرات التماسيح المحنطة التي كانت مقدسة لسوبك. وصول إلى أسوان في أواخر بعد الظهر.',
                    },
                    activities: [
                        {
                            heading: { en: 'Temple of Horus at Edfu', ar: 'معبد حورس في إدفو' },
                            description: { en: "The most completely preserved temple in Egypt — a masterpiece of Ptolemaic architecture.", ar: 'أكثر المعابد اكتمالاً في مصر — تحفة من روائع العمارة البطلمية.' },
                        },
                        {
                            heading: { en: 'Kom Ombo Double Temple', ar: 'معبد كوم أمبو المزدوج' },
                            description: { en: 'Dedicated to both Sobek and Haroeris — unique twin-shrine design with Nile views.', ar: 'مكرس لكل من سوبك وهاروريس — تصميم ضريح توأم فريد مع إطلالات على النيل.' },
                        },
                    ],
                },
                {
                    day: 7,
                    title: { en: "Aswan High Dam, Philae Temple & Nubian Village Experience", ar: 'السد العالي ومعبد فيلة وتجربة القرية النوبية' },
                    description: {
                        en: "Aswan\'s full day reveals the dramatic interplay between ancient heritage and modern engineering. Begin at the Aswan High Dam, one of the greatest engineering achievements of the 20th century — an immense structure that tamed the Nile, created Lake Nasser (the world\'s largest man-made lake), and transformed Egyptian agriculture. Then board a motorboat to the island of Agilkia to visit the magnificent Philae Temple, dedicated to the goddess Isis. Originally located on the island of Philae, it was painstakingly dismantled stone by stone and reassembled here by UNESCO between 1972 and 1980 to save it from the rising waters of Lake Nasser. In the afternoon, step aboard a traditional felucca sailboat for a serene sunset cruise around Elephantine Island and Kitchener\'s Island (Botanical Garden). End your Aswan day with an immersive visit to a Nubian village — enjoy home-cooked Nubian tea and snacks, hear traditional music, see the distinctive brightly painted houses, and meet the warm and welcoming Nubian community.",
                        ar: 'يوم كامل في أسوان يكشف التفاعل الدراماتيكي بين التراث القديم والهندسة الحديثة. ابدأ بالسد العالي لأسوان، أحد أعظم الإنجازات الهندسية في القرن العشرين — بنية هائلة روّضت النيل وخلقت بحيرة ناصر (أكبر بحيرة اصطناعية في العالم). ثم اركب قارباً إلى جزيرة أجيلكيا لزيارة معبد فيلة الرائع، المكرس للإلهة إيزيس والذي أُعيد تجميعه حجراً حجراً من قِبل اليونسكو. في فترة الظهيرة، اصعد على متن فلوكة تقليدية لرحلة هادئة عند الغروب حول جزيرة أسوان وجزيرة كيتشنر.',
                    },
                    activities: [
                        {
                            heading: { en: 'Aswan High Dam', ar: 'السد العالي لأسوان' },
                            description: { en: '111 m high, 3.6 km long — created Lake Nasser and changed the face of Egypt.', ar: 'ارتفاعه ١١١ متراً وطوله ٣.٦ كيلومتر — أوجد بحيرة ناصر وغيّر وجه مصر.' },
                        },
                        {
                            heading: { en: 'Philae Temple (Island of Agilkia)', ar: 'معبد فيلة (جزيرة أجيلكيا)' },
                            description: { en: 'UNESCO-rescued temple of Isis — a romantic island sanctuary approached by motorboat.', ar: 'معبد إيزيس المُنقذ من قِبل اليونسكو — ملاذ جزيرة رومانسي يُقصد إليه بالزورق.' },
                        },
                        {
                            heading: { en: 'Nile Felucca Sunset Cruise', ar: 'رحلة فلوكة عند غروب الشمس على النيل' },
                            description: { en: 'Drift peacefully around Elephantine Island on a traditional Egyptian sailboat at sunset.', ar: 'انجرف بهدوء حول جزيرة الفيلة على متن قارب شراعي مصري تقليدي عند الغروب.' },
                        },
                        {
                            heading: { en: 'Nubian Village Cultural Visit', ar: 'زيارة ثقافية لقرية نوبية' },
                            description: { en: 'Authentic Nubian hospitality — tea, music, colourful architecture and warm community spirit.', ar: 'ضيافة نوبية أصيلة — الشاي والموسيقى والعمارة الملونة وروح المجتمع الدافئة.' },
                        },
                    ],
                },
                {
                    day: 8,
                    title: { en: "Farewell Aswan — Fly Home with Unforgettable Memories", ar: 'وداع أسوان — العودة إلى الوطن بذكريات لا تُنسى' },
                    description: {
                        en: "Your final morning in Egypt is yours to savour at leisure. Enjoy a relaxed breakfast with Nile views before our team transfers you to Aswan Airport for your flight back to Cairo, connecting to your international departure. You leave Egypt with a profound sense of wonder, having walked in the footsteps of pharaohs, gods, and ancient builders whose legacy continues to astonish the world. We look forward to welcoming you back.",
                        ar: 'صباحك الأخير في مصر لك تستمتع به كما تشاء. تناول إفطاراً هانئاً مع إطلالات على النيل قبل أن ينقلك فريقنا إلى مطار أسوان للرحلة العائدة إلى القاهرة ثم الاتصال برحلتك الدولية. تغادر مصر وأنت تحمل إحساساً عميقاً بالدهشة، بعد أن سرت على خطى الفراعنة والآلهة والبنائين القدماء الذين لا يزال إرثهم يذهل العالم. نتطلع إلى الترحيب بك مجدداً.',
                    },
                    activities: [
                        {
                            heading: { en: 'Departure Transfer to Aswan Airport', ar: 'نقل المغادرة إلى مطار أسوان' },
                            description: { en: 'Domestic flight Aswan → Cairo. International connections as required.', ar: 'رحلة داخلية أسوان ← القاهرة. ارتباطات دولية حسب الحاجة.' },
                        },
                    ],
                },
            ],
        },
        faqs: [
            {
                question: {
                    en: 'What is the best time of year to visit Egypt?',
                    ar: 'ما هو أفضل وقت في السنة لزيارة مصر؟',
                },
                answer: {
                    en: 'October to April is ideal — temperatures are pleasantly warm (20–30 °C) and the crowds are manageable. Summer (June–August) is very hot, especially in Luxor and Aswan where temperatures can exceed 45 °C. December and January are peak season with the most pleasant weather but higher prices.',
                    ar: 'أكتوبر إلى أبريل مثالي — درجات الحرارة دافئة بشكل ممتع (٢٠–٣٠ درجة مئوية) والحشود في حدودها. الصيف (يونيو–أغسطس) حار جداً، خاصة في الأقصر وأسوان حيث يمكن أن تتجاوز درجات الحرارة ٤٥ درجة. ديسمبر ويناير هما موسم الذروة بأطيب الأجواء لكن بأسعار أعلى.',
                },
            },
            {
                question: {
                    en: 'Is Egypt safe for tourists?',
                    ar: 'هل مصر آمنة للسياح؟',
                },
                answer: {
                    en: "Egypt\'s major tourist destinations — Cairo, Luxor, Aswan and the Red Sea resorts — are well-established and generally very safe for international visitors. The Egyptian government maintains a strong security presence at tourist sites. We monitor travel advisories constantly and have operated tours in Egypt for over 15 years without major incident.",
                    ar: 'الوجهات السياحية الرئيسية في مصر — القاهرة والأقصر وأسوان ومنتجعات البحر الأحمر — راسخة وآمنة بشكل عام للزوار الدوليين. تحافظ الحكومة المصرية على حضور أمني قوي في المواقع السياحية. نتابع التحذيرات السياحية باستمرار وقد نظمنا جولات في مصر لأكثر من ١٥ عاماً دون حوادث كبرى.',
                },
            },
            {
                question: {
                    en: 'Do I need a visa to enter Egypt?',
                    ar: 'هل أحتاج إلى تأشيرة لدخول مصر؟',
                },
                answer: {
                    en: "Most nationalities can obtain a visa on arrival at Egyptian airports for approximately USD 25, or can apply online through the Egypt e-Visa portal before travel (recommended). Citizens of Arab League countries generally do not require a visa. Always check current requirements for your specific nationality before booking.",
                    ar: 'يمكن لمعظم الجنسيات الحصول على تأشيرة عند الوصول في المطارات المصرية بحوالي ٢٥ دولاراً، أو التقديم عبر الإنترنت من خلال بوابة التأشيرة الإلكترونية المصرية قبل السفر (موصى به). مواطنو دول جامعة الدول العربية عموماً لا يحتاجون إلى تأشيرة. تحقق دائماً من المتطلبات الحالية لجنسيتك المحددة قبل الحجز.',
                },
            },
            {
                question: {
                    en: 'What type of accommodation is included?',
                    ar: 'ما نوع الإقامة المشمولة؟',
                },
                answer: {
                    en: "This tour includes 7 nights in carefully selected 4-star hotels in central locations: 3 nights in Cairo (Pyramids/city area), 2 nights in Luxor (East Bank), and 2 nights in Aswan (Nile-view). All hotels feature swimming pools, restaurants, Wi-Fi, and air-conditioning. An upgrade to 5-star accommodation is available on request.",
                    ar: 'تشمل هذه الجولة ٧ ليالٍ في فنادق ٤ نجوم مختارة بعناية في مواقع مركزية: ٣ ليالٍ في القاهرة (منطقة الأهرامات/وسط المدينة) و٢ ليالٍ في الأقصر (الضفة الشرقية) و٢ ليالٍ في أسوان (إطلالة على النيل). تتميز جميع الفنادق بالمسابح والمطاعم والواي-فاي وتكييف الهواء. الترقية إلى إقامة ٥ نجوم متاحة بناءً على الطلب.',
                },
            },
            {
                question: {
                    en: 'Can I customise this tour?',
                    ar: 'هل يمكنني تخصيص هذه الجولة؟',
                },
                answer: {
                    en: "Absolutely. This itinerary is fully customisable — we can add Abu Simbel, Alexandria, the White Desert, or the Red Sea. We can extend the duration, upgrade accommodation, arrange private guiding, or adjust the pace to suit your group. Contact our team and we\'ll build your perfect Egypt experience.",
                    ar: 'بالتأكيد. هذا البرنامج قابل للتخصيص الكامل — يمكننا إضافة أبو سمبل أو الإسكندرية أو الصحراء البيضاء أو البحر الأحمر. يمكننا تمديد المدة أو ترقية الإقامة أو ترتيب إرشاد خاص أو تعديل الوتيرة لتناسب مجموعتك. تواصل مع فريقنا وسنبني لك تجربة مصر المثالية.',
                },
            },
        ],
        relatedTours: [
            {
                id: 'classic-cairo-pyramids-museum-day-tour',
                title: {
                    en: 'Classic Cairo: Pyramids, Sphinx & Egyptian Museum',
                    ar: 'القاهرة الكلاسيكية: الأهرامات وأبو الهول والمتحف المصري',
                },
            },
            {
                id: 'luxor-west-bank-valley-of-the-kings',
                title: {
                    en: 'Luxor West Bank: Valley of the Kings & Hatshepsut',
                    ar: 'الضفة الغربية في الأقصر: وادي الملوك وحتشبسوت',
                },
            },
            {
                id: 'aswan-philae-nubian-village-felucca',
                title: {
                    en: 'Aswan: Philae Temple, Nubian Village & Felucca',
                    ar: 'أسوان: معبد فيلة والقرية النوبية والفلوكة',
                },
            },
        ],
        reviews: [
            {
                type: 'text',
                title: {
                    en: 'Perfect first trip to Egypt',
                    ar: 'رحلة أولى مثالية إلى مصر',
                },
                content: {
                    en: 'Everything was smooth from airport pickup to the final transfer. The guide made every temple feel alive, and the pace was comfortable for our family.',
                    ar: 'كان كل شيء سلساً من استقبال المطار حتى النقل الأخير. جعل المرشد كل معبد ينبض بالحياة، وكان إيقاع الرحلة مريحاً لعائلتنا.',
                },
            },
            {
                type: 'video',
                url: 'https://www.ricksteves.com/watch-read-listen/video/tv-show/egypt',
                title: {
                    en: 'Egypt overview video inspiration',
                    ar: 'فيديو ملهم عن مصر',
                },
                content: {
                    en: 'A travel video reference covering Cairo, Luxor, the Nile, and southern Egypt.',
                    ar: 'مرجع فيديو سياحي يغطي القاهرة والأقصر والنيل وجنوب مصر.',
                },
            },
            {
                type: 'text',
                title: {
                    en: 'The Luxor days were unforgettable',
                    ar: 'أيام الأقصر كانت لا تُنسى',
                },
                content: {
                    en: 'Karnak and the Valley of the Kings were the highlights. Hotels were clean, transfers were punctual, and the team handled every detail.',
                    ar: 'كان الكرنك ووادي الملوك أبرز محطات الرحلة. الفنادق نظيفة، والتنقلات دقيقة، والفريق اهتم بكل التفاصيل.',
                },
            },
        ],
        tags: [
            { en: 'Egypt Tours', ar: 'جولات مصر' },
            { en: 'Pyramids of Giza', ar: 'أهرامات الجيزة' },
            { en: 'Nile River Cruise', ar: 'رحلة نيلية' },
            { en: 'Luxor', ar: 'الأقصر' },
            { en: 'Aswan', ar: 'أسوان' },
            { en: 'Valley of the Kings', ar: 'وادي الملوك' },
            { en: 'Cultural Tours', ar: 'جولات ثقافية' },
            { en: 'Historical Tours', ar: 'جولات تاريخية' },
            { en: 'Family Travel', ar: 'سفر عائلي' },
            { en: 'Guided Tours', ar: 'جولات بمرشد' },
        ],
        notes: [
            {
                title: { en: 'Important Health & Safety Note', ar: 'ملاحظة صحة وسلامة هامة' },
                text: {
                    en: 'Walking distances at archaeological sites can be significant (2–5 km per site on uneven terrain). Please inform us of any mobility limitations at the time of booking. Comprehensive travel insurance, including medical evacuation cover, is strongly recommended.',
                    ar: 'يمكن أن تكون مسافات المشي في المواقع الأثرية كبيرة (٢–٥ كيلومتر لكل موقع على تضاريس وعرة). يرجى إبلاغنا بأي قيود على الحركة وقت الحجز. يُوصى بشدة بالتأمين الشامل على السفر، بما في ذلك تغطية الإخلاء الطبي.',
                },
            },
            {
                title: { en: 'Dress Code at Religious Sites', ar: 'قواعد اللباس في المواقع الدينية' },
                text: {
                    en: 'Modest dress is required when visiting mosques and churches (covered shoulders and knees). Scarves for women are available at site entrances. Comfortable, closed-toe shoes are recommended for all sites.',
                    ar: 'اللباس المحتشم مطلوب عند زيارة المساجد والكنائس (تغطية الكتفين والركبتين). الأوشحة للنساء متاحة عند مداخل المواقع. يُوصى بالأحذية المريحة المغلقة عند الأصابع لجميع المواقع.',
                },
            },
        ],
        whatYouWillLoveHtml: {
            en: '<ul><li>Waking to a view of the Giza Pyramids from your hotel window</li><li>The silence and scale of the Great Hypostyle Hall at Karnak</li><li>Descending underground into a 3,300-year-old royal tomb</li><li>A felucca gliding silently through the golden Nile sunset</li><li>The warm smiles and vibrant colours of a Nubian welcome</li><li>Leaving with a deeper understanding of human civilisation\'s greatest chapter</li></ul>',
            ar: '<ul><li>الاستيقاظ على منظر أهرامات الجيزة من نافذة فندقك</li><li>الصمت والضخامة في قاعة الأعمدة العظيمة في الكرنك</li><li>النزول إلى الأعماق في مقبرة ملكية عمرها ٣٣٠٠ عام</li><li>الفلوكة تنزلق بهدوء في غروب النيل الذهبي</li><li>الابتسامات الدافئة والألوان الزاهية في الترحيب النوبي</li><li>المغادرة بفهم أعمق لأعظم فصول الحضارة الإنسانية</li></ul>',
        },
        tourDocuments: [
            {
                url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                label: {
                    en: 'Tour Brochure PDF',
                    ar: 'كتيب الجولة PDF',
                },
            },
            {
                url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                label: {
                    en: 'Detailed Day-by-Day Itinerary',
                    ar: 'برنامج تفصيلي يوم بيوم',
                },
            },
        ],
        reviewsCount: 147,
        averageRating: 4.8,
        isActive: true,
        isFeatured: true,
        viewCount: 3842,
        seo: {
            metaTitle: {
                en: 'Grand Egypt Nile Journey: Cairo, Luxor & Aswan — 8 Days | Alforsa Gate',
                ar: 'رحلة النيل المصرية الكبرى: القاهرة، الأقصر وأسوان — ٨ أيام | بوابة الفرصة',
            },
            metaDescription: {
                en: 'Discover ancient Egypt on our 8-day Nile Journey — Pyramids of Giza, Karnak Temple, Valley of the Kings, Philae & a Nubian village. All-inclusive guided tour from EGP 25,000.',
                ar: 'اكتشف مصر القديمة في رحلتنا النيلية لمدة ٨ أيام — أهرامات الجيزة ومعبد الكرنك ووادي الملوك وفيلة وقرية نوبية. جولة شاملة بمرشد من ٢٥٠٠٠ جنيه مصري.',
            },
            metaKeywords: {
                en: ['Egypt tours', 'Pyramids of Giza tour', 'Luxor Aswan tour', 'Nile journey', 'Valley of the Kings', 'Karnak temple tour', 'Egypt guided tour', 'Cairo tour package', 'Philae temple', 'Nubian village visit'],
                ar: ['جولات مصر', 'جولة أهرامات الجيزة', 'جولة الأقصر أسوان', 'رحلة نيلية', 'وادي الملوك', 'جولة معبد الكرنك', 'جولة مصرية بمرشد', 'باقة سياحية القاهرة', 'معبد فيلة', 'زيارة قرية نوبية'],
            },
        },
    };
    await Tour.findOneAndUpdate({ 'slug.en': slug }, tourData, { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true });
    console.log(`✓ Tour ${action} successfully:`);
    console.log('  Title: Grand Egypt Nile Journey: Cairo, Luxor & Aswan');
    console.log('  Slug:  grand-egypt-nile-journey-cairo-luxor-aswan');
    console.log('  Days:  8 | Nights: 7');
    console.log('  Price: EGP 25,000 / USD 520 / SAR 1,950');
    await mongoose_1.default.disconnect();
};
seed().catch((err) => { console.error(err); process.exit(1); });
//# sourceMappingURL=seedTour.js.map