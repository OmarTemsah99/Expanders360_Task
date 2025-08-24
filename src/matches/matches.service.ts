import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from './entities/match.entity';

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(Match) private readonly matches: Repository<Match>,
  ) {}

  findAll() {
    return this.matches.find();
  }

  async findOne(id: number) {
    const m = await this.matches.findOne({ where: { id } });
    if (!m) throw new NotFoundException('Match not found');
    return m;
  }
}
