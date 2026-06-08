import { Message } from "@/types/chat";
import { MapMessages } from "./useMapMessage";
import { MessageResponse } from "@/api/messages/types";

export const handleScroll = async (
  skip: number,
  setIsFetching: React.Dispatch<React.SetStateAction<boolean>>,
  prevScrollTopRef: React.MutableRefObject<number | null>,
  listRef: React.RefObject<HTMLDivElement>,
  isFetching: boolean,
  conv: any,
  hasMore: boolean,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  setSkip: React.Dispatch<React.SetStateAction<number>>,
  setHasMore: React.Dispatch<React.SetStateAction<boolean>>,
  fetchMessagesPage: (
    conversationId: number,
    skip: number,
  ) => Promise<MessageResponse[]>,
  currentUserContactId: number | null | undefined,
  currentUserId: number | null | undefined,
  PAGE_SIZE: number,
  messages: Message[],
) => {
  if (!listRef.current || isFetching || !conv || !hasMore) return;

  const el = listRef.current;
  const currentScrollTop = el.scrollTop;

  if (prevScrollTopRef.current === null) {
    prevScrollTopRef.current = currentScrollTop;
    return;
  }

  const prevScrollTop = prevScrollTopRef.current;
  prevScrollTopRef.current = currentScrollTop;

  if (el.scrollHeight <= el.clientHeight) return;

  if (currentScrollTop <= 150 && prevScrollTop > 150) {
    setIsFetching(true);
    const prevScrollHeight = el.scrollHeight;

    try {
      if (!conv?.numeric_id) return;
      const nextPage = await fetchMessagesPage(conv.numeric_id, skip);
      if (!nextPage || nextPage.length === 0) {
        setHasMore(false);
        return;
      }

      const mapped = MapMessages(
        currentUserContactId,
        currentUserId,
        nextPage,
        messages,
      );

      setMessages((prev) => [...mapped, ...prev]);
      setSkip((prev) => prev + nextPage.length);
      setHasMore(nextPage.length === PAGE_SIZE);

      // State mutations above must happen before the null check below so that
      // pagination state is always consistent even if scroll restoration can't run.
      const target = listRef.current;
      if (!target) return;

      // Restore scroll position once the DOM actually expands after prepend.
      // ResizeObserver fires after layout, unlike rAF which can fire before.
      let disconnected = false
      const disconnect = () => {
        if (!disconnected) {
          disconnected = true
          observer.disconnect()
        }
      }
      const observer = new ResizeObserver(() => {
        const newScrollHeight = target.scrollHeight;
        if (newScrollHeight !== prevScrollHeight) {
          target.scrollTop = newScrollHeight - prevScrollHeight;
          disconnect();
        }
      });
      observer.observe(target);
      // Safety fallback in case content doesn't change height (e.g. same-size messages)
      setTimeout(disconnect, 500);
    } catch (err) {
      console.error("Failed to load older messages", err);
    } finally {
      setIsFetching(false);
    }
  }
};
