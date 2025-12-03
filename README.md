# ICONIC Podcast Platform

A modern podcast website with AI chatbot, CRM, and content management built with React, Supabase, and Gemini AI.

## Features

- **AI Chatbot** - Gemini-powered assistant for lead generation
- **CRM Dashboard** - Admin-protected lead management with source filtering
- **SEO Optimized** - BrowserRouter, meta tags, Open Graph, structured data
- **Multi-language** - Czech, English, Spanish support
- **Campaign Landing Pages** - Dedicated pages for YouTube, Instagram traffic
- **Supabase Backend** - Persistent storage, authentication, RLS security

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your Supabase and API credentials

# Run development server
npm run dev
```

## Environment Setup

1. **Supabase**: Create a project at [supabase.com](https://supabase.com)
2. **Run migrations**: Execute `supabase/migrations/001_initial_schema.sql`
3. **Set environment variables** in `.env`:
   - `VITE_SUPABASE_URL` - Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key
   - `GEMINI_API_KEY` - Server-side only (for API routes)

## Project Structure

```
├── api/                  # Serverless API endpoints
├── components/           # React components
│   ├── common/          # Shared UI components
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── Hero.tsx
│   └── Chatbot.tsx
├── contexts/            # React contexts (Auth, Language)
├── pages/               # Page components
├── services/            # API services
│   ├── supabaseClient.ts
│   ├── geminiService.ts
│   ├── storageService.ts
│   └── errorService.ts
├── supabase/migrations/ # Database schema
└── types/               # TypeScript definitions
```

## Deployment

### Vercel/Netlify
1. Connect your repository
2. Set environment variables (mark `GEMINI_API_KEY` as secret)
3. Deploy - the `api/` folder will become serverless functions

### Security Notes
- API keys are **never** exposed in frontend bundle
- CRM dashboard requires admin authentication
- Supabase RLS policies protect all data

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Type check with TypeScript
