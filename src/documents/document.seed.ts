import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Model } from 'mongoose';
import { Repository } from 'typeorm';
import { Document, DocumentDocument } from './schemas/document.schema';
import { Project } from '../projects/entities/project.entity';

@Injectable()
export class DocumentSeed {
  private readonly log = new Logger(DocumentSeed.name);

  constructor(
    @InjectModel(Document.name) private documentModel: Model<DocumentDocument>,
    @InjectRepository(Project)
    private readonly projects: Repository<Project>,
  ) {}

  async run() {
    // Get existing projects to use their UUIDs
    const projects = await this.projects.find();

    if (projects.length === 0) {
      this.log.error(
        'No projects found for seeding documents. Please run ProjectSeed first.',
      );
      return;
    }

    const seedDocuments = [
      {
        title: 'Market Research Report - Egypt',
        content:
          'Comprehensive market analysis for expansion into Egyptian market. This report covers consumer behavior, market size, competition landscape, and regulatory requirements. Key findings indicate strong growth potential in the technology sector with favorable demographics and increasing digital adoption rates.',
        tags: ['market_research', 'egypt', 'technology', 'expansion'],
        country: 'Egypt',
      },
      {
        title: 'Legal Framework Analysis - UAE',
        content:
          'Detailed analysis of UAE legal requirements for foreign company establishment. Covers free zone options, mainland setup procedures, licensing requirements, and compliance obligations. Includes comparison of different emirates and their specific advantages for different business sectors.',
        tags: ['legal_setup', 'uae', 'compliance', 'licensing'],
        country: 'UAE',
      },
      {
        title: 'Competitive Landscape Study - Saudi Arabia',
        content:
          'In-depth competitive analysis for the Saudi Arabian market. Identifies key players, market positioning, pricing strategies, and potential partnership opportunities. Includes Vision 2030 alignment opportunities and sector-specific growth projections.',
        tags: ['market_research', 'saudi_arabia', 'competition', 'vision2030'],
        country: 'KSA',
      },
      {
        title: 'Company Registration Guide - Germany',
        content:
          'Step-by-step guide for company registration in Germany. Covers GmbH formation, tax registration, social security setup, and employment law compliance. Includes timeline estimates, cost breakdowns, and required documentation checklists.',
        tags: ['company_registration', 'germany', 'legal_setup', 'gmbh'],
        country: 'Germany',
      },
      {
        title: 'Expansion Strategy Document - USA',
        content:
          'Strategic roadmap for US market entry. Covers market segmentation, go-to-market strategy, distribution channels, and scaling plans. Includes risk assessment, investment requirements, and success metrics definition.',
        tags: ['expansion_strategy', 'usa', 'strategy', 'market_entry'],
        country: 'USA',
      },
      {
        title: 'Hiring and HR Setup Guide - Germany',
        content:
          'Comprehensive guide for establishing HR processes in Germany. Covers employment contracts, benefits packages, payroll setup, and compliance with German labor laws. Includes templates and best practices for remote and office-based teams.',
        tags: ['hiring', 'hr', 'germany', 'employment', 'compliance'],
        country: 'Germany',
      },
      {
        title: 'Marketing Strategy - UAE',
        content:
          'Digital marketing strategy tailored for the UAE market. Covers social media presence, influencer partnerships, local advertising regulations, and cultural considerations. Includes budget allocation and performance measurement frameworks.',
        tags: ['marketing', 'uae', 'digital_marketing', 'social_media'],
        country: 'UAE',
      },
      {
        title: 'Regulatory Compliance Checklist - Egypt',
        content:
          'Complete compliance checklist for Egyptian business operations. Covers tax obligations, import/export regulations, employment law compliance, and industry-specific requirements. Updated with latest regulatory changes and government initiatives.',
        tags: ['compliance', 'egypt', 'regulatory', 'tax', 'legal_setup'],
        country: 'Egypt',
      },
    ];

    for (const seedDoc of seedDocuments) {
      // Find a project that matches the country or use the first available project
      let targetProject = projects.find(
        (p) => p.country.toLowerCase() === seedDoc.country.toLowerCase(),
      );

      // If no matching country project found, use the first project
      if (!targetProject) {
        targetProject = projects[0];
        this.log.warn(
          `No project found for country ${seedDoc.country}, using project for ${targetProject.country}`,
        );
      }

      // Check if document already exists for this project and title
      const existingDoc = await this.documentModel.findOne({
        projectId: targetProject.id,
        title: seedDoc.title,
      });

      if (existingDoc) {
        this.log.log(
          `Document "${seedDoc.title}" already exists for project ${targetProject.id}`,
        );
        continue;
      }

      // Create new document
      const document = new this.documentModel({
        projectId: targetProject.id,
        title: seedDoc.title,
        content: seedDoc.content,
        tags: seedDoc.tags,
      });

      await document.save();
      this.log.log(
        `Document "${seedDoc.title}" created for project ${targetProject.id} (${targetProject.country})`,
      );
    }

    this.log.log('Document seeding completed');
  }
}
