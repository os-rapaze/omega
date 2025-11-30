import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { ConfigModule } from '@nestjs/config';
import { AiService } from './ai.service';
import { UsersModule } from '../users/users.module';
import { TimesModule } from '../times/times.module';
import { GithubModule } from '../github/github.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Time, TimeSchema } from '../times/times.schema';

@Module({
  imports: [
    UsersModule,
    ConfigModule,
    TimesModule,
    GithubModule,
    MongooseModule.forFeature([{ name: Time.name, schema: TimeSchema }]),
  ],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
