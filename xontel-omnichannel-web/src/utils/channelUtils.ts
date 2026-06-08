import React from "react";
import {
  FaWhatsapp,
  FaWhatsappSquare,
  FaFacebook,
  FaInstagram,
  FaTelegram,
  FaTelegramPlane,
  FaEnvelope,
  FaGlobe,
  FaPhone,
  FaRobot,
  FaArrowRight,
  FaSearch,
  FaComments,
  FaPaperPlane,
  FaPhoneAlt,
  FaHeadset,
  FaShare,
  FaInbox,
} from "react-icons/fa";
import { MessageSquare } from "lucide-react";
export const CHANNEL_CONFIG: Record<
  string,
  { icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; label: string; color: string; gradient: string }
> = {
  whatsapp:         { icon: FaWhatsapp,     label: "WhatsApp",         color: "#25D366", gradient: "linear-gradient(to right, #22c55e, #059669)" },
  whatsapp_bot:     { icon: FaRobot,        label: "WhatsApp Bot",     color: "#25D366", gradient: "linear-gradient(to right, #22c55e, #059669)" },
  whatsapp_group:   { icon: FaComments,     label: "WhatsApp Group",   color: "#25D366", gradient: "linear-gradient(to right, #22c55e, #059669)" },
  whatsapp_user:    { icon: FaPhoneAlt,     label: "WhatsApp User",    color: "#25D366", gradient: "linear-gradient(to right, #22c55e, #059669)" },
  facebook:         { icon: FaFacebook,     label: "Facebook",         color: "#1877F2", gradient: "linear-gradient(to right, #3b82f6, #1d4ed8)" },
  instagram:        { icon: FaInstagram,    label: "Instagram",        color: "#E4405F", gradient: "linear-gradient(to right, #833ab4, #fd1d1d, #fcaf45)" },
  twitter:          { icon: FaShare,        label: "Twitter / X",      color: "#1DA1F2", gradient: "linear-gradient(to right, #38bdf8, #0284c7)" },
  email:            { icon: FaEnvelope,     label: "Email",            color: "#EA4335", gradient: "linear-gradient(to right, #f87171, #dc2626)" },
  telegram:         { icon: FaTelegram,     label: "Telegram",         color: "#24A1DE", gradient: "linear-gradient(to right, #38bdf8, #0369a1)" },
  telegram_bot:     { icon: FaRobot,        label: "Telegram Bot",     color: "#24A1DE", gradient: "linear-gradient(to right, #38bdf8, #0369a1)" },
  telegram_channel: { icon: FaTelegramPlane,label: "Telegram Channel", color: "#24A1DE", gradient: "linear-gradient(to right, #38bdf8, #0369a1)" },
  telegram_group:   { icon: FaComments,     label: "Telegram Group",   color: "#24A1DE", gradient: "linear-gradient(to right, #38bdf8, #0369a1)" },
  telegram_user:    { icon: FaPhoneAlt,     label: "Telegram User",    color: "#24A1DE", gradient: "linear-gradient(to right, #38bdf8, #0369a1)" },
  internal:         { icon: FaInbox,        label: "Internal",         color: "#6366F1", gradient: "linear-gradient(to right, #818cf8, #4f46e5)" },
  chatgpt:          { icon: FaHeadset,      label: "ChatGPT",          color: "#10a37f", gradient: "linear-gradient(to right, #34d399, #059669)" },
  ai:               { icon: FaRobot,        label: "AI",               color: "#8B5CF6", gradient: "linear-gradient(to right, #a78bfa, #7c3aed)" },
  custom:           { icon: FaArrowRight,   label: "Custom",           color: "#6B7280", gradient: "linear-gradient(to right, #9ca3af, #4b5563)" },
};

export const getChannelIcon = (
  type: string,
): React.ComponentType<{ className?: string; style?: React.CSSProperties }> => {
  const config = CHANNEL_CONFIG[type];
  if (!config) return MessageSquare;

  const IconComponent = config.icon;
  const color = config.color;

  return (props: { className?: string; style?: React.CSSProperties }) =>
    React.createElement(IconComponent, {
      ...props,
      style: { color, ...props.style },
    });
};

export const getChannelColor = (type: string): string => {
  return CHANNEL_CONFIG[type]?.color || "inherit";
};

export const getChannelLabel = (type: string): string => {
  return CHANNEL_CONFIG[type]?.label || type;
};
