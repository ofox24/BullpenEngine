/**
 * Monte Carlo Simulation Engine
 * Runs multiple half-inning simulations to estimate outcomes
 */

import {
  GameState,
  getRunExpectancy,
  runnersToBaseState,
  advanceRunners,
  OutState,
  BaseState,
} from './runExpectancy'
import {
  PitcherStats,
  sampleOutcome,
  isOut,
  advancesRunners,
  Outcome,
} from './pitcherModel'
import {
  calculateWinProbability,
  calculateFinalWinProbability,
} from './winProbability'

export interface SimulationInput {
  inning: number
  outs: OutState
  scoreHome: number
  scoreAway: number
  isHome: boolean
  runners: string[]
  iterations: number
}

export interface SimulationResult {
  pitcherId: string
  pitcherName: string
  avgRunsAllowed: number
  avgWinProbability: number
  wpDelta: number
  iterations: number
  distribution: {
    runs0: number
    runs1: number
    runs2: number
    runs3plus: number
  }
}

/**
 * Simulate a single half-inning
 */
export function simulateHalfInning(
  initialState: GameState,
  pitcher: PitcherStats
): number {
  let state = { ...initialState }
  let pitchCount = 0

  while (state.outs < 3) {
    pitchCount++

    // Sample outcome
    const outcome = sampleOutcome(pitcher)

    // Handle outcome
    if (isOut(outcome)) {
      state.outs = (state.outs + 1) as OutState
    } else if (advancesRunners(outcome)) {
      const result = advanceRunners(
        state.bases,
        outcome as 'single' | 'double' | 'triple' | 'hr' | 'walk' | 'hbp'
      )
      state.bases = result.newBases
      state.runsScored += result.runsScored
    }

    // Safety: prevent infinite loops
    if (pitchCount > 100) {
      console.warn('Simulation exceeded 100 pitches, ending inning')
      break
    }
  }

  return state.runsScored
}

/**
 * Run Monte Carlo simulation for a single pitcher
 */
export function simulatePitcher(
  input: SimulationInput,
  pitcher: PitcherStats & { id: string; name: string }
): SimulationResult {
  const { inning, outs, scoreHome, scoreAway, isHome, runners, iterations } =
    input

  const initialGameState: GameState = {
    outs,
    bases: runnersToBaseState(runners),
    runsScored: 0,
  }

  const initialWinProb = calculateWinProbability({
    inning,
    outs,
    scoreHome,
    scoreAway,
    isHome,
  })

  const runsAllowedSamples: number[] = []
  const wpSamples: number[] = []

  // Run simulations
  for (let i = 0; i < iterations; i++) {
    const runsAllowed = simulateHalfInning(initialGameState, pitcher)
    runsAllowedSamples.push(runsAllowed)

    const finalWP = calculateFinalWinProbability(
      { inning, outs, scoreHome, scoreAway, isHome },
      runsAllowed
    )
    wpSamples.push(finalWP)
  }

  // Calculate statistics
  const avgRunsAllowed =
    runsAllowedSamples.reduce((a, b) => a + b, 0) / iterations
  const avgWinProbability = wpSamples.reduce((a, b) => a + b, 0) / iterations
  const wpDelta = avgWinProbability - initialWinProb

  // Distribution
  const distribution = {
    runs0: runsAllowedSamples.filter((r) => r === 0).length / iterations,
    runs1: runsAllowedSamples.filter((r) => r === 1).length / iterations,
    runs2: runsAllowedSamples.filter((r) => r === 2).length / iterations,
    runs3plus: runsAllowedSamples.filter((r) => r >= 3).length / iterations,
  }

  return {
    pitcherId: pitcher.id,
    pitcherName: pitcher.name,
    avgRunsAllowed,
    avgWinProbability,
    wpDelta,
    iterations,
    distribution,
  }
}

/**
 * Compare multiple pitcher options
 * Returns results sorted by best win probability
 */
export function compareOptions(
  input: SimulationInput,
  pitchers: (PitcherStats & { id: string; name: string })[]
): SimulationResult[] {
  const results = pitchers.map((pitcher) => simulatePitcher(input, pitcher))

  // Sort by best win probability (highest)
  return results.sort((a, b) => b.avgWinProbability - a.avgWinProbability)
}
