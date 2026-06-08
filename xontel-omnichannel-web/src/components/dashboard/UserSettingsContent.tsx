import React, { useMemo, useState } from "react";
import { useConversationItems } from "@/api/conversations/hooks";
import { isConversationClosed } from "@/api/conversations/cacheUtils";
import { useAuthUser } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { useUser } from "@/api/users/hooks";
import Avatar from "@/components/shared/Avatar";
import { cn } from "@/lib/utils";
import { ChatCapacitySection, PasskeySection } from "@/components/profile";
import EditProfileForm from "@/components/profile/EditProfileForm";
import ResetPasswordForm from "@/components/profile/ResetPasswordForm";
import HomeAnalyticsDashboard from "@/components/empty/HomeAnalyticsDashboard";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Bell,
  Eye,
  Volume2,
  Vibrate,
  PhoneCall,
  BadgeCheck,
  KeyRound,
  Pencil,
  ChevronRight,
  User,
  Mail,
  Phone,
  Clock,
} from "lucide-react";

type ToggleKey =
  | "pushNotifications"
  | "showPreviews"
  | "soundAlerts"
  | "vibrate"
  | "incomingCalls"
  | "badgeNotifications";

function ToggleSwitch({
  checked,
  onCheckedChange,
}: {
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors",
        checked ? "bg-xon-primary" : "bg-xon-surface-outline",
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-6" : "translate-x-1",
        )}
      />
    </button>
  );
}

