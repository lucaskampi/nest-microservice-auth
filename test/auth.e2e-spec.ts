import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import { AppModule } from '../src/app.module'
import request from 'supertest'
import { PrismaService } from '../src/prisma/prisma.service'

describe('AuthController (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService

  const testUser = {
    email: 'e2e-test@example.com',
    password: 'testPassword123',
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(new ValidationPipe({ transform: true }))
    await app.init()

    prisma = app.get<PrismaService>(PrismaService)
    await prisma.user.deleteMany({ where: { email: testUser.email } }).catch(() => {})
  })

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: testUser.email } }).catch(() => {})
    await app.close()
  })

  describe('/auth/register (POST)', () => {
    it('should register a new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201)

      expect(response.body).toHaveProperty('id')
      expect(response.body.email).toBe(testUser.email)
      expect(response.body).not.toHaveProperty('password')
    })

    it('should reject duplicate email', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(500)
    })

    it('should reject invalid email', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'invalid', password: 'password123' })
        .expect(400)
    })
  })

  describe('/auth/login (POST)', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: testUser.email, password: testUser.password })
        .expect(201)

      expect(response.body).toHaveProperty('access_token')
      expect(response.body.user).toHaveProperty('email', testUser.email)
    })

    it('should reject invalid password', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: testUser.email, password: 'wrongpassword' })
        .expect(401)
    })

    it('should reject non-existent user', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'password123' })
        .expect(401)
    })
  })

  describe('/auth/profile (GET)', () => {
    it('should return 401 without auth header', async () => {
      await request(app.getHttpServer())
        .get('/auth/profile')
        .expect(401)
    })

    it('should return profile with valid token', async () => {
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: testUser.email, password: testUser.password })

      const token = loginResponse.body.access_token

      const response = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      expect(response.body).toHaveProperty('email', testUser.email)
    })
  })

  describe('/auth/verify (POST)', () => {
    it('should verify valid token', async () => {
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: testUser.email, password: testUser.password })

      const token = loginResponse.body.access_token

      const response = await request(app.getHttpServer())
        .post('/auth/verify')
        .send({ token })
        .expect(201)

      expect(response.body.valid).toBe(true)
      expect(response.body.payload).toHaveProperty('email', testUser.email)
    })

    it('should return invalid for bad token', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/verify')
        .send({ token: 'invalid-token' })
        .expect(201)

      expect(response.body.valid).toBe(false)
      expect(response.body.payload).toBeNull()
    })
  })
})
