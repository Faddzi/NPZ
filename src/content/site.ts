// Every fact on the site comes from the NPZ portfolio PDF. `slide` records where, so QA can check it.
// Exception: figures NPZ gave us directly are marked with the date they gave them.
// Do not add claims, numbers, clients or people that are not in the PDF.

export const business = {
  name: 'National Promo Zone',
  short: 'NPZ',
  summary: 'End-to-end creative and digital marketing solutions tailored to help brands grow.', // slide 6
  founder: { name: 'Mustafa Patanwala', role: 'Founder, cinematographer and photographer', slide: 3 },
  phones: [
    { display: '+91 99674 68833', tel: '+919967468833' }, // slide 19 (primary, used for the hero call button)
    { display: '+91 88507 39043', tel: '+918850739043' }, // slide 19
  ],
  email: 'nationalpromozone53@gmail.com', // slide 19 (correct spelling)
  instagram: { handle: '@nationalpromozone', url: 'https://www.instagram.com/nationalpromozone/' }, // slide 19
} as const;

export const nav = [
  { href: '/', label: 'Home' },
  { href: '/about/', label: 'About' },
  { href: '/services/', label: 'Services' },
  { href: '/portfolio/', label: 'Portfolio' },
  { href: '/contact/', label: 'Contact' },
] as const;

// Updated by NPZ on 2026-11-25 (client feedback), replacing the slide 11 figures (50+, 2M+, 20+).
// NPZ said "around 30 to 40+" clients; 30+ is the safe end of that.
export const stats = [
  { value: '100', unit: '+', label: 'projects completed' },
  { value: '5M', unit: '+', label: 'views generated' },
  { value: '30', unit: '+', label: 'happy clients' },
] as const;

// slide 6, grouped for scanning
export const serviceGroups = [
  { title: 'Social and strategy', items: ['Social Media Management', 'Content Strategy & Monthly Content Calendar'] },
  {
    title: 'Photography',
    items: ['Professional Product Photography', 'Commercial Photography', 'Model Photoshoots'],
  },
  {
    title: 'Video and post-production',
    items: [
      'Cinematic Brand Films',
      'Professional Videography',
      'High-Quality Reels & Short-Form Content',
      'Event Coverage',
      'Post Production (Editing, Color Grading & Motion Graphics)',
    ],
  },
  {
    title: 'Design and paid ads',
    items: [
      'Graphic Design & Social Media Creatives',
      'Brand Identity & Visual Branding',
      'Performance Marketing (Paid Advertising)',
    ],
  },
] as const;

// slides 10 to 13 for the categories. Images are NPZ's own media (public/media folder supplied 2026-11-25).
export const categories = [
  {
    slug: 'food-and-beverages',
    title: 'Food & Beverages',
    line: 'Product shoots, food reels and campaign creatives.',
    image: '/work/food.webp',
    alt: 'Toasted sandwich loaded with melted cheese and chilli, on a paper wrap',
    slide: 10,
  },
  {
    slug: 'interior',
    title: 'Interior',
    line: 'Walkthrough reels and detail photography for interior brands.',
    image: '/work/interior.webp',
    alt: 'Office corridor with glass walls and a black and white chevron floor',
    slide: 11,
  },
  {
    slug: 'fashion-and-accessories',
    title: 'Fashion & Accessories',
    line: 'Bag, eyewear and lifestyle shoots, plus product reels.',
    image: '/work/fashion.webp',
    alt: 'Man in an embroidered gold cap and glasses, side profile against black',
    slide: 12,
  },
  {
    slug: 'jewellery',
    title: 'Jewellery',
    line: 'Close-up product photography and cinematic reels.',
    image: '/work/jewellery.webp',
    alt: 'Hand wearing two gemstone rings, set against gold fabric',
    slide: 13,
  },
] as const;

