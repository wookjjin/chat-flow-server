import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ChatsModule } from './chats/chats.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    ChatsModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
