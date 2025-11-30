import { Injectable, BadRequestException } from '@nestjs/common';
import { Projeto, ProjetoDocument } from '../projetos/projetos.schema';
import { CreateTimeDto } from './dto/create-time.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Types, Model } from 'mongoose';
import { Time, TimeDocument } from './times.schema';

@Injectable()
export class TimesService {
  constructor(
    @InjectModel(Time.name) private timeModel: Model<TimeDocument>,
    @InjectModel(Projeto.name) private projetoModel: Model<ProjetoDocument>,
  ) {}

  async create(createTimeDto: CreateTimeDto): Promise<Time> {
    const projeto = await this.projetoModel
      .findById(createTimeDto.projetoId)
      .exec();

    if (!projeto) {
      throw new BadRequestException('Projeto não encontrado.');
    }

    const createdTime = new this.timeModel(createTimeDto);
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

  async assignGithubUser(
    timeId: string | Types.ObjectId,
    githubUserId: string | Types.ObjectId,
  ): Promise<TimeDocument | null> {
    return await this.timeModel
      .findByIdAndUpdate(
        timeId,
        { $addToSet: { githubMembers: githubUserId } },
        { new: true },
      )
      .populate('githubMembers');
  }

  async getTime(timeId: string) {
    return this.timeModel.findById(timeId).populate('projetoId').exec();
  }
  async getTimes(projetoId: string): Promise<Time[]> {
    return this.timeModel
      .find({ projetoId })
      .populate('githubMembers')
      .populate('members')
      .exec();
  }

  async assignUserToGithubUserTeams(
    githubUserId: string,
    userId: string,
  ): Promise<void> {
    const githubObjectId = new Types.ObjectId(githubUserId);
    const userObjectId = new Types.ObjectId(userId);

    await this.timeModel.updateMany(
      {
        githubMembers: githubObjectId,
      },
      {
        $addToSet: { members: userObjectId },
      },
    );
  }
}
