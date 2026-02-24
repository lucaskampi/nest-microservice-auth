import { Test, TestingModule } from '@nestjs/testing'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { AuthGuard } from '@nestjs/passport'

describe('AuthController', () => {
  let controller: AuthController
  let authService: { login: jest.Mock; register: jest.Mock; verifyToken: jest.Mock }

  beforeEach(async () => {
    authService = {
      login: jest.fn(),
      register: jest.fn(),
      verifyToken: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    })
      .overrideGuard(AuthGuard('local'))
      .useValue({ canActivate: () => true })
      .overrideGuard(AuthGuard('jwt'))
      .useValue({ canActivate: () => true })
      .compile()

    controller = module.get<AuthController>(AuthController)
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('register', () => {
    it('should register a new user', async () => {
      const mockUser = { id: 1, email: 'test@example.com', role: 'USER' }
      authService.register.mockResolvedValue(mockUser)

      const result = await controller.register({ email: 'test@example.com', password: 'password123' })

      expect(authService.register).toHaveBeenCalledWith('test@example.com', 'password123')
      expect(result).toEqual(mockUser)
    })
  })

  describe('login', () => {
    it('should return login response', async () => {
      const mockResponse = { access_token: 'token', user: { id: 1, email: 'test@example.com', role: 'USER' } }
      authService.login.mockResolvedValue(mockResponse)
      const req = { user: { id: 1, email: 'test@example.com', role: 'USER' } }

      const result = await controller.login(req)

      expect(authService.login).toHaveBeenCalledWith(req.user)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getProfile', () => {
    it('should return user profile from request', () => {
      const req = { user: { id: 1, email: 'test@example.com', role: 'USER' } }

      const result = controller.getProfile(req)

      expect(result).toEqual(req.user)
    })
  })

  describe('verify', () => {
    it('should return valid true for valid token', async () => {
      const payload = { email: 'test@example.com', sub: 1 }
      authService.verifyToken.mockResolvedValue(payload)

      const result = await controller.verify({ token: 'valid-token' })

      expect(authService.verifyToken).toHaveBeenCalledWith('valid-token')
      expect(result).toEqual({ valid: true, payload })
    })

    it('should return valid false for invalid token', async () => {
      authService.verifyToken.mockResolvedValue(null)

      const result = await controller.verify({ token: 'invalid-token' })

      expect(result).toEqual({ valid: false, payload: null })
    })
  })
})
