import {
    UserAgent,
    UserAgentOptions,
    Registerer,
    Inviter,
    Invitation,
    Session,
    SessionState,
    Web,
    RegistererState,
} from 'sip.js';

export interface SIPConfig {
    uri: string;
    wsServer: string;
    password?: string;
    displayName?: string;
    authorizationUsername?: string;
}

export interface SIPCallInfo {
    session: Session;
    direction: 'incoming' | 'outgoing';
    remoteIdentity: string;
    state: SessionState;
    remoteStream?: MediaStream;
}

export type SipServiceEvent = 'registered' | 'unregistered' | 'call_incoming' | 'call_accepted' | 'call_ended' | 'call_failed';

export class SipService {
    private static instance: SipService;
    private ua: UserAgent | null = null;
    private registerer: Registerer | null = null;
    private activeSession: Session | null = null;
    private remoteStream: MediaStream = new MediaStream();
    private eventListeners: Map<SipServiceEvent, Array<(...args: any[]) => void>> = new Map();

    private constructor() { }

    public static getInstance(): SipService {
        if (!SipService.instance) {
            SipService.instance = new SipService();
        }
        return SipService.instance;
    }

    /**
     * Initialize and start the User Agent
     */
    public async initialize(config: SIPConfig): Promise<void> {
        console.log('%c[SIP] Initializing UA for:', 'color: #34b7f1; font-weight: bold;', config.uri);

        const uaOptions: UserAgentOptions = {
            uri: UserAgent.makeURI(config.uri),
            transportOptions: {
                server: config.wsServer,
            },
            authorizationUsername: config.authorizationUsername || config.uri.split('@')[0],
            authorizationPassword: config.password,
            displayName: config.displayName,
            delegate: {
                onInvite: (invitation: Invitation) => {
                    this.handleIncomingInvite(invitation);
                },
            },
        };

        this.ua = new UserAgent(uaOptions);

        try {
            await this.ua.start();
            console.log('%c[SIP] UA Started', 'color: #25D366;');

            this.registerer = new Registerer(this.ua);
            this.registerer.stateChange.addListener((newState) => {
                if (newState === RegistererState.Registered) {
                    this.emit('registered');
                } else if (newState === RegistererState.Unregistered) {
                    this.emit('unregistered');
                }
            });

            await this.registerer.register();
        } catch (error) {
            console.error('[SIP] UA Start Failed', error);
            throw error;
        }
    }

    /**
     * Initiate an outgoing call
     */
    public async makeCall(targetUri: string): Promise<Session> {
        if (!this.ua) throw new Error('SIP UA not initialized');

        const uri = UserAgent.makeURI(targetUri);
        if (!uri) throw new Error('Invalid target URI');

        const inviter = new Inviter(this.ua, uri, {
            sessionDescriptionHandlerOptions: {
                constraints: { audio: true, video: false },
            },
        });

        this.setupSessionHandlers(inviter);
        await inviter.invite();
        this.activeSession = inviter;
        return inviter;
    }

    /**
     * Answer an incoming call
     */
    public async answerCall(): Promise<void> {
        if (!this.activeSession || !(this.activeSession instanceof Invitation)) {
            throw new Error('No active incoming invitation to answer');
        }

        await this.activeSession.accept({
            sessionDescriptionHandlerOptions: {
                constraints: { audio: true, video: false },
            },
        });
    }

    /**
     * Hang up the current call
     */
    public async hangup(): Promise<void> {
        if (!this.activeSession) return;

        try {
            if (this.activeSession.state === SessionState.Initial || this.activeSession.state === SessionState.Establishing) {
                if (this.activeSession instanceof Invitation) {
                    await this.activeSession.reject();
                } else if (this.activeSession instanceof Inviter) {
                    await this.activeSession.cancel();
                }
            } else if (this.activeSession.state === SessionState.Established) {
                if (this.activeSession instanceof Invitation || this.activeSession instanceof Inviter) {
                    await this.activeSession.bye();
                }
            }
        } catch (e) {
            console.error('[SIP] Error hanging up:', e);
        } finally {
            this.activeSession = null;
        }
    }

    /**
     * Mute/Unmute microphone
     */
    public toggleMute(muted: boolean): void {
        if (!this.activeSession) return;

        const sdh = this.activeSession.sessionDescriptionHandler as Web.SessionDescriptionHandler;
        if (!sdh || !sdh.peerConnection) return;

        sdh.peerConnection.getSenders().forEach((sender) => {
            if (sender.track && sender.track.kind === 'audio') {
                sender.track.enabled = !muted;
            }
        });
    }

    private handleIncomingInvite(invitation: Invitation): void {
        const remoteUri = invitation.remoteIdentity.uri.toString();
        console.log('%c[SIP] Incoming Call from:', 'color: #34b7f1;', remoteUri);

        // Filter out calls from the agent's own number to prevent self-ringing loops
        if (remoteUri.includes('96522204946')) {
            console.log('%c[SIP] Ignoring incoming call from agent number: 96522204946', 'color: #ff9800;');
            invitation.reject();
            return;
        }

        this.activeSession = invitation;
        this.setupSessionHandlers(invitation);
        this.emit('call_incoming', invitation);
    }

    private setupSessionHandlers(session: Session): void {
        session.stateChange.addListener((newState: SessionState) => {
            console.log(`%c[SIP] Session State Change: ${newState}`, 'color: #888;');

            switch (newState) {
                case SessionState.Established:
                    this.setupRemoteMedia(session);
                    this.emit('call_accepted', session);
                    break;
                case SessionState.Terminated:
                    this.activeSession = null;
                    this.emit('call_ended', session);
                    break;
            }
        });
    }

    private setupRemoteMedia(session: Session): void {
        const sdh = session.sessionDescriptionHandler as Web.SessionDescriptionHandler;
        if (!sdh || !sdh.peerConnection) return;

        const remoteStream = new MediaStream();
        sdh.peerConnection.getReceivers().forEach((receiver) => {
            if (receiver.track) {
                remoteStream.addTrack(receiver.track);
            }
        });

        this.remoteStream = remoteStream;
        console.log('%c[SIP] Remote media stream attached', 'color: #25D366;');
    }

    public getRemoteStream(): MediaStream {
        return this.remoteStream;
    }

    public getActiveSession(): Session | null {
        return this.activeSession;
    }

    /**
     * Event system
     */
    public on(event: SipServiceEvent, callback: (...args: any[]) => void): void {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event)?.push(callback);
    }

    public off(event: SipServiceEvent, callback: (...args: any[]) => void): void {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            this.eventListeners.set(event, listeners.filter(l => l !== callback));
        }
    }

    private emit(event: SipServiceEvent, ...args: any[]): void {
        this.eventListeners.get(event)?.forEach(callback => callback(...args));
    }
}

export const sipService = SipService.getInstance();
