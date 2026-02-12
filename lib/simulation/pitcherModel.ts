/**
 * Pitcher Performance Model
 * Samples outcomes based on pitcher statistics
 */

export interface PitcherStats {
  era: number
  fip: number
  k9: number // strikeouts per 9 IP
  bb9: number // walks per 9 IP
  hr9: number // home runs per 9 IP
  throws: string // "L" or "R"
}

export type Outcome =
  | 'strikeout'
  | 'walk'
  | 'hbp'
  | 'single'
  | 'double'
  | 'triple'
  | 'hr'
  | 'out'

/**
 * Sample a plate appearance outcome for a pitcher
 * Uses pitcher rates and league averages
 */
export function sampleOutcome(stats: PitcherStats): Outcome {
  // Convert per-9 rates to per-PA probabilities
  // Average ~4 PA per inning, so 36 PA per 9 innings
  const paPerNine = 36

  const pK = stats.k9 / paPerNine
  const pBB = stats.bb9 / paPerNine
  const pHR = stats.hr9 / paPerNine

  // League average hit rates (conditional on ball in play)
  const leagueBABIP = 0.298
  const pSingle = 0.65 // of hits
  const pDouble = 0.25 // of hits
  const pTriple = 0.02 // of hits

  // HBP rate (league average ~0.01 per PA)
  const pHBP = 0.01

  // Calculate probabilities
  const roll = Math.random()
  let cumProb = 0

  // Strikeout
  cumProb += pK
  if (roll < cumProb) return 'strikeout'

  // Walk
  cumProb += pBB
  if (roll < cumProb) return 'walk'

  // HBP
  cumProb += pHBP
  if (roll < cumProb) return 'hbp'

  // Home run (can happen without ball in play)
  cumProb += pHR
  if (roll < cumProb) return 'hr'

  // Remaining probability is balls in play
  const remainingProb = 1 - cumProb

  // BABIP determines hits vs outs
  const pHit = leagueBABIP
  const hitRoll = Math.random()

  if (hitRoll < pHit) {
    // Hit - determine type
    const hitTypeRoll = Math.random()
    if (hitTypeRoll < pSingle) return 'single'
    if (hitTypeRoll < pSingle + pDouble) return 'double'
    if (hitTypeRoll < pSingle + pDouble + pTriple) return 'triple'
    return 'hr' // Remaining hits are HR
  } else {
    // Out in play (groundout, flyout, lineout)
    return 'out'
  }
}

/**
 * Check if outcome results in an out
 */
export function isOut(outcome: Outcome): boolean {
  return outcome === 'strikeout' || outcome === 'out'
}

/**
 * Check if outcome advances runners
 */
export function advancesRunners(outcome: Outcome): boolean {
  return ['single', 'double', 'triple', 'hr', 'walk', 'hbp'].includes(outcome)
}

/**
 * Estimate pitcher fatigue factor
 * Returns multiplier for negative outcomes (>1 = more walks/hits)
 */
export function getFatigueFactor(pitchCount: number): number {
  if (pitchCount < 15) return 1.0
  if (pitchCount < 25) return 1.05
  if (pitchCount < 35) return 1.15
  return 1.25 // Gassed
}

/**
 * Calculate expected runs per inning for a pitcher
 * Used for validation and testing
 */
export function expectedRunsPerInning(stats: PitcherStats): number {
  // Simple FIP-based estimate
  // ERA is actual, FIP is expected
  // Use average of both for more realistic simulation
  const avgERA = (stats.era + stats.fip) / 2
  return avgERA / 9
}
