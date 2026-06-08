import React from "react";
import { ChevronDown, Info, Copy, Check, Trash2, Edit, Reply, Star, Pin } from "lucide-react";
import { useAuthUser } from "@/contexts/AuthContext";
import { useUIDispatch, openMessageInfo, openMessageEdit } from "@/contexts/UIContext";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import EditMessageDialog from "./EditMessageModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Message } from "@/types/chat";
import { cn } from "@/lib/utils";
import { copyMessageContent, type CopyResult } from "@/utils/clipboardUtils";

interface MessageActionsDropdownProps {
  message: Message;
  isSender: boolean;
  onCopy: (text: string) => void;
  onDelete?: (messageId: string, deleteForEveryone?: boolean) => void;
  onEdit?: (messageId: string, newContent: string) => void;
  onReply?: (message: Message) => void;
  onStar?: (message: Message) => void;
  onPin?: (message: Message) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  containerClassName?: string;
  triggerClassName?: string;
  showTrigger?: boolean;
  style?: React.CSSProperties;
  isInternalConversation?: boolean;
}

export default function MessageActionsDropdown({
  message,
  isSender,
  onCopy,
  onDelete,
  onEdit,
  onReply,
  onStar,
  onPin,
  open,
  onOpenChange,
  containerClassName,
  triggerClassName,
  showTrigger = true,
  style,
  isInternalConversation,
}: MessageActionsDropdownProps) {
  const uiDispatch = useUIDispatch();
  const [hasCopied, setHasCopied] = React.useState(false);
  const [copyMessage, setCopyMessage] = React.useState<string>('');
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [showEditDialog, setShowEditDialog] = React.useState(false);

  const currentUserId = useAuthUser().id;
  // Check if message was sent by current user
  const isSentByCurrentUser = message.sent_by_user_id === currentUserId;

  const handleInfo = (e: React.MouseEvent) => {
    e.stopPropagation();
    uiDispatch(openMessageInfo(String(message.numericId)));
    onOpenChange?.(false);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      setShowEditDialog(true);
    } else {
      uiDispatch(openMessageEdit(message.id));
    }
    onOpenChange?.(false);
  };

  const handleEditConfirm = (newContent: string) => {
    onEdit?.(message.id, newContent);
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const result: CopyResult = await copyMessageContent(message);
      
      if (result.success) {
        setCopyMessage(result.message);
        setHasCopied(true);
        onCopy(result.message);
      } else {
        // Show error message
        setCopyMessage(result.message);
        setHasCopied(false);
      }
      
      // Reset the copy state after 2 seconds
      setTimeout(() => {
        setHasCopied(false);
        setCopyMessage('');
      }, 2000);
    } catch (error) {
      setCopyMessage('Failed to copy');
      setHasCopied(false);
      setTimeout(() => {
        setHasCopied(false);
        setCopyMessage('');
      }, 2000);
    }
    
    onOpenChange?.(false);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
    onOpenChange?.(false);
  };

  const handleConfirmDelete = (deleteForEveryone: boolean) => {
    onDelete?.(message.id, deleteForEveryone);
  };

  const handleReply = (e: React.MouseEvent) => {
    e.stopPropagation();
    onReply?.(message);
    onOpenChange?.(false);
  };

  const handleStar = (e: React.MouseEvent) => {
    e.stopPropagation();
    onStar?.(message);
    onOpenChange?.(false);
  };

  const handlePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPin?.(message);
    onOpenChange?.(false);
  };

  const ActionItem = ({ label, icon: Icon, onClick, isDestructive = false, showCheck = false }: any) => {
    const itemContent = (
      <>
        <span>{label}</span>
        {showCheck ? (
          <Check className="h-5 w-5 text-green-500" />
        ) : (
          <Icon className="h-5 w-5 opacity-60" />
        )}
      </>
    );

    if (!showTrigger) {
      return (
        <button
          onClick={onClick}
          className={cn("whatsapp-mobile-menu-item w-full", isDestructive && "destructive")}
        >
          {itemContent}
        </button>
      );
    }

    return (
      <DropdownMenuItem
        onClick={onClick}
        className={cn("whatsapp-mobile-menu-item cursor-pointer", isDestructive && "destructive")}
      >
        {itemContent}
      </DropdownMenuItem>
    );
  };

  const menuContent = (
    <>
      {onReply && (
        <ActionItem label="Reply" icon={Reply} onClick={handleReply} />
      )}
      {(message.text || message.media) && (
        <ActionItem
          label={hasCopied ? copyMessage || 'Copied' : 'Copy'}
          icon={Copy}
          onClick={handleCopy}
          showCheck={hasCopied}
        />
      )}
      {isInternalConversation && (() => {
        const attrs = (() => {
          const a = message.additional_attributes;
          if (!a) return {};
          if (typeof a === 'string') { try { return JSON.parse(a); } catch { return {}; } }
          return a as Record<string, any>;
        })();
        return <ActionItem label={attrs?.isStar ? "Unstar" : "Star"} icon={Star} onClick={handleStar} />;
      })()}
      {isSentByCurrentUser && (
        <ActionItem label="Info" icon={Info} onClick={handleInfo} />
      )}
      {isInternalConversation && (() => {
        const attrs = (() => {
          const a = message.additional_attributes;
          if (!a) return {};
          if (typeof a === 'string') { try { return JSON.parse(a); } catch { return {}; } }
          return a as Record<string, any>;
        })();
        return <ActionItem label={attrs?.isPinned ? "Unpin" : "Pin"} icon={Pin} onClick={handlePin} />;
      })()}
      {isSentByCurrentUser && isInternalConversation && (
        <ActionItem label="Edit" icon={Edit} onClick={handleEdit} />
      )}
      {/* {onDelete && (
        <ActionItem label="Delete" icon={Trash2} onClick={handleDeleteClick} isDestructive />
      )} */}
    </>
  );

  if (!showTrigger) {
    return (
      <div
        className={cn("whatsapp-mobile-menu p-0 border-none min-w-[220px] select-none", containerClassName)}
        style={style}
        onClick={(e) => e.stopPropagation()}
      >
        {menuContent}
        <DeleteConfirmDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleConfirmDelete}
          isSender={isSender}
        />
        <EditMessageDialog
          isOpen={showEditDialog}
          onClose={() => setShowEditDialog(false)}
          onConfirm={handleEditConfirm}
          message={message}
          isInternalConversation={isInternalConversation}
        />
      </div>
    );
  }

  return (
    <div
      className={
        (containerClassName ??
          "absolute top-1 right-1 opacity-0 group-hover/bubble:opacity-100 transition-opacity z-10") + " select-none"
      }
      onClick={(e) => e.stopPropagation()}
      style={style}
    >
      <DropdownMenu
        modal={false}
        {...(open !== undefined ? { open, onOpenChange } : {})}
      >
        <DropdownMenuTrigger asChild>
          <button
            className={
              triggerClassName ??
              "h-5 w-5 flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 rounded-full text-foreground/50 hover:text-foreground transition-colors outline-none"
            }
            title="More options"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="whatsapp-mobile-menu p-0 border-none min-w-[220px] select-none"
        >
          {menuContent}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        isSender={isSender}
      />

      {/* Edit Message Dialog */}
      <EditMessageDialog
        isOpen={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        onConfirm={handleEditConfirm}
        message={message}
        isInternalConversation={isInternalConversation}
      />
    </div>
  );
}
