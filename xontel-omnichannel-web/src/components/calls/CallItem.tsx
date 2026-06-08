import { Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Video } from 'lucide-react';
// import { CallWithConversation } from '@/store/slices/conversationsSlice';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTranslation } from 'react-i18next';
import { CallWithConversation } from '@/types/chat';
import { useDateFormat } from '@/hooks/useDateFormat';

interface CallItemProps {
  call: CallWithConversation;
  onClick?: () => void;
}

export default function CallItem({ call, onClick }: CallItemProps) {
  const { t, i18n } = useTranslation("chat");
  const { formatMessageRelativeTime } = useDateFormat();
  const isRTL = i18n.dir() === "rtl";

  const getStatusIcon = () => {
    const iconClass = "h-4 w-4";
    switch (call.status) {
      case "incoming":
        return <PhoneIncoming className={`${iconClass} text-xon-text-green`} />;
      case "outgoing":
        return <PhoneOutgoing className={`${iconClass} text-xon-text-blue`} />;
      case "missed":
        return <PhoneMissed className={`${iconClass} text-xon-text-red`} />;
    }
  };

  const getTypeIcon = () => {
    return call.type === "video"
      ? <Video className="h-4 w-4 text-xon-text-secondary" />
      : <Phone className="h-4 w-4 text-xon-text-secondary" />;
  };

  return (
    <div
      onClick={onClick}
      className={`
        flex items-center gap-3 p-3 pr-3 cursor-pointer transition-all duration-200 border-b border-xon-surface-outline
        bg-xon-surface-container hover:bg-xon-surface-hover
        pl-3 hover:pl-5 hover:border-s-2 hover:border-s-xon-primary
        ${isRTL ? "flex-row-reverse" : ""}
      `}
    >
      {/* Avatar */}
      <Avatar className="h-10 w-10">
        <AvatarImage src={call.conversationAvatar} alt={call.conversationName} />
        <AvatarFallback>{call.conversationName.charAt(0)}</AvatarFallback>
      </Avatar>

      {/* Text Content */}
      <div className={`flex-1 min-w-0 ${isRTL ? "text-right" : "text-left"}`}>
        <p className="font-medium text-sm truncate text-xon-text-primary">{call.conversationName}</p>

        <div
          className={`
            flex items-center gap-1.5 text-xs text-xon-text-secondary
            ${isRTL ? "flex-row-reverse" : ""}
          `}
        >
          {getStatusIcon()}
          <span>
            {call.status === "missed"
              ? t("callHistory.missed")
              : call.status === "incoming"
                ? t("callHistory.incoming")
                : call.status === "outgoing"
                  ? t("callHistory.outgoing")
                  : ""}
          </span>

          <span>•</span>

          <span>{formatMessageRelativeTime(call.time)}</span>
        </div>
      </div>

      <div>
        {getTypeIcon()}
      </div>
    </div>
  );
}