// slide 15. Logos are cut from the slide (no official files found online); swap in NPZ's originals when they arrive.
// `logo: null` shows a placeholder frame. The unnamed green "BD" logo is held back until NPZ names it.
export const clients: { name: string; logo: string | null }[] = [
  { name: 'Zoher Bros Opticians', logo: '/clients/zoher-bros-opticians.webp' },
  { name: 'Zotag', logo: '/clients/zotag.webp' },
  { name: 'Jawahir', logo: '/clients/jawahir.webp' },
  { name: "Shabbir's Tawakkal Sweets", logo: '/clients/shabbirs-tawakkal-sweets.webp' },
  { name: 'Maimoon Boutique', logo: '/clients/maimoon-boutique.webp' },
  { name: 'Easy Boba', logo: '/clients/easy-boba.webp' },
  { name: 'Al Anwar Jewellery', logo: '/clients/al-anwar-jewellery.webp' },
  { name: 'Adora', logo: '/clients/adora.webp' },
  { name: 'Perfumitr', logo: '/clients/perfumitr.webp' },
  { name: 'Shafaf Glass', logo: '/clients/shafaf-glass.webp' },
  { name: 'Fakhruddin & Sons', logo: '/clients/fakhruddin-and-sons.webp' },
  { name: 'MH Windows', logo: '/clients/mh-windows.webp' },
  { name: 'Maroof', logo: '/clients/maroof.webp' },
  { name: 'Raudat Solutions', logo: '/clients/raudat-solutions.webp' },
];

// slide 3, the founder's own words
export const founderBio =
  'As the Founder of National Promozone, I specialize in transforming ideas into compelling visual stories that help brands grow. My expertise spans content strategy, videography, video editing, and social media marketing, ensuring every project is crafted with creativity and purpose. With professional training and a passion for high-quality content, I focus on delivering engaging visuals and effective digital strategies that enhance brand presence, connect with audiences, and create lasting impact.';

// slide 5. Photos are NPZ's own (public/media folder supplied 2026-11-25).
export const team = [
  { name: 'Mustafa Patanwala', role: 'Founder, cinematographer and photographer', photo: '/team/mustafa.webp' },
  { name: 'Nooriyah', role: 'Content writer', photo: '/team/nooriyah.webp' },
  { name: 'Hasan', role: 'Graphic designer', photo: '/team/hasan.webp' },
] as const;

// slide 7
export const processSteps = [
  { title: 'Brand discovery', text: 'Understanding your business, audience, competitors and goals.' },
  { title: 'Research and strategy', text: 'Market research, trend analysis and campaign planning.' },
  { title: 'Creative concept', text: 'Ideas, scripts, storyboards and shot lists.' },
  { title: 'Pre-production', text: 'Location scouting, prop planning, model coordination and scheduling.' },
  { title: 'Production', text: 'Photography and cinematic videography on professional equipment.' },
  { title: 'Post-production', text: 'Editing, colour grading, sound design, motion graphics and quality checks.' },
  { title: 'Content delivery', text: 'Finished content delivered in platform-ready formats.' },
  { title: 'Publishing and growth', text: 'Content scheduling, performance tracking and continuous optimisation.' },
] as const;

// slide 8
export const kit = [
  { what: 'Camera', item: 'Sony ZV-E10' },
  { what: 'Stabilisation', item: 'Professional gimbal' },
  { what: 'Lighting', item: 'LED video lights' },
  { what: 'Soft light', item: 'Soft lighting setup' },
  { what: 'Audio', item: 'Wireless microphones' },
  { what: 'Support', item: 'Professional tripods' },
  { what: 'Storage', item: 'Memory cards and backup storage' },
] as const;

// slide 9
export const industries = [
  'Restaurants & cafés',
  'Fashion & clothing',
  'Jewellery & luxury',
  'Home décor & interiors',
  'Food & beverage',
  'Retail stores',
  'Lifestyle brands',
  'Beauty & cosmetics',
  'Footwear & accessories',
  'Home & kitchen products',
  'Events & hospitality',
  'Local businesses & startups',
] as const;

