import { Test, TestingModule } from '@nestjs/testing'
import { AuthService } from './auth.service'
import { UsersService } from '../users/users.service'
import { JwtService } from '@nestjs/jwt'

describe('AuthService', () => {
  let service: AuthService
  let usersService: { findByEmail: jest.Mock; validatePassword: jest.Mock; create: jest.Mock }
  let jwtService: { sign: jest.Mock; verify: jest.Mock }

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    role: 'USER',
  }

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      validatePassword: jest.fn(),
      create: jest.fn(),
    }

    jwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
      verify: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('validateUser', () => {
    it('should return user without password when credentials are valid', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser)
      usersService.validatePassword.mockResolvedValue(true)

      const result = await service.validateUser('test@example.com', 'password123')

      expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com')
      expect(usersService.validatePassword).toHaveBeenCalledWith(mockUser, 'password123')
      expect(result).toEqual({ id: 1, email: 'test@example.com', role: 'USER' })
    })

    it('should return null when user not found', async () => {
      usersService.findByEmail.mockResolvedValue(null)

      const result = await service.validateUser('notfound@example.com', 'password123')

      expect(result).toBeNull()
    })

    it('should return null when password is invalid', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser)
      usersService.validatePassword.mockResolvedValue(false)

      const result = await service.validateUser('test@example.com', 'wrongpassword')

      expect(result).toBeNull()
    })
  })

  describe('login', () => {
    it('should return access token and user info', async () => {
      const user = { id: 1, email: 'test@example.com', role: 'USER' }

      const result = await service.login(user)

      expect(jwtService.sign).toHaveBeenCalledWith({
        email: 'test@example.com',
        sub: 1,
        role: 'USER',
      })
      expect(result).toEqual({
        access_token: 'mock-jwt-token',
        user: { id: 1, email: 'test@example.com', role: 'USER' },
      })
    })
  })

  describe('register', () => {
    it('should create a new user and return user without password', async () => {
      usersService.create.mockResolvedValue(mockUser)

      const result = await service.register('test@example.com', 'password123')

      expect(usersService.create).toHaveBeenCalledWith('test@example.com', 'password123')
      expect(result).toEqual({ id: 1, email: 'test@example.com', role: 'USER' })
    })
  })

  describe('verifyToken', () => {
    it('should return payload for valid token', async () => {
      const payload = { email: 'test@example.com', sub: 1 }
      jwtService.verify.mockReturnValue(payload)

      const result = await service.verifyToken('valid-token')

      expect(jwtService.verify).toHaveBeenCalledWith('valid-token')
      expect(result).toEqual(payload)
    })

    it('should return null for invalid token', async () => {
      jwtService.verify.mockImplementation(() => Promise.reject(new Error('Invalid token')))

      const result = await service.verifyToken('invalid-token')

      expect(result).toBeNull()
    })
  })
})
