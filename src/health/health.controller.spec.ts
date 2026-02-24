import { Test, TestingModule } from '@nestjs/testing'
import { HealthController } from './health.controller'
import { HealthCheckService } from '@nestjs/terminus'
import { PrismaHealthIndicator } from '@nestjs/terminus'
import { PrismaService } from '../prisma/prisma.service'

describe('HealthController', () => {
  let controller: HealthController
  let healthCheckService: { check: jest.Mock }
  let prismaHealthIndicator: { pingCheck: jest.Mock }
  let prismaService: { $queryRaw: jest.Mock }

  beforeEach(async () => {
    healthCheckService = { check: jest.fn() }
    prismaHealthIndicator = { pingCheck: jest.fn() }
    prismaService = { $queryRaw: jest.fn() }

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: HealthCheckService, useValue: healthCheckService },
        { provide: PrismaHealthIndicator, useValue: prismaHealthIndicator },
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile()

    controller = module.get<HealthController>(HealthController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('check', () => {
    it('should perform health check', () => {
      healthCheckService.check.mockReturnValue({ status: 'ok' })

      controller.check()

      expect(healthCheckService.check).toHaveBeenCalled()
    })
  })

  describe('live', () => {
    it('should return liveness status', () => {
      const result = controller.live()

      expect(result).toHaveProperty('status', 'ok')
      expect(result).toHaveProperty('timestamp')
    })
  })

  describe('ready', () => {
    it('should return ready status when database is connected', async () => {
      prismaService.$queryRaw.mockResolvedValue(true)

      const result = await controller.ready()

      expect(result).toHaveProperty('status', 'ready')
      expect(result).toHaveProperty('timestamp')
    })

    it('should return not ready when database fails', async () => {
      prismaService.$queryRaw.mockRejectedValue(new Error('DB error'))

      const result = await controller.ready()

      expect(result).toHaveProperty('status', 'not ready')
      expect(result).toHaveProperty('timestamp')
    })
  })
})
