'use client';

import { useEffect, useRef, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatPanelProps {
  registrationId: string;
  projectTitle: string;
  ipType: string;
  authToken: string;
  onFieldsUpdated?: () => void;
}

const IP_TYPE_LABELS: Record<string, string> = {
  copyright: '저작권',
  trademark: '상표',
  design: '디자인권',
  patent: '특허',
};

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

function getMsgText(msg: { content?: string; parts?: Array<{ type: string; text?: string }> }): string {
  if (msg.parts) {
    return msg.parts.filter((p) => p.type === 'text').map((p) => p.text ?? '').join('');
  }
  return msg.content ?? '';
}

export default function ChatPanel({ registrationId, projectTitle, ipType, authToken, onFieldsUpdated }: ChatPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [input, setInput] = useState('');
  const msgTimestamps = useRef<Map<string, Date>>(new Map());

  const { messages, append, isLoading, error } = useChat({
    api: '/api/chat',
    body: { registrationId },
    headers: { Authorization: `Bearer ${authToken}` },
    onFinish: () => {
      onFieldsUpdated?.();
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  function adjustTextarea() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }

  function formatTime(date: Date) {
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  }

  function handleSend() {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput('');
    append({ role: 'user', content: text });
  }

  return (
    <div className="flex flex-col h-full bg-white border-l border-neutral-200">
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-neutral-200 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-body font-medium text-neutral-900 truncate">{projectTitle}</span>
          <span className="text-caption bg-royal text-white px-2 py-0.5 rounded-sm flex-shrink-0">
            {IP_TYPE_LABELS[ipType] ?? ipType}
          </span>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="w-2 h-2 bg-jade rounded-full" />
          <span className="text-caption text-neutral-500">저장됨</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {messages.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-body text-neutral-400 text-center">
              무엇을 등록하고 싶으신지<br />편하게 말씀해주세요.
            </p>
          </div>
        )}

        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          if (!msgTimestamps.current.has(msg.id)) {
            msgTimestamps.current.set(msg.id, new Date());
          }
          const ts = msgTimestamps.current.get(msg.id)!;
          const prevTs = idx > 0 ? msgTimestamps.current.get(messages[idx - 1].id) : undefined;
          const showTime = idx === 0 || !prevTs || ts.getMinutes() !== prevTs.getMinutes();
          const text = getMsgText(msg);
          if (!text) return null;

          return (
            <div key={msg.id}>
              {showTime && (
                <p className="text-center text-caption text-neutral-500 my-2">
                  {formatTime(ts)}
                </p>
              )}
              <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
                {!isUser && (
                  <div className="w-[22px] h-[22px] rounded-full bg-royal-50 border border-royal-100 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                    <span className="text-[11px] font-medium text-royal">AI</span>
                  </div>
                )}
                <div
                  className={cn(
                    'max-w-[75%] px-3 py-2 rounded-xl text-body leading-relaxed',
                    isUser
                      ? 'bg-royal text-white rounded-br-sm'
                      : 'bg-neutral-100 text-neutral-900 rounded-bl-sm'
                  )}
                >
                  {text}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex justify-start">
            <div className="w-[22px] h-[22px] rounded-full bg-royal-50 border border-royal-100 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
              <span className="text-[11px] font-medium text-royal">AI</span>
            </div>
            <div className="bg-neutral-100 rounded-xl rounded-bl-sm">
              <TypingIndicator />
            </div>
          </div>
        )}

        {error && (
          <p className="text-caption text-danger text-center py-2">
            오류가 발생했습니다. 다시 시도해주세요.
          </p>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="h-20 flex-shrink-0 border-t border-neutral-200 px-3 py-2 flex flex-col gap-1">
        <div className="flex items-end gap-2 h-full">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => { setInput(e.target.value); adjustTextarea(); }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="메시지 입력... (Shift+Enter: 줄바꿈)"
            rows={1}
            className="flex-1 resize-none bg-transparent text-body text-neutral-900 placeholder:text-neutral-400 focus:outline-none min-h-[44px] max-h-[120px] py-2.5"
            style={{ height: '44px' }}
            aria-label="메시지 입력"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="w-9 h-9 bg-royal rounded-md flex items-center justify-center flex-shrink-0 hover:bg-royal-600 transition-colors disabled:opacity-40 active:scale-[0.98]"
            aria-label="전송"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
        <p className="text-caption text-neutral-500 text-center">
          AI는 참고 자료를 제공하며, 법적 자문이 아닙니다.
        </p>
      </div>
    </div>
  );
}
