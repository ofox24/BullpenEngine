# Bullpen Chaos Engine

A web application that simulates MLB late-inning bullpen decision scenarios and grades decisions using win probability analysis and Monte Carlo simulations.

## Features

- **Interactive Scenario Builder**: Configure game state (inning, score, runners, outs)
- **Monte Carlo Simulation**: 1000+ iterations per pitcher to model outcomes
- **Win Probability Analysis**: Compare bullpen options by WP impact
- **Decision Grading**: Identifies optimal choices with visual feedback
- **Run Expectancy Matrix**: Historical 24-state MLB data (2015-2023)
- **Pitcher Database**: 30 placeholder pitchers with realistic stats

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TailwindCSS
- **Backend**: Next.js API Routes, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Simulation**: Custom Monte Carlo engine with run expectancy model
- **Deployment**: Docker Compose

## Project Structure

```
bullpen-chaos-engine/
├── app/
│   ├── api/
│   │   ├── pitchers/          # GET pitcher data
│   │   ├── scenarios/         # GET scenario history
│   │   └── simulate/          # POST simulation runs
│   ├── results/[id]/          # Simulation results page
│   ├── page.tsx               # Scenario configurator (home)
│   └── layout.tsx
├── lib/
│   ├── simulation/
│   │   ├── runExpectancy.ts   # 24-state RE matrix
│   │   ├── winProbability.ts  # WP calculator
│   │   ├── pitcherModel.ts    # Performance sampling
│   │   └── monteCarlo.ts      # Core simulation engine
│   └── prisma.ts
├── prisma/
│   ├── schema.prisma          # Database models
│   └── seed.ts                # Pitcher data seeding
├── docker-compose.yml
└── Dockerfile
```

## Quick Start

### Option 1: Local Development (npm)

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start Postgres** (via Docker or local)
   ```bash
   docker run -d --name bullpen-postgres \
     -e POSTGRES_USER=postgres \
     -e POSTGRES_PASSWORD=postgres \
     -e POSTGRES_DB=bullpen_chaos \
     -p 5432:5432 postgres:16-alpine
   ```

3. **Set up database**
   ```bash
   npx prisma db push
   npx prisma generate
   npm run db:seed
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open browser**
   ```
   http://localhost:3000
   ```

### Option 2: Docker Compose (Full Stack)

1. **Build and run**
   ```bash
   docker-compose up --build
   ```

2. **Open browser**
   ```
   http://localhost:3000
   ```

The app will automatically:
- Start Postgres
- Run Prisma migrations
- Seed pitcher data
- Launch Next.js app

## Usage

### 1. Configure Scenario
- Set inning, outs, score, and runners on base
- Choose whether home or away team is pitching

### 2. Select Pitchers
- Pick 2-6 bullpen options to compare
- View ERA, FIP, and handedness for each

### 3. Run Simulation
- Click "Run Simulation" to execute 1000 Monte Carlo iterations
- Each iteration simulates the half-inning for each pitcher

### 4. View Results
- See win probability for each pitcher option
- Optimal choice highlighted in green
- Decision grade and analysis summary

## Simulation Model

### Run Expectancy Matrix
Uses historical MLB data (24 base-out states):
- 0-2 outs × 8 base states (empty, 1st, 2nd, 1st+2nd, 3rd, etc.)
- Average runs expected to score in remainder of inning

### Pitcher Model
Samples outcomes based on:
- K/9 (strikeout rate)
- BB/9 (walk rate)
- HR/9 (home run rate)
- BABIP (batting average on balls in play)

### Win Probability
Logistic regression model considering:
- Run differential
- Innings remaining
- Home/away situation
- Outs and base state

### Monte Carlo Process
For each pitcher:
1. Simulate 1000 half-innings
2. Sample plate appearance outcomes
3. Advance runners using RE matrix
4. Calculate final win probability
5. Aggregate and rank results

## API Endpoints

### `GET /api/pitchers`
Returns all pitchers from database

### `POST /api/simulate`
```json
{
  "inning": 9,
  "outs": 0,
  "scoreHome": 3,
  "scoreAway": 3,
  "isHome": true,
  "runners": ["first", "third"],
  "pitcherIds": ["id1", "id2", "id3"],
  "iterations": 1000
}
```

Returns simulation results with win probabilities

### `GET /api/scenarios`
Returns recent simulation scenarios

### `GET /api/scenarios/[id]`
Returns specific scenario with results

## Database Schema

### Pitcher
- id, name, team, throws (L/R)
- era, fip, k9, bb9, hr9

### Scenario
- Game state (inning, outs, score, runners)
- Created timestamp

### SimulationResult
- Pitcher + scenario link
- avgWinProbability, wpDelta
- avgRunsAllowed, optimalChoice
- iterations count

## Development Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Database
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema to database
npm run db:seed          # Seed pitcher data
npm run db:studio        # Open Prisma Studio

# Docker
docker-compose up        # Run full stack
docker-compose down      # Stop all services
docker-compose logs -f   # View logs
```

## Environment Variables

Create `.env` file:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/bullpen_chaos?schema=public"
```

## Future Enhancements

- [ ] Real MLB data integration (Statcast, Baseball Reference)
- [ ] Historical scenario library (actual games)
- [ ] Batter-pitcher matchup adjustments
- [ ] Leverage index calculations
- [ ] Redis caching for simulations
- [ ] User authentication and saved scenarios
- [ ] Advanced metrics (xFIP, SIERA)
- [ ] Visualization: WP charts, outcome distributions
- [ ] Export results (CSV, PDF reports)
- [ ] Mobile responsive optimizations

## License

MIT

## Contributing

Pull requests welcome. For major changes, open an issue first.
