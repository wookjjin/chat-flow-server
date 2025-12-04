import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ChatsService } from './chats.service';

type CreateMessageBody = {
  chatId: string;
  role: string;
  content: string;
  timestamp: string | Date;
};

@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Get()
  getChatList() {
    return this.chatsService.getChatList();
  }

  @Post('message')
  async createMessage(@Body() body: CreateMessageBody) {
    const { chatId, role, content, timestamp } = body;
    await this.chatsService.createMessage(
      chatId,
      role,
      content,
      timestamp instanceof Date ? timestamp : new Date(timestamp),
    );
    return { success: true };
  }

  @Get('messages')
  async getMessages(@Query('chatId') chatId: string) {
    return this.chatsService.getMessages(chatId);
  }
}
