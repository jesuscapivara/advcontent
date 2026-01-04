import { Event } from "./event";

interface EventRepository {
  add(event: Event): Promise<void>;
  nextPending(quantity: number): Promise<Event[]>;
  markAsDispatched(eventId: string): Promise<void>;
}

export type { EventRepository };
