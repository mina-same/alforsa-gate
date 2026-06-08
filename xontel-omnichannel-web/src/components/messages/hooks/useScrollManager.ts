import { useEffect, useRef, useCallback } from 'react'

interface UseScrollManagerOptions {
  listRef: React.RefObject<HTMLDivElement>
  conversationId: string | undefined
  lastMessageId: string
}

interface UseScrollManagerReturn {
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void
  scrollToBottom: (behavior?: ScrollBehavior) => void
}

const PINNED_THRESHOLD = 150

export function useScrollManager({
  listRef,
  conversationId,
  lastMessageId,
}: UseScrollManagerOptions): UseScrollManagerReturn {
  const isPinnedToBottom = useRef(true)
  const initialScrollDoneRef = useRef(false)
  const prevConvIdRef = useRef<string | undefined>(undefined)
  const prevLastMessageIdRef = useRef<string>('')

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    const el = listRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior })
  }, [listRef])

  // Conversation switch — reset state; scroll instantly if content is already present
  useEffect(() => {
    if (!conversationId) return

    const conversationChanged = prevConvIdRef.current !== conversationId
    prevConvIdRef.current = conversationId

    if (!conversationChanged) return

    isPinnedToBottom.current = true
    initialScrollDoneRef.current = false
    prevLastMessageIdRef.current = ''

    let cancelled = false

    const doScroll = () => {
      if (cancelled) return
      const el = listRef.current
      if (!el) return

      // Only commit "done" when there is actual content to scroll to.
      // If messages haven't loaded yet, leave initialScrollDoneRef false so the
      // new-message effect can perform an instant scroll once content arrives.
      if (el.scrollHeight > el.clientHeight) {
        el.scrollTo({ top: el.scrollHeight, behavior: 'auto' })
        initialScrollDoneRef.current = true
      }
    }

    // Double rAF — lets React commit the DOM before we read scrollHeight
    requestAnimationFrame(() => requestAnimationFrame(doScroll))

    return () => { cancelled = true }
  }, [conversationId])

  // New message — instant scroll for first load; smooth scroll when already pinned
  useEffect(() => {
    if (!conversationId) return
    if (!lastMessageId) return

    const isNewMessage = lastMessageId !== prevLastMessageIdRef.current
    prevLastMessageIdRef.current = lastMessageId

    if (!isNewMessage) return

    if (!initialScrollDoneRef.current) {
      // First content after a conversation switch — always scroll instantly
      scrollToBottom('auto')
      initialScrollDoneRef.current = true
      // Retry after a short delay to catch images/media that load right after
      const tid = window.setTimeout(() => scrollToBottom('auto'), 400)
      return () => window.clearTimeout(tid)
    }

    // Subsequent new messages: only auto-scroll when the user is near the bottom
    if (!isPinnedToBottom.current) return
    scrollToBottom('smooth')
  }, [lastMessageId, conversationId, scrollToBottom])

  // Re-scroll when content grows (e.g. images load) and user is pinned to bottom
  useEffect(() => {
    const el = listRef.current
    if (!el) return

    // Observe the inner content element, not the viewport itself —
    // the viewport's own size is fixed; only its content grows.
    const content = el.firstElementChild as HTMLElement | null
    if (!content) return

    let prevHeight = content.offsetHeight

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newHeight = entry.contentRect.height
        const grew = newHeight > prevHeight
        prevHeight = newHeight
        // Only scroll when content grows — layout shrinks (e.g. sidebar closing)
        // must not pull the user back to the bottom.
        if (grew && isPinnedToBottom.current) {
          el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
        }
      }
    })

    observer.observe(content)

    return () => observer.disconnect()
  }, [conversationId, listRef])

  const onScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    isPinnedToBottom.current = distanceFromBottom <= PINNED_THRESHOLD
  }, [])

  return { onScroll, scrollToBottom }
}
