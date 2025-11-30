import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GithubService } from './github.service';
import { GithubUser, GithubUserSchema } from './schemas/github-user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GithubUser.name, schema: GithubUserSchema },
    ]),
  ],
  providers: [GithubService],
  exports: [GithubService],
})
export class GithubModule {}
