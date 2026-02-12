# Bullpen Chaos Engine

Bullpen Chaos Engine is a web app for comparing late-inning bullpen choices.
You set a game situation, choose multiple pitchers, run Monte Carlo simulations, and get a ranked recommendation based on expected win probability.

## What Users Should Do

1. Start the app (local or Docker).
2. Build a game scenario (inning, score, outs, runners).
3. Select at least 2 pitchers.
4. Click **Run Simulation (1,000 iterations)**.
5. Review the results page to see the best option and grade.

## What This Project Includes

- Scenario builder for inning/score/base-out state
- Pitcher comparison cards with ERA/FIP/K9/BB9/HR9
- Monte Carlo simulation engine for half-inning outcomes
- Win-probability based ranking and decision grading
- PostgreSQL + Prisma persistence for scenarios/results

## Tech Stack

- Next.js 14 (App Router)
- TypeScript + React + Tailwind CSS
- Prisma ORM
- PostgreSQL
- Recharts

## Prerequisites

- Node.js 20+
- npm
- Docker (optional, for containerized run)

## Setup Option 1: Local Development

### 1. Install dependencies

```bash
npm install
```

### 2. Create environment file

Copy `.env.example` to `.env` and verify:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/bullpen_chaos?schema=public"
```

### 3. Start PostgreSQL

If you do not already have Postgres running:

```bash
docker run -d --name bullpen-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=bullpen_chaos \
  -p 5432:5432 postgres:16-alpine
```

### 4. Prepare database

```bash
npm run db:push
npm run db:generate
npm run db:seed
```

### 5. Run the app

```bash
npm run dev
```

Open: `http://localhost:3000`

## Setup Option 2: Docker Compose

Run full stack (app + database):

```bash
docker-compose up --build
```

Open: `http://localhost:3000`

Stop services:

```bash
docker-compose down
```

## How To Use The App

### On the home page

- Set inning, outs, and score
- Toggle base runners directly on the diamond
- Choose which team is pitching
- Search/select 2+ pitchers
- Run simulation

### On the results page

- View win probability for each pitcher
- See delta vs average option
- Check decision grade and highlighted optimal choice
- Go back and test alternate scenarios

## API Endpoints

- `GET /api/pitchers` - list pitchers
- `POST /api/simulate` - run simulation for a scenario
- `GET /api/scenarios` - list saved scenarios
- `GET /api/scenarios/[id]` - get one scenario + results

Example simulate payload:

```json
{
  "inning": 9,
  "outs": 1,
  "scoreHome": 3,
  "scoreAway": 2,
  "isHome": true,
  "runners": ["first"],
  "pitcherIds": ["pitcher-id-1", "pitcher-id-2"],
  "iterations": 1000
}
```

## Development Commands

```bash
npm run dev          # start development server
npm run build        # production build
npm run start        # run production server

npm run db:generate  # prisma client generation
npm run db:push      # sync schema to db
npm run db:seed      # seed pitcher data
npm run db:studio    # open prisma studio
```

## Troubleshooting

- If app cannot connect to DB, verify `DATABASE_URL` and that Postgres is running on port `5432`.
- If Docker app startup fails, check logs with `docker-compose logs -f`.
- If Prisma complains about schema mismatch, rerun `npm run db:push`.

## License

MIT
