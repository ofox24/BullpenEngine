import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  await prisma.simulationResult.deleteMany()
  await prisma.scenarioPitcher.deleteMany()
  await prisma.scenario.deleteMany()
  await prisma.pitcher.deleteMany()

  const pitchers = [
    { name: 'Josh Hader', team: 'HOU', throws: 'L', era: 1.28, fip: 1.91, k9: 14.5, bb9: 2.8, hr9: 0.5 },
    { name: 'Emmanuel Clase', team: 'CLE', throws: 'R', era: 1.36, fip: 2.45, k9: 8.9, bb9: 1.2, hr9: 0.3 },
    { name: 'Devin Williams', team: 'MIL', throws: 'R', era: 1.53, fip: 2.12, k9: 13.2, bb9: 3.1, hr9: 0.4 },
    { name: 'Ryan Helsley', team: 'STL', throws: 'R', era: 2.04, fip: 2.67, k9: 14.8, bb9: 2.4, hr9: 0.6 },
    { name: 'Andrés Muñoz', team: 'SEA', throws: 'R', era: 2.12, fip: 2.34, k9: 13.1, bb9: 1.9, hr9: 0.5 },
    { name: 'Jhoan Duran', team: 'MIN', throws: 'R', era: 2.45, fip: 2.78, k9: 12.7, bb9: 3.2, hr9: 0.7 },
    { name: 'Alexis Díaz', team: 'CIN', throws: 'R', era: 2.56, fip: 2.89, k9: 11.4, bb9: 2.8, hr9: 0.6 },
    { name: 'Jordan Romano', team: 'TOR', throws: 'R', era: 2.68, fip: 2.91, k9: 11.2, bb9: 2.1, hr9: 0.8 },
    { name: 'Camilo Doval', team: 'SF', throws: 'R', era: 2.74, fip: 3.12, k9: 12.3, bb9: 3.9, hr9: 0.7 },
    { name: 'Evan Phillips', team: 'LAD', throws: 'R', era: 2.85, fip: 3.01, k9: 10.8, bb9: 1.8, hr9: 0.9 },
    { name: 'Clay Holmes', team: 'NYY', throws: 'R', era: 2.89, fip: 3.24, k9: 9.4, bb9: 3.4, hr9: 0.5 },
    { name: 'Paul Sewald', team: 'ARI', throws: 'R', era: 2.95, fip: 3.15, k9: 11.6, bb9: 2.5, hr9: 0.8 },
    { name: 'David Bednar', team: 'PIT', throws: 'R', era: 3.01, fip: 3.28, k9: 10.9, bb9: 2.9, hr9: 0.9 },
    { name: 'Félix Bautista', team: 'BAL', throws: 'R', era: 1.14, fip: 1.68, k9: 15.1, bb9: 2.1, hr9: 0.3 },
    { name: 'Kenley Jansen', team: 'BOS', throws: 'R', era: 3.12, fip: 3.45, k9: 10.2, bb9: 1.6, hr9: 1.0 },
    { name: 'Liam Hendriks', team: 'CWS', throws: 'R', era: 2.81, fip: 3.02, k9: 12.8, bb9: 2.3, hr9: 0.7 },
    { name: 'Robert Suarez', team: 'SD', throws: 'R', era: 2.27, fip: 2.56, k9: 11.7, bb9: 2.0, hr9: 0.5 },
    { name: 'A.J. Puk', team: 'MIA', throws: 'L', era: 3.24, fip: 3.48, k9: 12.4, bb9: 3.7, hr9: 0.8 },
    { name: 'Scott Barlow', team: 'KC', throws: 'R', era: 3.38, fip: 3.52, k9: 10.1, bb9: 2.9, hr9: 1.0 },
    { name: 'Taylor Rogers', team: 'SF', throws: 'L', era: 3.17, fip: 3.34, k9: 9.8, bb9: 2.4, hr9: 0.9 },
    { name: 'Jason Adam', team: 'TB', throws: 'R', era: 2.93, fip: 3.18, k9: 10.5, bb9: 1.9, hr9: 0.8 },
    { name: 'Raisel Iglesias', team: 'ATL', throws: 'R', era: 1.87, fip: 2.34, k9: 13.5, bb9: 1.5, hr9: 0.6 },
    { name: 'Ryan Pressly', team: 'HOU', throws: 'R', era: 3.49, fip: 3.67, k9: 9.7, bb9: 2.7, hr9: 1.1 },
    { name: 'Pete Fairbanks', team: 'TB', throws: 'R', era: 1.98, fip: 2.45, k9: 13.9, bb9: 2.2, hr9: 0.5 },
    { name: 'Griffin Jax', team: 'MIN', throws: 'R', era: 3.58, fip: 3.71, k9: 11.3, bb9: 3.1, hr9: 1.0 },
    { name: 'Tanner Scott', team: 'MIA', throws: 'L', era: 3.89, fip: 3.95, k9: 11.8, bb9: 4.3, hr9: 0.9 },
    { name: 'Michael King', team: 'NYY', throws: 'R', era: 2.75, fip: 3.08, k9: 10.4, bb9: 2.5, hr9: 0.8 },
    { name: 'Aroldis Chapman', team: 'KC', throws: 'L', era: 4.12, fip: 4.28, k9: 13.2, bb9: 4.8, hr9: 1.2 },
    { name: 'Jorge López', team: 'MIN', throws: 'R', era: 4.35, fip: 4.51, k9: 8.7, bb9: 3.5, hr9: 1.3 },
    { name: 'Daniel Bard', team: 'COL', throws: 'R', era: 4.91, fip: 4.73, k9: 9.2, bb9: 4.1, hr9: 1.4 },
  ]

  for (const pitcher of pitchers) {
    await prisma.pitcher.create({
      data: pitcher,
    })
  }

  console.log(`✅ Seeded ${pitchers.length} pitchers`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
