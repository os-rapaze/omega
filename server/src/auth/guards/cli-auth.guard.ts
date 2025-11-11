import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CliTokenService } from '../../cli/cli-token.service';

@Injectable()
export class CliAuthGuard implements CanActivate {
  constructor(private cliTokensService: CliTokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const token = req.headers['x-cli-token'];

    if (!token) return false;

    const cliSession = await this.cliTokensService.validateToken(token);
    if (!cliSession) throw new UnauthorizedException('Invalid CLI Token');

    req.user = cliSession.user;
    return true;
  }
}
