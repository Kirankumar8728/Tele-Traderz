// services/ProposalService.ts

export type ProposalMessageCallback = (data: any) => void;

export class ProposalService {
  private static instance: ProposalService | null = null;
  private publicWs: WebSocket | null = null;
  private authWs: WebSocket | null = null;
  private attachedSockets = new Set<WebSocket>();
  private callbacks = new Set<ProposalMessageCallback>();

  private constructor() {}

  public static getInstance(): ProposalService {
    if (!ProposalService.instance) {
      ProposalService.instance = new ProposalService();
    }
    return ProposalService.instance;
  }

  /**
   * Sets the active WebSockets from the useDeriv hook and hooks event listeners onto them.
   */
  public setWebSockets(publicWs: WebSocket | null, authWs: WebSocket | null) {
    const activeSockets = new Set<WebSocket>();
    if (publicWs) activeSockets.add(publicWs);
    if (authWs) activeSockets.add(authWs);

    // Clean up old sockets no longer in use
    for (const ws of this.attachedSockets) {
      if (!activeSockets.has(ws)) {
        try {
          ws.removeEventListener('message', this.handleMessage);
        } catch (e) {
          console.error('Error removing message listener:', e);
        }
        this.attachedSockets.delete(ws);
      }
    }

    // Attach listeners to new active sockets
    for (const ws of activeSockets) {
      if (!this.attachedSockets.has(ws)) {
        try {
          ws.addEventListener('message', this.handleMessage);
          this.attachedSockets.add(ws);
          if (import.meta.env.DEV) {
            console.log('[PROPOSAL_SERVICE] Attached message listener to WebSocket:', ws.url);
          }
        } catch (e) {
          console.error('[PROPOSAL_SERVICE] Failed to attach listener:', e);
        }
      }
    }

    this.publicWs = publicWs;
    this.authWs = authWs;
  }

  /**
   * Registers a callback for incoming proposal messages.
   */
  public registerCallback(cb: ProposalMessageCallback): () => void {
    this.callbacks.add(cb);
    return () => {
      this.callbacks.delete(cb);
    };
  }

  /**
   * Transmits a raw proposal request over the active WebSocket connection.
   */
  public send(payload: any): boolean {
    // Authenticated requests (and proposals when authenticated) should go to authWs if available and open
    const targetWs = (this.authWs && this.authWs.readyState === WebSocket.OPEN)
      ? this.authWs
      : this.publicWs;

    if (!targetWs || targetWs.readyState !== WebSocket.OPEN) {
      if (import.meta.env.DEV) {
        console.warn('[PROPOSAL_SERVICE] Cannot send request, WebSocket not open');
      }
      return false;
    }

    try {
      targetWs.send(JSON.stringify(payload));
      return true;
    } catch (e) {
      console.error('[PROPOSAL_SERVICE] Failed to send message over WS:', e);
      return false;
    }
  }

  /**
   * Sends a forget subscription message.
   */
  public forget(subscriptionId: string): boolean {
    const payload = { forget: subscriptionId };
    return this.send(payload);
  }

  private handleMessage = (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      if (data.msg_type === 'proposal' || data.msg_type === 'forget' || data.error?.msg_type === 'proposal') {
        this.callbacks.forEach(cb => {
          try {
            cb(data);
          } catch (e) {
            console.error('[PROPOSAL_SERVICE] Callback error:', e);
          }
        });
      }
    } catch (e) {
      // Soft ignore JSON parse errors from other WS streams
    }
  };

  public clear(): void {
    for (const ws of this.attachedSockets) {
      try {
        ws.removeEventListener('message', this.handleMessage);
      } catch (e) {}
    }
    this.attachedSockets.clear();
    this.callbacks.clear();
    this.publicWs = null;
    this.authWs = null;
  }
}

export default ProposalService;
