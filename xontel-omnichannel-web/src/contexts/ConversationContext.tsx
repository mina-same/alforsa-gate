import React, { createContext, useContext } from "react";
import { Message } from "@/types/chat";

export interface ConversationStaticContextValue {
  conversationId: number | undefined;
  isInternalConversation: boolean;
  isAssignedToMe: boolean;
  canDelete: boolean;
  partnerName: string | undefined;
  channelType: string | undefined;
  currentUserAvatar: string | undefined;
  otherUserAvatar: string | undefined;
  onReply: (message: Message) => void;
  onDelete: (messageId: string, deleteForEveryone?: boolean) => void;
  onEdit: (messageId: string, newContent: string) => void;
  onResend: (messageId: string | number) => void;
  onCall: () => void;
  onOpenMediaViewer: (messageId: number) => void;
}

export interface ConversationSearchContextValue {
  searchQuery: string;
}

// Combined type kept for convenience
export type ConversationContextValue = ConversationStaticContextValue & ConversationSearchContextValue;

const ConversationStaticContext = createContext<ConversationStaticContextValue | null>(null);
const ConversationSearchContext = createContext<ConversationSearchContextValue>({ searchQuery: "" });

export function ConversationProvider({
  staticValue,
  searchValue,
  children,
}: {
  staticValue: ConversationStaticContextValue;
  searchValue: ConversationSearchContextValue;
  children: React.ReactNode;
}) {
  return (
    <ConversationStaticContext.Provider value={staticValue}>
      <ConversationSearchContext.Provider value={searchValue}>
        {children}
      </ConversationSearchContext.Provider>
    </ConversationStaticContext.Provider>
  );
}

export function useConversationStaticContext(): ConversationStaticContextValue {
  const ctx = useContext(ConversationStaticContext);
  if (!ctx) throw new Error("useConversationStaticContext must be used within ConversationProvider");
  return ctx;
}

export function useConversationSearchContext(): ConversationSearchContextValue {
  return useContext(ConversationSearchContext);
}

// Convenience hook combining both — avoids mass migration for components that use only static fields
export function useConversationContext(): ConversationContextValue {
  const staticCtx = useConversationStaticContext();
  const searchCtx = useConversationSearchContext();
  return { ...staticCtx, ...searchCtx };
}
