import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'
import { AuthService } from './auth.service'
import { RegisterDto, VerifyDto } from './dto/auth.dto'
import { UserWithoutPassword } from '../users/users.service'

interface AuthenticatedRequest extends Request {
  user: UserWithoutPassword
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.email, dto.password)
  }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Returns JWT token' })
  async login(@Request() req: AuthenticatedRequest) {
    return this.authService.login(req.user)
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Returns user profile' })
  getProfile(@Request() req: AuthenticatedRequest) {
    return req.user
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify JWT token' })
  @ApiResponse({ status: 200, description: 'Token is valid' })
  async verify(@Body() dto: VerifyDto) {
    const payload = await this.authService.verifyToken(dto.token)
    return { valid: !!payload, payload }
  }
}
