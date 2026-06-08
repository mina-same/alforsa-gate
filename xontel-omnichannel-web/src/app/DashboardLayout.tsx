import React, { useEffect, useRef, useState } from 'react';
import { useAuthUser } from '@/contexts/AuthContext';
import Sidebar from '@/components/dashboard/Sidebar';
import MainLayout from '@/components/dashboard/MainLayout';
import UserSettingsContent from '@/components/dashboard/UserSettingsContent';
import ProfilePanel from '@/components/messages/ProfilePanel';
import ChannelSettings from '@/pages/ChannelSettings';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile'
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { useTranslation } from 'react-i18next';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useUIContext, setActiveInboxId, closeProfilePanel, openNotesSidebar } from '@/contexts/UIContext';
import { useUserPermissions } from '@/api/users/hooks';

const EmailInboxPage = React.lazy(() => import('@/pages/EmailInboxPage'));



const SIDEBAR_MAX_WIDTH_DEFAULT = 380;
const SIDEBAR_MIN_WIDTH = 380;

function DashboardContent() {
  const isMobile = useIsMobile();
  const { state: uiState, dispatch: uiDispatch } = useUIContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const activeInboxId = uiState.activeInboxId;

  // Keep permissions in sync using server-authoritative id from AuthContext (populated
  // from /me on every app load), not from mutable localStorage.
  const authUser = useAuthUser();
  useUserPermissions(authUser.id);
  const isSettings = location.pathname.includes('/settings');
  const isNotesOpen = uiState.notesSidebar.isOpen;
  const isInfoOpen = uiState.messageInfo.isOpen;
  const currentConversationId = searchParams.get('conversation');
  const selectedEmailId = uiState.email.selectedId;

  // Sync URL inbox_id to Redux
  useEffect(() => {
    const urlInboxId = searchParams.get('inbox_id');
    const urlConversationId = searchParams.get('conversation');

    if (urlInboxId) {
      const numericId = parseInt(urlInboxId, 10);
      if (!isNaN(numericId) && numericId !== activeInboxId) {
        uiDispatch(setActiveInboxId(numericId));
      }
    }
  }, [searchParams, activeInboxId, isSettings, uiDispatch]);

  // // Sync URL conversation parameter to Redux
  // useEffect(() => {
  //   const urlConversationId = searchParams.get('conversation');
  //   const urlInboxId = searchParams.get('inbox_id');

  //   // First switch inbox if needed, then set conversation
  //   if (urlInboxId) {
  //     const numericId = parseInt(urlInboxId, 10);
  //     if (!isNaN(numericId) && numericId !== activeInboxId) {
  //       console.log('🔄 Switching inbox from URL:', numericId);
  //       dispatch(setActiveInboxId(numericId));
  //       // Don't set conversation immediately, let the inbox change trigger conversation loading
  //       return;
  //     }
  //   }

  // }, [searchParams, activeInboxId, dispatch]);

  // Global listener for navigation events (from toasts/notifications)
  useEffect(() => {
    const handleNavigate = (event: CustomEvent) => {
      const { conversationId, inbox_id, type } = event.detail;
      if (inbox_id) {
        uiDispatch(setActiveInboxId(inbox_id));
      }

      if (conversationId) {
        setSearchParams(prev => {
          const p = new URLSearchParams(prev);
          p.set('conversation', conversationId);
          if (inbox_id) p.set('inbox_id', String(inbox_id));
          return p;
        });
      }

      if (type === 'mention') {
        uiDispatch(openNotesSidebar());
      }
    };

    window.addEventListener('navigate-to-conversation', handleNavigate as EventListener);
    return () => window.removeEventListener('navigate-to-conversation', handleNavigate as EventListener);
  }, [uiDispatch, setSearchParams]);

  // Sync URL notes parameter to Redux (handles direct URL access or reloads)
  useEffect(() => {
    const openNotes = searchParams.get('open_notes');
    if (openNotes === 'true') {
      uiDispatch(openNotesSidebar());
    }
  }, [searchParams, uiDispatch]);

  // Sync Redux notes state back to URL (removes parameter when closed)
  useEffect(() => {
    if (!isNotesOpen && searchParams.get('open_notes') === 'true') {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('open_notes');
      setSearchParams(newParams, { replace: true });
    }
  }, [isNotesOpen, searchParams, setSearchParams]);
  const isProfileOpen = uiState.profilePanel.isOpen;
  // Close profile panel when switching conversations (only on actual change)
  const prevConversationIdRef = useRef<string | null>(currentConversationId);
  useEffect(() => {
    if (prevConversationIdRef.current !== currentConversationId) {
      prevConversationIdRef.current = currentConversationId;
      if (isProfileOpen) {
        uiDispatch(closeProfilePanel());
      }
    }
  }, [currentConversationId, isProfileOpen, uiDispatch]);
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  const { state: appSidebarState } = useSidebar();
  const effectiveSidebarMinWidth =  SIDEBAR_MIN_WIDTH;

  const [sidebarWidth, setSidebarWidth] = useState("380px");

  const currentMaxSidebarWidth = typeof window !== 'undefined'
    ? Math.min(SIDEBAR_MAX_WIDTH_DEFAULT, window.innerWidth * ((isNotesOpen || isInfoOpen) ? 0.25 : 0.35))
    : SIDEBAR_MAX_WIDTH_DEFAULT;
  const [isResizing, setIsResizing] = useState(false);
  const dragStartXRef = useRef(0);
  const dragStartWidthRef = useRef(SIDEBAR_MAX_WIDTH_DEFAULT);
  const sidebarRef = useRef<HTMLDivElement>(null);

  /** --- Resize logic --- **/
  useEffect(() => {
    if (isMobile) return; // Disabled resizing entirely on mobile

    const handleMouseMove = (event: MouseEvent) => {
      if (!isResizing) return;

      const delta = event.clientX - dragStartXRef.current;
      // In RTL, dragging left (negative delta) means expanding (positive width change)
      // Wait, if sidebar is on the Right...
      // Dragging Left (decreasing X) -> Width increases. Delta is negative. So we need -delta.
      // Dragging Right (increasing X) -> Width decreases. Delta is positive. So we need -delta.
      // Yes, effectiveDelta = -delta.

      const effectiveDelta = isRTL ? -delta : delta;

      const nextWidth = dragStartWidthRef.current + effectiveDelta;
      const clamped = Math.min(
        Math.max(nextWidth, effectiveSidebarMinWidth),
        currentMaxSidebarWidth
      );

      setSidebarWidth(clamped + "px");
    };

    const handleMouseUp = () => {
      if (isResizing) setIsResizing(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, isMobile, isRTL]);

  const isProfile = location.pathname.includes('/profile');
  // On mobile, treat any profile sub-route (analytics, account, edit, etc.) as "content active"
  // so the sidebar is hidden and only the main content is shown.
  const isProfileSubRoute = isProfile && location.pathname !== '/profile';
  const shouldHideMobileNav = currentConversationId && !isSettings && !isProfile && !isProfileOpen;
  const bottomPadding = isMobile && !shouldHideMobileNav ? 'pb-16' : '';

  return (
    <SidebarInset>
      <div className="h-full w-full flex flex-col">
        <div className={`flex flex-1 min-h-0 flex-col md:flex-row overflow-hidden ${bottomPadding}`}>
          {/* Sidebar - Visible on Desktop OR (Mobile AND No Conversation/Email/Profile/ProfileSubRoute selected) */}
          {!isSettings && (!isMobile || (!currentConversationId && !selectedEmailId && !isProfileOpen && !isProfileSubRoute)) && (
            <div
              ref={sidebarRef}
              className={`flex-shrink-0 border-r border-border h-full ${isMobile ? "w-full" : ""
                }`}
              style={
                !isMobile
                  ? {
                    width: sidebarWidth,
                    minWidth: effectiveSidebarMinWidth,
                    maxWidth: currentMaxSidebarWidth,
                  }
                  : {}
              }
            >
              <Sidebar
              />
            </div>
          )}

          {/* Resize Handle - Desktop Only */}
          {/* {!isMobile && !isSettings && (
            <div
              className="h-full bg-transparent cursor-col-resize hover:bg-transparent transition-colors flex-shrink-0"
              onMouseDown={(event) => {
                dragStartXRef.current = event.clientX;
                if (sidebarRef.current) {
                  dragStartWidthRef.current = sidebarRef.current.getBoundingClientRect().width;
                }
                setIsResizing(true);
              }}
            >
              <div className=" h-[1px] w-[1px] bg-border group-hover:bg-primary transition-colors" />
            </div>
          )} */}

          {/* Main Content OR Profile - Visible on Desktop OR (Mobile AND (Conversation Selected OR Profile Open)) */}
            <div className="flex-1 min-w-0 h-full relative overflow-auto">
              {isSettings ? (
                <ChannelSettings />
              ) : isProfile ? (
                <UserSettingsContent />
              ) : location.pathname.includes('/email') ? (
                <EmailInboxPage />
              ) : (
                <>
                  {/* Keep MainLayout always mounted so MessageThread never loses scroll state */}
                  <div className={isProfileOpen ? 'hidden' : 'h-full'}>
                    <MainLayout />
                  </div>
                  {isProfileOpen && <ProfilePanel />}
                </>
              )}
            </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav />
      </div>
    </SidebarInset>
  );
}


export default function DashboardLayout() {
  return (
    <div className="h-[100dvh] min-h-[100dvh] text-foreground overflow-hidden bg-background">
      <SidebarProvider>
        <AppSidebar />
        <DashboardContent />
      </SidebarProvider>
    </div>
  );
}
