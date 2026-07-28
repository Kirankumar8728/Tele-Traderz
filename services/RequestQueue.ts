// RequestQueue.ts

export class RequestQueue {
  private static instance: RequestQueue | null = null;
  private queue: any[] = [];

  private constructor() {}

  public static getInstance(): RequestQueue {
    if (!RequestQueue.instance) {
      RequestQueue.instance = new RequestQueue();
    }
    return RequestQueue.instance;
  }

  public enqueue(request: any) {
    console.log('[RequestQueue] Enqueue request:', request);
    this.queue.push(request);
  }

  public drain(sender: (request: any) => void) {
    if (this.queue.length === 0) return;
    console.log(`[RequestQueue] Draining ${this.queue.length} requests`);
    const requestsToProcess = [...this.queue];
    this.queue = [];
    requestsToProcess.forEach(req => {
      try {
        sender(req);
      } catch (e) {
        console.error('[RequestQueue] Error sending queued request, re-queueing:', e);
        this.queue.push(req);
      }
    });
  }

  public clear() {
    this.queue = [];
  }

  public getLength(): number {
    return this.queue.length;
  }
}
