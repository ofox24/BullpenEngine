# Bullpen Chaos Engine

Bullpen Chaos Engine is a web app for comparing late-inning bullpen choices.
You set a game situation, choose multiple pitchers, run Monte Carlo simulations, and get a ranked recommendation based on expected win probability.

## What Users Should Do

1. Start the app 
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


## License

MIT
