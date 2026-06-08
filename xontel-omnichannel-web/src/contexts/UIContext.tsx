import React, { createContext, useContext, useReducer, type Dispatch } from 'react'

// Split contexts so dispatch-only consumers never re-render on state changes.
// dispatch from useReducer is a stable reference — UIDispatchContext never changes value.

export interface UIState {
    messageInfo: {
        isOpen: boolean
        messageId: string | null
    }
    messageEdit: {
        isOpen: boolean
        messageId: string | null
    }
    profilePanel: {
        isOpen: boolean
        conversationId: string | null
    }
    sidebarView: 'conversations' | 'calls' | 'email' | 'contacts'
    callsTab: 'all' | 'missed'
    activeInboxId: number | null
    notesSidebar: {
        isOpen: boolean
    }
    activeCall: {
        isInCall: boolean
        conversationId: string | number | null
    }
    email: {
        selectedId: number | null
        activeCategory: 'inbox' | 'unread' | 'sent' | 'starred' | 'drafts' | 'trash'
    }
    scrollToMessage: {
        messageId: string | null
        requestId: number
    }
}

const initialState: UIState = {
    messageInfo: { isOpen: false, messageId: null },
    messageEdit: { isOpen: false, messageId: null },
    profilePanel: { isOpen: false, conversationId: null },
    sidebarView: 'conversations',
    callsTab: 'all',
    activeInboxId: null,
    notesSidebar: { isOpen: false },
    activeCall: { isInCall: false, conversationId: null },
    email: { selectedId: null, activeCategory: 'inbox' },
    scrollToMessage: { messageId: null, requestId: 0 },
}

export type UIAction =
    | { type: 'setSidebarView'; payload: UIState['sidebarView'] }
    | { type: 'setCallsTab'; payload: UIState['callsTab'] }
    | { type: 'openMessageInfo'; payload: string }
    | { type: 'openMessageEdit'; payload: string }
    | { type: 'closeMessageInfo' }
    | { type: 'closeMessageEdit' }
    | { type: 'toggleMessageInfo' }
    | { type: 'openProfilePanel'; payload: string }
    | { type: 'closeProfilePanel' }
    | { type: 'setActiveInboxId'; payload: number | null }
    | { type: 'openNotesSidebar' }
    | { type: 'closeNotesSidebar' }
    | { type: 'toggleNotesSidebar' }
    | { type: 'setActiveCall'; payload: { isInCall: boolean; conversationId?: string | number | null } }
    | { type: 'setSelectedEmailId'; payload: number | null }
    | { type: 'setEmailCategory'; payload: UIState['email']['activeCategory'] }
    | { type: 'requestScrollToMessage'; payload: string }
    | { type: 'clearScrollToMessage' }

function uiReducer(state: UIState, action: UIAction): UIState {
    switch (action.type) {
        case 'setSidebarView':
            return { ...state, sidebarView: action.payload }
        case 'setCallsTab':
            return { ...state, callsTab: action.payload }
        case 'openMessageInfo':
            return {
                ...state,
                messageInfo: { isOpen: true, messageId: action.payload },
                notesSidebar: { isOpen: false },
            }
        case 'openMessageEdit':
            return { ...state, messageEdit: { isOpen: true, messageId: action.payload } }
        case 'closeMessageInfo':
            return { ...state, messageInfo: { isOpen: false, messageId: null } }
        case 'closeMessageEdit':
            return { ...state, messageEdit: { isOpen: false, messageId: null } }
        case 'toggleMessageInfo':
            return {
                ...state,
                messageInfo: {
                    isOpen: !state.messageInfo.isOpen,
                    messageId: state.messageInfo.isOpen ? null : state.messageInfo.messageId,
                },
            }
        case 'openProfilePanel':
            return { ...state, profilePanel: { isOpen: true, conversationId: action.payload } }
        case 'closeProfilePanel':
            return { ...state, profilePanel: { isOpen: false, conversationId: null } }
        case 'setActiveInboxId':
            return { ...state, activeInboxId: action.payload }
        case 'openNotesSidebar':
            return {
                ...state,
                notesSidebar: { isOpen: true },
                messageInfo: { isOpen: false, messageId: null },
            }
        case 'closeNotesSidebar':
            return { ...state, notesSidebar: { isOpen: false } }
        case 'toggleNotesSidebar':
            return {
                ...state,
                notesSidebar: { isOpen: !state.notesSidebar.isOpen },
                messageInfo: { isOpen: false, messageId: null },
            }
        case 'setActiveCall':
            return {
                ...state,
                activeCall: {
                    isInCall: action.payload.isInCall,
                    conversationId:
                        action.payload.conversationId !== undefined
                            ? action.payload.conversationId
                            : state.activeCall.conversationId,
                },
            }
        case 'setSelectedEmailId':
            return { ...state, email: { ...state.email, selectedId: action.payload } }
        case 'setEmailCategory':
            return { ...state, email: { ...state.email, activeCategory: action.payload } }
        case 'requestScrollToMessage':
            return {
                ...state,
                scrollToMessage: {
                    messageId: action.payload,
                    requestId: state.scrollToMessage.requestId + 1,
                },
            }
        case 'clearScrollToMessage':
            return { ...state, scrollToMessage: { ...state.scrollToMessage, messageId: null } }
        default:
            return state
    }
}

