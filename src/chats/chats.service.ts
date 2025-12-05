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
  getChatList() {
    return [
      {
        id: 'chat-001',
        title: 'Next.js 프로젝트 구조 정리',
        lastMessage: '폴더 분리는 이렇게 하면 돼요!',
        updatedAt: '2025-11-25 09: 12',
        pinned: true,
      },
      {
        id: 'chat-002',
        title: 'Tailwind 레이아웃 질문',
        lastMessage: 'overflow-hidden 부분만 수정해보세요.',
        updatedAt: '2025-11-24 23: 48',
        pinned: false,
      },
      {
        id: 'chat-003',
        title: 'AI 채팅 기능 구현하기',
        lastMessage: 'SSE로 스트림 형태로 보내면 돼요.',
        updatedAt: '2025-11-24 18: 21',
        pinned: false,
      },
      {
        id: 'chat-004',
        title: 'React Router 모드 차이점',
        lastMessage: 'Framework 모드는 서버 중심입니다.',
        updatedAt: '2025-11-23 14: 03',
        pinned: false,
      },
      {
        id: 'chat-005',
        title: 'Nuxt TresJS 설정',
        lastMessage: 'tres.config.ts를 이렇게 수정해보세요.',
        updatedAt: '2025-11-22 10: 55',
        pinned: false,
      },
      {
        id: 'chat-006',
        title: 'SCREAM 아키텍처 질문',
        lastMessage: '도메인 계층에서 먼저 설계할게요.',
        updatedAt: '2025-11-21 19: 20',
        pinned: false,
      },
      {
        id: 'chat-007',
        title: 'CSS hover 문제',
        lastMessage: '그건 맥에서만 정상 동작해요.',
        updatedAt: '2025-11-21 08: 32',
        pinned: false,
      },
      {
        id: 'chat-008',
        title: 'Jenkins 배포 배우기',
        lastMessage: 'Pipeline부터 익혀야 합니다.',
        updatedAt: '2025-11-20 16: 15',
        pinned: false,
      },
    ];
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
