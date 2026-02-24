import { Test, TestingModule } from '@nestjs/testing'
import { JwtStrategy } from './jwt.strategy'

describe('JwtStrategy', () => {
  let strategy: JwtStrategy

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtStrategy],
    }).compile()

    strategy = module.get<JwtStrategy>(JwtStrategy)
  })

  it('should be defined', () => {
    expect(strategy).toBeDefined()
  })

  describe('validate', () => {
    it('should return user payload without password', async () => {
      const payload = { sub: 1, email: 'test@example.com', role: 'USER' }

      const result = await strategy.validate(payload)

      expect(result).toEqual({ userId: 1, email: 'test@example.com', role: 'USER' })
    })

    it('should extract userId from sub claim', async () => {
      const payload = { sub: 42, email: 'admin@example.com', role: 'ADMIN' }

      const result = await strategy.validate(payload)

      expect(result.userId).toBe(42)
      expect(result.role).toBe('ADMIN')
    })
  })
})
