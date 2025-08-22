import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // MySQL
    TypeOrmModule.forRoot({
      type: 'mysql',
      // Use safe helpers to read environment variables and provide sensible defaults
      host: process.env.MYSQL_HOST ?? 'localhost',
      port: parseInt(process.env.MYSQL_PORT ?? '3306', 10),
      username: process.env.MYSQL_USER ?? 'root',
      password: process.env.MYSQL_PASSWORD ?? '',
      database: process.env.MYSQL_DB ?? 'expansion_db',
      autoLoadEntities: true,
      synchronize: true, // ❌ disable in production
    }),

    // MongoDB
    MongooseModule.forRoot(
      process.env.MONGO_URI ?? 'mongodb://localhost:27017/expansion_docs',
    ),

    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
