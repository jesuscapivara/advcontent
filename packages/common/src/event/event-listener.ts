import { Event } from "./event";

type ListenerObject = {
  listenerName: string;
  eventName: string;
  queueName: string;
};

abstract class EventListener {
  static listenerName: string;
  static eventName: string;

  abstract execute(event: Event): Promise<void>;

  static createQueueName() {
    return `${this.eventName}.${this.listenerName}`;
  }

  static asObject(): ListenerObject {
    return {
      listenerName: this.listenerName,
      eventName: this.eventName,
      queueName: this.createQueueName(),
    };
  }
}

export { EventListener };
export type { ListenerObject };
