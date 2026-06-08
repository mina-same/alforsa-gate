import React from "react";
import { User } from "lucide-react";
import { UserResponse } from "@/api/users/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserMentionProps {
  users: UserResponse[];
  selectedIndex: number;
  onSelectUser: (user: UserResponse) => void;
  onHover: (index: number) => void;
}

export default function UserMention({
  users,
  selectedIndex,
  onSelectUser,
  onHover,
}: UserMentionProps) {
  if (users.length === 0) return null;

  const getUserName = (user: UserResponse) => {
    return user.full_name || user.email || `User ${user.id}`;
  };

  const getUserInitials = (user: UserResponse) => {
    const name = getUserName(user);
    return name
      .split(" ")
      .map((word: string) => word.charAt(0).toUpperCase())
      .join("")
      .substring(0, 2);
  };

  return (
    <div className="absolute bottom-full left-0 mb-2 w-80 max-h-48 overflow-y-auto bg-xon-surface-container border border-xon-surface-outline rounded-lg shadow-lg z-50">
      <div className="p-2">
        <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-xon-text-secondary font-medium">
          <User className="h-3 w-3" />
          <span>Mention users ({users.length})</span>
        </div>

        <div className="mt-1">
          {users.length === 0 ? (
            <div className="px-2 py-3 text-center text-sm text-xon-text-secondary">
              No users found
            </div>
          ) : (
            users.map((user, index) => (
              <div
                key={user.id}
                className={`flex items-center gap-3 px-2 py-2 rounded-md cursor-pointer transition-colors ${
                  index === selectedIndex
                    ? "bg-xon-primary/10 text-xon-primary"
                    : "hover:bg-xon-surface-hover text-xon-text-primary"
                }`}
                onClick={() => onSelectUser(user)}
                onMouseEnter={() => onHover(index)}
              >
                <Avatar className="h-6 w-6 flex-shrink-0">
                  <AvatarImage src={user.avatar_url} alt={getUserName(user)} />
                  <AvatarFallback className="text-xs bg-xon-surface-gray">
                    {getUserInitials(user)}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm truncate">
                    {getUserName(user)}
                  </div>
                  {user.email && user.full_name && (
                    <div className="text-xs text-xon-text-secondary truncate">
                      {user.email}
                    </div>
                  )}
                </div>

                {user.is_agent && (
                  <div className="flex items-center gap-1 text-xs text-xon-primary">
                    <User className="h-3 w-3" />
                    <span>Agent</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
