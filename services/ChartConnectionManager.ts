// ChartConnectionManager.ts
import { WebSocketManager } from './WebSocketManager';
import { HeartbeatManager } from './HeartbeatManager';
import { ReconnectManager } from './ReconnectManager';
import { ChartStateMachine, ChartState } from './ChartStateMachine';
import { RequestQueue } from './RequestQueue';

export class ChartConnectionManager {
  private static instance: ChartConnectionManager | null = null;
  private deliberateClose = false;

  private constructor() {
    // Register connection and disconnection callbacks on the WebSocketManager
    WebSocketManager.getInstance().registerCallbacks(
      () => this.handleConnect(),
      (error) => this.handleDisconnect(error)
    );
  }

  public static getInstance(): ChartConnectionManager {
    if (!ChartConnectionManager.instance) {
      ChartConnectionManager.instance = new ChartConnectionManager();
    }
    return ChartConnectionManager.instance;
  }

  public connect() {
    this.deliberateClose = false;
    const stateMachine = ChartStateMachine.getInstance();
    const wsManager = WebSocketManager.getInstance();

    if (wsManager.isConnected()) {
      stateMachine.transition(ChartState.CONNECTED);
      return;
    }

    if (ReconnectManager.getInstance().isReconnecting()) {
      stateMachine.transition(ChartState.RECONNECTING);
    } else {
      stateMachine.transition(ChartState.CONNECTING);
    }

    wsManager.connect();
  }

  public disconnect() {
    console.log('[ChartConnectionManager] Deliberate disconnect called');
    this.deliberateClose = true;
    ReconnectManager.getInstance().reset();
    HeartbeatManager.getInstance().stop();
    WebSocketManager.getInstance().disconnect();
    ChartStateMachine.getInstance().transition(ChartState.OFFLINE);
  }

  private handleConnect() {
    console.log('[ChartConnectionManager] WebSocket connection established');
    const stateMachine = ChartStateMachine.getInstance();
    stateMachine.transition(ChartState.CONNECTED);

    ReconnectManager.getInstance().reset();

    // Start 20s active ping checks.
    HeartbeatManager.getInstance().start(() => {
      console.warn('[ChartConnectionManager] Heartbeat timeout occurred, resetting connection');
      this.forceReconnect();
    });

    // Send any queued API requests
    RequestQueue.getInstance().drain((req) => {
      WebSocketManager.getInstance().send(req);
    });
  }

  private handleDisconnect(error?: string) {
    console.log('[ChartConnectionManager] WebSocket disconnected:', error);
    HeartbeatManager.getInstance().stop();

    if (this.deliberateClose) {
      ChartStateMachine.getInstance().transition(ChartState.OFFLINE);
      return;
    }

    const stateMachine = ChartStateMachine.getInstance();
    stateMachine.transition(ChartState.RECONNECTING, error || 'Disconnected from server');

    // Trigger exponential backoff reconnection scheduler
    ReconnectManager.getInstance().triggerReconnect(() => {
      console.log('[ChartConnectionManager] Running scheduled reconnection');
      this.connect();
    });
  }

  private forceReconnect() {
    console.log('[ChartConnectionManager] Forcing reconnection');
    WebSocketManager.getInstance().disconnect();
  }
}
