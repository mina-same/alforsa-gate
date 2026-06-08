import React from "react";
import { UserResponse } from "@/api/users/types";

interface NoteContentProps {
  content: string;
  mentionedUsers?: UserResponse[];
  className?: string;
}

export default function NoteContent({
  content,
  mentionedUsers = [],
  className = "",
}: NoteContentProps) {
  // Function to render content with highlighted mentions
  const renderContentWithMentions = () => {
    if (!mentionedUsers || mentionedUsers.length === 0) {
      return content;
    }

    let processedContent = content;
    const mentionMap = new Map();

    // Create a map of user names/emails to user objects
    mentionedUsers.forEach((user) => {
      const fullName = user.full_name;
      const email = user.email;

      if (fullName) {
        mentionMap.set(`@${fullName}`, user);
      }
      if (email) {
        mentionMap.set(`@${email}`, user);
      }
      // Also map by ID as fallback
      mentionMap.set(`@${user.id}`, user);
    });

    // Sort mentions by length (longer names first) to avoid partial matches
    const sortedMentions = Array.from(mentionMap.keys()).sort(
      (a, b) => b.length - a.length,
    );

    // Replace mentions with styled spans
    let result = [];
    let lastIndex = 0;

    // Find all mentions and their positions
    const mentionPositions: Array<{
      start: number;
      end: number;
      text: string;
      user: UserResponse;
    }> = [];

    sortedMentions.forEach((mention) => {
      const regex = new RegExp(
        `(?<!\\w)${mention.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?!\\w)`,
        "g",
      );
      let match: RegExpExecArray | null;
      while ((match = regex.exec(processedContent)) !== null) {
        mentionPositions.push({
          start: match.index,
          end: match.index + match[0].length,
          text: match[0],
          user: mentionMap.get(mention),
        });
      }
    });

    // Sort positions by start index
    mentionPositions.sort((a, b) => a.start - b.start);

    // Build the result array
    mentionPositions.forEach((mention, index) => {
      // Add text before the mention
      if (mention.start > lastIndex) {
        result.push(
          <span key={`text-${index}`}>
            {processedContent.substring(lastIndex, mention.start)}
          </span>,
        );
      }

      // Add the highlighted mention
      result.push(
        <span
          key={`mention-${mention.user.id}-${index}`}
          className="text-blue-500 hover:text-blue-600 hover:underline cursor-pointer font-medium"
          title={`${mention.user.full_name || mention.user.email} ${mention.user.is_agent ? "(Agent)" : ""}`}
        >
          {mention.text}
        </span>,
      );

      lastIndex = mention.end;
    });

    // Add remaining text
    if (lastIndex < processedContent.length) {
      result.push(
        <span key="text-final">{processedContent.substring(lastIndex)}</span>,
      );
    }

    return result.length > 0 ? result : content;
  };

  return (
    <div
      className={`text-sm text-xon-text-primary leading-relaxed whitespace-pre-wrap break-words ${className}`}
    >
      {renderContentWithMentions()}
    </div>
  );
}
