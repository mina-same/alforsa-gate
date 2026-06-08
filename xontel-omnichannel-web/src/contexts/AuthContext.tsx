import React, { createContext, useContext, useState } from 'react'
import { UserResponse } from '@/api/users/types'
import type { OrgInternalAttributes } from '@/api/auth/types'

// Split contexts so setter-only consumers (App, auth hooks, WebSocket) never
// re-render when user data changes. useState's setter is a stable reference.
const emptyUser: UserResponse = {
    id: 0,
    email: '',
    full_name: '',
    organization_id: 0,
    role: 'user',
    status: 'active',
    timezone: '',
}

const AuthUserContext = createContext<UserResponse | null>(null)
const AuthSetUserContext = createContext<((user: UserResponse) => void) | null>(null)

const OrgSettingsContext = createContext<OrgInternalAttributes | null>(null)
const OrgSetSettingsContext = createContext<((settings: OrgInternalAttributes | null) => void) | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserResponse>(emptyUser)
    const [orgSettings, setOrgSettings] = useState<OrgInternalAttributes | null>(() => {
        try {
            const stored = localStorage.getItem('orgSettings')
            return stored ? JSON.parse(stored) : null
        } catch {
            return null
        }
    })

    return (
        <OrgSetSettingsContext.Provider value={setOrgSettings}>
            <OrgSettingsContext.Provider value={orgSettings}>
                <AuthSetUserContext.Provider value={setUser}>
                    <AuthUserContext.Provider value={user}>
                        {children}
                    </AuthUserContext.Provider>
                </AuthSetUserContext.Provider>
            </OrgSettingsContext.Provider>
        </OrgSetSettingsContext.Provider>
    )
}

/** Returns the current user. Always a UserResponse (never null) — initial value is emptyUser until populated. */
export function useAuthUser(): UserResponse {
    const ctx = useContext(AuthUserContext)
    if (ctx === null) throw new Error('useAuthUser must be used within AuthProvider')
    return ctx
}

/** Returns the stable setter. Subscribe to this to call setUser without re-rendering on user changes. */
export function useSetAuthUser(): (user: UserResponse) => void {
    const ctx = useContext(AuthSetUserContext)
    if (ctx === null) throw new Error('useSetAuthUser must be used within AuthProvider')
    return ctx
}

/** Returns parsed org internal attributes (e.g. agent_inactivity settings). Null until populated after login. */
export function useOrgSettings(): OrgInternalAttributes | null {
    return useContext(OrgSettingsContext)
}

/** Returns the stable org settings setter. */
export function useSetOrgSettings(): (settings: OrgInternalAttributes | null) => void {
    const ctx = useContext(OrgSetSettingsContext)
    if (ctx === null) throw new Error('useSetOrgSettings must be used within AuthProvider')
    return ctx
}
