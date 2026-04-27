import { useState, useCallback, useRef } from 'react';
import type { ChatMessage, ToolCall, ChatState } from './types';
import { useAtlasChatContext } from './AtlasChatContext';

function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

/**
 * Parse SSE stream from the atlas-api /chat endpoint.
 * Expected SSE event types:
 *   data: {"type":"token","content":"..."}
 *   data: {"type":"tool_call","name":"blueprint_graph","data":{...}}
 *   data: {"type":"done","model":"deepseek-v3"}
 *   data: {"type":"error","message":"..."}
 */
export function useAtlasChat() {
  const { config } = useAtlasChatContext();
  const [state, setState] = useState<ChatState>({
    messages: [],
    isStreaming: false,
    error: null,
  });
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (content: string, pageUrl: string) => {
      const userMsg: ChatMessage = {
        id: generateId(),
        role: 'user',
        content,
        timestamp: Date.now(),
      };

      const assistantMsg: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: '',
        toolCalls: [],
        timestamp: Date.now(),
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, userMsg, assistantMsg],
        isStreaming: true,
        error: null,
      }));

      // Dev mode: simulate streaming response on localhost
      const isDev =
        typeof window !== 'undefined' &&
        window.location.hostname === 'localhost';

      if (isDev) {
        const { mockResponse, mockToolCalls } = getDevMockResponse(content);
        const words = mockResponse.split(' ');
        for (let i = 0; i < words.length; i++) {
          await new Promise(r => setTimeout(r, 30 + Math.random() * 40));
          const token = (i === 0 ? '' : ' ') + words[i];
          setState(prev => {
            const msgs = [...prev.messages];
            const last = { ...msgs[msgs.length - 1] };
            last.content += token;
            msgs[msgs.length - 1] = last;
            return { ...prev, messages: msgs };
          });
        }
        if (mockToolCalls) {
          setState(prev => {
            const msgs = [...prev.messages];
            const last = { ...msgs[msgs.length - 1] };
            last.toolCalls = mockToolCalls;
            last.model = 'dev-mock';
            msgs[msgs.length - 1] = last;
            return { ...prev, messages: msgs };
          });
        }
        setState(prev => ({ ...prev, isStreaming: false }));
        return;
      }

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch(`${config.apiUrl}/chat`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: content,
            page_url: pageUrl,
            history: state.messages.slice(-10).map(m => ({
              role: m.role,
              content: m.content,
            })),
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const errBody = await res.text();
          let errMsg = 'Something went wrong. Try again.';
          if (res.status === 401) errMsg = 'Please log in to chat with Atlas.';
          else if (res.status === 403) errMsg = 'Your account has been suspended.';
          else if (res.status === 429) errMsg = 'You\'ve reached your daily limit. Come back tomorrow!';
          else {
            try {
              const parsed = JSON.parse(errBody);
              if (parsed.message) errMsg = parsed.message;
            } catch { /* use default */ }
          }
          setState(prev => ({
            ...prev,
            isStreaming: false,
            error: errMsg,
            // Remove the empty assistant message
            messages: prev.messages.slice(0, -1),
          }));
          return;
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error('No response body');

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const payload = line.slice(6).trim();
            if (payload === '[DONE]') continue;

            try {
              const event = JSON.parse(payload);

              if (event.type === 'token') {
                setState(prev => {
                  const msgs = [...prev.messages];
                  const last = { ...msgs[msgs.length - 1] };
                  last.content += event.content;
                  msgs[msgs.length - 1] = last;
                  return { ...prev, messages: msgs };
                });
              } else if (event.type === 'tool_call') {
                const toolCall: ToolCall = {
                  name: event.name,
                  data: event.data,
                };
                setState(prev => {
                  const msgs = [...prev.messages];
                  const last = { ...msgs[msgs.length - 1] };
                  last.toolCalls = [...(last.toolCalls || []), toolCall];
                  msgs[msgs.length - 1] = last;
                  return { ...prev, messages: msgs };
                });
              } else if (event.type === 'done') {
                setState(prev => {
                  const msgs = [...prev.messages];
                  const last = { ...msgs[msgs.length - 1] };
                  last.model = event.model;
                  msgs[msgs.length - 1] = last;
                  return { ...prev, messages: msgs };
                });
              } else if (event.type === 'error') {
                setState(prev => ({
                  ...prev,
                  error: event.message,
                }));
              }
            } catch {
              // Skip malformed SSE lines
            }
          }
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setState(prev => ({
            ...prev,
            error: 'Connection lost. Try again.',
            messages: prev.messages.slice(0, -1),
          }));
        }
      } finally {
        setState(prev => ({ ...prev, isStreaming: false }));
        abortRef.current = null;
      }
    },
    [config.apiUrl, state.messages]
  );

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
    setState(prev => ({ ...prev, isStreaming: false }));
  }, []);

  const clearMessages = useCallback(() => {
    setState({ messages: [], isStreaming: false, error: null });
  }, []);

  return {
    messages: state.messages,
    isStreaming: state.isStreaming,
    error: state.error,
    sendMessage,
    stopStreaming,
    clearMessages,
  };
}

