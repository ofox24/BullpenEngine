/**
 * Run Expectancy Matrix (24 base-out states)
 * Based on historical MLB data (2015-2023 averages)
 *
 * Format: RE[outs][bases]
 * Bases encoded as binary: 1st=1, 2nd=2, 3rd=4
 * Example: runners on 1st and 3rd = 1 + 4 = 5
 */
export const RUN_EXPECTANCY_MATRIX: Record<number, Record<number, number>> = {
  0: {
    0: 0.481, // Bases empty
    1: 0.859, // 1st
    2: 1.100, // 2nd
    3: 1.426, // 1st & 2nd
    4: 1.329, // 3rd
    5: 1.784, // 1st & 3rd
    6: 1.946, // 2nd & 3rd
    7: 2.292, // Bases loaded
  },
  1: {
    0: 0.254,
    1: 0.509,
    2: 0.664,
    3: 0.908,
    4: 0.897,
    5: 1.140,
    6: 1.352,
    7: 1.541,
  },
  2: {
    0: 0.098,
    1: 0.214,
    2: 0.305,
    3: 0.343,
    4: 0.354,
    5: 0.413,
    6: 0.570,
    7: 0.736,
  },
}

export type BaseState = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7
export type OutState = 0 | 1 | 2

export interface GameState {
  outs: OutState
  bases: BaseState
  runsScored: number
}

/**
 * Get run expectancy for a given game state
 */
export function getRunExpectancy(outs: OutState, bases: BaseState): number {
  if (outs === 3) return 0
  return RUN_EXPECTANCY_MATRIX[outs][bases]
}

/**
 * Convert runner positions to base state encoding
 * @param runners Array of base names: ["first", "second", "third"]
 */
export function runnersToBaseState(runners: string[]): BaseState {
  let state = 0
  if (runners.includes('first')) state += 1
  if (runners.includes('second')) state += 2
  if (runners.includes('third')) state += 4
  return state as BaseState
}

/**
 * Convert base state to runner positions
 */
export function baseStateToRunners(bases: BaseState): string[] {
  const runners: string[] = []
  if (bases & 1) runners.push('first')
  if (bases & 2) runners.push('second')
  if (bases & 4) runners.push('third')
  return runners
}

/**
 * Advance runners based on outcome
 * Returns new base state and runs scored
 */
export function advanceRunners(
  bases: BaseState,
  outcome: 'single' | 'double' | 'triple' | 'hr' | 'walk' | 'hbp'
): { newBases: BaseState; runsScored: number } {
  const runners = baseStateToRunners(bases)
  let runsScored = 0
  const newRunners: string[] = []

  switch (outcome) {
    case 'hr':
      runsScored = runners.length + 1 // All runners + batter
      return { newBases: 0, runsScored }

    case 'triple':
      runsScored = runners.length // All runners score
      newRunners.push('third')
      break

    case 'double':
      if (runners.includes('third')) runsScored++
      if (runners.includes('second')) runsScored++
      if (runners.includes('first')) {
        // Runner from first goes to third (conservative)
        newRunners.push('third')
      }
      newRunners.push('second')
      break

    case 'single':
      if (runners.includes('third')) runsScored++
      if (runners.includes('second')) runsScored++
      if (runners.includes('first')) {
        // Runner from first to second
        newRunners.push('second')
      }
      newRunners.push('first')
      break

    case 'walk':
    case 'hbp':
      // Force advance only
      if (runners.includes('third') && runners.includes('second') && runners.includes('first')) {
        runsScored++ // Bases loaded walk
        newRunners.push('first', 'second', 'third')
      } else if (runners.includes('second') && runners.includes('first')) {
        newRunners.push('first', 'second', 'third')
      } else if (runners.includes('first')) {
        newRunners.push('first', 'second')
      } else {
        newRunners.push('first')
        if (runners.includes('second')) newRunners.push('second')
        if (runners.includes('third')) newRunners.push('third')
      }
      break
  }

  return {
    newBases: runnersToBaseState(newRunners),
    runsScored,
  }
}
