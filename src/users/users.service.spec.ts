import { Test, TestingModule } from '@nestjs/testing'
import { UsersService } from './users.service'
import { PrismaService } from '../prisma/prisma.service'
import * as bcrypt from 'bcrypt'

jest.mock('bcrypt')

describe('UsersService', () => {
  let service: UsersService
  let prisma: { user: { create: jest.Mock; findUnique: jest.Mock } }

  beforeEach(async () => {
    prisma = {
      user: {
        create: jest.fn(),
        findUnique: jest.fn(),
      },
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile()

    service = module.get<UsersService>(UsersService)
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('create', () => {
    it('should create a user with hashed password', async () => {
      const hashedPassword = 'hashedPassword123'
      ;(bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword)
      prisma.user.create.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        password: hashedPassword,
        role: 'USER',
      })

      const result = await service.create('test@example.com', 'password123')

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10)
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          password: hashedPassword,
          role: 'USER',
        },
      })
      expect(result).toEqual({
        id: 1,
        email: 'test@example.com',
        password: hashedPassword,
        role: 'USER',
      })
    })

    it('should create a user with custom role', async () => {
      ;(bcrypt.hash as jest.Mock).mockResolvedValue('hashed')
      prisma.user.create.mockResolvedValue({
        id: 1,
        email: 'admin@example.com',
        password: 'hashed',
        role: 'ADMIN',
      })

      const result = await service.create('admin@example.com', 'pass', 'ADMIN')

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'admin@example.com',
          password: 'hashed',
          role: 'ADMIN',
        },
      })
      expect(result.role).toBe('ADMIN')
    })
  })

  describe('findByEmail', () => {
    it('should return user when found', async () => {
      const mockUser = { id: 1, email: 'test@example.com', password: 'hash', role: 'USER' }
      prisma.user.findUnique.mockResolvedValue(mockUser)

      const result = await service.findByEmail('test@example.com')

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@example.com' } })
      expect(result).toEqual(mockUser)
    })

    it('should return null when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null)

      const result = await service.findByEmail('notfound@example.com')

      expect(result).toBeNull()
    })
  })

  describe('validatePassword', () => {
    it('should return true for valid password', async () => {
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)

      const result = await service.validatePassword(
        { password: 'hashedPassword' },
        'correctPassword',
      )

      expect(bcrypt.compare).toHaveBeenCalledWith('correctPassword', 'hashedPassword')
      expect(result).toBe(true)
    })

    it('should return false for invalid password', async () => {
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)

      const result = await service.validatePassword(
        { password: 'hashedPassword' },
        'wrongPassword',
      )

      expect(result).toBe(false)
    })
  })
})
