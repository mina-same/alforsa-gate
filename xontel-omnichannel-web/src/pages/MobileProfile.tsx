import React, { useCallback, useMemo, useState, useEffect } from "react";
import { useAuthUser } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Bell,
  ChevronRight,
  Globe,
  Info,
  KeyRound,
  Moon,
  Pencil,
  Shield,
  Sun,
  LogOut,
  Check,
  ChevronLeft,
  Camera,
  ChevronDown,
  Clock,
  X,
} from "lucide-react";
import { useUserInboxes, useUpdateUser, useUser } from "@/api/users/hooks";
import { useUIContext, setActiveInboxId } from "@/contexts/UIContext";
import { getChannelIcon, getChannelLabel } from "@/utils/channelUtils";
import { useLogout } from "@/api/auth/hooks";
import PasskeySection from "@/components/profile/PasskeySection";
import HomeAnalyticsDashboard from "@/components/empty/HomeAnalyticsDashboard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Skeleton } from "@/components/ui/skeleton";
import EditPhotoModal from "@/components/shared/EditPhotoModal";
import { useUploadMedia } from "@/api/media/hooks";
import { SUPPORTED_LANGUAGES, LANGUAGE_STORAGE_KEY } from "@/i18n";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import { useAgentStatusMonitor } from "@/hooks/useAgentStatusMonitor";

type Theme = "light" | "dark";

