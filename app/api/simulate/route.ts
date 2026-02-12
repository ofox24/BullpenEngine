import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { compareOptions } from '@/lib/simulation/monteCarlo'
import { OutState } from '@/lib/simulation/runExpectancy'
import { PitcherStats } from '@/lib/simulation/pitcherModel'

const simulateSchema = z.object({
  inning: z.number().int().min(1).max(15),
  outs: z.number().int().min(0).max(2),
  scoreHome: z.number().int().min(0),
  scoreAway: z.number().int().min(0),
  isHome: z.boolean(),
  runners: z.array(z.enum(['first', 'second', 'third'])),
  pitcherIds: z.array(z.string()).min(2).max(6),
  iterations: z.number().int().min(100).max(10000).optional().default(1000),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const input = simulateSchema.parse(body)

    // Fetch pitcher data
    const pitchers = await prisma.pitcher.findMany({
      where: {
        id: {
          in: input.pitcherIds,
        },
      },
    })

    if (pitchers.length !== input.pitcherIds.length) {
      return NextResponse.json(
        { error: 'One or more pitchers not found' },
        { status: 404 }
      )
    }

    // Create scenario
    const scenario = await prisma.scenario.create({
      data: {
        inning: input.inning,
        outs: input.outs,
        scoreHome: input.scoreHome,
        scoreAway: input.scoreAway,
        isHome: input.isHome,
        runnersOn: JSON.stringify(input.runners),
        pitchers: {
          create: input.pitcherIds.map((pitcherId) => ({
            pitcherId,
          })),
        },
      },
    })

    // Run simulation
    const pitcherStats = pitchers.map((p) => ({
      id: p.id,
      name: p.name,
      era: p.era,
      fip: p.fip,
      k9: p.k9,
      bb9: p.bb9,
      hr9: p.hr9,
      throws: p.throws,
    }))

    const results = compareOptions(
      {
        inning: input.inning,
        outs: input.outs as OutState,
        scoreHome: input.scoreHome,
        scoreAway: input.scoreAway,
        isHome: input.isHome,
        runners: input.runners,
        iterations: input.iterations,
      },
      pitcherStats
    )

    // Store results
    const optimalPitcherId = results[0].pitcherId

    await Promise.all(
      results.map((result) =>
        prisma.simulationResult.create({
          data: {
            scenarioId: scenario.id,
            pitcherId: result.pitcherId,
            pitcherName: result.pitcherName,
            avgWinProbability: result.avgWinProbability,
            wpDelta: result.wpDelta,
            avgRunsAllowed: result.avgRunsAllowed,
            optimalChoice: result.pitcherId === optimalPitcherId,
            iterations: result.iterations,
          },
        })
      )
    )

    return NextResponse.json({
      scenarioId: scenario.id,
      results: results.map((r) => ({
        pitcherId: r.pitcherId,
        pitcherName: r.pitcherName,
        avgRunsAllowed: r.avgRunsAllowed,
        avgWinProbability: r.avgWinProbability,
        wpDelta: r.wpDelta,
        optimalChoice: r.pitcherId === optimalPitcherId,
      })),
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Simulation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
