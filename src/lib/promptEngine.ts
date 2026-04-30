/**
 * Zone Prompt Engine
 * Generates diverse, creative prompts for continuous AI content generation.
 * Categories are weighted so the feed stays varied and visually rich.
 */

import type { PromptCategory } from "@/types";

const CATEGORIES: PromptCategory[] = [
  {
    name: "Sci-Fi & Futurism",
    weight: 15,
    subjects: [
      "cyberpunk city at night",
      "alien megastructure",
      "space station interior",
      "android face revealing circuitry",
      "warp drive activation",
      "floating city above clouds",
      "neon-lit dystopian market",
    ],
    styles: [
      "cinematic lighting",
      "ultra detailed",
      "concept art",
      "octane render",
      "8K resolution",
      "photorealistic",
    ],
    moods: [
      "mysterious",
      "awe-inspiring",
      "tense",
      "ethereal",
      "futuristic",
    ],
    settings: ["deep space", "mega city", "underground facility", "alien world"],
  },
  {
    name: "Nature & Landscapes",
    weight: 20,
    subjects: [
      "bioluminescent forest",
      "volcanic eruption at sunset",
      "underwater coral city",
      "frozen tundra aurora borealis",
      "ancient jungle temple",
      "thunderstorm over desert dunes",
      "misty mountain valley",
    ],
    styles: [
      "golden hour lighting",
      "National Geographic style",
      "long exposure photography",
      "drone photography",
      "hyper realistic",
    ],
    moods: ["serene", "dramatic", "mystical", "raw", "peaceful"],
    settings: ["wilderness", "ocean depth", "mountain peak", "tropical jungle"],
  },
  {
    name: "Abstract & Surreal",
    weight: 15,
    subjects: [
      "impossible geometry",
      "fractal dreamscape",
      "liquid metal sculpture",
      "cosmic mandala",
      "surreal clock melting in void",
      "portal between dimensions",
      "infinite mirror labyrinth",
    ],
    styles: [
      "Salvador Dali inspired",
      "glitch art",
      "psychedelic",
      "generative art",
      "neo surrealism",
    ],
    moods: ["trippy", "contemplative", "mind-bending", "otherworldly"],
    settings: ["void", "dreamscape", "parallel dimension", "subconscious realm"],
  },
  {
    name: "Character & Portrait",
    weight: 15,
    subjects: [
      "ancient warrior princess",
      "cyberpunk hacker",
      "elven forest guardian",
      "steam punk inventor",
      "deep sea explorer",
      "rogue AI avatar",
      "nomadic wanderer",
    ],
    styles: [
      "cinematic portrait",
      "dramatic lighting",
      "studio photography",
      "oil painting style",
      "concept art",
    ],
    moods: ["determined", "mysterious", "fierce", "pensive", "heroic"],
    settings: ["fantasy realm", "near future", "alternate history", "mythological"],
  },
  {
    name: "Architecture & Urban",
    weight: 10,
    subjects: [
      "brutalist megastructure",
      "glass cathedral of the future",
      "submerged ancient city",
      "orbital ring city",
      "bio-integrated living building",
      "abandoned overgrown skyscraper",
    ],
    styles: [
      "architectural visualization",
      "photorealistic render",
      "Zaha Hadid inspired",
      "cinematic wide angle",
    ],
    moods: ["imposing", "dreamlike", "desolate", "vibrant"],
    settings: ["skyline", "underwater", "space colony", "post-apocalyptic"],
  },
  {
    name: "Fantasy & Mythology",
    weight: 15,
    subjects: [
      "dragon perched on an ancient castle",
      "Norse god wielding thunder",
      "enchanted forest clearing",
      "underwater kingdom of Atlantis",
      "phoenix rising from ashes",
      "titan emerging from ocean",
    ],
    styles: [
      "epic fantasy painting",
      "high detail illustration",
      "cinematic",
      "digital art",
      "painterly style",
    ],
    moods: ["epic", "mystical", "legendary", "awe-inspiring"],
    settings: ["mythological realm", "enchanted lands", "stormy heavens", "ancient world"],
  },
  {
    name: "Micro & Macro",
    weight: 10,
    subjects: [
      "microscopic cell city",
      "crystal lattice glowing",
      "water droplet universe",
      "circuit board as a city map",
      "DNA strand as architecture",
      "pollen grain as alien planet",
    ],
    styles: [
      "electron microscopy art",
      "macro photography",
      "scientific illustration",
      "photorealistic",
    ],
    moods: ["intricate", "fascinating", "alien", "beautiful"],
    settings: ["micro world", "quantum realm", "nano scale"],
  },
];

const QUALITY_BOOSTERS = [
  "masterpiece",
  "best quality",
  "highly detailed",
  "sharp focus",
  "4K",
  "8K",
  "HDR",
  "photorealistic",
  "award winning photography",
  "trending on ArtStation",
];

const NEGATIVE_PROMPTS = [
  "blurry",
  "low quality",
  "pixelated",
  "watermark",
  "text",
  "ugly",
  "deformed",
  "bad anatomy",
  "duplicate",
  "extra limbs",
  "fused fingers",
  "too many fingers",
  "poorly drawn",
];

function weightedRandom<T>(items: T[], weights: number[]): T {
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let random = Math.random() * totalWeight;
  for (let i = 0; i < items.length; i++) {
    random -= weights[i];
    if (random <= 0) return items[i];
  }
  return items[items.length - 1];
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickMultiple<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function generatePrompt(): { prompt: string; negativePrompt: string; tags: string[] } {
  const category = weightedRandom(CATEGORIES, CATEGORIES.map((c) => c.weight));

  const subject = pickRandom(category.subjects);
  const style = pickRandom(category.styles);
  const mood = pickRandom(category.moods);
  const setting = pickRandom(category.settings);
  const qualityBoosters = pickMultiple(QUALITY_BOOSTERS, 3);

  const prompt = [
    subject,
    `set in ${setting}`,
    `${mood} atmosphere`,
    style,
    ...qualityBoosters,
  ].join(", ");

  const negativePrompt = NEGATIVE_PROMPTS.join(", ");

  const tags = [category.name, subject.split(" ")[0], mood, style.split(" ")[0]];

  return { prompt, negativePrompt, tags };
}

export function generateBatchPrompts(count: number): ReturnType<typeof generatePrompt>[] {
  return Array.from({ length: count }, () => generatePrompt());
}

export { CATEGORIES, NEGATIVE_PROMPTS };
