export interface Planet {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  price: number;
  color: string;
  image: string;
  alienComment?: string;
  badge?: string;
  isSoldOut?: boolean;
  isTooHot?: boolean;
  noRefunds?: boolean;
  gasFees?: boolean;
  reservedBy?: string;
}

export const PLANETS: Planet[] = [
  {
    id: "sun",
    name: "THE SUN",
    subtitle: "The ultimate space heater.",
    description: "A massive ball of plasma. Great for solar power, terrible for ice cream. Guaranteed to brighten your day, and your retinas.",
    price: 999999,
    color: "#FFD700",
    image: "https://imgs.search.brave.com/3FcFTqyigbLl3xMt7xW9o10BvnlARbzvM5-U8ztFDek/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9wbmdp/bWcuY29tL3VwbG9h/ZHMvc3VuL3NtYWxs/L3N1bl9QTkcxMzQy/NC5wbmc",
    isTooHot: true,
    alienComment: "I tried to land there once. It was a short trip."
  },
  {
    id: "mercury",
    name: "MERCURY",
    subtitle: "The closest you'll get to a tan.",
    description: "Extremely close to the sun. Perfect for those who find the Sahara 'a bit chilly'. Comes with complimentary heat-resistant flip-flops.",
    price: 4500,
    color: "#A5A5A5",
    image: "https://e7.pngegg.com/pngimages/957/238/png-clipart-mercury-planet-planet-miscellaneous-sphere-thumbnail.png",
    alienComment: "Too bright. My eyes hurt just looking at it."
  },
  {
    id: "venus",
    name: "VENUS",
    subtitle: "Love is in the air. And acid.",
    description: "A beautiful yellow hue with a thick atmosphere of sulfuric acid. Great for exfoliating your entire existence.",
    price: 8200,
    color: "#E3BB76",
    image: "https://e7.pngegg.com/pngimages/216/536/png-clipart-venus-earth-planet-solar-system-venus-sphere-astronomical-object-thumbnail.png",
    alienComment: "Smells like rotten eggs. 1/5 stars."
  },
  {
    id: "earth",
    name: "EARTH",
    subtitle: "The original. Overrated.",
    description: "Mostly water, mostly humans, mostly debt. Currently undergoing a 'global warming' feature update.",
    price: 0,
    color: "#2B82C9",
    image: "https://e7.pngegg.com/pngimages/316/998/png-clipart-earth-earth-thumbnail.png",
    isSoldOut: true,
    alienComment: "Too many monkeys with smartphones."
  },
  {
    id: "mars",
    name: "MARS",
    subtitle: "Slightly dusty. Elon approved.",
    description: "The red planet. Great for starting a new civilization or just hiding from your taxes. High iron content, low oxygen content.",
    price: 12999,
    color: "#E27B58",
    image: "https://e7.pngegg.com/pngimages/337/664/png-clipart-mars-mars-thumbnail.png",
    badge: "🔥 Dev Challenge Sale",
    reservedBy: "Elon (pending payment)",
    alienComment: "The neighbors are constantly launching noisy metal tubes."
  },
  {
    id: "jupiter",
    name: "JUPITER",
    subtitle: "Big. Really big.",
    description: "A gas giant with a Great Red Spot that's actually a massive storm. No solid ground, so bring a very strong balloon.",
    price: 25000,
    color: "#D39C7E",
    image: "https://e7.pngegg.com/pngimages/552/71/png-clipart-agar-io-jupiter-planet-solar-system-jupiter-solar-system-saturn-thumbnail.png",
    gasFees: true,
    alienComment: "I got lost in the clouds for three centuries."
  },
  {
    id: "saturn",
    name: "SATURN",
    subtitle: "If you liked it, you should've put a ring on it.",
    description: "The most stylish planet in the solar system. The rings are made of ice and rock, perfect for a very long skating session.",
    price: 32000,
    color: "#C5AB6E",
    image: "https://imgs.search.brave.com/8zSuinn8hvtF9D4iA4i33q-ZRy_OOe3AZ9TcaEvfgQg/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvdGh1/bWJuYWlscy8wNTUv/NDUzLzg3Mi9zbWFs/bC9zYXR1cm4tcGxh/bmV0LXdpdGgtcmlu/Z3MtaW4tcmVhbGlz/dGljLXJlbmRlcmlu/Zy1pc29sYXRlZC1v/bi10cmFuc3BhcmVu/dC1iYWNrZ3JvdW5k/LWZyZWUtcG5nLnBu/Zw",
    alienComment: "The rings are a nightmare for navigation."
  },
  {
    id: "pluto",
    name: "PLUTO",
    subtitle: "Still a planet in our hearts.",
    description: "Small, cold, and lonely. Perfect for introverts who want to be as far away from everyone as possible.",
    price: 999,
    color: "#968570",
    image: "https://e7.pngegg.com/pngimages/743/958/png-clipart-new-horizons-pluto-s-heart-moons-of-pluto-pluto-planet-new-horizons-pluto-s-heart-thumbnail.png",
    badge: "📉 Discounted",
    alienComment: "Wait, is it a planet today? I can't keep up."
  },
  {
    id: "blackhole",
    name: "BLACK HOLE",
    subtitle: "The ultimate storage solution.",
    description: "Zero volume, infinite density. Great for disposing of unwanted gifts or ex-partners. Light not included.",
    price: 99999,
    color: "#000000",
    image: "https://imgs.search.brave.com/VzwhmhsGK5rGQLlc1ADMoObcvpRKsadAEDb-GSDe8o0/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvdGh1/bWJuYWlscy8wNTgv/NjYzLzY1My9zbWFs/bC9tZXNtZXJpemlu/Zy1ibGFjay1ob2xl/LXdpdGgtZ2xvd2lu/Zy1hY2NyZXRpb24t/ZGlzay1pbi1jb3Nt/aWMtc3BhY2UtcG5n/LnBuZw",
    noRefunds: true,
    alienComment: "I dropped my keys in one once. Still waiting for them to come out the other side."
  }
];
