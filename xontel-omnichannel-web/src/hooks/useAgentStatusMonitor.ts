import { useEffect, useRef, useCallback } from 'react';
import { useUpdateStatus } from '@/api/auth/hooks';
import { useOrgSettings } from '@/contexts/AuthContext';
import type { AgentInactivitySetting } from '@/api/auth/types';

function toMs(setting: AgentInactivitySetting): number {
    const multiplier = setting.unit === 'hrs' ? 60 * 60 * 1000 : 60 * 1000;
    return setting.value * multiplier;
}

interface StatusMonitorConfig {
    currentStatus: string;
    maxConcurrentChats?: number;
    currentOpenChats: number;
    userId?: number;
    onStatusChange?: (status: string) => void;
}

export const useAgentStatusMonitor = ({
    currentStatus,
    maxConcurrentChats,
    currentOpenChats,
    userId,
    onStatusChange
}: StatusMonitorConfig) => {
    const updateStatus = useUpdateStatus();
    const orgSettings = useOrgSettings();

    // Refs to track state without triggering re-renders inside effects
    const lastActivityRef = useRef<number>(Date.now());
    const currentStatusRef = useRef<string>(currentStatus);
    const manualStatusOverrideRef = useRef<{
        status: string;
        timestamp: number;
    } | null>(null);

    // Update ref when prop changes
    useEffect(() => {
        currentStatusRef.current = currentStatus;
    }, [currentStatus]);

    const inactivity = orgSettings?.agent_inactivity;

    // How long inactive before going away (online → away threshold)
    const AWAY_ENABLED = inactivity?.online?.enabled ?? true;
    const AWAY_TIMEOUT = inactivity?.online ? toMs(inactivity.online) : 5 * 60 * 1000;

    // How long inactive before going offline
    const OFFLINE_ENABLED = inactivity?.offline?.enabled ?? true;
    const OFFLINE_TIMEOUT = inactivity?.offline ? toMs(inactivity.offline) : 30 * 60 * 1000;

    const MANUAL_OVERRIDE_DURATION = 10 * 60 * 1000; // 10 minutes - respect manual changes for this period

    // Expose a function to manually set status (to be called from sidebar)
    const setManualStatus = useCallback((status: string) => {
        manualStatusOverrideRef.current = {
            status,
            timestamp: Date.now()
        };
        
        // Apply the manual status immediately
        if (onStatusChange) {
            onStatusChange(status);
        }
        updateStatus.mutate(status);
        currentStatusRef.current = status;
    }, [onStatusChange, updateStatus]);

    // Determine the target status based on conditions
    const getTargetStatus = useCallback(() => {
        const now = Date.now();
        
        // Check if we have a recent manual override
        if (manualStatusOverrideRef.current) {
            const timeSinceManual = now - manualStatusOverrideRef.current.timestamp;
            if (timeSinceManual < MANUAL_OVERRIDE_DURATION) {
                // Respect the manual status for the duration
                return manualStatusOverrideRef.current.status;
            } else {
                // Manual override expired, clear it
                manualStatusOverrideRef.current = null;
            }
        }

        const inactiveTime = now - lastActivityRef.current;

        // 1. Offline Check
        if (OFFLINE_ENABLED && inactiveTime >= OFFLINE_TIMEOUT) {
            return 'offline';
        }

        // 2. Away Check
        if (AWAY_ENABLED && inactiveTime >= AWAY_TIMEOUT) {
            return 'away';
        }

        // 3. Busy Check (Over Capacity)
        // Only applies if user is active (not away/offline)
        if (maxConcurrentChats !== undefined && currentOpenChats >= maxConcurrentChats) {
            return 'busy';
        }

        // 4. Default to Online
        return 'online';
    }, [maxConcurrentChats, currentOpenChats]);

    // Function to apply status change
    const checkAndApplyStatus = useCallback(() => {
        const targetStatus = getTargetStatus();

        // Only update if different
        if (targetStatus !== currentStatusRef.current) {
            // Optimistic update callback
            if (onStatusChange) {
                onStatusChange(targetStatus);
            }
            // API update
            updateStatus.mutate(targetStatus);
            // Update ref immediately to prevent double-firing
            currentStatusRef.current = targetStatus;
        }
    }, [getTargetStatus, updateStatus, onStatusChange]);

    // Event listener for user activity
    const handleActivity = useCallback(() => {
        lastActivityRef.current = Date.now();

        // If we are currently Away or Offline, coming back should trigger an immediate check
        // to possibly restore to Online/Busy.
        if (currentStatusRef.current === 'away' || currentStatusRef.current === 'offline') {
            checkAndApplyStatus();
        }
    }, [checkAndApplyStatus]);

    // Set up activity listeners
    useEffect(() => {
        if (!userId) return;

        const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
        const throttle = (func: Function, limit: number) => {
            let inThrottle: boolean;
            return function (this: any, ...args: any[]) {
                if (!inThrottle) {
                    func.apply(this, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            }
        };

        const onActivity = throttle(handleActivity, 1000);

        events.forEach(event => document.addEventListener(event, onActivity));

        // Visibility change (tab switch/minimize)
        const onVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                // Treat becoming visible as activity
                handleActivity();
            }
        };
        document.addEventListener('visibilitychange', onVisibilityChange);

        return () => {
            events.forEach(event => document.removeEventListener(event, onActivity));
            document.removeEventListener('visibilitychange', onVisibilityChange);
        };
    }, [userId, handleActivity]);

    // Periodic check (every 10 seconds)
    useEffect(() => {
        if (!userId) return;

        const intervalId = setInterval(() => {
            checkAndApplyStatus();
        }, 10000); // Check every 10 seconds

        return () => clearInterval(intervalId);
    }, [userId, checkAndApplyStatus]);

    // Initial Login / Mount logic
    useEffect(() => {
        if (userId) {
            // "when i login update to active"
            // We'll interpret this as "On load, reset to active/busy based on capacity"
            // effectively resetting any stale "Away/Offline" state from previous session.
            handleActivity(); // Updates timestamp
            checkAndApplyStatus(); // Recalculates status based on 'now'
        }
    }, [userId]); // Run once on mount/user load

    // Return the manual status setter so components can call it
    return { setManualStatus };
};
