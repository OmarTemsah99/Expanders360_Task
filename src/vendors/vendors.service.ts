import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { Vendor } from './entities/vendor.entity';

@Injectable()
export class VendorsService {
  constructor(
    @InjectRepository(Vendor) private readonly vendors: Repository<Vendor>,
  ) {}

  findAll() {
    return this.vendors.find();
  }

  async findOne(id: number) {
    const v = await this.vendors.findOne({ where: { id } });
    if (!v) throw new NotFoundException('Vendor not found');
    return v;
  }

  create(dto: CreateVendorDto) {
    const v = this.vendors.create(dto);
    return this.vendors.save(v);
  }

  async update(id: number, dto: UpdateVendorDto) {
    const v = await this.findOne(id);
    Object.assign(v, dto);
    return this.vendors.save(v);
  }

  async remove(id: number) {
    const v = await this.findOne(id);
    await this.vendors.remove(v);
    return { deleted: true };
  }
}
