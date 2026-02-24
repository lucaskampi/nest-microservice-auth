import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { AuthController } from './auth/auth.controller'
import { AuthService } from './auth/auth.service'
import { UsersService } from './users/users.service'
import { PrismaService } from './prisma/prisma.service'
import { JwtStrategy } from './auth/jwt.strategy'
import { LocalStrategy } from './auth/local.strategy'
import { HealthModule } from './health/health.module'

@Module({
  imports: [
    PassportModule,
    HealthModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, UsersService, PrismaService, JwtStrategy, LocalStrategy],
})
export class AppModule {}
