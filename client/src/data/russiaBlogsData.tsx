// Static Russia blog data — future: replaced by backend API responses

export interface BlogSection {
  type: 'paragraph' | 'h2' | 'quote' | 'list' | 'tips' | 'image';
  content?: string;
  items?: string[];
  image?: string;
  caption?: string;
  label?: string;
}

export interface RussiaBlog {
  slug: string;
  title: { en: string; ar: string };
  excerpt: { en: string; ar: string };
  metaDesc: { en: string; ar: string };
  coverImage: string;
  readTime: number;
  publishedAt: string;
  author: { en: string; ar: string };
  tags: { en: string[]; ar: string[] };
  sections: { en: BlogSection[]; ar: BlogSection[] };
}

export const RUSSIA_BLOGS: RussiaBlog[] = [
  // ─── 1. Moscow 7-Day Guide ───────────────────────────────────────────────────
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
    metaDesc: {
      en: 'Complete 7-day Moscow itinerary for Saudi tourists: Kremlin, Red Square, metro tour, Arbat Street, Golden Ring day trip, halal restaurants & practical tips for 2026.',
      ar: 'برنامج سياحي كامل لمدة 7 أيام في موسكو للسياح السعوديين: الكرملين، الميدان الأحمر، مترو موسكو، شارع أربات، ومطاعم حلال 2026.',
    },
    coverImage: 'https://images.unsplash.com/photo-1547448415-e9f5b28e570d?w=1200&q=85',
    readTime: 12,
    publishedAt: '2026-07-15',
    author: { en: 'Alforsa Travel Team', ar: 'فريق ألفرسا للسياحة' },
    tags: {
      en: ['Moscow', 'Russia', 'Itinerary', 'Saudi Travelers', 'Travel Tips', 'Halal Travel'],
      ar: ['موسكو', 'روسيا', 'برنامج سياحي', 'مسافرون سعوديون', 'سياحة حلال'],
    },
    sections: {
      en: [
        {
          type: 'paragraph',
          content:
            "Moscow is one of those cities that stops you mid-stride. Nowhere else on earth will you stand between a 16th-century fortress, an ornate communist department store, a gilded Orthodox cathedral, and a gleaming glass skyscraper — all within a five-minute walk. For Saudi travelers, Moscow offers a thrilling contrast: the familiarity of a grand, palace-rich Islamic heritage (Kazan's influence permeates the city) meets the sheer spectacle of imperial Russian excess. This 7-day guide is your blueprint for experiencing Moscow at its absolute finest.",
        },
        {
          type: 'h2',
          content: 'Day 1–2: Red Square & The Kremlin — The Soul of Russia',
        },
        {
          type: 'paragraph',
          content:
            "Your Moscow journey begins where Russian history was forged: Red Square. At 330 metres long and flanked by St. Basil's Cathedral, the Kremlin towers, Lenin's Mausoleum, and the magnificent GUM department store, this is one of the most photographed plazas on earth — and for good reason. Visit at sunset when the golden onion domes of St. Basil's ignite against the twilight sky for photographs you'll treasure forever. Dedicate Day 2 to the Kremlin interior: the Armoury Museum houses Tsar diamonds, Fabergé eggs, and imperial carriages, while the Diamond Fund displays gems that outshine anything in London or Paris.",
        },
        {
          type: 'image',
          image: 'https://images.unsplash.com/photo-1513326738677-b964603b136d?w=1000&q=80',
          caption: 'Red Square at dusk — one of the world\'s most iconic public spaces',
        },
        {
          type: 'h2',
          content: "Day 3: Moscow's Underground Palaces — The World's Most Beautiful Metro",
        },
        {
          type: 'paragraph',
          content:
            "This is Moscow's best-kept secret for first-time visitors. The Moscow Metro isn't just transport — it's an art gallery built 40 metres underground. Stations like Komsomolskaya (Baroque chandeliers, marble ceilings), Mayakovskaya (stainless steel arches, Art Deco mosaics), and Novoslobodskaya (stained-glass windows glowing like a cathedral) were built as 'palaces for the people' in the 1930s–50s. Take the Circle Line (Ring Line) as a self-guided tour. In the afternoon, stroll Arbat Street — Moscow's oldest pedestrian street — lined with street artists, souvenir shops, and cafes, then grab dinner at one of Tverskaya's many halal restaurants.",
        },
        {
          type: 'h2',
          content: 'Day 4: Tretyakov Gallery & Gorky Park — Culture Meets Leisure',
        },
        {
          type: 'paragraph',
          content:
            "The Tretyakov Gallery holds Russia's most important collection of national art — 180,000 works spanning 1,000 years, including Andrei Rublev's iconic icons and the largest collection of Russian realist paintings anywhere. After the museum, cross the Vodootvodny Canal to Gorky Park: a sprawling riverside leisure space where Muscovites rent bikes, kayaks, and rollerblades. In summer, the outdoor terrace restaurants along the park serve excellent food with views of the Moscow River. It's the perfect place to watch everyday Moscow life.",
        },
        {
          type: 'quote',
          content:
            '"Moscow is not merely Russia\'s capital — it is Russia\'s soul condensed into one glittering, contradictory, endlessly surprising city. Every corner has a story. Every palace hides a secret."',
        },
        {
          type: 'h2',
          content: 'Day 5: Sparrow Hills, Moscow City & Novodevichy Convent',
        },
        {
          type: 'paragraph',
          content:
            "Start the morning at Sparrow Hills Observation Deck for Moscow's best panoramic view — the city stretches before you with Moscow City's glass towers on one side and Stalin's Seven Sisters skyscrapers piercing the horizon. Then visit the UNESCO-listed Novodevichy Convent, a stunning walled monastery where Russia's tsars buried their relatives. By afternoon, head to Moscow City (Moskva-City) — Russia's Manhattan — where glass skyscrapers soar above the Moscow River. The Federation Tower's Sky observation deck (354m) offers the highest city views in Europe.",
        },
        {
          type: 'h2',
          content: 'Day 6: Golden Ring Day Trip — Sergiev Posad (90 min from Moscow)',
        },
        {
          type: 'paragraph',
          content:
            "The Golden Ring is a circuit of ancient Russian towns northeast of Moscow, each preserving medieval churches, monasteries, and kremlin fortresses unchanged for centuries. The most accessible from Moscow is Sergiev Posad (90 minutes by commuter train), home to the Trinity Lavra of St. Sergius — Russia's most important monastery and a UNESCO World Heritage Site. The blue-and-gold domes of Dormition Cathedral and the fortress walls create a scene of extraordinary medieval grandeur. For longer day trips, Suzdal and Vladimir offer even deeper immersion into pre-Petrine Russia.",
        },
        {
          type: 'h2',
          content: 'Day 7: Izmailovo Market & Departure',
        },
        {
          type: 'paragraph',
          content:
            "Spend your final Moscow morning at Izmailovo Kremlin and Vernissage Market — the largest flea market in Russia. Spread across a fairy-tale wooden kremlin complex, it's the ultimate place for Russian souvenirs: hand-painted matryoshka dolls, amber jewelry, Soviet memorabilia, fur hats (ushanka), and traditional khokhloma lacquerware at prices far below the tourist shops near Red Square. Haggling is expected and prices can drop 30–40%. Catch an afternoon or evening flight — Sheremetyevo (SVO) serves direct flights to Riyadh, Jeddah, and Dubai.",
        },
        {
          type: 'tips',
          label: '🏆 Essential Moscow Tips for Saudi Travelers',
          items: [
            'Book Kremlin & Diamond Fund tickets online at least 2 weeks ahead — they sell out fast',
            'Download Yandex Go for taxis — far cheaper than hotel cabs and works without Russian SIM',
            'Buy a Troika metro card (10-trip) at any station — saves 30% vs single tickets',
            'Best photo timing: Red Square at blue hour (30 min after sunset)',
            'Halal restaurants: Barashka (Petrovka St), Plov Centre (Sadovnicheskaya), Uzbekistan (Neglinnaya St)',
            'UnionPay cards work in Russian banks and ATMs — bring USD/EUR cash as backup',
            'Dress code: shoulders and knees covered for entering churches and the Kremlin cathedrals',
            'Stay near Tverskaya or Okhotny Ryad metro stations — 5 min walk from Red Square',
          ],
        },
      ],
      ar: [
        {
          type: 'paragraph',
          content:
            'موسكو — قلب روسيا النابض — من أكثر المدن إثارةً في العالم. تجمع بين عظمة القياصرة وبريق الحداثة والتراث الإسلامي العميق في تتارستان المجاورة. هذا الدليل يضع بين يديك خارطة طريق لأسبوع لا يُنسى في العاصمة الروسية.',
        },
        { type: 'h2', content: 'اليوم 1–2: الميدان الأحمر والكرملين' },
        {
          type: 'paragraph',
          content:
            'ابدأ رحلتك من حيث صُنعت روسيا — الميدان الأحمر. يحده الكرملين وكاتدرائية القديس باسيل وضريح لينين ومول غوم الأسطوري. خصّص اليوم الثاني لداخل الكرملين: متحف الأسلحة يعرض مجوهرات التاج الإمبراطورية وبيض فابيرجيه وعربات القياصرة.',
        },
        { type: 'image', image: 'https://images.unsplash.com/photo-1513326738677-b964603b136d?w=1000&q=80', caption: 'الميدان الأحمر عند الغروب — من أشهر الساحات في التاريخ' },
        { type: 'h2', content: 'اليوم 3: مترو موسكو الفريد وشارع أربات' },
        {
          type: 'paragraph',
          content:
            'مترو موسكو ليس مجرد وسيلة نقل — بل متحف فني تحت الأرض. محطات كـ"كومسومولسكايا" و"نوفوسلوبودسكايا" تنبهر بزخارفها الرخامية وثرياتها الذهبية. بعد الظهر، تجوّل في شارع أربات العريق الذي يزخر بمحلات التحف والمقاهي وفناني الشوارع.',
        },
        { type: 'h2', content: 'اليوم 4–5: المتاحف وبارك غوركي وتلة الطيور' },
        {
          type: 'paragraph',
          content:
            'غاليري تريتياكوف يضم أعظم مجموعة فنية روسية — 180,000 قطعة تمتد 1000 سنة. ثم استرخِ في بارك غوركي على ضفاف نهر موسكو. في اليوم الخامس، اصعد إلى تلة الطيور لأفضل منظر بانورامي لموسكو، ثم ادخل دير نوفوديفيتشي المدرج على قائمة اليونسكو.',
        },
        { type: 'h2', content: 'اليوم 6: رحلة يوم إلى سيرغييف بوساد' },
        {
          type: 'paragraph',
          content:
            'على بُعد 90 دقيقة بالقطار، تنتظرك مدينة سيرغييف بوساد وديرها العظيم "ترويتسكايا لافرا" — أقدس موقع ديني روسي ومدرج على قائمة التراث العالمي. قبابها الذهبية وأسوارها القروسطية مشهد لا يُصدَّق.',
        },
        { type: 'h2', content: 'اليوم 7: سوق إزمايلوفو والمغادرة' },
        {
          type: 'paragraph',
          content:
            'اقضِ صباحك الأخير في سوق إزمايلوفو — أكبر بازار في روسيا. دمى ماتريوشكا، مجوهرات الكهرمان، قبعات الفرو، والتحف التقليدية بأسعار أقل بكثير من محلات المنطقة السياحية. المساومة متوقعة ومقبولة.',
        },
        {
          type: 'tips',
          label: '🏆 نصائح ذهبية لزيارة موسكو',
          items: [
            'احجز تذاكر الكرملين أونلاين قبل أسبوعين على الأقل',
            'حمّل تطبيق Yandex Go للتاكسي — أرخص وأموثوق',
            'بطاقة تروييكا للمترو (10 رحلات) توفر 30% من التكلفة',
            'مطاعم حلال في موسكو: باراشكا وبلوف سنتر ومطعم أوزبكستان',
            'احضر دولارات أو يوروهات نقداً — بطاقات فيزا محدودة',
            'ارتدِ ملابس محتشمة لدخول الكنائس والكاتدرائيات',
          ],
        },
      ],
    },
  },

  // ─── 2. St. Petersburg White Nights ─────────────────────────────────────────
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
    metaDesc: {
      en: "Complete guide to St. Petersburg White Nights 2026: Hermitage Museum, Peterhof Palace, drawbridges at midnight, Mariinsky Theatre, canal boat tours & tips for Saudi travelers.",
      ar: 'دليل شامل لليالي البيضاء في سانت بطرسبرغ 2026: الإرميتاج، بيترهوف، جسور السحب وجولات القنوات للمسافرين السعوديين.',
    },
    coverImage: 'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?w=1200&q=85',
    readTime: 10,
    publishedAt: '2026-07-22',
    author: { en: 'Alforsa Travel Team', ar: 'فريق ألفرسا للسياحة' },
    tags: {
      en: ['St. Petersburg', 'White Nights', 'Hermitage', 'Russia Summer', 'Peterhof', 'Travel Guide'],
      ar: ['سانت بطرسبرغ', 'الليالي البيضاء', 'الإرميتاج', 'روسيا صيفاً', 'بيترهوف'],
    },
    sections: {
      en: [
        {
          type: 'paragraph',
          content:
            "Between June 11 and July 2 each year, St. Petersburg barely sees darkness. For those magical three weeks, the sun skims below the horizon but never fully disappears — bathing Russia's most beautiful city in an ethereal golden glow that lasts through midnight. The White Nights (Belye Nochi) are St. Petersburg's most celebrated phenomenon, drawing visitors from across the world to witness a city transformed by perpetual twilight. For Saudi travelers accustomed to blazing heat and dark nights, this extraordinary inversion of nature is genuinely mind-bending.",
        },
        {
          type: 'h2',
          content: 'The Hermitage: One of Earth\'s Greatest Art Collections',
        },
        {
          type: 'paragraph',
          content:
            "The State Hermitage Museum, housed across five interconnected palaces along the Neva River, is simply one of the most overwhelming cultural experiences on earth. With over 3 million items — only 5% displayed at any given time — a single visit can easily consume an entire day. Highlights include the Jordan Staircase (pure white marble and gold), rooms of Rembrandt and Rubens, the Gold Rooms with Scythian treasures, and the magnificent Malachite Room where the provisional Russian government signed its last decrees. Book a guided 3-hour essential highlights tour to avoid decision paralysis.",
        },
        {
          type: 'image',
          image: 'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?w=1000&q=80',
          caption: "The Hermitage's Winter Palace — one of the world's most magnificent buildings",
        },
        {
          type: 'h2',
          content: 'Peterhof Palace: The Russian Versailles in Full Summer Glory',
        },
        {
          type: 'paragraph',
          content:
            "45 minutes from St. Petersburg by hydrofoil across the Gulf of Finland, Peterhof Palace reaches its peak glory in summer. Peter the Great's answer to Versailles boasts 150 fountains, 4 cascades, and golden statues that frame a grand canal stretching to the sea. The Grand Cascade — 64 fountains centered on a golden Samson statue — is among the most spectacular fountain systems ever built. Visit on a weekday to avoid peak crowds, and stay for the grand summer fountain shows staged on select evenings.",
        },
        {
          type: 'h2',
          content: 'Midnight Drawbridges: The City\'s Most Spectacular Nightly Show',
        },
        {
          type: 'paragraph',
          content:
            "Every night between late April and November, St. Petersburg's 13 moveable bridges rise to let ships pass through the city from 1:25 AM to 5:00 AM. The most spectacular are Palace Bridge (directly in front of the Hermitage, opens 1:25 AM) and Blagoveshchensky Bridge. During the White Nights, these drawbridge spectacles unfold in magical golden twilight rather than darkness — hundreds of onlookers gather on the Neva embankments to watch. Book a White Nights canal cruise in advance: the best boats depart around midnight and offer champagne, live Russian music, and close-up views of the rising bridges.",
        },
        {
          type: 'quote',
          content:
            '"To see St. Petersburg in the White Nights is to understand why poets, tsars, and Dostoevsky himself called it the most beautiful and the most terrible city in the world. The light does something to the soul."',
        },
        {
          type: 'h2',
          content: 'Mariinsky Theatre & Cultural Events',
        },
        {
          type: 'paragraph',
          content:
            "The White Nights Festival (late May–mid July) transforms the city into a global stage. The Mariinsky Theatre — home of the Kirov Ballet and one of the world's most revered opera houses — hosts nightly performances of classical Russian ballet (Swan Lake, Sleeping Beauty) and opera by international stars. Tickets sell out months in advance; book through the official Mariinsky website immediately after purchasing your Russia flights. The Hermitage also hosts special White Nights gala nights when the palace rooms stay open until midnight — a once-in-a-lifetime experience.",
        },
        {
          type: 'h2',
          content: 'Getting Around St. Petersburg',
        },
        {
          type: 'paragraph',
          content:
            "St. Petersburg's metro covers all major sights efficiently — buy a contactless Podorozhnik card for unlimited trips. The historic centre is compact and very walkable; the Nevsky Prospekt boulevard stretches 4.5 km from the Hermitage to the Alexander Nevsky Monastery, connecting most major attractions. Canal boat tours are both practical and scenic — boats depart from Anichkov Bridge and Fontanka embankment throughout the day. Rent a bike through the city's Velobike scheme to explore at your own pace.",
        },
        {
          type: 'tips',
          label: '✨ White Nights Insider Tips',
          items: [
            'Book canal cruise tickets 2–3 weeks ahead — midnight bridge tours sell out in peak season',
            'Mariinsky Theatre: book online at mariinsky.ru as soon as flights are confirmed',
            'Bring an eye mask — hotel rooms light up at 3 AM even with curtains',
            'Best drawbridge viewing spot: Vasilievsky Island embankment (free, uncrowded)',
            'Peterhof: go weekday, arrive when doors open at 9 AM to beat crowds',
            'Halal food in St. Petersburg: Halal Market (Nevsky Prospekt), Coucous (Vasilievsky Island)',
            'White Nights officially start June 11 — book accommodations 4+ months ahead',
            'Temperature June-July: 18–24°C — bring a light jacket for midnight canal rides',
          ],
        },
      ],
      ar: [
        {
          type: 'paragraph',
          content:
            'بين 11 يونيو و2 يوليو من كل عام، تعيش سانت بطرسبرغ ظاهرة فلكية نادرة: الشمس لا تغيب تماماً، وتبقى السماء في شفق ذهبي سحري حتى منتصف الليل. هذه "الليالي البيضاء" هي أكثر ما يميز هذه المدينة الاستثنائية، وتجعلها وجهة يحلم بها المسافرون من كل أنحاء العالم.',
        },
        { type: 'h2', content: 'متحف الإرميتاج: كنز الفن الإنساني' },
        {
          type: 'paragraph',
          content:
            'يضم الإرميتاج أكثر من 3 ملايين قطعة فنية في خمسة قصور متصلة على ضفاف نهر نيفا. يستحق زيارة يوم كامل. أبرز ما فيه: سلّم الأردن الرخامي المذهّب، قاعات رامبرانت وروبنس، وقاعة الملكيت الخضراء الأسطورية. احجز جولة إرشادية لمدة 3 ساعات لتغطية أهم المعروضات.',
        },
        { type: 'image', image: 'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?w=1000&q=80', caption: 'قصر الشتاء — مقر متحف الإرميتاج الأسطوري' },
        { type: 'h2', content: 'قصر بيترهوف: فرساي روسيا في عزّ الصيف' },
        {
          type: 'paragraph',
          content:
            'على بُعد 45 دقيقة بالقارب السريع، يبهرك بيترهوف بـ150 نافورة وأربع شلالات وتماثيل ذهبية تحفّ بقناة عظيمة تمتد حتى خليج فنلندا. زره في يوم من أيام الأسبوع لتتجنب الازدحام، وابق لمشاهدة عروض النوافير الصيفية المسائية الرائعة.',
        },
        { type: 'h2', content: 'جسور السحب: المشهد الأسطوري عند منتصف الليل' },
        {
          type: 'paragraph',
          content:
            'كل ليلة، ترتفع 13 جسراً في المدينة لتمرير السفن بين الساعة 1:25 صباحاً والفجر. خلال الليالي البيضاء، يحدث هذا المشهد في شفق ذهبي ساحر وليس في الظلام. احجز جولة قناة ليلية مسبقاً — أفضلها تنطلق عند منتصف الليل مع موسيقى روسية حية.',
        },
        { type: 'h2', content: 'مهرجان الليالي البيضاء والمسرح الماريينسكي' },
        {
          type: 'paragraph',
          content:
            'المسرح الماريينسكي — أحد أرقى دور الأوبرا والباليه في العالم — يستضيف خلال الليالي البيضاء عروضاً استثنائية للبالية الكلاسيكي. التذاكر تُباع بشكل مبكر جداً؛ احجز عبر mariinsky.ru فور تأكيد رحلتك.',
        },
        {
          type: 'tips',
          label: '✨ نصائح للليالي البيضاء',
          items: [
            'احجز جولات القنوات الليلية قبل أسبوعين على الأقل',
            'احضر قناعاً للنوم — الغرف تضاء بالشفق من الساعة 3 فجراً',
            'أفضل نقطة لمشاهدة الجسور: جزيرة فاسيليفسكي (مجاناً)',
            'مطاعم حلال: Halal Market على نيفسكي بروسبيكت',
            'درجة الحرارة يونيو-يوليو: 18-24 درجة — احضر جاكيت خفيف',
          ],
        },
      ],
    },
  },

  // ─── 3. Lake Baikal Winter ───────────────────────────────────────────────────
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
    metaDesc: {
      en: "Lake Baikal winter guide 2026: how to get there from Moscow, ice walks, hovercraft tours, ice caves, dog sledding, Buryat culture & best February travel tips for Saudi visitors.",
      ar: 'دليل بحيرة بايكال الشتوي 2026: كيف تصل من موسكو، المشي على الجليد، كهوف الجليد، وأفضل نصائح السفر لفبراير.',
    },
    coverImage: 'https://images.unsplash.com/photo-1551966775-a4ddc8df052b?w=1200&q=85',
    readTime: 11,
    publishedAt: '2026-08-05',
    author: { en: 'Alforsa Travel Team', ar: 'فريق ألفرسا للسياحة' },
    tags: {
      en: ['Lake Baikal', 'Russia Winter', 'Siberia', 'Ice Travel', 'Adventure', 'Bucket List'],
      ar: ['بحيرة بايكال', 'روسيا الشتاء', 'سيبيريا', 'مغامرة', 'تجارب فريدة'],
    },
    sections: {
      en: [
        {
          type: 'paragraph',
          content:
            "There is nowhere else on earth quite like Lake Baikal in winter. The world's deepest lake (1,642 metres) and oldest (25 million years) holds 20% of all unfrozen fresh water on the planet. Every February, this colossal body of water transforms into a surreal ice sheet stretching 636 kilometres — transparent turquoise in some places, milky white in others, cracked into cathedral-scale fissures that thunder and groan as the ice shifts. For Saudi travelers who have never experienced extreme cold, this is an adventure that rewires the senses entirely.",
        },
        {
          type: 'h2',
          content: 'Getting There: Moscow to Irkutsk',
        },
        {
          type: 'paragraph',
          content:
            "Baikal's gateway city is Irkutsk — a charming Siberian city of wooden merchant mansions and Orthodox churches that itself deserves a full day of exploration. Irkutsk is 5–6 hours direct flight from Moscow (Aeroflot, S7 Airlines) or 80+ hours on the Trans-Siberian Railway for the true adventure experience. From Irkutsk, the village of Listvyanka on Baikal's western shore is 65 km (1 hour by bus or taxi). The island of Olkhon, accessed by hovercraft in winter, is the spiritual heart of Baikal and the most spectacular base for ice experiences.",
        },
        {
          type: 'image',
          image: 'https://images.unsplash.com/photo-1551966775-a4ddc8df052b?w=1000&q=80',
          caption: "Baikal's winter ice — one of nature's most extraordinary phenomena",
        },
        {
          type: 'h2',
          content: 'The Ice Experiences You Cannot Miss',
        },
        {
          type: 'paragraph',
          content:
            "Walking on Baikal's ice feels like walking on glass — in the clearest sections, you can see down several metres into the dark water below. Rent ice crampons and trekking poles from Irkutsk tour agencies. The most dramatic ice caves form on Olkhon Island's northwest coast each February — grottos of blue and jade-green ice that glow in the afternoon sun. Hovercraft tours zip across the frozen lake at 70 km/h, stopping at cave formations and remote bays. Dog sledding across the ice with Buryat mushers is among the most exhilarating activities available anywhere on earth.",
        },
        {
          type: 'h2',
          content: 'Buryat Culture: The Soul of Siberia',
        },
        {
          type: 'paragraph',
          content:
            "Olkhon Island is home to the Buryat people — a Buddhist Mongolic group with a rich shamanic tradition stretching back millennia. Shamanic rock formations, sacred trees wrapped in colored ribbons, and the spiritual energy of Cape Burkhan (Shaman Rock) give Olkhon an otherworldly atmosphere. The Buryat cuisine is a discovery in itself: buuzy (steamed meat dumplings similar to Gulf manti), pozitsy (baked dumplings), and smoked omul — Baikal's endemic fish — are essential eating. Most Buryat cuisine is meat-heavy and naturally halal (no pork in traditional recipes).",
        },
        {
          type: 'quote',
          content:
            '"Standing on the frozen surface of Baikal, hearing the ice crack beneath you — ancient, 25-million-year-old ice groaning with the memory of geological time — this is when travel becomes something larger than tourism."',
        },
        {
          type: 'h2',
          content: 'Best Time to Visit & Practical Essentials',
        },
        {
          type: 'paragraph',
          content:
            "The ice is at its most spectacular and structurally safe in mid-February to mid-March. January can be too cold for comfortable travel (down to -30°C on Olkhon). March offers slightly warmer temperatures (-10 to -15°C) while the ice remains thick. The ice road to Olkhon opens around late January and closes by late March — check current conditions with your tour operator. Temperatures in Irkutsk in February average -16°C, dropping to -20 to -25°C on the lake. Proper layering is essential: thermal base layer, fleece mid-layer, windproof outer shell.",
        },
        {
          type: 'tips',
          label: '❄️ Lake Baikal Winter Survival Guide',
          items: [
            'Best timing: February 10 – March 5 (ice thick, caves formed, not too cold)',
            'Book Olkhon Island homestays or guesthouses 2–3 months ahead — very limited beds',
            'Clothing: -30°C rated down jacket, thermal long johns, wool socks, winter boots rated to -40°C',
            'Hovercraft to Olkhon: runs only when ice is safe — book via Irkutsk tour agencies',
            'Ice crampons: rent in Listvyanka or Olkhon village (approx SAR 25/day)',
            'No ATMs on Olkhon — withdraw cash in Irkutsk before departure',
            'Bring a high-quality polarised lens camera filter — ice photography is extraordinary',
            'Halal eating: Listvyanka has several fish restaurants (omul is halal) and Buryat meat dishes',
          ],
        },
      ],
      ar: [
        {
          type: 'paragraph',
          content:
            'لا يوجد مكان آخر في العالم مثل بحيرة بايكال في الشتاء. أعمق بحيرة في العالم (1,642 متر) تتحول كل فبراير إلى صفيحة جليدية فيروزية شفافة تمتد 636 كيلومتراً، مع شقوق جليدية بأحجام الكاتدرائيات وأصوات تشبه الرعد. تجربة تُعيد ضبط الحواس تماماً.',
        },
        { type: 'h2', content: 'كيف تصل: موسكو إلى إيركوتسك' },
        {
          type: 'paragraph',
          content:
            'بوابة بايكال هي مدينة إيركوتسك — 5-6 ساعات جواً من موسكو أو 80+ ساعة على قطار عبر سيبيريا للمغامرين. من إيركوتسك، قرية ليستفيانكا على الضفة الغربية على بُعد 65 كم (ساعة بالسيارة). جزيرة أولخون — روح بايكال الروحية — تُعدّ أفضل قاعدة لتجارب الجليد.',
        },
        { type: 'image', image: 'https://images.unsplash.com/photo-1551966775-a4ddc8df052b?w=1000&q=80', caption: 'جليد بايكال الشتوي — من أكثر مناظر الطبيعة إثارة في العالم' },
        { type: 'h2', content: 'تجارب الجليد التي لا تُفوَّت' },
        {
          type: 'paragraph',
          content:
            'المشي على جليد بايكال يشبه المشي على الزجاج — في الأماكن الأكثر شفافية ترى قاع البحيرة على عمق عدة أمتار. أبرز التجارب: كهوف الجليد الزرقاء في جزيرة أولخون، جولات الحوّامات بسرعة 70 كم/ساعة، وقيادة مزلقات الكلاب مع مرشدين بوريات.',
        },
        { type: 'h2', content: 'ثقافة البوريات: روح سيبيريا' },
        {
          type: 'paragraph',
          content:
            'شعب البوريات البوذي يعيش حول البحيرة بتراث شاماني عريق. مأكولاتهم غنية باللحوم وغالباً حلال: "بووزي" (زلابية لحم مطبوخة على البخار)، "بوزيتسي"، وسمك الأوموول المدخن المتوطن في بايكال — كله تجربة طعام استثنائية.',
        },
        {
          type: 'tips',
          label: '❄️ دليل البقاء في بايكال الشتوي',
          items: [
            'أفضل توقيت: 10 فبراير – 5 مارس (جليد سميك وليس شديد البرودة)',
            'احجز مسكنك في جزيرة أولخون قبل 2-3 أشهر',
            'ملابس دافئة مُقيَّمة لـ-40 درجة مئوية — ضرورة حتمية',
            'لا صرافات آلية في أولخون — اسحب النقود من إيركوتسك',
            'احضر كاميرا بعدسة مستقطبة لتصوير الجليد بشكل مذهل',
          ],
        },
      ],
    },
  },

  // ─── 4. Trans-Siberian Railway ───────────────────────────────────────────────
  {
    slug: 'trans-siberian-railway-ultimate-guide',
    title: {
      en: 'Trans-Siberian Railway: The Epic Journey Every Saudi Traveler Must Know',
      ar: 'قطار عبر سيبيريا: الرحلة الأسطورية التي يجب على كل مسافر سعودي معرفتها',
    },
    excerpt: {
      en: '9,289 kilometres, 8 time zones, 14 days across the full breadth of the earth\'s largest country — the Trans-Siberian Railway is the greatest train journey in the world, and it\'s more accessible than you think.',
      ar: '9,289 كيلومتراً عبر 8 مناطق زمنية وأعظم رحلة قطار في التاريخ — قطار عبر سيبيريا أكثر سهولاً مما تتخيل.',
    },
    metaDesc: {
      en: "Trans-Siberian Railway guide for Saudi travelers 2026: three routes, how to book, which class to choose, key stops, packing list, halal food on board & total cost in SAR.",
      ar: 'دليل قطار عبر سيبيريا للمسافرين السعوديين 2026: المسارات الثلاثة، كيفية الحجز، الدرجات المختلفة والتكلفة الإجمالية.',
    },
    coverImage: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=1200&q=85',
    readTime: 14,
    publishedAt: '2026-08-12',
    author: { en: 'Alforsa Travel Team', ar: 'فريق ألفرسا للسياحة' },
    tags: {
      en: ['Trans-Siberian', 'Train Travel', 'Russia', 'Adventure', 'Bucket List', 'Siberia'],
      ar: ['عبر سيبيريا', 'سفر بالقطار', 'روسيا', 'مغامرة', 'سيبيريا'],
    },
    sections: {
      en: [
        {
          type: 'paragraph',
          content:
            "The Trans-Siberian Railway is, without exaggeration, the greatest land journey on earth. At 9,289 kilometres from Moscow to Vladivostok on the Pacific coast, it spans 8 time zones, crosses the Ural Mountains (the geographical boundary between Europe and Asia), traverses the endless Siberian taiga, skirts the shore of Lake Baikal, and passes through dozens of cities, settlements, and villages whose names appear nowhere else in world geography. For Saudi travelers who have conquered the world's famous destinations, this is the journey that remains — the one everyone talks about but few have done.",
        },
        {
          type: 'h2',
          content: 'The Three Great Routes',
        },
        {
          type: 'paragraph',
          content:
            "There are actually three trans-continental routes. The original Trans-Siberian (Moscow–Vladivostok, 6–8 days non-stop) is purely Russian territory. The Trans-Mongolian branches south through Ulaanbaatar to Beijing, adding the Gobi Desert and Great Wall (7–8 days Moscow to Beijing). The Trans-Manchurian also reaches Beijing but via northeastern China. Most first-time travelers choose either the full Trans-Siberian in short segments (taking a break at Irkutsk/Baikal) or the Trans-Mongolian for the extraordinary diversity of landscapes: Russian taiga → Mongolian steppe → Chinese farmland, all in one continuous journey.",
        },
        {
          type: 'image',
          image: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=1000&q=80',
          caption: 'The Trans-Siberian Railway — 9,289 km across the world\'s largest country',
        },
        {
          type: 'h2',
          content: 'Choosing Your Class: Platzkart, Kupe & Spalny Vagon',
        },
        {
          type: 'paragraph',
          content:
            "Russian trains have three main sleeping classes. Platzkart (3rd class) is an open-plan carriage with fold-down bunks — 54 passengers sharing one open space. Dirty but character-filled, it's where real Russian travel stories are made; budget travelers love it (around SAR 300–500 Moscow–Irkutsk). Kupe (2nd class / 4-berth compartments) is the sweet spot: a private lockable compartment for 4 passengers with fold-down upper bunks, a fold-out table, and reasonable privacy (SAR 800–1,500). Spalny Vagon (1st class / 2-berth) is the luxury option with wood paneling, a private WC, and included meals (SAR 2,500–4,000). For Saudi travelers valuing privacy, Kupe is the minimum recommended class.",
        },
        {
          type: 'h2',
          content: 'Key Stops Worth Breaking Your Journey',
        },
        {
          type: 'paragraph',
          content:
            "The magic of the Trans-Siberian is in stopping, not just passing through. Yekaterinburg (26 hours from Moscow) marks the Europe-Asia border and was where the last Tsar was executed in 1918 — a city of genuine historical weight. Novosibirsk (39 hours, Russia's third city) has a world-class opera house and the fascinating Akademgorodok science city nearby. Irkutsk (75 hours) is the gateway to Lake Baikal — stop here for 3–5 days. Vladivostok (the Pacific terminus) is a Korean-influenced port city with outstanding seafood, cable cars over the Golden Horn Bay, and a recently renovated historic centre. Allow 2–3 weeks total if stopping properly.",
        },
        {
          type: 'quote',
          content:
            '"At some point on the third day across the Siberian taiga, when you realize the birch forests have been identical for 24 hours and the train is still moving, you understand the true scale of Russia. It is humbling in a way that no photograph can prepare you for."',
        },
        {
          type: 'h2',
          content: 'Food, Water & Halal Provisions',
        },
        {
          type: 'paragraph',
          content:
            "Every Trans-Siberian train has a restaurant car serving hot Russian meals — borscht, pelmeni, chicken dishes, and breakfasts. Quality and halal compliance vary; it's wise to bring supplementary provisions. At every major station stop (15–30 minutes), platform vendors sell local food: Siberian pastries, smoked fish, pies, dried fruit, and nuts. For Muslim travelers, pack sealed halal snacks, instant noodles, dried fruits, nuts, and halal-certified instant soups to supplement platform food. Hot water (kipyatok) is free from the samovar at the end of every carriage — available 24 hours. Local supermarkets at station stops (bring a phrasebook or Google Translate) often stock tinned halal meat.",
        },
        {
          type: 'h2',
          content: 'How to Book & Total Cost in SAR',
        },
        {
          type: 'paragraph',
          content:
            "The official booking platform is rzd.ru (Russian Railways) — most routes bookable in English. For international Trans-Mongolian/Trans-Manchurian routes, book through TrainLine Europe or specialist agents like Real Russia. Booking opens 90 days in advance; June–August and New Year periods sell out weeks ahead. Budget a complete Moscow–Vladivostok journey (2nd class Kupe, 8 nights) at around SAR 2,000–3,500 for the train only. The Trans-Mongolian to Beijing in 1st class including stopovers runs approximately SAR 5,000–8,000 for the rail portion. Alforsa can arrange complete Trans-Siberian packages including flights, stopovers, accommodation, and local guides.",
        },
        {
          type: 'tips',
          label: '🚂 Trans-Siberian Packing Essentials',
          items: [
            'Offline map app (Maps.me) with Russia downloaded — no Wi-Fi on the train',
            'Download Yandex Translate offline Russian pack before departure',
            'Bring a padlock for your Kupe compartment (and for luggage under the lower bunk)',
            'Slippers are essential — Russian travelers change shoes on boarding',
            'A week\'s supply of halal snacks: dried dates, nuts, halal protein bars, instant soups',
            'Power bank (charging points limited in lower classes)',
            'A physical Russian phrasebook — apps fail in tunnels and remote areas',
            'Light sleeping sheet/liner — bedding is provided but a thin liner adds comfort',
            'Books, card games, downloaded films — 8 days is long, even with stunning scenery',
          ],
        },
      ],
      ar: [
        {
          type: 'paragraph',
          content:
            'قطار عبر سيبيريا هو الرحلة البرية الأعظم في تاريخ البشرية. 9,289 كيلومتراً من موسكو إلى فلاديفوستوك على المحيط الهادي، عابراً 8 مناطق زمنية وسلسلة جبال الأورال وغابات سيبيريا اللانهائية وشاطئ بحيرة بايكال. للمسافر السعودي الذي جاب العالم — هذه هي الرحلة المتبقية.',
        },
        { type: 'h2', content: 'المسارات الثلاثة الكبرى' },
        {
          type: 'paragraph',
          content:
            'المسار الأصلي: موسكو–فلاديفوستوك (6-8 أيام). المسار عبر منغوليا: يتفرع جنوباً عبر أولان باتور إلى بكين، ويمر بصحراء غوبي وسور الصين العظيم. المسار عبر منشوريا: يصل أيضاً إلى بكين عبر شمال الصين. معظم المسافرين للمرة الأولى يختارون إما المسار الروسي مع توقف في بايكال، أو المسار المنغولي لتنوعه الاستثنائي.',
        },
        { type: 'image', image: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=1000&q=80', caption: 'قطار عبر سيبيريا — أعظم رحلة برية في التاريخ' },
        { type: 'h2', content: 'الدرجات المختلفة واختيار الأنسب' },
        {
          type: 'paragraph',
          content:
            'ثلاث درجات رئيسية: بلاتسكارت (ثالثة مفتوحة – 54 شخصاً، ~300-500 ريال)، كوبيه (ثانية – مقصورة لـ4 أشخاص، ~800-1500 ريال، الأنسب للعائلات)، وسبالني فاغون (أولى – مقصورة شخصين مع دورة مياه خاصة، ~2500-4000 ريال). للمسافرين السعوديين المهتمين بالخصوصية، درجة كوبيه هي الحد الأدنى الموصى به.',
        },
        { type: 'h2', content: 'الطعام الحلال على متن القطار' },
        {
          type: 'paragraph',
          content:
            'لكل قطار مطعم يقدم أطباقاً روسية ساخنة. للمسلمين: احضر تمراً ومكسرات ومعجنات حلال معلبة وحساءً فورياً لتكميل الوجبات. الماء الساخن (كيبياتوك) مجاني على مدار الساعة من ثرموس المقطورة. عند محطات التوقف الكبيرة، تجد باعة يبيعون فطائر ومنتجات محلية.',
        },
        {
          type: 'tips',
          label: '🚂 حقيبة عبر سيبيريا الأساسية',
          items: [
            'تطبيق خرائط أوفلاين مع تحميل روسيا ومنغوليا مسبقاً',
            'قفل لمقصورة كوبيه وحقائبك',
            'شبشب للارتداء داخل القطار — عادة روسية راسخة',
            'مؤن حلال لأسبوع: تمر، مكسرات، حساء فوري، بروتين بار حلال',
            'باور بانك بسعة كبيرة — الشحن محدود في الدرجات الدنيا',
            'كتب أو ألعاب أو أفلام محملة — 8 أيام طويلة حتى مع المناظر',
          ],
        },
      ],
    },
  },

  // ─── 5. Halal Food Russia ────────────────────────────────────────────────────
  {
    slug: 'halal-food-russia-muslim-travelers',
    title: {
      en: "Halal Food in Russia 2026: The Complete Muslim Traveler's Guide",
      ar: 'الطعام الحلال في روسيا 2026: الدليل الشامل للمسافر المسلم',
    },
    excerpt: {
      en: "Russia has one of the world's largest Muslim populations — 20+ million. From Moscow's renowned Barashka to Kazan's ancient Tatar cuisine, halal dining in Russia is richer, more varied, and more available than any other destination in Europe.",
      ar: 'روسيا تضم أكثر من 20 مليون مسلم — من مطعم باراشكا الشهير في موسكو إلى مطبخ قازان التتاري العريق، الطعام الحلال في روسيا أوفر وأغنى مما تتوقع.',
    },
    metaDesc: {
      en: "Halal food guide Russia 2026: best halal restaurants in Moscow & St. Petersburg, Kazan's Tatar cuisine, apps to find halal food, prayer facilities & tips for Muslim Saudi travelers.",
      ar: 'دليل الطعام الحلال في روسيا 2026: أفضل المطاعم الحلال في موسكو وسانت بطرسبرغ وقازان، تطبيقات البحث عن الطعام الحلال وأماكن الصلاة.',
    },
    coverImage: 'https://images.unsplash.com/photo-1568464333934-67a35f59c98b?w=1200&q=85',
    readTime: 9,
    publishedAt: '2026-08-20',
    author: { en: 'Alforsa Travel Team', ar: 'فريق ألفرسا للسياحة' },
    tags: {
      en: ['Halal Food', 'Muslim Travel', 'Russia', 'Moscow Restaurants', 'Islamic Tourism', 'Kazan'],
      ar: ['طعام حلال', 'سياحة إسلامية', 'روسيا', 'مطاعم موسكو', 'قازان', 'مسلمون في روسيا'],
    },
    sections: {
      en: [
        {
          type: 'paragraph',
          content:
            "Russia is home to over 20 million Muslims — the second-largest religious group in the country — making it one of the most Muslim-friendly destinations in all of Europe or Asia. The Volga Tatars have lived in Russia for over a thousand years, and their culinary traditions permeate Russian food culture far more deeply than most visitors realize. For Saudi and Gulf travelers concerned about halal availability, Russia's reality is far more reassuring than the internet would have you believe. This guide covers everything you need to eat well, pray comfortably, and travel with confidence across Russia's major cities.",
        },
        {
          type: 'h2',
          content: 'Halal in Moscow: Better Than Paris, Easier Than Berlin',
        },
        {
          type: 'paragraph',
          content:
            "Moscow has a thriving halal food scene driven by its large Azerbaijani, Uzbek, Chechen, Tatar, and Kyrgyz communities. The city's Central Mosque near Prospekt Mira metro station is one of Russia's largest (capacity 10,000) and its surrounding neighborhood has concentrated halal butchers, bakeries, and restaurants. Barashka (Петровка 20/1) is Moscow's finest halal restaurant — an upscale Azerbaijani establishment famous for lamb dishes, pomegranate-dressed salads, and an extraordinary bread basket; expect SAR 150–250 per person. Plov Centre (Садовническая ул., 9) is the go-to for Uzbek plov — the definitive Central Asian halal feast, SAR 80–120 per person. For fast halal, Doner Kebab chains (Dodo, Falafel House) are widespread across the city.",
        },
        {
          type: 'image',
          image: 'https://images.unsplash.com/photo-1568464333934-67a35f59c98b?w=1000&q=80',
          caption: "Russia's rich culinary heritage includes deep halal traditions from Tatar and Central Asian cultures",
        },
        {
          type: 'h2',
          content: 'St. Petersburg Halal Options',
        },
        {
          type: 'paragraph',
          content:
            "St. Petersburg has fewer halal options than Moscow but the situation has improved dramatically. The Cathedral Mosque on Kronverksky Prospekt (one of Europe's largest mosques) is the spiritual centre for the city's 300,000-strong Muslim community. The Halal Market on Nevsky Prospekt (near Vosstaniya Square) sells certified halal products and has a small café. Couscous Restaurant on Vasilievsky Island serves North African halal cuisine. The Central Market (Kuznechny Market) has halal butcher stalls. When in doubt, Uzbek and Azerbaijani restaurants — easily identified by their signs — are almost universally halal by tradition.",
        },
        {
          type: 'h2',
          content: 'Kazan: Russia\'s Muslim Capital — A City Every Saudi Traveler Should Visit',
        },
        {
          type: 'paragraph',
          content:
            "800 km east of Moscow, Kazan is the capital of Tatarstan and Russia's most fascinating Islamic city. Here, minarets rise beside Orthodox bell towers in genuinely harmonious coexistence — a UNESCO World Heritage Kremlin contains both the Annunciation Cathedral and the gleaming white Kul Sharif Mosque (opened 2005, capacity 6,000). Kazan's halal food is exceptional: Tatar cuisine features chak-chak (honey-drenched fried dough — the national sweet), echpochmak (triangular meat-and-potato pastry), and belesh (huge baked pie with lamb or duck). The Bauman Street pedestrian boulevard is lined with halal cafes and Tatar bakeries. Kazan is 3.5 hours by Sapsan train from Moscow and makes a perfect 2-night addition to any Russia itinerary.",
        },
        {
          type: 'quote',
          content:
            '"In Kazan, I realized that Russia\'s relationship with Islam is not an exception or a footnote — it is a thousand-year-old thread woven through the very fabric of Russian civilization. Saudi visitors here feel not like outsiders, but like neighbors."',
        },
        {
          type: 'h2',
          content: 'Prayer Facilities Across Russia',
        },
        {
          type: 'paragraph',
          content:
            "Russia's four major cities all have historic Friday mosques. Moscow's Cathedral Mosque (near Prospekt Mira) was rebuilt and reopened in 2015 — one of Europe's largest at 10,000 capacity. St. Petersburg's Juma Mosque (1913, Kronverksky Prospekt) is a landmark art-deco mosque. Kazan has dozens of mosques throughout the city. Prayer apps (Muslim Pro, Athan) work in Russia with accurate GPS prayer times. At airports, Sheremetyevo (Moscow) and Pulkovo (St. Petersburg) both have designated prayer rooms on the departures levels. In shopping malls and tourist areas, designated prayer spaces are increasingly common, especially in areas with high Muslim visitor traffic.",
        },
        {
          type: 'h2',
          content: 'Apps & Tools for Halal Travel in Russia',
        },
        {
          type: 'paragraph',
          content:
            "Several apps make halal navigation in Russia simple. Halal Guide (available in Russian App Store) maps certified halal restaurants across Russian cities with user reviews. Muslim Pro provides accurate prayer times, qibla direction, and halal restaurant markers for Moscow and St. Petersburg. Zabihah.com has growing Russia coverage. For translation, Yandex Translate outperforms Google Translate for Russian-specific terms and menus — download the offline pack before departure. When in doubt at a restaurant without clear halal certification, ordering fish, vegetable dishes, or eggs is the safest approach in non-certified establishments.",
        },
        {
          type: 'tips',
          label: '🕌 Halal Travel Russia: Quick Reference',
          items: [
            "Moscow's best halal: Barashka (Azerbaijani luxury), Plov Centre (Uzbek), Kafe Baku (home-style Azerbaijani)",
            "St. Petersburg: Couscous (Vasilievsky Island), Halal Market café (Nevsky Prospekt area)",
            "Kazan: entire city centre — Tatar cuisine is halal by tradition throughout",
            "Prayer rooms in airports: Sheremetyevo T-B, T-C; Pulkovo Terminal 1",
            "Halal certification mark to look for: 'Халяль' (Cyrillic spelling of Halal)",
            "Safe default menu items: fish, egg dishes, vegetable plov, salads, bread",
            "Download Muslim Pro offline before leaving — GPS prayer times work without mobile data",
            "Ramadan in Russia: major mosques hold tarawih and suhoor events; Kazan is especially welcoming",
          ],
        },
      ],
      ar: [
        {
          type: 'paragraph',
          content:
            'روسيا موطن لأكثر من 20 مليون مسلم — المجموعة الدينية الثانية في البلاد. التتار الفولغيون يعيشون هنا منذ أكثر من ألف سنة، وحضورهم الثقافي والغذائي عميق في النسيج الروسي. للمسافر السعودي، روسيا أكثر ودًّا للمسلمين بكثير مما تُصوّره كثير من المواقع على الإنترنت.',
        },
        { type: 'h2', content: 'الطعام الحلال في موسكو' },
        {
          type: 'paragraph',
          content:
            'موسكو تزخر بالمطاعم الحلال بفضل جالياتها الأذربيجانية والأوزبكية والشيشانية والتتارية الكبيرة. أبرز الأماكن: مطعم باراشكا (بتروفكا 20/1) — أرقى مطعم حلال أذربيجاني في المدينة (~150-250 ريال للشخص). بلوف سنتر (ساد وفنيتشيسكايا 9) — المرجع للبلاف الأوزبكي الأصيل (~80-120 ريال). المسجد الجامع بالقرب من محطة "بروسبيكت ميرا" يحيط به حي متكامل بالجزارات والمخابز والمطاعم الحلال.',
        },
        { type: 'image', image: 'https://images.unsplash.com/photo-1568464333934-67a35f59c98b?w=1000&q=80', caption: 'التراث الثقافي الروسي يتضمن تقاليد حلال عميقة من المطبخ التتاري والآسيوي الوسطى' },
        { type: 'h2', content: 'قازان: العاصمة الإسلامية لروسيا' },
        {
          type: 'paragraph',
          content:
            'قازان عاصمة تتارستان، على بُعد 3.5 ساعة بالقطار من موسكو، مدينة تتعايش فيها المآذن وأبراج الأجراس الأرثوذكسية بانسجام فريد. كريملينها مدرج في اليونسكو ويضم كنيسة وجامع كل شريف الشامخ. مطبخها التتاري حلال بالكامل: "شاك-شاك" (حلوى العجين المقلي بالعسل)، "إيشبوتشماك" (فطيرة اللحم والبطاطا المثلثة)، "بيليش" (فطيرة ضخمة باللحم). كل المدينة تقريباً حلال.',
        },
        { type: 'h2', content: 'أماكن الصلاة والتطبيقات المفيدة' },
        {
          type: 'paragraph',
          content:
            'المسجد الجامع في موسكو (بالقرب من بروسبيكت ميرا) سعته 10,000 مصلٍّ. مسجد الجمعة في سانت بطرسبرغ (1913) معلم معماري رائع. تطبيق Muslim Pro يعمل بدقة في روسيا ويوفر مواقيت الصلاة واتجاه القبلة وخريطة المطاعم الحلال. في مطارات شيريميتيفو وبولكوفو غرف صلاة مخصصة في صالات المغادرة.',
        },
        {
          type: 'tips',
          label: '🕌 مرجع سريع للسفر الحلال في روسيا',
          items: [
            'موسكو: باراشكا (أذربيجاني فاخر)، بلوف سنتر (أوزبكي)، كافيه باكو (شعبي)',
            'سانت بطرسبرغ: مطعم كوسكوس، سوق حلال ماركت',
            'قازان: المدينة كلها تقريباً حلال بالكامل',
            'كلمة حلال بالروسية: Халяль — ابحث عنها على لافتات المطاعم',
            'تطبيق Muslim Pro أوفلاين للمواقيت واتجاه القبلة',
            'رمضان في قازان: احتفالات وصلوات تراويح في المساجد الكبرى',
          ],
        },
      ],
    },
  },
];
