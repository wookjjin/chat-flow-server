import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    forceCloseConnections: true,
  });
  app.enableShutdownHooks();
  app.enableCors({
    origin: ['https://chat-flow-inky.vercel.app', 'http://localhost:5173'],
  });
  await app.listen(3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
