import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ChatsService } from './chats.service';
export class CreateMessageBody {
  role: string;
  content: string;
}

@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Get()
  getChatList() {
    return this.chatsService.getChatList();
  }

  /** 첫 대화: 방 생성 + 메시지 저장 */
  @Post('conversation')
  async startConversation(
    @Body() body: CreateMessageBody,
  ): Promise<{ success: boolean; conversationId: number }> {
    const { role, content } = body;

    const conversationId =
      await this.chatsService.createConversationWithFirstMessage(role, content);

    return { success: true, conversationId };
  }

  /** 기존 대화방 메시지 조회 */
  @Get(':conversationId/messages')
  async getMessages(
    @Param('conversationId', ParseIntPipe) conversationId: number,
  ) {
    const result = await this.chatsService.getMessages(conversationId);

    type MessageRow = {
      message_id: number;
      conversation_id: number;
      role: string;
      content: string;
      created_at: Date;
    };

    // snake_case → camelCase 변환
    return result.rows.map((row: MessageRow) => ({
      messageId: row.message_id,
      conversationId: row.conversation_id,
      role: row.role,
      content: row.content,
      createdAt: row.created_at,
    }));
  }

  /** 기존 대화방에 메시지 추가 */
  @Post(':conversationId/message')
  async createMessage(
    @Param('conversationId', ParseIntPipe) conversationId: number,
    @Body() body: CreateMessageBody,
  ) {
    const { role, content } = body;
    await this.chatsService.createMessage(conversationId, role, content);
    return { success: true };
  }
}
