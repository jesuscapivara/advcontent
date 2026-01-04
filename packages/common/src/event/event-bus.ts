import { Event } from "./event";
import { ListenerObject } from "./event-listener";

interface EventBus {
  emit(event: Event): Promise<void>;
  registerListener(listener: ListenerObject): void;
}

export type { EventBus };
