import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import axios from 'axios';
import { GithubUser, GithubUserDocument } from './schemas/github-user.schema';

@Injectable()
export class GithubService {
  constructor(
    @InjectModel(GithubUser.name)
    private githubUserModel: Model<GithubUserDocument>,
  ) {}

  async getCommits(owner: string, repo: string, token: string) {
    const res = await axios.get<any[]>(
      `https://api.github.com/repos/${owner}/${repo}/commits`,
      {
        headers: {
          Authorization: `token ${token}`,
        },
      },
    );

    return res.data.map((commit) => ({
      sha: commit.sha,
      message: commit.commit.message,
      author: commit.commit.author,
      date: commit.commit.author.date,
    }));
  }

  async getCommitDetails(
    owner: string,
    repo: string,
    sha: string,
    token: string,
  ) {
    const res = await axios.get<any>(
      `https://api.github.com/repos/${owner}/${repo}/commits/${sha}`,
      {
        headers: {
          Authorization: `token ${token}`,
        },
      },
    );

    return {
      sha: res.data.sha,
      message: res.data.commit.message,
      author: res.data.commit.author.name,
      date: res.data.commit.author.date,
      files: res.data.files.map((file: any) => ({
        filename: file.filename,
        status: file.status,
        additions: file.additions,
        deletions: file.deletions,
        changes: file.changes,
      })),
    };
  }

  async getRepoFiles(
    owner: string,
    repo: string,
    token: string,
    branch: string = 'main',
  ) {
    const branchRes = await axios.get<any>(
      `https://api.github.com/repos/${owner}/${repo}/branches/${branch}`,
      {
        headers: {
          Authorization: `token ${token}`,
        },
      },
    );
    const treeSha = branchRes.data.commit.commit.tree.sha;

    const treeRes = await axios.get<any>(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${treeSha}?recursive=1`,
      {
        headers: {
          Authorization: `token ${token}`,
        },
      },
    );

    return treeRes.data.tree
      .filter((item: any) => item.type === 'blob')
      .map((item: any) => ({
        path: item.path,
        type: item.type,
        size: item.size,
        url: item.url,
        html_url: `https://github.com/${owner}/${repo}/blob/${branch}/${item.path}`,
      }));
  }

  async getBranches(owner: string, repo: string, token: string) {
    const res = await axios.get<any[]>(
      `https://api.github.com/repos/${owner}/${repo}/branches`,
      {
        headers: {
          Authorization: `token ${token}`,
        },
      },
    );

    return res.data.map((branch) => ({
      name: branch.name,
      commitSha: branch.commit.sha,
      protected: branch.protected,
    }));
  }

  async createUser(userData: Partial<GithubUser>): Promise<GithubUserDocument> {
    const createdUser = new this.githubUserModel(userData);
    return createdUser.save();
  }

  async linkGithubUserToUser(githubUserId: string, userId: string) {
    return this.githubUserModel.findByIdAndUpdate(
      githubUserId,
      { userId },
      { new: true },
    );
  }
}
