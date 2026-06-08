import { useRef, useState } from "react";
import ReactDOM from "react-dom";
import Avatar from "@components/shared/Avatar";
import { UserResponse } from "@/api/users/types";

interface AgentAvatarPopupProps {
  agent: UserResponse;
  isRTL: boolean;
  children?: React.ReactNode;
}

interface PopupPos {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}

export default function AgentAvatarPopup({ agent, isRTL, children }: AgentAvatarPopupProps) {
  const triggerRef = useRef<HTMLDivElement>(null);
  const [popupPos, setPopupPos] = useState<PopupPos | null>(null);

  const handleMouseEnter = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const showBelow = rect.top < window.innerHeight / 2;

    setPopupPos({
      ...(showBelow
        ? { top: rect.bottom + 8 }
        : { bottom: window.innerHeight - rect.top + 8 }),
      ...(isRTL
        ? { left: rect.left }
        : { right: window.innerWidth - rect.right }),
    });
  };

  const handleMouseLeave = () => setPopupPos(null);

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="flex-shrink-0 cursor-default"
      >
        {children ?? <Avatar src={agent.avatar_url} name={agent.full_name} size="xs" />}
      </div>

      {popupPos &&
        ReactDOM.createPortal(
          <div
            dir={isRTL ? "rtl" : "ltr"}
            className="fixed z-[99999] bg-xon-surface-container border border-xon-surface-outline rounded-lg shadow-lg p-3 flex flex-col items-start gap-2 min-w-[160px] max-w-[220px] pointer-events-none"
            style={{
              ...(popupPos.top !== undefined ? { top: `${popupPos.top}px` } : {}),
              ...(popupPos.bottom !== undefined ? { bottom: `${popupPos.bottom}px` } : {}),
              ...(popupPos.left !== undefined ? { left: `${popupPos.left}px` } : {}),
              ...(popupPos.right !== undefined ? { right: `${popupPos.right}px` } : {}),
            }}
          >
            <div className="flex items-center gap-2.5">
              <Avatar src={agent.avatar_url} name={agent.full_name} size="sm" />
              <div className="flex flex-col items-start min-w-0">
                <span className="text-sm font-semibold text-xon-text-primary truncate max-w-[140px]">
                  {agent.full_name}
                </span>
                <span className="text-xs text-xon-text-secondary truncate max-w-[140px]">
                  {agent.email}
                </span>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
