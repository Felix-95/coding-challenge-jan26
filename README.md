Hey Julian & Daniel,

das ist mein Versuch der Apple-Oranges coding challenge. Hier kurze infos was bei der Implementation beachtet werden muss. 

- Die base Orangen/Apples/Algorithmus fügt man so hinzu:
./scripts/add-soft-criteria-algorithm.sh   # Register matching algorithm
./scripts/add-seed-fruits.sh               # Load initial fruits

Außerdem muss ein OpenAI API key in der .env.local gesetzt werden.
Die Challenge hat Spaß gemacht und bis Dienstag :D


## Quick Start

### Prerequisites
- Node.js 18+
- pnpm (`npm install -g pnpm`)
- SurrealDB (`brew install surrealdb/tap/surreal`)
- Docker (for Supabase local)
- OpenAI API key ([get one here](https://platform.openai.com/api-keys))

### Setup Steps

```bash
# 1. Install dependencies
npm install                    # Root (Supabase CLI)
cd frontend && pnpm install && cd ..   # Frontend

# 2. Set up environment
cp supabase/.env.example supabase/.env.local
# Edit supabase/.env.local and add your OPENAI_API_KEY

# 3. Start SurrealDB (in a separate terminal)
surreal start --user root --pass root memory

# 4. Start Supabase (in a separate terminal)
npx supabase start

# 5. Initialize database
./scripts/apply-schema.sh      # Create tables

# 6. Start edge functions (in a separate terminal)
npx supabase functions serve --no-verify-jwt --env-file supabase/.env.local

# 7. Seed data (after edge functions are running)
./scripts/add-soft-criteria-algorithm.sh   # Register matching algorithm
./scripts/add-seed-fruits.sh               # Load initial fruits

# 8. Start frontend (in a separate terminal)
cd frontend && pnpm dev
```

### Verify It Works

```bash
# Test the API - should return a match with LLM-generated messages
curl http://127.0.0.1:54321/functions/v1/get-incoming-apple \
  -H "Content-Type: application/json" -d '{}' | jq '.messages'
```

Open http://localhost:3000/dashboard to see the frontend.

---


---

# Coding Challenge - Matchmaking System

## Introduction

Hey! Welcome to our little take home challenge. We won't force Leetcode problems down your throat. Instead, what we do here at Clera is build, so therefore, we expect you to build cool stuff too!

But what and why are we building? Well, a lot of the world revolves around matchmaking. The fact that you and I exist is proof of that. A not so insignificant portion of what shapes a person's life is determined by matchmaking: friends, love, jobs. I mean hell, what we're doing right now at this very moment is matchmaking. Despite its prevalence, it is still quite the difficult task. So let's tackle it together—on a small scale at least. Our goal is to connect apples to oranges. Just because we shouldn't compare apples to oranges, doesn't mean we can't try to create a perfect pear… pair.

## Problem Statement

The abstract idea of the project is simple. In one basket we have apples, each apple has preferences that it wishes its orange to fulfill. In another basket we have oranges, each orange obviously also has preferences that it wishes a potential apple to meet. Our job is to:

1. Match them based on their joint preferences
2. Communicate to both parties that we've found them a match

We're going to be creating a small fullstack application that will encompass everything from frontend, edge functions as our backend and a bit of creative problem solving on your end to make this come to life.

## Tech Stack

Let me lay out the tech stack real quick before I get into more specifics.

### Frontend
- React
- Next.js
- Tailwind CSS
- Zustand
- Effect

### Backend
- Trigger.dev
- Supabase Edge Functions
- SurrealDB

### Agentic Components
- AI SDK

## Implementation Details

### Data Setup

In the `data` folder you will find a JSON file called `raw_apples_and_oranges.json`. It contains an array of apples and oranges with relevant attributes and their preferences. The first task is to create a SurrealDB instance that will hold this data. All design decisions regarding data storage are up to you, whatever helps achieve the goal best. This gives us our main pool of apples and oranges to draw from during the system's core cycle.

### Core System

Now that we have our data and access to it, we need to implement the core of our system. Two edge functions are provided: `get-incoming-apple` and `get-incoming-orange`. Both follow the same task flow:

#### Task Flow

1. **Generate a new fruit instance** ✅ *Implemented*
   - Uses `generateApple()` or `generateOrange()` from `_shared/generateFruit.ts`
   - Attributes are randomly generated using a normal distribution
   - Preferences are generated with relaxed constraints (not too strict)

2. **Capture the fruit's communication** ✅ *Implemented*
   - `communicateAttributes(fruit)` - Returns a human-readable description of the fruit's physical characteristics
   - `communicatePreferences(fruit)` - Returns a human-readable description of what the fruit is looking for in a match
   - Both functions have extensive variability with multiple templates and phrasings

3. **Store the new fruit in SurrealDB** ✅ *Implemented*
   - Connect to SurrealDB instance via HTTP client
   - Insert the fruit record with attributes and preferences

4. **Match the fruit to potential partners** ✅ *Implemented*
   - Query existing fruits of the opposite type from SurrealDB
   - Calculate compatibility scores using soft-criteria matching algorithm
   - Return all matches ranked by overall score

5. **Communicate matching results via LLM** ✅ *Implemented*
   - Uses AI SDK with OpenAI's `gpt-4o` model
   - Generates personalized messages for highest-scoring match
   - Two distinct messages: one for incoming fruit, one for existing fruit
   - Playful "fruit matchmaker" persona with puns and compatibility highlights

#### Running the Backend Locally

```bash
# Start Supabase local environment (from project root)
npx supabase start

# Copy env template and add your API keys
cp supabase/.env.example supabase/.env.local
# Edit supabase/.env.local and add your OPENAI_API_KEY

# Serve edge functions with env file (in a separate terminal)
npx supabase functions serve --no-verify-jwt --env-file supabase/.env.local

# Test the functions
curl http://127.0.0.1:54321/functions/v1/get-incoming-apple -H "Content-Type: application/json" -d '{}'
curl http://127.0.0.1:54321/functions/v1/get-incoming-orange -H "Content-Type: application/json" -d '{}'
```

#### Running the Frontend Locally

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

The frontend will be available at `http://localhost:3000`. The dashboard is at `/dashboard`.

### Visualization

To tie it all together, you will create a visualization (you may choose the medium) of this flow. In other words, it should be possible for us to "start a new conversation" and visualize the resulting "conversation".

### Metrics & Analytics

Our goal is to match as best we can, but how do I know if our solution is any good? You tell me! In the frontend application, include an admin dashboard with metrics that you can track and help convince me that the system is performing well and we are creating great pears.

## Hard Requirements

- The data must be loaded into and queried from SurrealDB
- The communication between the system and the fruits need to be visualized in a medium of your choosing
- You must communicate the matchmaking results through an LLM

## Additional Notes

- You may serve the edge functions locally.

- We encourage you to utilize AI as you see fit throughout this challenge; seeing as you will need to build many aspects of the solution quickly. Regardless of how the code is created, you will be expected to own it. This ownership includes:
  - Explaining all generated code
  - Justifying all design decisions
  - Displaying creativity in your solution

- Also feel free to change anything and everything in the template. Just because someone wrote it, doesn't mean it is right or perfect. So let's hold each other accountable and call out anything we see to keep the collective quality up and solve the problem together.

## File Structure

```
Root
├── frontend/                          # Next.js application
│   ├── app/
│   │   ├── dashboard/                 # Admin dashboard with metrics
│   │   └── page.tsx                   # Main entry point
│   └── lib/
│       ├── store.ts                   # Zustand state management
│       └── utils.ts                   # Utility functions
│
├── supabase/
│   ├── config.toml                    # Supabase local configuration
│   ├── .env.example                   # Environment template
│   └── functions/
│       ├── _shared/
│       │   ├── generateFruit.ts       # Fruit generation & communication
│       │   ├── generateFruit.test.ts  # Deno tests
│       │   ├── matchingScorer.ts      # Compatibility scoring algorithm
│       │   ├── matchMessages.ts       # LLM message generation
│       │   ├── openai.ts              # AI SDK OpenAI client
│       │   ├── db.ts                  # SurrealDB HTTP client
│       │   ├── schema.surql           # SurrealDB schema definitions
│       │   └── deno.json              # Shared dependencies
│       ├── get-incoming-apple/
│       │   ├── index.ts               # Apple edge function
│       │   └── deno.json
│       └── get-incoming-orange/
│           ├── index.ts               # Orange edge function
│           └── deno.json
│
├── data/
│   ├── README.md                      # Data schema documentation
│   └── raw_apples_and_oranges.json    # Seed data (40 fruits)
│
├── scripts/
│   ├── apply-schema.sh                # Initialize SurrealDB tables
│   ├── add-soft-criteria-algorithm.sh # Register matching algorithm
│   ├── add-seed-fruits.sh             # Load initial fruit data
│   └── delete-fruits.sh               # Clear all fruit data
│
├── package.json                       # Root dependencies (supabase CLI)
└── README.md                          # This file
```
