import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CliToken, CliTokenSchema } from './cli-token.schema';
import { CliController } from './cli.controller';
import { CliTokenService } from './cli-token.service';
import { CliAuthGuard } from '../auth/guards/cli-auth.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CliToken.name, schema: CliTokenSchema },
    ]),
  ],
  providers: [CliTokenService, CliAuthGuard],
  exports: [CliTokenService, CliAuthGuard],
  controllers: [CliController],
})
export class CliModule {}