// Services page. Names are slide 6 verbatim. The one-line descriptions are DRAFT copy for NPZ to confirm:
// they only restate each service, using wording from slides 6 to 8 where it exists. No results or prices.
export const servicePage = [
  {
    id: 'social',
    title: 'Social and strategy',
    media: { kind: 'video', src: '/media/reel-street-food.mp4', poster: '/work/svc-street-food.webp', alt: 'Street food reel: a cook tossing shawarma on the grill' },
    items: [
      { name: 'Social Media Management', text: 'Your accounts run for you: posting, scheduling and tracking how each post performs.' },
      { name: 'Content Strategy & Monthly Content Calendar', text: 'Research, trends and a month of planned posts, agreed before anything is shot.' },
    ],
  },
  {
    id: 'photography',
    title: 'Photography',
    media: { kind: 'image', src: '/work/jewellery.webp', alt: 'Hand wearing two gemstone rings, set against gold fabric' },
    items: [
      { name: 'Professional Product Photography', text: 'Clean, well-lit shots that show your products at their best.' },
      { name: 'Commercial Photography', text: 'Photos made for campaigns, ads and brand pages.' },
      { name: 'Model Photoshoots', text: 'Shoots with models, planned from location and props to the schedule.' },
    ],
  },
  {
    id: 'video',
    title: 'Video and post-production',
    media: { kind: 'video', src: '/media/reel-al-anwar.mp4', poster: '/work/svc-al-anwar.webp', alt: 'Jewellery reel for Al Anwar: a gold necklace worn and framed close up' },
    items: [
      { name: 'Cinematic Brand Films', text: 'Short films that tell your brand’s story.' },
      { name: 'Professional Videography', text: 'Filmed with gimbals, LED lighting and wireless audio.' },
      { name: 'High-Quality Reels & Short-Form Content', text: 'Vertical videos made for Instagram and short-form feeds.' },
      { name: 'Event Coverage', text: 'Photo and video coverage of your events.' },
      { name: 'Post Production', text: 'Editing, colour grading, sound design and motion graphics.' },
    ],
  },
  {
    id: 'design',
    title: 'Design and paid ads',
    media: { kind: 'art' },
    items: [
      { name: 'Graphic Design & Social Media Creatives', text: 'Posts, stories and campaign creatives in your brand’s look.' },
      { name: 'Brand Identity & Visual Branding', text: 'Logos, colours and type that make a brand easy to recognise.' },
      { name: 'Performance Marketing (Paid Advertising)', text: 'Paid campaigns, tracked and adjusted while they run.' },
    ],
  },
] as const;

// slide 14: Instagram insights from one client account (the slide does not name the client). L = lakh (100,000).
export const socialResults = {
  tiles: [
    { value: '2.7L', unit: '+', label: 'views in the best month', note: 'May, up 1,124% on April' },
    { value: '94', unit: '%', label: 'of those views from non-followers', note: 'New people, reached organically' },
    { value: '505K', unit: '', label: 'views on the top reel', note: 'Out of several reels that went viral' },
  ],
  topReels: [505000, 151000, 93000, 43500, 30100],
} as const;

// Portfolio page. All media is NPZ's own (public/media folder supplied 2026-11-25); no stock.
// Clients are named only where the work itself shows the name and the client is on slide 15.
export const portfolioReels = [
  { src: '/media/reel-al-anwar.mp4', poster: '/folio/reel-al-anwar.webp', title: 'Al Anwar Jewellery', tag: 'Jewellery reel', alt: 'Reel for Al Anwar Jewellery: a gold necklace worn and framed close up' },
  { src: '/media/reel-sandwich.mp4', poster: '/folio/reel-sandwich.webp', title: 'Loaded sandwich', tag: 'Food reel', alt: 'Food reel: a cheese-loaded sandwich being made' },
  { src: '/media/reel-lighting.mp4', poster: '/folio/reel-lighting.webp', title: 'Lighting store', tag: 'Brand reel', alt: 'Brand reel for a lighting store: presenter among festive lights' },
  { src: '/media/reel-street-food.mp4', poster: '/folio/reel-street-food.webp', title: 'Street food', tag: 'Food reel', alt: 'Street food reel: a cook working the shawarma grill' },
  { src: '/media/reel-ride.mp4', poster: '/folio/reel-ride.webp', title: 'The ride', tag: 'Travel film', alt: 'Travel film: rider on a motorcycle with the city skyline behind' },
] as const;

export const portfolioFilters = [
  { id: 'all', label: 'All work' },
  { id: 'jewellery', label: 'Jewellery' },
  { id: 'food', label: 'Food & drink' },
  { id: 'lifestyle', label: 'Fashion & lifestyle' },
  { id: 'retail', label: 'Retail' },
  { id: 'interior', label: 'Interiors' },
] as const;

