/**
 * Win Probability Calculator
 * Simplified model based on run differential and inning
 */

interface WinProbInput {
  inning: number
  outs: number
  scoreHome: number
  scoreAway: number
  isHome: boolean // Is the home team pitching (bottom of inning)?
}

/**
 * Calculate win probability using logistic regression approximation
 * Based on historical MLB data patterns
 */
export function calculateWinProbability(input: WinProbInput): number {
  const { inning, outs, scoreHome, scoreAway, isHome } = input

  // Run differential from perspective of team we're calculating for
  const runDiff = isHome ? scoreHome - scoreAway : scoreAway - scoreHome

  // Innings remaining (fractional)
  const inningsRemaining = 9 - inning + (outs / 3)

  // Base win probability from run differential
  // Logistic function: 1 / (1 + e^(-k * runDiff))
  // k scales with innings remaining
  const k = 0.14 * Math.sqrt(Math.max(inningsRemaining, 0.1))
  const baseWP = 1 / (1 + Math.exp(-k * runDiff))

  // Adjustments
  let wp = baseWP

  // Home team advantage in late innings (if score is close)
  if (isHome && inning >= 9 && Math.abs(runDiff) <= 1) {
    wp += 0.03
  }

  // Extra innings - more volatile
  if (inning > 9) {
    // Compress toward 50-50
    wp = 0.5 + (wp - 0.5) * 0.85
  }

  // Clamp to [0.01, 0.99]
  return Math.max(0.01, Math.min(0.99, wp))
}

/**
 * Calculate win probability after a half-inning is complete
 */
export function calculateFinalWinProbability(
  initialState: WinProbInput,
  runsAllowed: number
): number {
  const newState = { ...initialState }

  // Update score based on who was pitching
  if (newState.isHome) {
    // Home team was pitching, away team scored
    newState.scoreAway += runsAllowed
  } else {
    // Away team was pitching, home team scored
    newState.scoreHome += runsAllowed
  }

  // Move to next half-inning
  if (newState.isHome) {
    // Was bottom of inning, move to top of next inning
    newState.inning += 1
    newState.isHome = false
  } else {
    // Was top of inning, move to bottom
    newState.isHome = true
  }

  newState.outs = 0

  return calculateWinProbability(newState)
}

/**
 * Get approximate run differential needed for X% win probability
 */
export function getRunDifferentialForWP(
  targetWP: number,
  inningsRemaining: number
): number {
  const k = 0.14 * Math.sqrt(Math.max(inningsRemaining, 0.1))
  // Solve: targetWP = 1 / (1 + e^(-k * runDiff))
  // runDiff = -ln((1/targetWP) - 1) / k
  return -Math.log(1 / targetWP - 1) / k
}
