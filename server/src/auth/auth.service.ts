import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UserDocument } from '../users/schemas/user.schema';
import { ConflictException } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async signIn(email: string, pass: string): Promise<{ access_token: string }> {
    const user: UserDocument | null = await this.usersService.findOne(email);

    if (!user || user.password !== pass) {
      throw new UnauthorizedException();
    }

    const payload = { sub: user._id, name: user.name };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async signUp(createUserDto: CreateUserDto): Promise<{ access_token: string }> {
    const existingUser = await this.usersService.findOne(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('Email já está em uso.');
    }

    const user = await this.usersService.create(createUserDto);
    const payload = { sub: user._id, name: user.name };
    return { access_token: await this.jwtService.signAsync(payload) };
  }
}

