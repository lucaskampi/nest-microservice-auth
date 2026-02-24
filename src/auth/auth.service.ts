import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UsersService, UserWithoutPassword } from '../users/users.service'

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<UserWithoutPassword | null> {
    const user = await this.usersService.findByEmail(email)
    if (user && await this.usersService.validatePassword(user, password)) {
      const { password: _, ...result } = user
      return result
    }
    return null
  }

  async login(user: UserWithoutPassword) {
    const payload = { email: user.email, sub: user.id, role: user.role }
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    }
  }

  async register(email: string, password: string): Promise<UserWithoutPassword> {
    return this.usersService.create(email, password)
  }

  async verifyToken(token: string) {
    try {
      return await this.jwtService.verify(token)
    } catch (error) {
      return null
    }
  }
}
