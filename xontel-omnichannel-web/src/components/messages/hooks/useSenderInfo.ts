import { useContact } from "@/api/contacts/hooks";
import { useUser } from "@/api/users/hooks";
import { Message } from "@/types/chat";

export interface SenderIdInfo {
  type: "contact" | "user" | null;
  id: number | null;
}

export interface SenderInfo {
  senderIdInfo: SenderIdInfo;
  senderContact: any;
  senderName: string | null;
  senderAvatar: string | null;
}

function parseSenderId(message: Message): SenderIdInfo {
  if (message.sent_by_user_id) {
    return { type: "user", id: message.sent_by_user_id };
  }
  if (!message.senderId) return { type: null, id: null };

  const contactMatch = message.senderId.match(/^contact-(\d+)$/);
  if (contactMatch) {
    const id = Number(contactMatch[1]);
    return { type: "contact", id: Number.isFinite(id) ? id : null };
  }

  const userMatch = message.senderId.match(/^user-(\d+)$/);
  if (userMatch) {
    const id = Number(userMatch[1]);
    return { type: "user", id: Number.isFinite(id) ? id : null };
  }

  const numericId = Number(message.senderId);
  if (Number.isFinite(numericId) && numericId > 0) {
    return { type: "user", id: numericId };
  }

  return { type: null, id: null };
}

export function useSenderInfo(message: Message): SenderInfo {
  const senderIdInfo = parseSenderId(message);

  const { data: senderContact } = useContact(
    senderIdInfo.type === "contact" ? senderIdInfo.id || 0 : 0,
  );
  const { data: senderUser } = useUser(
    senderIdInfo.type === "user" ? senderIdInfo.id || 0 : 0,
  );

  const senderName = (() => {
    if (senderIdInfo.type === "contact" && senderContact) return senderContact.name;
    if (senderIdInfo.type === "user" && senderUser) {
      return senderUser.full_name || senderUser.email || `User ${senderIdInfo.id}`;
    }
    if (senderContact?.name) return senderContact.name;
    if (senderUser?.full_name || senderUser?.email) return senderUser.full_name || senderUser.email;
    return null;
  })();

  const senderAvatar = (() => {
    if (senderIdInfo.type === "contact" && senderContact) return senderContact.avatar_url ?? null;
    if (senderIdInfo.type === "user" && senderUser) return senderUser.avatar_url ?? null;
    return null;
  })();

  return { senderIdInfo, senderContact, senderName, senderAvatar };
}
