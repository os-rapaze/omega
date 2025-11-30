import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { CliLoginDto } from '../dto/cli-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: { password: string; username: string }) {
    return this.authService.signIn(signInDto.username, signInDto.password);
  }

  @Post('cli/link')
  async linkCli(@Body() body: CliLoginDto) {
    const { username, password } = body;
    const result = await this.authService.linkCli(username, password);
    return result;
  }

  @Get('validate')
  @UseGuards(AuthGuard)
  validate(@Request() req) {
    return { user: req.user };
  }

  @Post('signup')
  signUp(@Body() createUserDto: CreateUserDto) {
    return this.authService.signUp(createUserDto);
  }
}