// Action creators — identical API to the old Redux action creators
export const setSidebarView = (payload: UIState['sidebarView']): UIAction => ({ type: 'setSidebarView', payload })
export const setCallsTab = (payload: UIState['callsTab']): UIAction => ({ type: 'setCallsTab', payload })
export const openMessageInfo = (payload: string): UIAction => ({ type: 'openMessageInfo', payload })
export const openMessageEdit = (payload: string): UIAction => ({ type: 'openMessageEdit', payload })
export const closeMessageInfo = (): UIAction => ({ type: 'closeMessageInfo' })
export const closeMessageEdit = (): UIAction => ({ type: 'closeMessageEdit' })
export const toggleMessageInfo = (): UIAction => ({ type: 'toggleMessageInfo' })
export const openProfilePanel = (payload: string): UIAction => ({ type: 'openProfilePanel', payload })
export const closeProfilePanel = (): UIAction => ({ type: 'closeProfilePanel' })
export const setActiveInboxId = (payload: number | null): UIAction => ({ type: 'setActiveInboxId', payload })
export const openNotesSidebar = (): UIAction => ({ type: 'openNotesSidebar' })
export const closeNotesSidebar = (): UIAction => ({ type: 'closeNotesSidebar' })
export const toggleNotesSidebar = (): UIAction => ({ type: 'toggleNotesSidebar' })
export const setActiveCall = (payload: { isInCall: boolean; conversationId?: string | number | null }): UIAction => ({
    type: 'setActiveCall',
    payload,
})
export const setSelectedEmailId = (payload: number | null): UIAction => ({ type: 'setSelectedEmailId', payload })
export const setEmailCategory = (payload: UIState['email']['activeCategory']): UIAction => ({
    type: 'setEmailCategory',
    payload,
})
export const requestScrollToMessage = (payload: string): UIAction => ({ type: 'requestScrollToMessage', payload })
export const clearScrollToMessage = (): UIAction => ({ type: 'clearScrollToMessage' })

interface UIContextValue {
    state: UIState
    dispatch: Dispatch<UIAction>
}

const UIStateContext = createContext<UIState | null>(null)
const UIDispatchContext = createContext<Dispatch<UIAction> | null>(null)

export function UIProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(uiReducer, initialState)
    return (
        <UIDispatchContext.Provider value={dispatch}>
            <UIStateContext.Provider value={state}>
                {children}
            </UIStateContext.Provider>
        </UIDispatchContext.Provider>
    )
}

export function useUIState(): UIState {
    const ctx = useContext(UIStateContext)
    if (!ctx) throw new Error('useUIState must be used within UIProvider')
    return ctx
}

export function useUIDispatch(): Dispatch<UIAction> {
    const ctx = useContext(UIDispatchContext)
    if (!ctx) throw new Error('useUIDispatch must be used within UIProvider')
    return ctx
}

/** Convenience hook — use useUIDispatch() or useUIState() directly when you only need one. */
export function useUIContext(): UIContextValue {
    return { state: useUIState(), dispatch: useUIDispatch() }
}
