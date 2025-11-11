import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types, Model } from 'mongoose';
import { Time, TimeDocument } from './times.schema';

@Injectable()
export class TimesService {
  constructor(@InjectModel(Time.name) private timeModel: Model<TimeDocument>) {}

  async create(timeData: Partial<Time>): Promise<TimeDocument> {
    const createdTime = new this.timeModel(timeData);
    return createdTime.save();
  }

  async assignUser(
    timeId: string | Types.ObjectId,
    userId: string | Types.ObjectId,
  ): Promise<TimeDocument | null> {
    return await this.timeModel
      .findByIdAndUpdate(
        timeId,
        { $addToSet: { members: userId } },
        { new: true },
      )
      .populate('members');
  }
}
