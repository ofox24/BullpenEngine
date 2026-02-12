import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const scenario = await prisma.scenario.findUnique({
      where: { id: params.id },
      include: {
        results: {
          orderBy: {
            avgWinProbability: 'desc',
          },
        },
      },
    })

    if (!scenario) {
      return NextResponse.json(
        { error: 'Scenario not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ scenario })
  } catch (error) {
    console.error('Error fetching scenario:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