/**
 * Dev-only mock responses for local testing without a backend.
 */
function getDevMockResponse(question: string): {
  mockResponse: string;
  mockToolCalls?: ToolCall[];
} {
  const q = question.toLowerCase();

  if (q.includes('blueprint') || q.includes('beginplay')) {
    return {
      mockResponse:
        'Here\'s a basic **BeginPlay** Blueprint that prints "Hello World" when your Actor spawns:\n\n' +
        'The **Event BeginPlay** node fires once when the Actor is first created or the game starts. ' +
        'Connect it to a **Print String** node to see output in the viewport.',
      mockToolCalls: [
        {
          name: 'blueprint_graph',
          data: {
            title: 'BeginPlay → Print String',
            width: 550,
            height: 200,
            nodes: [
              {
                id: 'n1',
                title: 'Event BeginPlay',
                style: 'event',
                x: 30,
                y: 50,
                pins: [
                  { id: 'exec_out', label: '', type: 'exec', side: 'output' },
                ],
              },
              {
                id: 'n2',
                title: 'Print String',
                style: 'function',
                x: 280,
                y: 50,
                pins: [
                  { id: 'exec_in', label: '', type: 'exec', side: 'input' },
                  { id: 'exec_out', label: '', type: 'exec', side: 'output' },
                  { id: 'string', label: 'In String', type: 'string', side: 'input', value: 'Hello World' },
                ],
              },
            ],
            wires: [
              { from: { node: 'n1', pin: 'exec_out' }, to: { node: 'n2', pin: 'exec_in' } },
            ],
          },
        },
      ],
    };
  }

  if (q.includes('vehicle') || q.includes('spawn')) {
    return {
      mockResponse:
        'To spawn a vehicle in HELIX, you use `SpawnActor` with your vehicle class. Here\'s how in each language:\n\n' +
        '```lua\n-- Lua (UnLua)\nlocal Vehicle = UE.UGameplayStatics.SpawnActor(\n  World,\n  VehicleClass,\n  SpawnTransform\n)\nVehicle:SetReplicates(true)\n```\n\n' +
        '```javascript\n// JavaScript (PuerTS)\nconst vehicle = UE.GameplayStatics.SpawnActor(\n  world,\n  vehicleClass,\n  spawnTransform\n);\nvehicle.SetReplicates(true);\n```\n\n' +
        'Make sure your vehicle class has **Replication** enabled if you want other players to see it. ' +
        'Check the [Vehicles guide](/docs/game-systems/vehicles) for the full setup.',
    };
  }

  if (q.includes('world') && q.includes('package')) {
    return {
      mockResponse:
        'Great question! A **World** and a **Package** are two different things:\n\n' +
        '**World** — A playable experience. Think of it as a complete game that players join. ' +
        'It contains a map, configuration, and one or more Packages.\n\n' +
        '**Package** — A modular bundle of assets and scripts. Like an npm package or a FiveM resource. ' +
        'Packages are published to the **Vault** and can be shared across multiple Worlds.\n\n' +
        'Think of it this way: a World is a meal, and Packages are the ingredients. ' +
        'You combine multiple Packages to create a complete World experience.',
    };
  }

  // Default response
  return {
    mockResponse:
      'That\'s a great question! In HELIX, you can approach this a few ways.\n\n' +
      'The recommended approach is to use **Blueprints** in HELIX Studio — they give you the best performance ' +
      'and deepest engine integration. If you\'re coming from FiveM, you\'ll find **Lua** (via UnLua) familiar. ' +
      'Web developers might prefer **JavaScript** (via PuerTS).\n\n' +
      'Check the [Scripting Guide](/docs/scripting/choosing-your-language) for a full comparison. ' +
      'Want me to show you a specific code example?',
  };
}
