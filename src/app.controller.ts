import { Controller, Sse, MessageEvent, Query } from '@nestjs/common';
import { Observable, interval } from 'rxjs';
import { mergeMap, take } from 'rxjs/operators';
import { ChatsService } from './chats/chats.service';

interface StreamChunk {
  type: 'start' | 'chunk' | 'end';
  content: string;
  messageId: string;
}

@Controller('api')
export class AppController {
  constructor(private readonly chatsService: ChatsService) {}

  private generateResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('안녕') || lowerMessage.includes('hello')) {
      return `안녕하세요! 무엇을 도와드릴까요? 😊

저는 실시간 스트리밍으로 응답하는 AI 어시스턴트입니다. 궁금하신 점이 있으면 언제든 물어보세요!`;
    }

    if (lowerMessage.includes('날씨')) {
      return `오늘 날씨에 대해 물어보셨네요.

실제 날씨 정보를 가져오려면 외부 API와 연동이 필요합니다. 현재는 데모 버전이라 실제 날씨 데이터는 제공하지 않지만, 날씨 API를 연동하면 실시간 날씨 정보를 제공할 수 있습니다!

예를 들어:
- OpenWeatherMap API
- 기상청 API
등을 활용할 수 있습니다.`;
    }

    if (lowerMessage.includes('코드') || lowerMessage.includes('프로그래밍')) {
      return `프로그래밍에 관심이 있으시군요! 👨‍💻

어떤 언어나 기술에 대해 알고 싶으신가요?

저는 다음과 같은 주제로 도움을 드릴 수 있습니다:
- JavaScript/TypeScript
- React, Vue, Angular
- Node.js, NestJS
- Python, Java, Go
- 알고리즘과 자료구조
- 데이터베이스 설계

구체적인 질문을 해주시면 더 자세히 답변드리겠습니다!`;
    }

    // 기본 응답
    return `"${userMessage}"에 대한 답변입니다.

이것은 실시간 스트리밍 응답 데모입니다. 실제 AI 모델을 연동하면 다음과 같은 서비스를 사용할 수 있습니다:

1. **OpenAI GPT API**: GPT-3.5, GPT-4 등
2. **Anthropic Claude API**: Claude 3 모델들
3. **Google PaLM API**: Google의 대화형 AI
4. **자체 AI 모델**: 직접 훈련한 모델

각 문자가 하나씩 전송되는 것을 볼 수 있습니다. 이는 실제 AI 서비스와 동일한 사용자 경험을 제공합니다!

궁금한 점이 더 있으시면 언제든 물어보세요. 😊`;
  }

  @Sse('sse')
  sse(
    @Query('message') userMessage: string,
    @Query('conversationId') conversationId: number,
  ): Observable<MessageEvent> {
    const messageId = Date.now().toString();
    const fullResponse = this.generateResponse(userMessage || '안녕하세요');

    const chunks = fullResponse.split('');
    const totalChunks = chunks.length;

    const typingSpeed = 25;

    // 🔥 여기서 서버 측 버퍼 생성
    let buffer = '';

    return interval(typingSpeed).pipe(
      take(totalChunks + 2),
      mergeMap(async (index) => {
        let chunk: StreamChunk;

        if (index === 0) {
          chunk = {
            type: 'start',
            content: '',
            messageId,
          };
        } else if (index <= totalChunks) {
          const content = chunks[index - 1];
          buffer += content; // 🔥 chunk 누적

          chunk = {
            type: 'chunk',
            content,
            messageId,
          };
        } else {
          // 🔥 end 시점 → 전체 assistant 메시지 DB 저장
          await this.chatsService.createMessage(
            conversationId,
            'assistant',
            buffer,
          );

          chunk = {
            type: 'end',
            content: '',
            messageId,
          };
        }

        return { data: chunk } as MessageEvent;
      }),
    );
  }
}
