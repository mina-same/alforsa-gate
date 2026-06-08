import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquarePlus, Users, Sparkles } from "lucide-react";
import AgentConversationModal from "./AgentConversationModal";
import { cn } from "@/lib/utils";
import { useUIState } from "@/contexts/UIContext";

interface StartAgentConversationButtonProps {
  className?: string;
}

export default function StartAgentConversationButton({ className }: StartAgentConversationButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"direct" | "group">("direct");
  const uiState = useUIState();
  const activeInboxId = uiState.activeInboxId;

  // Check if current inbox is internal channel
  const isInternalChannel = React.useMemo(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem("userInboxes") || "[]");
      // Handle paginated response format with items array
      const inboxes = parsed.items || parsed;
      const currentInbox = inboxes.find((i: any) => Number(i.id) === Number(activeInboxId));

      // Check for internal channel indicators
      const isInternal = currentInbox == null
        

      console.log("Channel detection:", {
        currentInbox,
        isInternal,
        channelType: currentInbox?.channel_type,
        name: currentInbox?.name
      });

      return isInternal;
    } catch (error) {
      console.error("Error detecting internal channel:", error);
      return false;
    }
  }, [activeInboxId]);

  // Only show button in internal channels
  if (!isInternalChannel) {
    return null;
  }

  return (
    <>
      <div className="flex flex-col gap-2 mb-3">
        <Button
          onClick={() => {
            setModalMode("direct");
            setIsModalOpen(true);
          }}
          className={cn(
            "w-full gap-3 group relative overflow-hidden transition-all duration-300",
            "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700",
            "text-white border-0 shadow-md hover:shadow-lg",
            "transform hover:scale-[1.01] active:scale-[0.99]",
            className
          )}
          size="lg"
        >
          {/* Background gradient animation */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

          <MessageSquarePlus className="h-5 w-5" />
          <span className="font-semibold">Direct Message</span>
        </Button>

        <Button
          onClick={() => {
            setModalMode("group");
            setIsModalOpen(true);
          }}
          className={cn(
            "w-full gap-3 group relative overflow-hidden transition-all duration-300",
            "bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700",
            "text-white border-0 shadow-md hover:shadow-lg",
            "transform hover:scale-[1.01] active:scale-[0.99]",
            className
          )}
          size="lg"
        >
          {/* Background gradient animation */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

          <Users className="h-5 w-5" />
          <span className="font-semibold">Create Group</span>
        </Button>
      </div>

      <AgentConversationModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        defaultMode={modalMode}
      />
    </>
  );
}
