# Zone

An infinite AI-generated content portal — continuously creating images and videos in real-time from unique prompts, powered by Hugging Face, Replicate, and other AI providers.

## Stack
- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS** (dark theme, custom animations)
- **Prisma + SQLite** (upgradeable to PostgreSQL)
- **Hugging Face Inference API**
- **Replicate API**
- **BullMQ** (job queue, Redis-backed for production)

## Getting Started

### 1. Install Node.js
Download and install Node.js LTS from https://nodejs.org/

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment
```bash
copy .env.example .env.local
```
Edit `.env.local` and add your API keys:
- `HUGGINGFACE_API_KEY` — from https://huggingface.co/settings/tokens
- `REPLICATE_API_TOKEN` — from https://replicate.com/account/api-tokens

### 4. Initialize the database
```bash
npm run db:generate
npm run db:migrate
```

### 5. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Start the generation engine (optional standalone worker)
```bash
npm run engine:start
```

## Architecture

```
Zone/
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── api/
│   │   │   ├── generate/      # Trigger AI generation
│   │   │   ├── content/       # Fetch/store content
│   │   │   └── engine/        # Engine status
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ContentFeed.tsx    # Real-time content grid
│   │   ├── ContentCard.tsx    # Individual content item
│   │   ├── Header.tsx
│   │   └── GenerationStatus.tsx
│   ├── lib/
│   │   ├── promptEngine.ts    # Weighted prompt generation
│   │   ├── generationEngine.ts # Persistent generation loop
│   │   └── aiProviders/       # HuggingFace, Replicate adapters
│   ├── workers/
│   │   └── generationWorker.mjs # Standalone engine worker
│   └── types/index.ts
├── prisma/schema.prisma        # Database schema
└── .env.example
```

## Generation Engine

The engine runs continuously, generating content at a configurable interval (default: 30s). Each cycle:
1. Generates a unique prompt via the weighted prompt engine
2. Routes the request to an available AI provider
3. Saves the result and broadcasts it to the feed

Control via environment variables in `.env.local`:
- `GENERATION_INTERVAL_MS` — milliseconds between generation cycles (default: 30000)
- `MAX_CONCURRENT_JOBS` — max parallel generation jobs (default: 2)
- `DEFAULT_CONTENT_TYPE` — `image` or `video` (default: image)
