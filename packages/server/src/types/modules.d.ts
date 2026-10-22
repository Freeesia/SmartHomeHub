declare module "castv2-client";
declare module "voicetext";
declare module "ps4-waker" {
  export interface Socket {
    login(pin: string, callback: (err: unknown) => void): void;
  }
  export class Device {
    constructor(options?: unknown);
    readonly isConnected: boolean;
    getDeviceStatus(): Promise<Record<string, any>>;
    turnOn(): Promise<void>;
    turnOff(): Promise<void>;
    sendKeys(keys: string[]): Promise<void>;
    startTitle(titleId: string): Promise<void>;
    openSocket(): Promise<Socket>;
  }
}
