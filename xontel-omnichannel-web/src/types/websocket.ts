export type WebSocketConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export interface WebSocketMessage {
  type: string;
  data?: any;
  [key: string]: any;
}

export interface AssignConversation {
  id: number;
  status: string;
  assigned_agent_id: number;
  updated_at: string;
  type: string;
  data?: any;
  [key: string]: any;
}
