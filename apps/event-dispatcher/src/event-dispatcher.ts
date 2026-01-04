import { EventBus, EventRepository } from "@org/common/event";
import { Logger } from "@org/common/logger";
import { ArrayUtils, sleep } from "@org/common/utils";

type Deps = {
  eventRepository: EventRepository;
  eventBus: EventBus;
  logger: Logger;
};

class EventDispatcher {
  private running = false;

  constructor(private deps: Deps) {}

  private async dispatchEvents() {
    const events = await this.deps.eventRepository.nextPending(25);

    await ArrayUtils.runInBatches(
      { array: events, batchSize: 5 },
      async (event) => {
        await this.deps.eventBus.emit(event);
        await this.deps.eventRepository.markAsDispatched(event.id);
      },
    );
  }

  private async loop() {
    while (this.running) {
      try {
        await this.dispatchEvents();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        this.deps.logger.error({ message: e.message, payload: e });
      }
      await sleep(500);
    }
  }

  start() {
    if (this.running) return;

    this.running = true;
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.loop();
  }

  stop() {
    this.running = false;
  }
}

export { EventDispatcher };
