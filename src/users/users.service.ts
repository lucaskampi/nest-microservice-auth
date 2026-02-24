import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import * as bcrypt from 'bcrypt'

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(email: string, password: string, role: string = 'USER') {
    const hashedPassword = await bcrypt.hash(password, 10)
    return this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
      },
    })
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    })
  }

  async validatePassword(user: any, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password)
  }
}
