import { ConnectionOptions, Queue } from "bullmq";

import { Event, EventBus, ListenerObject } from "@org/common/event";
import { Logger } from "@org/common/logger";
import { ArrayUtils } from "@org/common/utils";

export class BullMQEventBus implements EventBus {
  private listeners = new Map<string, Map<string, Queue>>();

  constructor(
    private connection: ConnectionOptions,
    private logger: Logger,
  ) {}

  registerListener({
    eventName,
    listenerName,
    queueName,
  }: ListenerObject): void {
    if (!this.listeners.get(eventName)) {
      this.listeners.set(eventName, new Map());
    }

    if (this.listeners.get(eventName)?.get(listenerName)) {
      throw new Error(
        `Following listener is already registered: Event = ${eventName} and Listener = ${listenerName}`,
      );
    }

    this.logger.info({
      message: `[Event Dispatcher] -- Registered Event = ${eventName} -- Listener = ${listenerName}`,
    });

    this.listeners.get(eventName)?.set(
      listenerName,
      new Queue(queueName, {
        connection: this.connection,
      }),
    );
  }

  async emit(event: Event): Promise<void> {
    const _event = this.listeners.get(event.name);
    if (!_event) {
      throw new Error(
        `There are no listeners registered for the following Event = ${event.name}`,
      );
    }

    const listeners = [..._event.entries()];

    await ArrayUtils.runInBatches(
      { array: listeners, batchSize: 5 },
      async ([_, queue]) => {
        await queue.add(event.name, event, {
          attempts: 5,
          backoff: {
            type: "exponential",
            delay: 2000,
          },
        });

        this.logger.info({
          message: `[Event Dispatcher] -- Dispatched Event = ${event.name} -- Listener = ${queue.name}`,
        });
      },
    );
  }
}
