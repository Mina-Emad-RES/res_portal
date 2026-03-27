import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';
import { SetPasswordDto } from './dto/set-password.dto';
import type { AuthRequest } from './auth-request.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  me(@Req() req: AuthRequest) {
    return req.user;
  }

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.username,
      loginDto.password,
    );

    return this.authService.login(user);
  }

  @Public()
  @Get('validate-password-token')
  validatePasswordToken(@Query('token') token: string) {
    return this.authService.validatePasswordSetupToken(token);
  }

  @Public()
  @Post('set-password')
  async setPassword(@Body() body: SetPasswordDto) {
    return this.authService.setPassword(body.token, body.password);
  }
}