export const portfolioShots = [
  { src: '/folio/food-shoot.webp', w: 410, h: 320, cat: 'food', alt: 'Café scene: a guest at a table as a dish is served from behind' },
  { src: '/folio/sandwich-stack.webp', w: 562, h: 1000, cat: 'food', alt: 'Triple-decker sandwich stuffed with grated cheese and vegetables' },
  { src: '/folio/bag.webp', w: 343, h: 478, cat: 'lifestyle', alt: 'Model sliding a laptop into a green backpack' },
  { src: '/folio/rings.webp', w: 506, h: 900, cat: 'jewellery', alt: 'Hand wearing two gemstone rings against gold fabric' },
  { src: '/folio/light-window.webp', w: 562, h: 1000, cat: 'retail', alt: 'Shop window glowing with festive string lights at night' },
  { src: '/folio/interior-hall.webp', w: 368, h: 478, cat: 'interior', alt: 'Office corridor with glass walls and a black and white chevron floor' },
  { src: '/folio/street-food.webp', w: 506, h: 900, cat: 'food', alt: 'Street food plate piled with toppings and sauce' },
  { src: '/folio/aa-mumbai.webp', w: 562, h: 1000, cat: 'jewellery', alt: 'Presenter in a pink top on a Mumbai street, opening a jewellery reel' },
  { src: '/folio/eyewear.webp', w: 326, h: 509, cat: 'lifestyle', alt: 'Man in an embroidered gold cap and glasses, side profile against black' },
  { src: '/folio/jewellery-flower.webp', w: 341, h: 399, cat: 'jewellery', alt: 'Flower-shaped ruby ring on black' },
  { src: '/folio/sf-grill.webp', w: 560, h: 996, cat: 'food', alt: 'Cook in an orange shirt working the shawarma grill' },
  { src: '/folio/cinema-cover.webp', w: 900, h: 625, cat: 'food', alt: 'Cheese being grated over a dish, gloved hands' },
  { src: '/folio/lighting.webp', w: 506, h: 900, cat: 'retail', alt: 'Presenter in sunglasses lit by pink and blue festive lights' },
  { src: '/folio/light-mandir.webp', w: 562, h: 1000, cat: 'retail', alt: 'Carved wooden home temple decorated with chandeliers and lights' },
  { src: '/folio/earrings.webp', w: 336, h: 583, cat: 'jewellery', alt: 'Hand holding a pair of gemstone drop earrings' },
  { src: '/folio/sf-taste.webp', w: 560, h: 996, cat: 'food', alt: 'Woman taking a bite of a shawarma roll at the counter' },
  { src: '/folio/interior.webp', w: 431, h: 318, cat: 'interior', alt: 'Meeting room with a long table, leather chairs and warm ceiling lights' },
  { src: '/folio/sandwich.webp', w: 506, h: 900, cat: 'food', alt: 'Toasted sandwich loaded with melted cheese, on a paper plate' },
  { src: '/folio/light-custom.webp', w: 562, h: 1000, cat: 'retail', alt: 'Presenter holding a glowing ball of custom LED lights' },
  { src: '/folio/motorcycle-journey.webp', w: 506, h: 900, cat: 'lifestyle', alt: 'Rider in white on a motorcycle in an open square' },
  { src: '/folio/sandwich-prep.webp', w: 562, h: 1000, cat: 'food', alt: 'Sliced tomatoes laid on buttered bread for a sandwich' },
  { src: '/folio/sequence-a.webp', w: 600, h: 900, cat: 'lifestyle', alt: 'Tall brick-red tower against a teal sky' },
  { src: '/folio/sf-tandoor.webp', w: 560, h: 996, cat: 'food', alt: 'Bread puffing up against a glowing tandoor' },
  { src: '/folio/sequence-b.webp', w: 600, h: 900, cat: 'jewellery', alt: 'Gold necklace with pear-shaped stones, hand resting below it' },
  { src: '/folio/al-anwar.webp', w: 506, h: 900, cat: 'jewellery', alt: 'Gold drop earring with white stones, worn' },
] as const;
