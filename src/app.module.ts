import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { AdminSeed } from './auth/admin.seed';
import { ProjectsModule } from './projects/projects.module';
import { VendorsModule } from './vendors/vendors.module';
import { MatchesModule } from './matches/matches.module';
import { DocumentsModule } from './documents/documents.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // MySQL
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.MYSQL_HOST ?? 'localhost',
      port: parseInt(process.env.MYSQL_PORT ?? '3306', 10),
      username: process.env.MYSQL_USER ?? 'root',
      password: process.env.MYSQL_PASSWORD ?? '',
      database: process.env.MYSQL_DB ?? 'expansion_db',
      autoLoadEntities: true,
      synchronize: true, // disable in production
    }),

    // MongoDB
    MongooseModule.forRoot(
      process.env.MONGO_URI ?? 'mongodb://localhost:27017/expansion_docs',
    ),

    AuthModule,
    ProjectsModule,
    VendorsModule,
    MatchesModule,
    DocumentsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly adminSeed: AdminSeed) {}

  async onModuleInit() {
    await this.adminSeed.run();
  }
}
