import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

beforeAll(async () => {
  await prisma.$connect()
})

afterAll(async () => {
  await prisma.user.deleteMany({
    where: {
      email: {
        contains: '@example.com',
      },
    },
  }).catch(() => {})
  await prisma.$disconnect()
})
