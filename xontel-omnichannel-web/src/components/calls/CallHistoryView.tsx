import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Phone, Video, PhoneIncoming, PhoneOutgoing, PhoneMissed } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useConversationMessages } from '@/api/messages/hooks';
import { useConversationItems } from '@/api/conversations/hooks';
import { conversationResponseToLocal } from '@/api/conversations/cacheUtils';
import { Call } from '@/types/chat';
import { MessageResponse } from '@/api/messages/types';

function messageToCall(message: MessageResponse): Call {
  let status: Call['status'];
  if (message.direction === 'outbound') {
    status = 'outgoing';
  } else {
    const isMissed =
      message.status === 'failed' ||
      message.status === 'pending' ||
      !message.content ||
      message.content === '0' ||
      message.content === '00:00';
    status = isMissed ? 'missed' : 'incoming';
  }

  let type: Call['type'] = 'audio';
  if (message.additional_attributes) {
    try {
      const attrs =
        typeof message.additional_attributes === 'string'
          ? JSON.parse(message.additional_attributes)
          : message.additional_attributes;
      if (attrs?.call_type === 'video' || attrs?.is_video) type = 'video';
    } catch {
      // default audio
    }
  }

  return {
    id: String(message.id),
    status,
    type,
    time: message.created_at,
    duration: message.content || undefined,
  };
}

export default function CallHistoryView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, i18n } = useTranslation('chat');
  const isRTL = i18n.dir() === 'rtl';

  const currentConvId = searchParams.get('conversation');
  const currentCallId = searchParams.get('call');

  const conversationItems = useConversationItems();
  const currentConversation = useMemo(() => {
    const found = conversationItems.find(
      (c) =>
        c.conversation_uuid === currentConvId ||
        String(c.id) === currentConvId,
    );
    return found ? conversationResponseToLocal(found) : null;
  }, [conversationItems, currentConvId]);

  const numericConvId = currentConversation?.numeric_id || (currentConvId ? parseInt(currentConvId, 10) : 0);
  const { data: callsData } = useConversationMessages(numericConvId || 0, {
    message_type: 'calls',
    limit: 100,
  });

  const calls = useMemo(
    () => (callsData?.items ?? []).map(messageToCall),
    [callsData],
  );

  const currentCall = useMemo(
    () => calls.find((c) => c.id === currentCallId) ?? null,
    [calls, currentCallId],
  );

  const handleCallClick = (callId: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('call', callId);
      return next;
    });
  };

  const getStatusIcon = (status: Call['status']) => {
    const iconClass = 'h-4 w-4 md:h-5 md:w-5';
    switch (status) {
      case 'incoming':
        return <PhoneIncoming className={`${iconClass} text-xon-text-green`} />;
      case 'outgoing':
        return <PhoneOutgoing className={`${iconClass} text-xon-text-blue`} />;
      case 'missed':
        return <PhoneMissed className={`${iconClass} text-xon-text-red`} />;
    }
  };

  if (!currentConversation) {
    return (
      <div className="h-full flex items-center justify-center text-xon-text-secondary p-6 text-center">
        {t('callHistory.select')}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-xon-surface-container p-4 md:p-10">
      <div className="sticky top-0 bg-xon-surface md:bg-xon-surface/80 md:backdrop-blur-lg pb-3 z-10 border-b border-xon-surface-outline">
        <h3 className="text-lg md:text-xl font-bold text-xon-text-primary">
          {t('callHistory.title')} {currentConversation.name}
        </h3>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="space-y-2 pb-10">
          {calls.map((call) => (
            <div
              key={call.id}
              onClick={() => handleCallClick(call.id)}
              className={`rounded-lg px-4 md:px-6 py-3 md:py-4 flex items-center justify-between
              bg-xon-surface-container hover:bg-xon-surface-container-hover active:bg-xon-surface-hover cursor-pointer transition-colors
              ${currentCall?.id === call.id ? 'bg-xon-container-blue' : ''}`}
            >
              <div className="flex items-center w-full gap-3 md:gap-4 min-w-0">
                {getStatusIcon(call.status)}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm md:text-base font-medium ${
                      call.status === 'missed' ? 'text-xon-text-red' : 'text-xon-text-primary'
                    }`}
                  >
                    {!isRTL ? (
                      <>
                        {call.status === 'incoming' && t('callHistory.incoming')}
                        {call.status === 'outgoing' && t('callHistory.outgoing')}
                        {call.status === 'missed' && t('callHistory.missed')}{' '}
                        {call.type === 'video' ? t('callHistory.video') : t('callHistory.voice')}
                      </>
                    ) : (
                      <>
                        {call.type === 'video' ? t('callHistory.video') : t('callHistory.voice')}{' '}
                        {call.status === 'incoming' && t('callHistory.incoming')}
                        {call.status === 'outgoing' && t('callHistory.outgoing')}
                        {call.status === 'missed' && t('callHistory.missed')}
                      </>
                    )}
                  </p>
                  <p className="text-xs md:text-sm text-xon-text-secondary">{call.time}</p>
                </div>
                <div className="flex items-center gap-1 md:gap-2 shrink-0">
                  <p className="text-xs md:text-sm text-xon-text-secondary">
                    {call.duration} {t('callHistory.mins')}
                  </p>
                  {call.type === 'video' ? (
                    <Video className="h-4 w-4 text-xon-text-secondary" />
                  ) : (
                    <Phone className="h-4 w-4 text-xon-text-secondary" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
