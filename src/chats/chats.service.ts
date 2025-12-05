import { Inject, Injectable } from '@nestjs/common';
import type { QueryResult, QueryResultRow } from 'pg';

type QueryExecutor = {
  query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    params?: ReadonlyArray<unknown>,
  ): Promise<QueryResult<T>>;
};
@Injectable()
export class ChatsService {
  /** 대화방 목록 조회 */
  async getChatList() {
    const result = await this.pg.query(
      `
      SELECT 
        c.conversation_id AS "conversationId",
        COALESCE(
          (SELECT content FROM messages 
          WHERE conversation_id = c.conversation_id 
          ORDER BY created_at ASC LIMIT 1),
        '') AS "firstMessage",
        COALESCE(
          (SELECT content FROM messages 
          WHERE conversation_id = c.conversation_id 
          ORDER BY created_at DESC LIMIT 1),
        '') AS "lastMessage",
        c.created_at AS "createdAt",
        c.updated_at AS "updatedAt"
      FROM conversations c
      ORDER BY c.updated_at DESC;
      `,
    );

    return result.rows;
  }
  //
  constructor(@Inject('PG') private readonly pg: QueryExecutor) {}

  async createMessage(conversationId: number, role: string, content: string) {
    await this.pg.query(
      `INSERT INTO messages (conversation_id, role, content) VALUES ($1, $2, $3)`,
      [conversationId, role, content],
    );

    // 마지막 업데이트 시간 갱신
    await this.pg.query(
      `UPDATE conversations SET updated_at = NOW() WHERE conversation_id = $1`,
      [conversationId],
    );
  }

  async getMessages(conversationId: number) {
    return this.pg.query(
      `SELECT * FROM messages
      WHERE conversation_id = $1
      ORDER BY created_at ASC`,
      [conversationId],
    );
  }

  async createConversationWithFirstMessage(
    role: string,
    content: string,
  ): Promise<number> {
    // 1) conversation 생성
    type ConversationRow = {
      conversation_id: number;
    };

    const result = await this.pg.query<ConversationRow>(
      `INSERT INTO conversations DEFAULT VALUES RETURNING conversation_id`,
    );

    const firstRow = result.rows[0] as ConversationRow | undefined;
    if (!firstRow) {
      throw new Error('Failed to create conversation');
    }

    const conversationId = firstRow.conversation_id;

    // 2) 첫 메시지 저장
    await this.pg.query(
      `INSERT INTO messages (conversation_id, role, content) VALUES ($1, $2, $3)`,
      [conversationId, role, content],
    );

    return conversationId;
  }

  async saveAssistantMessage(conversationId: number, content: string) {
    await this.pg.query(
      `INSERT INTO messages (conversation_id, role, content) VALUES ($1, 'assistant', $2)`,
      [conversationId, content],
    );
  }
}