export default function UserSettingsContent() {
  const { t, i18n } = useTranslation("chat");
  const isRTL = i18n.language === "ar";
  const navigate = useNavigate();

  const location = useLocation();
  const activeTab =
    location.pathname === "/profile/edit"
      ? "edit"
      : location.pathname === "/profile/account/reset-password"
        ? "reset-password"
        : location.pathname === "/profile/analytics"
        ? "analytics"
        : location.pathname === "/profile/account"
          ? "account"
          : location.pathname === "/profile/notifications"
            ? "notifications"
            : location.pathname.startsWith("/profile")
              ? "profile"
              : null;
  const userData = useAuthUser();
  const userId = Number(userData.id) || 0;
  const { data: currentUser } = useUser(userId);
  const conversationItems = useConversationItems();

  const [toggles, setToggles] = useState<Record<ToggleKey, boolean>>({
    pushNotifications: true,
    showPreviews: true,
    soundAlerts: true,
    vibrate: false,
    incomingCalls: true,
    badgeNotifications: true,
  });

  const currentOpenChats = useMemo(() => {
    const apiCount = (currentUser as any)?.current_chat_count;
    if (
      apiCount != null &&
      Number.isFinite(Number(apiCount)) &&
      Number(apiCount) >= 0
    ) {
      return Number(apiCount);
    }
    return conversationItems.reduce((sum, conv: any) => {
      const assigned =
        conv?.assigned_agent_id != null &&
        Number(conv.assigned_agent_id) === Number(userId);
      const isClosed = isConversationClosed(conv);
      return assigned && !isClosed ? sum + 1 : sum;
    }, 0);
  }, [currentUser, conversationItems, userId]);

  const maxConcurrentChats = useMemo(() => {
    const raw = (currentUser as any)?.max_concurrent_chats;
    const parsed = raw != null ? Number(raw) : undefined;
    return parsed != null && Number.isFinite(parsed) && parsed > 0
      ? parsed
      : undefined;
  }, [currentUser]);

  const chatCapacity = useMemo(
    () => ({
      max: maxConcurrentChats,
      current: currentOpenChats,
      percent:
        maxConcurrentChats != null
          ? Math.min(
              100,
              Math.max(0, (currentOpenChats / maxConcurrentChats) * 100),
            )
          : 0,
    }),
    [maxConcurrentChats, currentOpenChats],
  );

  const notificationSections = useMemo(
    () => [
      {
        title: t("notifications.general", "General"),
        items: [
          {
            key: "pushNotifications" as const,
            label: t("notifications.push", "Push Notifications"),
            description: t(
              "notifications.push_description",
              "Enable system alerts",
            ),
            icon: Bell,
            iconBg: "bg-xon-primary/10",
            iconColor: "text-xon-primary",
          },
          {
            key: "showPreviews" as const,
            label: t("notifications.previews", "Show Previews"),
            description: t(
              "notifications.previews_description",
              "Preview message in alerts",
            ),
            icon: Eye,
            iconBg: "bg-xon-surface-container-hover",
            iconColor: "text-xon-text-secondary",
          },
        ],
      },
      {
        title: t(
          "notifications.message_notifications",
          "Message Notifications",
        ),
        items: [
          {
            key: "soundAlerts" as const,
            label: t("notifications.sound_alerts", "Sound Alerts"),
            description: t(
              "notifications.sound_alerts_description",
              "Custom message tone",
            ),
            icon: Volume2,
            iconBg: "bg-xon-container-yellow",
            iconColor: "text-xon-text-yellow",
          },
          {
            key: "vibrate" as const,
            label: t("notifications.vibrate", "Vibrate"),
            description: t(
              "notifications.vibrate_description",
              "Pulse for new messages",
            ),
            icon: Vibrate,
            iconBg: "bg-xon-container-purple",
            iconColor: "text-xon-purple",
          },
        ],
      },
      {
        title: t("notifications.call_notifications", "Call Notifications"),
        items: [
          {
            key: "incomingCalls" as const,
            label: t("notifications.incoming_calls", "Incoming Calls"),
            description: t(
              "notifications.incoming_calls_description",
              "Ring for all calls",
            ),
            icon: PhoneCall,
            iconBg: "bg-xon-container-green",
            iconColor: "text-xon-text-green",
          },
          {
            key: "badgeNotifications" as const,
            label: t("notifications.badges", "Badge Notifications"),
            description: t(
              "notifications.badges_description",
              "Show missed count",
            ),
            icon: BadgeCheck,
            iconBg: "bg-xon-container-red",
            iconColor: "text-xon-text-red",
          },
        ],
      },
    ],
    [t],
  );

  const tabTitles: Record<string, string> = {
    profile: t("interface.profile", "Profile"),
    analytics: t("interface.performance_analytics", "Performance Analytics"),
    account: t("interface.account", "Account"),
    notifications: t("interface.notifications", "Notifications"),
  };

  /* ── Empty state ── */
  if (!activeTab) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 text-xon-text-secondary px-6">
        <Avatar
          src={currentUser?.avatar_url}
          name={currentUser?.full_name}
          className="w-16 h-16"
        />
        <p className="text-base font-bold text-xon-text-primary">
          {currentUser?.full_name}
        </p>
        <p className="text-sm text-xon-text-secondary">
          {t(
            "settings.select_section",
            "Select a section from the menu to get started",
          )}
        </p>
      </div>
    );
  }

  if (activeTab === "edit") return <EditProfileForm />;
  if (activeTab === "reset-password") return <ResetPasswordForm />;

  return (
    <div className="h-full overflow-y-auto xon-scrollbar-hidden bg-xon-surface">
      <div className="bg-xon-surface-container p-[18px] shadow-sm flex items-center gap-3">
        <h1 className="text-lg font-semibold text-xon-text-primary">
          {tabTitles[activeTab]}
        </h1>
      </div>
      <div className=" mx-auto py-2 p-2  space-y-6">
        {/* ── Profile ── */}
        {activeTab === "profile" && (
          <>
            {/* Profile Picture card */}
            <div className="bg-xon-surface-container rounded-2xl border border-xon-surface-outline overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-xon-surface-outline">
                <span className="text-sm text-xon-text-secondary font-medium">
                  {t("profile.profile_picture", "Profile Picture")}
                </span>
                <button
                  onClick={() => navigate("/profile/edit")}
                  className="rounded-xl p-1.5 hover:bg-xon-surface-container-hover transition-colors"
                >
                  <Pencil className="h-4 w-4 text-xon-text-blue" />
                </button>
              </div>
              <div className="flex flex-col items-center gap-3 py-8 px-6">
                <Avatar
                  src={currentUser?.avatar_url}
                  name={currentUser?.full_name}
                  className="w-24 h-24 text-3xl font-bold rounded-full"
                />
                <div className="text-center space-y-1">
                  <h2 className="text-2xl font-bold text-xon-text-primary">
                    {currentUser?.full_name}
                  </h2>
                  <p className="text-sm text-xon-text-secondary">
                    {currentUser?.email}
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-3 mt-2">
                  <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    ● {t("profile.status", "Online")}
                  </span>
                  <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-xon-surface-container-hover text-xon-text-secondary border border-xon-surface-outline">
                    👤 {t("profile.role", "Agent")}
                  </span>
                </div>
              </div>
            </div>

            {/* Personal Information card */}
            <div>
              <h3 className="text-sm font-bold text-xon-text-primary mb-3">
                {t("profile.personal_information", "Personal Information")}
              </h3>
              <div className="bg-xon-surface-container rounded-2xl border border-xon-surface-outline overflow-hidden">
                <div className="grid grid-cols-2">
                  {[
                    {
                      icon: User,
                      label: t("profile.name", "Name"),
                      value: currentUser?.full_name,
                      border: "border-b border-r",
                    },
                    {
                      icon: Mail,
                      label: t("profile.email", "Email"),
                      value: currentUser?.email,
                      border: "border-b",
                    },
                    {
                      icon: Phone,
                      label: t("profile.phone", "Mobile Number"),
                      value: (currentUser as any)?.phone,
                      border: "border-r",
                    },
                    {
                      icon: Clock,
                      label: t("profile.timezone", "Timezone"),
                      value: (currentUser as any)?.timezone,
                      border: "",
                    },
                  ].map(({ icon: Icon, label, value, border }) => (
                    <div
                      key={label}
                      className={cn(
                        "px-5 py-4",
                        border,
                        "border-xon-surface-outline",
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="h-4 w-4 text-xon-text-secondary flex-shrink-0" />
                        <span className="text-xs text-xon-text-secondary">
                          {label}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-xon-text-primary ps-6">
                        {value || "—"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── Analytics ── */}
        {activeTab === "analytics" && (
          <>
            <ChatCapacitySection chatCapacity={chatCapacity} />
            <HomeAnalyticsDashboard />
          </>
        )}

        {/* ── Account ── */}
        {activeTab === "account" && (
          <>
            <div className="bg-xon-surface-container rounded-2xl border border-xon-surface-outline overflow-hidden">
              <div className="px-6 py-4 border-b border-xon-surface-outline">
                <p className="text-xs text-xon-text-secondary">
                  {t("profile.account_description", "Reset password, passkeys")}
                </p>
              </div>
              <button
                onClick={() => navigate("/profile/account/reset-password")}
                className="w-full flex items-center justify-between gap-4 px-6 py-4 hover:bg-xon-surface-container-hover transition-colors text-left"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-xon-container-yellow flex items-center justify-center flex-shrink-0">
                    <KeyRound className="h-5 w-5 text-xon-text-yellow" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-xon-text-primary">
                      {t("security.password_settings", "Password Settings")}
                    </p>
                    <p className="text-xs text-xon-text-secondary">
                      {t(
                        "security.password_settings_description",
                        "Change password and requirements",
                      )}
                    </p>
                  </div>
                </div>
                <ChevronRight
                  className={cn(
                    "h-4 w-4 text-xon-text-secondary flex-shrink-0",
                    isRTL && "rotate-180",
                  )}
                />
              </button>
            </div>
            <PasskeySection />
          </>
        )}

        {/* ── Notifications ── */}
        {activeTab === "notifications" && (
          <div className="space-y-6">
            {notificationSections.map((section) => (
              <section key={section.title}>
                <label className="text-[11px] font-bold text-xon-text-secondary uppercase tracking-widest px-1">
                  {section.title}
                </label>
                <div className="mt-2 bg-xon-surface-container rounded-2xl border border-xon-surface-outline overflow-hidden">
                  {section.items.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.key}
                        className={cn(
                          "flex items-center justify-between px-6 py-4",
                          index > 0 && "border-t border-xon-surface-outline",
                        )}
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div
                            className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                              item.iconBg,
                            )}
                          >
                            <Icon className={cn("h-5 w-5", item.iconColor)} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-xon-text-primary">
                              {item.label}
                            </p>
                            <p className="text-xs text-xon-text-secondary">
                              {item.description}
                            </p>
                          </div>
                        </div>
                        <ToggleSwitch
                          checked={toggles[item.key]}
                          onCheckedChange={(next) =>
                            setToggles((prev) => ({
                              ...prev,
                              [item.key]: next,
                            }))
                          }
                        />
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
