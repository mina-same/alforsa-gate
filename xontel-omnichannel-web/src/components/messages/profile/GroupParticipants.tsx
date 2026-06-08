import { UserPlus, Search, UserMinus, Check, Loader2 } from 'lucide-react'
import Avatar from '@/components/shared/Avatar'
import type { UserResponse } from '@/api'
import type { Conversation } from '@/types/chat'

interface GroupParticipantsProps {
  isEditing: boolean
  isLoadingAllUsers: boolean
  allUsers: UserResponse[]
  groupUsers: UserResponse[]
  selectedUserIds: number[]
  currentUserId: number | undefined
  conversation: Conversation
  isAddingMemberActive: boolean
  memberSearchQuery: string
  onToggleAddMember: () => void
  onMemberSearchChange: (q: string) => void
  onToggleUser: (userId: number) => void
  onRemoveUser: (userId: number) => void
  getStatusColor: (status?: string) => string
}

export function GroupParticipants({
  isEditing, isLoadingAllUsers,
  allUsers, groupUsers, selectedUserIds, currentUserId,
  conversation, isAddingMemberActive, memberSearchQuery,
  onToggleAddMember, onMemberSearchChange, onToggleUser, onRemoveUser,
  getStatusColor,
}: GroupParticipantsProps) {
  return (
    <div className="px-4 py-5 border-b border-xon-surface-outline">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <p className="text-xs font-bold text-xon-text-secondary uppercase tracking-wider">
            Group Participants
          </p>
          <span className="flex items-center justify-center h-5 w-5 rounded-full bg-xon-primary/10 text-xon-primary text-[10px] font-bold">
            {selectedUserIds.length || 0}
          </span>
        </div>
        {isEditing && (
          <button
            onClick={onToggleAddMember}
            className="p-1 hover:bg-xon-surface-container-hover rounded-full transition-colors text-xon-text-primary"
            title="Add members"
          >
            <UserPlus
              className={`h-4 w-4 transition-transform duration-200 ${isAddingMemberActive ? 'rotate-12' : ''}`}
            />
          </button>
        )}
      </div>

      {isAddingMemberActive && isEditing && (
        <div className="mt-2 mb-4 bg-xon-surface-container border border-xon-surface-outline rounded-xl overflow-hidden shadow-sm">
          <div className="p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-xon-text-secondary" />
              <input
                type="text"
                value={memberSearchQuery}
                onChange={(e) => onMemberSearchChange(e.target.value)}
                placeholder="Search agents..."
                className="w-full bg-xon-surface-container-hover border border-xon-surface-outline rounded-lg text-sm outline-none text-xon-text-primary pl-9 pr-3 py-2 focus:ring-1 focus:ring-xon-primary/30 transition-all font-medium"
              />
            </div>
          </div>

          <div className="border-t border-xon-surface-outline" />

          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {isLoadingAllUsers ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-xon-text-secondary" />
              </div>
            ) : allUsers.length > 0 ? (
              <div className="p-1.5 space-y-0.5">
                {allUsers
                  .filter(
                    (user) =>
                      user.full_name?.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
                      user.email?.toLowerCase().includes(memberSearchQuery.toLowerCase()),
                  )
                  .map((user) => {
                    const isSelected = selectedUserIds.includes(Number(user.id))
                    return (
                      <button
                        key={user.id}
                        onClick={() => onToggleUser(Number(user.id))}
                        className={`w-full flex items-center justify-between p-2 rounded-lg transition-all ${
                          isSelected ? 'bg-xon-primary/5' : 'hover:bg-xon-surface-container-hover'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative flex-shrink-0">
                            <Avatar src={user.avatar_url} name={user.full_name || user.email} size="sm" />
                            <div
                              className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-xon-surface-container shadow-sm"
                              style={{ backgroundColor: getStatusColor(user.agent_status) }}
                              title={user.agent_status || 'offline'}
                            />
                          </div>
                          <div className="text-left min-w-0">
                            <p className="text-sm font-semibold text-xon-text-primary truncate">
                              {user.full_name || user.email}
                            </p>
                            <p className="text-[10px] text-xon-text-secondary truncate">{user.role}</p>
                          </div>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center transition-all border ${
                            isSelected ? 'bg-xon-primary border-xon-primary' : 'bg-transparent border-xon-surface-outline'
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3 text-white stroke-[3]" />}
                        </div>
                      </button>
                    )
                  })}
              </div>
            ) : (
              <div className="py-8 px-4 text-center">
                <p className="text-xs text-xon-text-secondary italic">No agents found</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="space-y-1">
        {isEditing ? (
          allUsers
            .filter((user) => selectedUserIds.includes(Number(user.id)))
            .map((user) => {
              const isMe = currentUserId != null && Number(user.id) === Number(currentUserId)
              const isAssigned = Number(user.id) === Number(conversation.assigned_agent_id)
              return (
                <div
                  key={user.id}
                  className="flex items-center gap-3 py-2 px-3 rounded-xl bg-xon-surface-container-hover border border-xon-surface-outline/50 group"
                >
                  <div className="relative flex-shrink-0">
                    <Avatar src={user.avatar_url} name={user.full_name || user.email || 'User'} size="sm" />
                    <div
                      className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-xon-surface-container shadow-sm"
                      style={{ backgroundColor: getStatusColor(user.agent_status) }}
                      title={user.agent_status || 'offline'}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-xon-text-primary truncate">
                      {isMe ? 'You' : user.full_name || 'Anonymous User'}
                    </p>
                    <p className="text-[10px] text-xon-text-secondary font-medium uppercase tracking-tight">
                      {isAssigned ? 'Assigned Agent' : user.role || 'Member'}
                    </p>
                  </div>
                  <button
                    onClick={() => onRemoveUser(Number(user.id))}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-xon-container-red/10 rounded-full transition-all text-xon-text-red"
                    title="Remove from group"
                  >
                    <UserMinus className="h-4 w-4" />
                  </button>
                </div>
              )
            })
        ) : (
          groupUsers?.map((user) => {
            const isMe = currentUserId != null && Number(user.id) === Number(currentUserId)
            const isAssigned = Number(user.id) === Number(conversation.assigned_agent_id)
            return (
              <div
                key={user.id}
                className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-xon-surface-container-hover transition-all group border border-transparent hover:border-xon-surface-outline/30"
              >
                <div className="relative flex-shrink-0">
                  <Avatar src={user.avatar_url} name={user.full_name || user.email || 'User'} size="sm" />
                  <div
                    className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-xon-surface-container shadow-sm"
                    style={{ backgroundColor: getStatusColor(user.agent_status) }}
                    title={user.agent_status || 'offline'}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-xon-text-primary truncate">
                    {isMe ? 'You' : user.full_name || 'Anonymous User'}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] text-xon-text-secondary font-medium uppercase tracking-tight">
                      {user.role || 'Member'}
                    </p>
                    {isAssigned && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-xon-whatsapp-green/10 text-xon-whatsapp-green text-[9px] font-bold uppercase tracking-tighter">
                        Assigned
                      </span>
                    )}
                  </div>
                </div>
                {isMe && (
                  <span className="text-[10px] font-black text-xon-primary bg-xon-primary/5 px-2 py-0.5 rounded-full border border-xon-primary/20">
                    YOU
                  </span>
                )}
              </div>
            )
          })
        )}

        {isEditing && selectedUserIds.length === 0 && (
          <div className="py-8 px-4 text-center border-2 border-dashed border-xon-surface-outline rounded-2xl bg-xon-surface-container-hover/30">
            <UserPlus className="h-8 w-8 text-xon-text-secondary/30 mx-auto mb-2" />
            <p className="text-xs text-xon-text-secondary font-medium">No members selected</p>
            <button
              onClick={onToggleAddMember}
              className="mt-2 text-xs font-bold text-xon-primary hover:underline"
            >
              Add someone
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
