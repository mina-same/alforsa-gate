import { useEffect, useRef, useState, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import CallItem from '@/components/calls/CallItem';
import { useConversationItems } from '@/api/conversations/hooks';
import { conversationResponseToLocal } from '@/api/conversations/cacheUtils';
import { useInfiniteInboxMemberCalls } from '@/api/inboxes/hooks';
import { MessageResponse } from '@/api/messages/types';
import NoCallsSvg from '@/assets/empty-states/NoCallsSvg';
import { SegmentedToggle } from '../ui/segmented-toggle';
import { useTranslation } from 'react-i18next';
import { useUIContext, setCallsTab } from '@/contexts/UIContext';
import { useAuthUser } from '@/contexts/AuthContext';
import { CallWithConversation } from '@/types/chat';
import CallConfirmationSheet from '@/components/messages/CallConfirmationSheet';
import { useWhatsAppCall } from '@/hooks/useWhatsAppCall';

type FilterStatus = 'all' | 'missed';
type FilterType = 'all' | 'audio' | 'video';

function messageToCall(message: MessageResponse): Omit<CallWithConversation, 'conversationName' | 'conversationAvatar'> {
  let status: 'incoming' | 'outgoing' | 'missed';
  if (message.direction === 'outbound') {
    status = 'outgoing';
  } else if (message.direction === 'inbound') {
    const isMissed =
      message.status === 'failed' ||
      message.status === 'pending' ||
      !message.content ||
      message.content === '0' ||
      message.content === '00:00';
    status = isMissed ? 'missed' : 'incoming';
  } else {
    status = 'missed';
  }

  let type: 'audio' | 'video' = 'audio';
  if (message.additional_attributes) {
    try {
      const attrs =
        typeof message.additional_attributes === 'string'
          ? JSON.parse(message.additional_attributes)
          : message.additional_attributes;
      if (attrs?.call_type === 'video') type = 'video';
    } catch {
      // default to audio
    }
  }

  return {
    id: String(message.id),
    status,
    type,
    time: message.created_at,
    duration: message.content,
    conversationId: String(message.conversation_id),
  };
}

export default function CallsList() {
  const { state: uiState, dispatch: uiDispatch } = useUIContext();
  const conversationItems = useConversationItems();
  const conversationMap = useMemo(() => {
    const map = new Map<string, ReturnType<typeof conversationResponseToLocal>>();
    for (const c of conversationItems) {
      const local = conversationResponseToLocal(c);
      map.set(String(c.id), local);
      if (c.conversation_uuid) map.set(c.conversation_uuid, local);
    }
    return map;
  }, [conversationItems]);
  const currentUserId = useAuthUser().id;
  const activeInboxId = uiState.activeInboxId;
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter] = useState<FilterType>('all');
  const { t } = useTranslation('chat');
  const statusFilter = uiState.callsTab;
  const [showInitialSkeleton, setShowInitialSkeleton] = useState(true);
  const [showCallModal, setShowCallModal] = useState(false);
  const [selectedCall, setSelectedCall] = useState<CallWithConversation | null>(null);
  const { startCall } = useWhatsAppCall();

  const sentinelRef = useRef<HTMLDivElement>(null);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteInboxMemberCalls(
    activeInboxId ?? 0,
    currentUserId ?? 0,
    { limit: 20 }
  );

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.unobserve(el);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allCalls: CallWithConversation[] = useMemo(() => {
    const messages = data?.pages.flatMap((p) => p.items) ?? [];
    return messages
      .map((msg: MessageResponse) => {
        const base = messageToCall(msg);
        const conversation = conversationMap.get(base.conversationId);
        return {
          ...base,
          conversationName: conversation?.name ?? t('callHistory.unknown'),
          conversationAvatar: conversation?.avatar,
        };
      })
      .sort((a: CallWithConversation, b: CallWithConversation) => new Date(b.time).getTime() - new Date(a.time).getTime());
  }, [data, conversationMap, t]);

  useEffect(() => {
    const timeout = setTimeout(() => setShowInitialSkeleton(false), 700);
    return () => clearTimeout(timeout);
  }, []);

  const filteredCalls = useMemo(() => {
    let result = allCalls;
    if (searchQuery) {
      result = result.filter((c) =>
        c.conversationName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter((c) => c.status === statusFilter);
    }
    if (typeFilter !== 'all') {
      result = result.filter((c) => c.type === typeFilter);
    }
    return result;
  }, [allCalls, searchQuery, statusFilter, typeFilter]);

  const shouldShowSkeleton =
    (showInitialSkeleton && allCalls.length === 0 && searchQuery.trim().length === 0) || isLoading;

  const handleCallClick = (call: CallWithConversation) => {
    setSelectedCall(call);
    setShowCallModal(true);
  };

  const handleConfirmCall = async () => {
    if (!selectedCall) return;

    const conversation = conversationMap.get(selectedCall.conversationId);

    if (!conversation) {
      setShowCallModal(false);
      setSelectedCall(null);
      return;
    }

    const phoneRaw = conversation.phone || conversation.name || '';
    const hasDigits = /\d/.test(phoneRaw);
    const isMetaId = phoneRaw.length > 15 && /[a-zA-Z]/.test(phoneRaw);

    if (!phoneRaw || isMetaId || !hasDigits) {
      alert('Contact phone number not found. Cannot initiate call.');
      setShowCallModal(false);
      setSelectedCall(null);
      return;
    }

    const phoneNumericOnly = phoneRaw.replace(/\D/g, '');

    try {
      const result = await startCall(conversation.channel_id || 0, {
        conversationId: conversation.numeric_id || Number(conversation.id),
        contactId: conversation.contact_id || 0,
        to: phoneNumericOnly,
        isVideo: selectedCall.type === 'video',
      });

      if (result.success && result.callId) {
        window.dispatchEvent(new CustomEvent('whatsapp-incoming-call', {
          detail: {
            from: phoneRaw,
            callId: result.callId,
            name: conversation.name,
            outbound: true,
            contact_id: conversation.contact_id,
            channel_id: conversation.channel_id,
          },
        }));
      } else {
        alert(`Failed to start call: ${result.error || 'Unknown error'}`);
      }
    } catch (e: any) {
      alert(`Error: ${e?.message || 'Failed to initiate call'}`);
    }

    setShowCallModal(false);
    setSelectedCall(null);
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="mb-3 px-4 space-y-2">
        <input
          className="w-full rounded-md border border-xon-surface-outline bg-xon-surface-container-hover px-3 py-2 text-sm outline-none text-xon-text-primary placeholder:text-xon-text-secondary"
          placeholder={t('callHistory.search') + ' ' + t('callHistory.in') + ' ' + t('sidebar.calls')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="flex gap-2">
          <SegmentedToggle
            value={statusFilter}
            onChange={(val) => uiDispatch(setCallsTab(val as FilterStatus))}
            options={[
              { label: t('callHistory.all'), value: 'all' },
              { label: t('callHistory.missed'), value: 'missed' },
            ]}
          />
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin">
        <ul className="space-y-1">
          {shouldShowSkeleton ? (
            Array.from({ length: 8 }).map((_, idx) => (
              <li
                key={idx}
                className="flex items-center gap-3 p-3 rounded-lg bg-xon-surface-container"
              >
                <Skeleton variant="circle" className="h-10 w-10" />
                <div className="flex-1 min-w-0 space-y-2">
                  <Skeleton variant="text" className="h-4 w-1/3" />
                  <Skeleton variant="text" className="h-3 w-2/3" />
                </div>
                <Skeleton className="h-4 w-4 rounded-sm" />
              </li>
            ))
          ) : filteredCalls.length > 0 ? (
            filteredCalls.map((call) => (
              <li key={`${call.conversationId}-${call.id}`}>
                <CallItem call={call} onClick={() => handleCallClick(call)} />
              </li>
            ))
          ) : (
            <li className="flex flex-col items-center text-center py-10 px-4 gap-3">
              <NoCallsSvg />
              <p className="text-base font-semibold text-xon-text-primary">{t('callHistory.noCallsFound')}</p>
            </li>
          )}
        </ul>

        {/* Sentinel triggers next page when scrolled into view */}
        <div ref={sentinelRef} className="h-2" />
        {isFetchingNextPage && (
          <div className="flex justify-center py-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-xon-primary border-t-transparent" />
          </div>
        )}
      </div>

      {showCallModal && selectedCall && (
        <CallConfirmationSheet
          isOpen={showCallModal}
          onClose={() => {
            setShowCallModal(false);
            setSelectedCall(null);
          }}
          onConfirm={handleConfirmCall}
          contactName={selectedCall.conversationName}
        />
      )}
    </div>
  );
}
