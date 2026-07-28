// ChartStateMachine.ts

export enum ChartState {
  IDLE = 'IDLE',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  LOADING_HISTORY = 'LOADING_HISTORY',
  READY = 'READY',
  STREAMING = 'STREAMING',
  RECONNECTING = 'RECONNECTING',
  OFFLINE = 'OFFLINE',
  ERROR = 'ERROR'
}

export type StateListener = (state: ChartState, errorMsg?: string) => void;

export class ChartStateMachine {
  private static instance: ChartStateMachine | null = null;
  private state: ChartState = ChartState.IDLE;
  private errorMsg: string | undefined = undefined;
  private listeners: Set<StateListener> = new Set();

  private constructor() {}

  public static getInstance(): ChartStateMachine {
    if (!ChartStateMachine.instance) {
      ChartStateMachine.instance = new ChartStateMachine();
    }
    return ChartStateMachine.instance;
  }

  public getState(): ChartState {
    return this.state;
  }

  public getErrorMessage(): string | undefined {
    return this.errorMsg;
  }

  public transition(newState: ChartState, errorMsg?: string) {
    if (this.state === newState && this.errorMsg === errorMsg) return;
    console.log(`[ChartStateMachine] Transition: ${this.state} -> ${newState} ${errorMsg ? `(${errorMsg})` : ''}`);
    this.state = newState;
    this.errorMsg = errorMsg;
    this.notify();
  }

  public registerListener(listener: StateListener) {
    this.listeners.add(listener);
    listener(this.state, this.errorMsg);
  }

  public unregisterListener(listener: StateListener) {
    this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(l => {
      try {
        l(this.state, this.errorMsg);
      } catch (e) {
        console.error('[ChartStateMachine] Error in listener notify:', e);
      }
    });
  }
}
