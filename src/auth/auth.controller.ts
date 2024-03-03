import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthCredantialsDto } from './dto/auth-credantions.dto';
// import { AuthGuard } from '@nestjs/passport';
// import { UserEntity } from './user.entiry';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signUp(
    @Body(ValidationPipe) authCredantialsDto: AuthCredantialsDto,
  ): Promise<void> {
    return this.authService.signUp(authCredantialsDto);
  }

  @Post('signin')
  async signIn(
    @Body(ValidationPipe) authCredantialsDto: AuthCredantialsDto,
  ): Promise<{ accessToken: string }> {
    return this.authService.signIn(authCredantialsDto);
  }
}
