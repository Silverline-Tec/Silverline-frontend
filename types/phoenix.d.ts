declare module 'phoenix' {
  type ReceiveStatus = 'ok' | 'error' | 'timeout';

  export class Socket {
    constructor(endpoint: string, options?: Record<string, unknown>);
    connect(params?: Record<string, unknown>): void;
    disconnect(callback?: () => void, code?: number, reason?: string): void;
    channel(topic: string, params?: Record<string, unknown>): Channel;
    onOpen(callback: () => void): void;
    onClose(callback: () => void): void;
    onError(callback: (error?: unknown) => void): void;
  }

  export class Channel {
    join(timeout?: number): Push;
    leave(timeout?: number): Push;
    on(event: string, callback: (payload: never) => void): number;
  }

  export class Push {
    receive(status: ReceiveStatus, callback: (payload?: unknown) => void): Push;
  }
}
