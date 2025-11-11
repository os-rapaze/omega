import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '../auth.guard';
import { CliAuthGuard } from './cli-auth.guard';

@Injectable()
export class CombinedAuthGuard implements CanActivate {
  constructor(
    private jwtGuard: AuthGuard,
    private cliGuard: CliAuthGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const can = await this.jwtGuard.canActivate(context);
      if (can) return true;
    } catch (_) {}

    try {
      const can = await this.cliGuard.canActivate(context);
      if (can) return true;
    } catch (_) {}

    throw new ForbiddenException('Acesso negado.');
  }
}
