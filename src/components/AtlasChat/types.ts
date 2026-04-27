export interface AtlasUser {
  id: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: ToolCall[];
  timestamp: number;
  model?: string;
}

export interface ToolCall {
  name: string;
  // BlueprintGraph data or other tool results
  data: Record<string, unknown>;
}

export interface AuthState {
  status: 'loading' | 'authenticated' | 'unauthenticated';
  user: AtlasUser | null;
}

export interface ChatState {
  messages: ChatMessage[];
  isStreaming: boolean;
  error: string | null;
}

export interface AtlasConfig {
  apiUrl: string;
}
