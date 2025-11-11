import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TimesService } from './times.service';
import { Time, TimeSchema } from './times.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Time.name, schema: TimeSchema }]),
  ],
  providers: [TimesService],
  exports: [TimesService],
})
export class TimesModule {}
