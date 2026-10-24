'use strict';

/**
 * Single source of truth for everything about the business.
 * Views and the server both read from here so copy can never drift.
 */

const site = {
  name: 'Kali Hotel & Restaurant',
  shortName: 'Kali Hotel',
  tagline: 'Multi-cuisine dining, lounge & celebration venue in Janakpur Dham',
  description:
    'Kali Hotel and Restaurant is a restaurant in Janakpur Dham where we would provide customers a unique experience of attractive ambience, high notch service and mouth watering cuisine. Allow us to provide our service to you. Hope to see you soon!',
  shortDescription:
    'Kali Hotel & Restaurant, Janakpur Dham — attractive ambience, high notch service and mouth watering multi-cuisine food. Rated 4.0 stars on Google.',
  phone: '+977 9854025213',
  phoneE164: '+9779854025213',
  phoneDisplay: '9854025213',
  whatsappUrl:
    'https://wa.me/9779854025213?text=Hi%20Kali%20Hotel%20%26%20Restaurant%2C%20I%27d%20like%20to%20book%20a%20table%20or%20ask%20about%20an%20event.',
  email: 'kalihnr@gmail.com',
  facebook: 'https://www.facebook.com/kalihotelandrestaurant/',
  mapsUrl:
    'https://www.google.com/maps/place/Kali+Hotel/@26.7401841,85.9162553,15z/data=!4m6!3m5!1s0x39ec6bb2a060dc97:0x63322298577faf14!8m2!3d26.7401841!4d85.926555!16s%2Fg%2F11l3t4vcd2',
  mapEmbedUrl:
    'https://www.google.com/maps?q=Kali+Hotel%2C+Ring+Rd%2C+Janakpur%2C+Madhesh+Province+45600&output=embed',
  priceRange: 'Rs 1–500',
  rating: {
    value: 4.0,
    count: 167,
    bestRating: 5,
  },
  address: {
    street: 'PWRG+3JF, Ring Rd, Janakpur',
    locality: 'Janakpur',
    region: 'Madhesh Province',
    postalCode: '45600',
    country: 'NP',
    countryName: 'Nepal',
    full: 'PWRG+3JF, Ring Rd, Janakpur, Madhesh Province 45600',
    geo: { latitude: 26.7401841, longitude: 85.926555 },
  },
  hours: [
    { days: 'Sunday – Saturday', time: '8:00 AM – 10:00 PM' },
  ],
  cuisines: ['Nepali', 'Indian', 'Chinese', 'Thai', 'Tandoori', 'South Indian', 'Continental'],
  highlights: [
    {
      title: 'Multi-cuisine kitchen',
      text: 'Tandoori, Thai, Chinese, South Indian, Indian and Continental — all under one roof.',
    },
    {
      title: 'Cabin & early booking',
      text: 'Private cabins can be reserved in advance for families and small groups.',
    },
    {
      title: 'Party decorations',
      text: 'Birthday and anniversary setups with balloons, décor and dedicated planning.',
    },
    {
      title: 'Bar & lounge night',
      text: 'A lively LED-lit lounge and counter for evening drinks and relaxed dinners.',
    },
  ],
  menuCategories: [
    { id: 'all', label: 'All Dishes' },
    { id: 'biryani', label: 'Biryani & Rice' },
    { id: 'momos', label: 'Momos' },
    { id: 'paneer', label: 'Paneer & Gravy' },
    { id: 'chinese', label: 'Chinese & Snacks' },
    { id: 'starters', label: 'Crispy Starters' },
  ],
  menu: [
    {
      id: 'chicken-biryani',
      name: 'Chicken Biryani',
      category: 'biryani',
      image: '/images/chi_biryani-1.jpg',
      alt: 'Chicken biryani served in a bowl at Kali Hotel & Restaurant, Janakpur Dham',
      description:
        'Layered basmati rice slow-cooked with chicken and warming spices — our signature biryani plate.',
    },
    {
      id: 'mutton-chilli-momo',
      name: 'Chilli Momo & Mutton Soup',
      category: 'momos',
      image: '/images/mutton_chilli_momo.jpg',
      alt: 'Chilli momo served with a bowl of hot Mutton jhol soup at Kali Hotel & Restaurant',
      description:
        'Steamed momo tossed in chilli with a hot mutton jhol soup on the side — the dish our guests recommend most.',
      badge: {
        label: 'Reviewer favourite',
        tone: 'gold',
        note: 'Recommended by our guests:jhol momo with hot mutton soup.',
      },
    },
    {
      id: 'special-gravy',
      name: 'Special Gravy',
      category: 'paneer',
      image: '/images/138313120_164875018757519_2484154134282757066_n.jpg',
      alt: 'Special gravy dish served in a bowl at Kali Hotel & Restaurant, Janakpur',
      description:
        'Our house special gravy prepared with a rich spice base, served hot with bread or rice.',
    },
    {
      id: 'crispy-appetizers',
      name: 'Crispy Appetizers',
      category: 'starters',
      image: '/images/Screen%20Shot%202026-10-22%20at%201.38.14%20PM.png',
      alt: 'Crispy appetizer starters including paneer crispy at Kali Hotel & Restaurant',
      description:
        'Golden, crunchy starters to open the meal — paneer crispy is the one our reviewers keep ordering again.',
      badge: {
        label: 'Reviewer favourite',
        tone: 'gold',
        note: 'Paneer crispy — "which is worth it", says our local guide.',
      },
    },
    {
      id: 'paneer-gravy-naan',
      name: 'Paneer Gravy & Naan',
      category: 'paneer',
      image: '/images/Screen%20Shot%202026-10-22%20at%201.39.23%20PM.png',
      alt: 'Paneer curry gravy served with fresh naan bread at Kali Hotel & Restaurant',
      description:
        'Soft paneer cubes in a fragrant tomato and onion gravy, with hot buttered naan.',
    },
    {
      id: 'fried-rice-snacks',
      name: 'Fried Rice & Snacks',
      category: 'chinese',
      image: '/images/Screen%20Shot%202026-10-22%20at%201.39.40%20PM.png',
      alt: 'Fried rice with Chinese snacks and chowmein at Kali Hotel & Restaurant',
      description:
        'Wok-tossed fried rice alongside Chinese snacks and veg chowmein — perfect for sharing.',
      badge: {
        label: 'Reviewer pick',
        tone: 'emerald',
        note: 'Veg chowmein with a sip of Coca-Cola — yum yum bites.',
      },
    },
    {
      id: 'paneer-special-garlic-naan',
      name: 'Paneer Special & Garlic Naan',
      category: 'paneer',
      image: '/images/Screen%20Shot%202026-10-22%20at%201.39.57%20PM.png',
      alt: 'Paneer special dish with garlic naan bread at Kali Hotel & Restaurant, Janakpur',
      description:
        'A richer paneer special finished with a garlicky naan straight off the tandoor.',
    },
  ],
  recommendedDishes: [
    { name: 'Chicken Jhol Momo', note: 'Recommended by our reviewers' },
    { name: 'Paneer Crispy', note: 'Worth it, they say' },
    { name: 'Tandoori', note: 'House tandoor classics' },
    { name: 'Veg Chowmein', note: 'Goes perfectly with a Coke' },
  ],
  reviews: [
    {
      id: 'aman-sah',
      author: 'Aman Sah',
      role: 'Local Guide',
      reviewCount: 417,
      rating: 5,
      text:
        'Kali Hotel is the best place to dine with family and friends along with that you can conduct birthday and anniversary parties as they provide decoration and early booking of cabin facility as well as they serve very quality food, I recommend having chicken jhol momo, Paneer crispy which is worth it.',
    },
    {
      id: 'maniki-agrawal',
      author: 'Maniki Agrawal',
      role: 'Local Guide',
      reviewCount: 23,
      rating: 4,
      text:
        "Variants types of Dishes with Tandoori ,Thai,Chinese ,south,Indian,this place offered all types of Dishes with one Roof so it's much more than this too Yummy yummy bites with sip of Coca-Cola with veg chowmin",
    },
  ],
  celebrations: [
    {
      title: 'Birthday parties',
      text: 'Balloon décor, a decorated seating area and a cake-ready table — we host birthdays every week.',
    },
    {
      title: 'Anniversary dinners',
      text: 'Quiet corner tables and cabin seating arranged for anniversary evenings.',
    },
    {
      title: 'Cabin bookings',
      text: 'Book a cabin early so your family gets the space it needs on the day.',
    },
    {
      title: 'Custom decorations',
      text: 'Tell us the theme and occasion when you reserve and we will set the hall for you.',
    },
  ],
  faq: [
    {
      q: 'Do you take party and event bookings?',
      a: 'Yes. Message us on WhatsApp or call +977 9854025213 to arrange birthday and anniversary parties, cabin bookings and decoration requests. We recommend early booking for cabins.',
    },
    {
      q: 'What kinds of food do you serve?',
      a: 'A multi-cuisine kitchen covering Nepali, Indian, Chinese, Thai, Tandoori, South Indian and Continental food — from biryani and momos to gravies, naan, fried rice and chowmein.',
    },
    {
      q: 'Where is Kali Hotel located?',
      a: 'PWRG+3JF, Ring Rd, Janakpur, Madhesh Province 45600 — on the ring road in Janakpur Dham.',
    },
    {
      q: 'How can I book a table?',
      a: 'Message us on WhatsApp or call +977 9854025213 between 10:00 AM and 10:00 PM.',
    },
  ],
};

module.exports = site;
