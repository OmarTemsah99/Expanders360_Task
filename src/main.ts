import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  await app.listen(process.env.PORT ?? 3000);
}

// Call bootstrap and handle rejections to satisfy the no-floating-promises rule
bootstrap().catch((err) => {
  // Log the error and exit with non-zero code so failures are visible in CI/dev
  // (keeps behavior explicit instead of using `void` to ignore)
  console.error(err);
  process.exit(1);
});
