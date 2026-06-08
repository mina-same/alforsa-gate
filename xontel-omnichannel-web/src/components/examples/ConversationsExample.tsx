import React, { useState } from 'react';
import { useConversations, useCreateMessage, useConversationMessages } from '@/api';
import { Button } from '@/components/ui/button';

/**
 * Example Component - Using React Query Hooks
 * Shows how to use the API hooks in your components
 */
export default function ConversationsExample() {
  const [selectedConvId, setSelectedConvId] = useState<number | null>(null);
  const [messageContent, setMessageContent] = useState('');

  // Query: List conversations
  const {
    data: conversations,
    isLoading: isLoadingConversations,
    error: conversationsError,
  } = useConversations({
    skip: 0,
    limit: 20,
  });

  // Query: Get messages for selected conversation
  const {
    data: messages,
    isLoading: isLoadingMessages,
  } = useConversationMessages(selectedConvId || 0);

  // Mutation: Create message
  const createMessageMutation = useCreateMessage();

  const handleSendMessage = async () => {
    if (!selectedConvId || !messageContent.trim()) return;

    try {
      await createMessageMutation.mutateAsync({
        content: messageContent,
        conversation_id: selectedConvId,
        message_type: 'text',
        direction: 'outbound',
      });
      setMessageContent('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <div className="flex h-screen gap-4 p-4">
      {/* Conversations List */}
      <div className="w-1/3 border rounded-lg p-4">
        <h2 className="text-lg font-bold mb-4">Conversations</h2>

        {isLoadingConversations && <p>Loading conversations...</p>}
        {conversationsError && <p className="text-red-500">Error loading conversations</p>}

        <div className="space-y-2">
          {conversations?.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setSelectedConvId(conv.id)}
              className={`w-full text-left p-3 rounded-lg transition ${
                selectedConvId === conv.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <p className="font-semibold">{conv.subject || 'No subject'}</p>
              <p className="text-sm text-gray-600">{conv.message_count} messages</p>
            </button>
          ))}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 border rounded-lg p-4 flex flex-col">
        {selectedConvId ? (
          <>
            <h2 className="text-lg font-bold mb-4">Messages</h2>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto mb-4 space-y-2">
              {isLoadingMessages && <p>Loading messages...</p>}
              {messages?.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-lg ${
                    msg.direction === 'outbound'
                      ? 'bg-blue-100 ml-auto max-w-xs'
                      : 'bg-gray-100 max-w-xs'
                  }`}
                >
                  <p>{msg.content}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(msg.created_at).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 border rounded-lg px-3 py-2"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
              />
              <Button
                onClick={handleSendMessage}
                disabled={createMessageMutation.isPending || !messageContent.trim()}
              >
                {createMessageMutation.isPending ? 'Sending...' : 'Send'}
              </Button>
            </div>
          </>
        ) : (
          <p className="text-gray-500">Select a conversation to view messages</p>
        )}
      </div>
    </div>
  );
}
