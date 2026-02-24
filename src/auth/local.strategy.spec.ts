import { Test, TestingModule } from '@nestjs/testing'
import { UnauthorizedException } from '@nestjs/common'
import { LocalStrategy } from './local.strategy'
import { AuthService } from './auth.service'

describe('LocalStrategy', () => {
  let strategy: LocalStrategy
  let authService: { validateUser: jest.Mock }

  beforeEach(async () => {
    authService = {
      validateUser: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalStrategy,
        { provide: AuthService, useValue: authService },
      ],
    }).compile()

    strategy = module.get<LocalStrategy>(LocalStrategy)
  })

  it('should be defined', () => {
    expect(strategy).toBeDefined()
  })

  describe('validate', () => {
    it('should return user when credentials are valid', async () => {
      const mockUser = { id: 1, email: 'test@example.com', role: 'USER' }
      authService.validateUser.mockResolvedValue(mockUser)

      const result = await strategy.validate('test@example.com', 'password123')

      expect(authService.validateUser).toHaveBeenCalledWith('test@example.com', 'password123')
      expect(result).toEqual(mockUser)
    })

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      authService.validateUser.mockResolvedValue(null)

      await expect(strategy.validate('test@example.com', 'wrongpassword')).rejects.toThrow(
        UnauthorizedException,
      )
    })
  })
})
