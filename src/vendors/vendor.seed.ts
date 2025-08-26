import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vendor } from './entities/vendor.entity';

@Injectable()
export class VendorSeed {
  private readonly log = new Logger(VendorSeed.name);

  constructor(
    @InjectRepository(Vendor)
    private readonly vendors: Repository<Vendor>,
  ) {}

  async run() {
    const seedVendors: Array<Partial<Vendor>> = [
      {
        name: 'Global Insights Ltd',
        countries_supported: ['USA', 'UK', 'UAE'],
        services_offered: ['market_research', 'expansion_strategy'],
        rating: 4.5,
        response_sla_hours: 24,
      },
      {
        name: 'LegalEase Solutions',
        countries_supported: ['UAE', 'KSA', 'Egypt'],
        services_offered: ['legal_setup', 'company_registration'],
        rating: 4.2,
        response_sla_hours: 48,
      },
      {
        name: 'TalentBridge HR',
        countries_supported: ['Germany', 'USA', 'India'],
        services_offered: ['hiring', 'outsourcing'],
        rating: 4.7,
        response_sla_hours: 12,
      },
      {
        name: 'MENA Growth Partners',
        countries_supported: ['Egypt', 'KSA', 'UAE'],
        services_offered: ['market_research', 'marketing'],
        rating: 4.0,
        response_sla_hours: 36,
      },
      {
        name: 'Americas Business Hub',
        countries_supported: ['USA', 'Canada', 'Mexico'],
        services_offered: ['expansion_strategy', 'financial_advisory'],
        rating: 4.3,
        response_sla_hours: 24,
      },
    ];

    for (const vendor of seedVendors) {
      const exists = await this.vendors.findOne({
        where: { name: vendor.name },
      });

      if (exists) {
        this.log.log(`Vendor already exists: ${vendor.name}`);
        continue;
      }

      await this.vendors.save(vendor);
      this.log.log(`Vendor created: ${vendor.name}`);
    }
  }
}
