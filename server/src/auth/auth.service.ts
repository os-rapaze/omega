import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CliTokenService } from '../cli/cli-token.service';
import { JwtService } from '@nestjs/jwt';
import { UserDocument } from '../users/schemas/user.schema';
import { ConflictException } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private cliTokensService: CliTokenService,
    private jwtService: JwtService,
  ) {}

  async signIn(
    username: string,
    pass: string,
  ): Promise<{ access_token: string }> {
    const user: UserDocument | null =
      await this.usersService.findOneWithPassword(username);

    if (!user || user.password !== pass) {
      throw new UnauthorizedException();
    }

    const payload = { sub: user._id, name: user.name, username: user.username };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async signUp(
    createUserDto: CreateUserDto,
  ): Promise<{ access_token: string }> {
    const existingUser = await this.usersService.findOne(
      createUserDto.username,
    );
    if (existingUser) {
      throw new ConflictException('Email já está em uso.');
    }

    const user = await this.usersService.create(createUserDto);
    const payload = { sub: user._id, name: user.name, email: user.email };
    return { access_token: await this.jwtService.signAsync(payload) };
  }

  async linkCli(username: string, pass: string) {
    const user = await this.usersService.findOneWithPassword(username);

    if (!user || user.password !== pass) {
      throw new UnauthorizedException();
    }

    const cliToken = await this.cliTokensService.generateToken(user._id);

    return {
      cli_token: cliToken,
    };
  }
}
