// import React, { useRef, useEffect } from 'react'
// import { Copy, Trash2, Reply, Share2, Info } from 'lucide-react'
// import type { Message } from '../../store/slices/conversationsSlice'

// interface MessageContextMenuProps {
//   message: Message
//   isOpen: boolean
//   position: { x: number; y: number }
//   onClose: () => void
//   onReply: (message: Message) => void
//   onDelete: (messageId: string) => void
//   onCopy: (text: string) => void
// }

// export default function MessageContextMenu({
//   message,
//   isOpen,
//   position,
//   onClose,
//   onReply,
//   onDelete,
//   onCopy,
// }: MessageContextMenuProps) {
//   const menuRef = useRef<HTMLDivElement>(null)

//   // Close menu when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (e: MouseEvent) => {
//       if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
//         onClose()
//       }
//     }

//     if (isOpen) {
//       document.addEventListener('mousedown', handleClickOutside)
//       return () => document.removeEventListener('mousedown', handleClickOutside)
//     }
//   }, [isOpen, onClose])

//   if (!isOpen) return null

//   const menuItems = [
//     {
//       icon: Reply,
//       label: 'Reply',
//       action: () => {
//         onReply(message)
//         onClose()
//       },
//     },
//     {
//       icon: Copy,
//       label: 'Copy',
//       action: () => {
//         if (message.text) {
//           onCopy(message.text)
//           onClose()
//         }
//       },
//       hidden: !message.text,
//     },
//     {
//       icon: Share2,
//       label: 'Forward',
//       action: () => {
//         onClose()
//         // TODO: implement forward
//       },
//     },
//     {
//       icon: Info,
//       label: 'Info',
//       action: () => {
//         onClose()
//         // TODO: show message info (timestamp, read status, etc.)
//       },
//     },
//     {
//       icon: Trash2,
//       label: 'Delete',
//       action: () => {
//         onDelete(message.id)
//         onClose()
//       },
//       destructive: true,
//     },
//   ]

//   return (
//     <div
//       ref={menuRef}
//       className="fixed z-[9999] h-full border border-border rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-150"
//       style={{
//         left: `${position.x}px`,
//         top: `${position.y}px`,
//         transform: 'translate(-50%, -50%)',
//       }}
//     >
//       <div className="flex flex-col min-w-[160px] overflow-hidden">
//         {menuItems.map((item, idx) => {
//           if (item.hidden) return null
//           const Icon = item.icon
//           const isLast = idx === menuItems.filter((i) => !i.hidden).length - 1
//           return (
//             <button
//               key={idx}
//               onClick={item.action}
//               className={`flex items-center gap-3 px-4 py-3 text-sm ${
//                 !isLast ? 'border-b border-border' : ''
//               } hover:bg-muted transition-colors ${item.destructive ? 'text-destructive hover:text-destructive' : 'text-foreground'}`}
//             >
//               <Icon className="h-4 w-4" />
//               <span>{item.label}</span>
//             </button>
//           )
//         })}
//       </div>
//     </div>
//   )
// }
