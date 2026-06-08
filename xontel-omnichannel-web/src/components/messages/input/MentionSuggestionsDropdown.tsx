import React from "react";

import { Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type MentionUser = {
  id: any;
  full_name?: string;
  email?: string;
  avatar_url?: string;
};

export default function MentionSuggestionsDropdown({
  isInternalConversation,
  isOpen,
  isLoading,
  inboxId,
  inboxMembersError,
  inboxMembersCount,
  users,
  selectedIndex,
  onSelect,
}: {
  isInternalConversation: boolean;
  isOpen: boolean;
  isLoading: boolean;
  inboxId?: number | null;
  inboxMembersError: unknown;
  inboxMembersCount: number;
  users: MentionUser[];
  selectedIndex: number;
  onSelect: (user: MentionUser) => void;
}) {
  if (!isInternalConversation || !isOpen) return null;

  return (
    <div
      className={`absolute bottom-full left-4 right-4 mb-2 bg-xon-surface-container border border-xon-surface-outline rounded-lg shadow-2xl overflow-hidden z-50 transition-all ${isOpen
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-2 pointer-events-none"
        }`}
    >
      <div className="p-2 border-b border-xon-surface-outline flex items-center justify-between bg-xon-surface-container-hover">
        <span className="text-xs font-semibold flex items-center gap-1.5 text-xon-text-secondary uppercase tracking-wider">
          @ Mentions
        </span>
        {isLoading && (
          <Loader2 className="h-3 w-3 animate-spin text-xon-primary" />
        )}
      </div>
      <div className="max-h-64 overflow-y-auto">
        {users.length > 0 ? (
          users.map((u, idx) => (
            <button
              key={u.id}
              onClick={() => onSelect(u)}
              className={`w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors border-l-2 ${idx === selectedIndex
                  ? "bg-xon-surface-container-hover border-xon-primary"
                  : "hover:bg-xon-surface-hover border-transparent"
                }`}
            >
              <Avatar className="h-7 w-7">
                <AvatarImage src={u.avatar_url} />
                <AvatarFallback className="text-xs">
                  {String(u.full_name || u.email || "U")
                    .charAt(0)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium truncate">{u.full_name}</div>
                {u.email && (
                  <div className="text-xs text-xon-text-secondary truncate">
                    {u.email}
                  </div>
                )}
              </div>
            </button>
          ))
        ) : isLoading ? (
          <div className="px-4 py-6 text-center flex flex-col items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-xon-primary/50" />
            <span className="text-xs text-xon-text-secondary italic">
              Loading members...
            </span>
          </div>
        ) : !inboxId ? (
          <div className="px-4 py-6 text-center text-xs text-xon-text-secondary italic">
            Inbox id not found for this conversation
          </div>
        ) : inboxMembersError ? (
          <div className="px-4 py-6 text-center text-xs text-xon-text-secondary italic">
            Failed to load inbox members
          </div>
        ) : inboxMembersCount === 0 ? (
          <div className="px-4 py-6 text-center text-xs text-xon-text-secondary italic">
            No members found
          </div>
        ) : (
          <div className="px-4 py-6 text-center text-xs text-xon-text-secondary italic">
            No matches
          </div>
        )}
      </div>
    </div>
  );
}