export default function MobileProfile() {
  const { t, i18n } = useTranslation(["chat", "common"]);
  const navigate = useNavigate();
  const location = useLocation();
  const { state: uiState, dispatch: uiDispatch } = useUIContext();
  const isRTL = i18n.language === "ar";
  const { mutate: logout } = useLogout();

  const [theme, setTheme] = useState<Theme>(() => {
    return document.documentElement.classList.contains("dark")
      ? "dark"
      : "light";
  });

  const authUser = useAuthUser()

  const [userData, setUserData] = useState(() => ({
    id: authUser.id,
    name: authUser.full_name || t("profile.user"),
    email: authUser.email || "",
    avatar_url: authUser.avatar_url || "",
    phone: authUser.phone || "",
    bio: authUser.bio || "",
  }));

  const userId = authUser.id;
  const { data: currentUser, refetch: refetchUser } = useUser(userId);
  const { data: userInboxes, isLoading: isLoadingInboxes } =
    useUserInboxes(userId);
  const { mutate: updateUser } = useUpdateUser();
  const { mutate: uploadMedia, isPending: isUploading } = useUploadMedia();

  // Update userData when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setUserData({
        id: currentUser.id,
        name: currentUser.full_name || "",
        email: currentUser.email || "",
        avatar_url: currentUser.avatar_url || "",
        phone: currentUser.phone || "",
        bio: currentUser.bio || "",
      });
      localStorage.setItem("userProfile", JSON.stringify(currentUser));
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
    }
  }, [currentUser]);

  const chatCapacity = useMemo(() => {
    const rawMax = (currentUser as any)?.max_concurrent_chats as
      | number
      | string
      | undefined;
    const rawCurrent = (currentUser as any)?.current_chat_count as
      | number
      | string
      | undefined;

    const maxParsed = rawMax != null ? Number(rawMax) : undefined;
    const currentParsed = rawCurrent != null ? Number(rawCurrent) : undefined;

    const max =
      typeof maxParsed === "number" &&
      Number.isFinite(maxParsed) &&
      maxParsed > 0
        ? maxParsed
        : undefined;
    const current =
      typeof currentParsed === "number" &&
      Number.isFinite(currentParsed) &&
      currentParsed >= 0
        ? currentParsed
        : 0;
    const percent =
      max != null ? Math.min(100, Math.max(0, (current / max) * 100)) : 0;

    return { max, current, percent };
  }, [currentUser]);
  const activeInboxId = uiState.activeInboxId;

  const toggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    if (next === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", next);
  };

  const handleLanguageChange = (lang: string) => {
    if (lang === i18n.language) return;
    i18n.changeLanguage(lang);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    const pathWithoutLang = location.pathname.replace(/^\/(en|ar)/, "");
    navigate(pathWithoutLang || "/");
  };

  const handleInboxSwitch = (inboxId: number) => {
    uiDispatch(setActiveInboxId(inboxId));
  };

  const currentLanguageInfo = SUPPORTED_LANGUAGES.map((lang) => ({
    code: lang,
    name: t(`languages.${lang}`),
    flag: lang === "en" ? "🇬🇧" : "🇸🇦",
  }));

  const [avatarEditOpen, setAvatarEditOpen] = useState(false);
  const [avatarEditSrc, setAvatarEditSrc] = useState<string | null>(null);
  const [avatarEditFileName, setAvatarEditFileName] =
    useState<string>("avatar.jpg");
  const [agentStatus, setAgentStatus] = useState(
    currentUser?.agent_status || "online",
  );
  const maxConcurrentChats = useMemo(() => {
    const raw = (currentUser as any)?.max_concurrent_chats as
      | number
      | string
      | undefined;
    const parsed = raw != null ? Number(raw) : undefined;
    return parsed != null && Number.isFinite(parsed) && parsed > 0
      ? parsed
      : undefined;
  }, [currentUser]);
  const { setManualStatus } = useAgentStatusMonitor({
    currentStatus: agentStatus,
    maxConcurrentChats,
    currentOpenChats: 0,
    userId,
    onStatusChange: (status: string) => setAgentStatus(status),
  });
  const handleStatusChange = (nextStatus: string) => {
    // Use the manual status setter from the hook
    setManualStatus(nextStatus);
  };
  const closeAvatarEditor = useCallback(() => {
    setAvatarEditOpen(false);
    setAvatarEditSrc((prev) => {
      if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
      return null;
    });
  }, []);

  const uploadAvatarFile = useCallback(
    (file: File) => {
      try {
        uploadMedia(
          { file },
          {
            onSuccess: (response) => {
              updateUser(
                { id: userId, data: { avatar_url: response.url } },
                {
                  onSuccess: () => {
                    refetchUser();
                    const updatedUser = {
                      ...userData,
                      avatar_url: response.url,
                    };
                    setUserData(updatedUser);
                    localStorage.setItem(
                      "userProfile",
                      JSON.stringify({
                        ...currentUser,
                        avatar_url: response.url,
                      }),
                    );
                    localStorage.setItem(
                      "currentUser",
                      JSON.stringify({
                        ...currentUser,
                        avatar_url: response.url,
                      }),
                    );
                  },
                },
              );
            },
            onError: (error: any) => {
              alert(
                t("profile.avatar.upload_error", {
                  defaultValue: "Failed to upload image. Please try again.",
                }) + (error.message ? `: ${error.message}` : ""),
              );
            },
          },
        );
      } catch (error) {
        console.error("Avatar upload error:", error);
      }
    },
    [currentUser, refetchUser, t, updateUser, uploadMedia, userData, userId],
  );

  // Avatar upload handler (opens crop/rotate first)
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert(
        t("profile.avatar.invalid_file", {
          defaultValue: "Please select an image file",
        }),
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert(
        t("profile.avatar.file_too_large", {
          defaultValue: "File size must be less than 5MB",
        }),
      );
      return;
    }

    const url = URL.createObjectURL(file);
    setAvatarEditSrc(url);
    setAvatarEditFileName(file.name || "avatar.jpg");
    setAvatarEditOpen(true);
  };

  const statusColor = useMemo(() => {
    switch (agentStatus) {
      case "offline":
        return "var(--xon-color-text-red)";
      case "away":
        return "var(--xon-color-text-yellow)";
      case "busy":
        return "var(--xon-color-text-red)"; // Busy also red or maybe orange? Using red for now as it's critical.
      default:
        return "var(--xon-color-text-green)";
    }
  }, [agentStatus]);

  return (
    <>
      <div className="flex flex-col h-[100dvh] overflow-hidden text-xon-text-primary animate-in fade-in slide-in-from-right-4 duration-300 relative">
        <button
          type="button"
          onClick={toggleTheme}
          className="fixed top-4 right-4 z-20 bg-xon-surface-container p-3 rounded-full shadow-lg border border-xon-surface-outline hover:scale-110 active:scale-95 transition-all"
          aria-label={t("profile.appearance", { defaultValue: "Appearance" })}
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>

        <main className="flex-1 overflow-y-auto xon-scrollbar-hidden pb-[calc(6rem+env(safe-area-inset-bottom))]">
          <div className="pt-12 pb-8 px-6 text-center border-b border-xon-surface-outline">
            <div className="flex items-center justify-center">
              <div className="text-xs font-semibold text-xon-text-secondary">
                {t("profile.title")}
              </div>
            </div>

            <div className="relative inline-block mb-4">
              <Avatar className="h-28 w-28 border-4 border-white dark:border-xon-surface-outline shadow-xl">
                <AvatarImage src={userData.avatar_url} alt={userData.name} />
                <AvatarFallback className="text-3xl font-bold bg-xon-primary/10">
                  {userData.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <label
                htmlFor="avatar-upload-mobile"
                className="absolute bottom-0 right-0 bg-xon-primary text-xon-primary-on p-2 rounded-full shadow-lg hover:scale-105 transition-transform border-2 border-white dark:border-xon-surface-outline cursor-pointer"
              >
                <Camera className="h-5 w-5" />
              </label>
              <input
                id="avatar-upload-mobile"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
                disabled={isUploading}
              />
            </div>

            <h2 className="text-2xl font-bold text-xon-text-primary">
              {userData.name}
            </h2>
            <p className="text-xon-text-secondary text-sm font-medium">
              {userData.email}
            </p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  style={{ backgroundColor: `var(--xon-color-container-${agentStatus === 'offline' || agentStatus === 'busy' ? 'red' : agentStatus === 'away' ? 'yellow' : 'green'})` }}
                  className={`inline-flex items-center px-3 py-3 mt-3 text-xon-text-green rounded-full text-[11px] font-bold uppercase tracking-wider focus:border-0 focus-visible:ring-0 justify-between hover:bg-transparent gap-2 w-fit text-xs`}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full mr-2"
                    style={{ backgroundColor: statusColor }}
                  />

                  <span
                    className={`flex items-center gap-2 `}
                    style={{ color: statusColor }}
                  >
                    {agentStatus.charAt(0).toUpperCase() + agentStatus.slice(1)}
                  </span>
                  <ChevronDown className="h-3 w-3 text-xon-text-secondary"/>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[160px]">
                {["online", "away", "busy", "offline"].map((status) => (
                  <DropdownMenuItem
                    key={status}
                    onSelect={() => handleStatusChange(status)}
                    className="flex items-center gap-2"
                  >
                    <span
                      className={`flex items-center justify-center h-4 w-4 shrink-0 rounded-full ${
                        status === "online"
                          ? "bg-[var(--xon-color-text-green)]"
                          : status === "away"
                            ? "bg-[var(--xon-color-text-yellow)]"
                            : "bg-[var(--xon-color-text-red)]"
                      }`}
                    >
                      {status === "online" ? (
                        <Check className="p-0.5 text-white" />
                      ) : status === "away" ? (
                        <Clock className="p-0.5 text-white" />
                      ) : status === "busy" ? (
                        <div className="h-0.5 w-2 bg-white rounded-full" />
                      ) : (
                        <X className="p-0.5 text-white" />
                      )}
                    </span>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="px-5 mt-6 space-y-8">
            <section>
              <label className="text-[11px] font-bold text-xon-text-secondary uppercase tracking-widest px-1">
                {t("profile.chat_capacity", { defaultValue: "Chat Capacity" })}
              </label>
              <div className="mt-2 p-5 bg-xon-surface-container rounded-2xl shadow-sm border border-xon-surface-outline">
                <div className="flex justify-between items-end mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-xon-text-primary">
                      {chatCapacity.current}
                    </span>
                    <span className="text-lg font-medium text-xon-text-secondary">
                      / {chatCapacity.max ?? "—"}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-xon-primary uppercase">
                    {chatCapacity.max != null &&
                    chatCapacity.current >= chatCapacity.max
                      ? t("profile.full_load", { defaultValue: "Full Load" })
                      : `${Math.round(chatCapacity.percent)}%`}
                  </span>
                </div>

                <Progress value={chatCapacity.percent} className="h-2.5" />

                <p className="mt-3 text-xs text-xon-text-secondary flex items-center">
                  <Info className="h-4 w-4 mr-1" />
                  {t("profile.chat_capacity_description", {
                    defaultValue: "Current active chats assigned to you.",
                  })}
                </p>
              </div>
            </section>

            <section>
              <HomeAnalyticsDashboard />
            </section>

            <section>
              <h3 className="text-xs font-semibold text-xon-text-secondary uppercase tracking-wider mb-4 px-1">
                {t("profile.inboxes")}
              </h3>
              <div>
                {isLoadingInboxes ? (
                  <div className="bg-xon-surface-container rounded-2xl p-6 shadow-sm border border-xon-surface-outline">
                    <div className="space-y-3">
                      {Array.from({ length: 4 }).map((_, idx) => (
                        <div
                          key={idx}
                          className="w-full flex items-center justify-between p-3 rounded-xl border border-xon-surface-outline"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Skeleton className="h-10 w-10 rounded-lg" />
                            <div className="min-w-0 space-y-2">
                              <Skeleton variant="text" className="h-4 w-40" />
                              <Skeleton variant="text" className="h-3 w-24" />
                            </div>
                          </div>
                          <Skeleton className="h-4 w-4 rounded-sm" />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : userInboxes?.items && userInboxes.items.length > 0 ? (
                  <div className="space-y-3">
                    {userInboxes.items.map((inbox: any) => {
                      const Icon = getChannelIcon(inbox.channel_type);
                      const isActive =
                        Number(inbox.id) === Number(activeInboxId);
                      return (
                        <button
                          key={inbox.id}
                          onClick={() => handleInboxSwitch(inbox.id)}
                          className={`w-full bg-xon-surface-container rounded-xl p-4 shadow-sm border flex items-center justify-between text-left transition-all ${
                            isActive
                              ? "border-xon-primary ring-1 ring-xon-primary/10"
                              : "border-xon-surface-outline hover:bg-xon-surface-container-hover"
                          }`}
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                isActive
                                  ? "bg-xon-primary/10 text-xon-primary"
                                  : "bg-xon-surface-hover text-xon-text-secondary"
                              }`}
                            >
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-sm truncate">
                                {inbox.name}
                              </p>
                              <p className="text-xs text-xon-text-secondary truncate">
                                {getChannelLabel(inbox.channel_type)}
                              </p>
                            </div>
                          </div>
                          {isActive ? (
                            <span className="text-[11px] font-semibold uppercase text-xon-primary">
                              {t("profile.active", { defaultValue: "Active" })}
                            </span>
                          ) : (
                            <span className="w-5 h-5 border-2 border-xon-surface-outline rounded-full" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 bg-xon-surface-container rounded-2xl border border-xon-surface-outline">
                    <p className="text-xs text-xon-text-secondary">
                      {t("profile.no_inboxes_assigned", {
                        defaultValue: "You are not a member of any inbox yet.",
                      })}
                    </p>
                  </div>
                )}
              </div>
            </section>

            <section>
              <h3 className="text-xs font-semibold text-xon-text-secondary uppercase tracking-wider mb-4 px-1">
                {t("profile.account_settings", {
                  defaultValue: "Account Settings",
                })}
              </h3>
              <div className="bg-xon-surface-container rounded-2xl shadow-sm border border-xon-surface-outline overflow-hidden">
                <button
                  type="button"
                  onClick={() => navigate("/profile/edit")}
                  className="w-full flex items-center justify-between gap-4 p-4 text-left hover:bg-xon-surface-container-hover transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-xon-container-blue flex items-center justify-center flex-shrink-0">
                      <Pencil className="h-5 w-5 text-xon-text-blue" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-xon-text-primary truncate">
                        {t("profile.edit_profile", {
                          defaultValue: "Edit Profile",
                        })}
                      </p>
                      <p className="text-xs text-xon-text-secondary truncate">
                        {t("profile.edit_profile_description", {
                          defaultValue: "Update your personal information.",
                        })}
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    className={`h-4 w-4 text-xon-text-secondary flex-shrink-0 ${isRTL ? "rotate-180" : ""}`}
                  />
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/profile/notifications")}
                  className="w-full flex items-center justify-between gap-4 p-4 text-left hover:bg-xon-surface-container-hover transition-colors border-t border-xon-surface-outline"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center flex-shrink-0">
                      <Bell className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-xon-text-primary truncate">
                        {t("profile.notifications", {
                          defaultValue: "Notifications",
                        })}
                      </p>
                      <p className="text-xs text-xon-text-secondary truncate">
                        {t("profile.notifications_description", {
                          defaultValue: "Alerts, sounds and push prefs",
                        })}
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    className={`h-4 w-4 text-xon-text-secondary flex-shrink-0 ${isRTL ? "rotate-180" : ""}`}
                  />
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/profile/reset-password")}
                  className="w-full flex items-center justify-between gap-4 p-4 text-left hover:bg-xon-surface-container-hover transition-colors border-t border-xon-surface-outline"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                      <KeyRound className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-xon-text-primary truncate">
                        {t("profile.reset_password", {
                          defaultValue: "Reset Password",
                        })}
                      </p>
                      <p className="text-xs text-xon-text-secondary truncate">
                        {t("profile.reset_password_description", {
                          defaultValue: "Change your password securely.",
                        })}
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    className={`h-4 w-4 text-xon-text-secondary flex-shrink-0 ${isRTL ? "rotate-180" : ""}`}
                  />
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/profile/security")}
                  className="w-full flex items-center justify-between gap-4 p-4 text-left hover:bg-xon-surface-container-hover transition-colors border-t border-xon-surface-outline"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center flex-shrink-0">
                      <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-xon-text-primary truncate">
                        {t("profile.security", { defaultValue: "Security" })}
                      </p>
                      <p className="text-xs text-xon-text-secondary truncate">
                        {t("profile.security_description", {
                          defaultValue: "Password and 2FA settings",
                        })}
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    className={`h-4 w-4 text-xon-text-secondary flex-shrink-0 ${isRTL ? "rotate-180" : ""}`}
                  />
                </button>

                <button
                  type="button"
                  onClick={() => logout()}
                  className="w-full flex items-center justify-between gap-4 p-4 text-left hover:bg-xon-container-red transition-colors border-t border-xon-surface-outline"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-xon-container-red flex items-center justify-center flex-shrink-0">
                      <LogOut className="h-5 w-5 text-xon-text-red" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-xon-text-red truncate">
                        {t("profile.logout", { defaultValue: "Log Out" })}
                      </p>
                      <p className="text-xs text-xon-text-secondary truncate">
                        {t("profile.logout_description", {
                          defaultValue: "Sign out of your session.",
                        })}
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </section>

            <PasskeySection />

            <section className="pb-8">
              <label className="text-[11px] font-bold text-xon-text-secondary uppercase tracking-widest px-1">
                {t("profile.language", { defaultValue: "Language" })}
              </label>
              <div className="mt-2 p-5 bg-xon-surface-container rounded-2xl border border-xon-surface-outline">
                <div className="flex items-center gap-2 text-sm font-semibold text-xon-text-primary mb-4">
                  <Globe className="h-4 w-4" />
                  {t("profile.language", { defaultValue: "Language" })}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {currentLanguageInfo.map((lang) => {
                    const isSelected = i18n.language === lang.code;
                    return (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                          isSelected
                            ? "border-xon-primary bg-xon-primary/5 text-xon-primary"
                            : "border-xon-surface-outline hover:bg-xon-surface-hover"
                        }`}
                      >
                        <span>{lang.flag}</span>
                        <span className="text-sm font-medium">{lang.name}</span>
                        {isSelected ? <Check className="h-4 w-4" /> : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>
          </div>
        </main>

        <EditPhotoModal
          open={avatarEditOpen}
          onOpenChange={(open) => {
            if (!open) closeAvatarEditor();
            else setAvatarEditOpen(true);
          }}
          imageSrc={avatarEditSrc}
          title={t("profile.edit_photo", { defaultValue: "Edit Photo" })}
          description={t("profile.edit_photo_description", {
            defaultValue: "Crop and rotate before uploading.",
          })}
          isSaving={isUploading}
          fileName={avatarEditFileName}
          onSave={(file) => {
            uploadAvatarFile(file);
            closeAvatarEditor();
          }}
        />
      </div>
      <MobileBottomNav />
    </>
  );
}
