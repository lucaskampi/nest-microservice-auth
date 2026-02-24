import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'
import { AuthService } from './auth.service'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  async register(@Body() body: { email: string; password: string }) {
    return this.authService.register(body.email, body.password)
  }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Returns JWT token' })
  async login(@Request() req: any) {
    return this.authService.login(req.user)
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Returns user profile' })
  getProfile(@Request() req: any) {
    return req.user
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify JWT token' })
  @ApiResponse({ status: 200, description: 'Token is valid' })
  async verify(@Body() body: { token: string }) {
    const payload = await this.authService.verifyToken(body.token)
    return { valid: !!payload, payload }
  }
}
