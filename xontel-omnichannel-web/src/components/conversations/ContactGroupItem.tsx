import { useState, memo } from "react";
import Avatar from "../shared/Avatar";
import { Conversation } from "@/types/chat";
import ConversationItem from "./ConversationItem";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { ContactTags } from "@/api/tags/types";

type ConversationGroup = {
  contact_id: number;
  contact_name: string;
  contact_avatar_url: string;
  contact_phone: string;
  conversations: Conversation[];
};

export default memo(function ContactGroupItem({ group, availableTags = [] }: { group: ConversationGroup; availableTags?: ContactTags[] }) {
  const [open, setOpen] = useState(false);

  const latest = group.conversations[0];

  return (
    <div className="border-b">
      {
        group.conversations.length>1 &&
        (
            <div
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 p-3 cursor-pointer hover:bg-xon-surface"
      >
        <Avatar
          src={latest.contact_avatar_url}
          name={latest.contact_name}
          size="md"
        />

        <div className="flex-1 min-w-0">
          <div className="font-bold truncate">
            {latest.contact_name}
          </div>

          <div className="text-sm text-gray-500 truncate">
            {latest.lastMessage?.text || latest.subject}
          </div>
        </div>

        {/* عدد المحادثات */}
        {group.conversations.length > 1 && (
          <div className=" flex items-center gap-1 text-xs bg-xon-surface-container-hover text-blue px-2 py-1 rounded-md">
            {group.conversations.length}

            {open ? (
              <ChevronDown className="size-4" />
            ) : (
              <ChevronRight className="size-4 " />
            )}
          
          </div>
        )}
      </div>
        )
      }

    

      {open && (
        <div >
          {group.conversations.map((conv) => (
            <div key={conv.id} className="border-l-2 border-xon-surface-outline ml-7 ">
              <ConversationItem conversation={conv} availableTags={availableTags} />
            </div>
          ))}
        </div>
      )}

       {group.conversations.length === 1 && (
        <ConversationItem
          key={group.conversations[0].id}
          conversation={group.conversations[0]}
          availableTags={availableTags}
        />
       )}
    </div>
  );
});