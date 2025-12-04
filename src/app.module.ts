import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ChatsModule } from './chats/chats.module';

@Module({
  imports: [ChatsModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
