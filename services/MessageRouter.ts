// MessageRouter.ts

export type MessageHandler = (data: any) => void;

export class MessageRouter {
  private static instance: MessageRouter | null = null;
  private reqIdHandlers: Map<number, MessageHandler> = new Map();
  private globalHandlers: Set<MessageHandler> = new Set();
  private lastReqId = 1000;

  private constructor() {}

  public static getInstance(): MessageRouter {
    if (!MessageRouter.instance) {
      MessageRouter.instance = new MessageRouter();
    }
    return MessageRouter.instance;
  }

  public getNextReqId(): number {
    this.lastReqId++;
    return this.lastReqId;
  }

  public registerReqIdHandler(reqId: number, handler: MessageHandler) {
    this.reqIdHandlers.set(reqId, handler);
  }

  public unregisterReqIdHandler(reqId: number) {
    this.reqIdHandlers.delete(reqId);
  }

  public registerGlobalHandler(handler: MessageHandler) {
    this.globalHandlers.add(handler);
  }

  public unregisterGlobalHandler(handler: MessageHandler) {
    this.globalHandlers.delete(handler);
  }

  public routeMessage(messageStr: string) {
    let data: any;
    try {
      data = JSON.parse(messageStr);
    } catch (e) {
      console.error('[MessageRouter] Failed to parse message:', e);
      return;
    }

    // 1. Route by transaction req_id matching
    if (data.req_id !== undefined && data.req_id !== null) {
      const numericReqId = Number(data.req_id);
      const handler = this.reqIdHandlers.get(numericReqId);
      if (handler) {
        try {
          handler(data);
        } catch (e) {
          console.error(`[MessageRouter] Error in handler for req_id ${numericReqId}:`, e);
        }
      }
    }

    // 2. Forward to registered global listeners (e.g. tick stream feeds)
    this.globalHandlers.forEach(handler => {
      try {
        handler(data);
      } catch (e) {
        console.error('[MessageRouter] Error in global message handler:', e);
      }
    });
  }

  public rejectAllPending(reason: string = 'WebSocket disconnected') {
    const handlers = Array.from(this.reqIdHandlers.entries());
    this.reqIdHandlers.clear();
    handlers.forEach(([reqId, handler]) => {
      try {
        handler({ error: { message: reason }, req_id: reqId });
      } catch (e) {
        console.error(`[MessageRouter] Error rejecting handler for req_id ${reqId}:`, e);
      }
    });
  }

  public clear() {
    this.rejectAllPending('Router cleared');
    this.globalHandlers.clear();
  }
}
