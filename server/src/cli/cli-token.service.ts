import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as crypto from 'crypto';
import { CliToken, CliTokenDocument } from './cli-token.schema';

@Injectable()
export class CliTokenService {
  constructor(
    @InjectModel(CliToken.name) private tokenModel: Model<CliTokenDocument>,
  ) {}

  async generateToken(userId: Types.ObjectId) {
    const token = crypto.randomBytes(32).toString('hex');

    const cliToken = await this.tokenModel.create({
      user: userId,
      token,
    });

    return cliToken.token;
  }

  async validateToken(token: string) {
    return this.tokenModel.findOne({ token }).populate({
      path: 'user',
      select: '-password',
    });
  }

  async revokeToken(token: string) {
    return this.tokenModel.updateOne({ token }, { revoked: true });
  }
}
