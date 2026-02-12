import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const pitchers = await prisma.pitcher.findMany({
      orderBy: [
        { era: 'asc' },
      ],
    })

    return NextResponse.json({ pitchers })
  } catch (error) {
    console.error('Error fetching pitchers:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
