import { Event, EventBus, EventRepository } from "@org/common/event";
import { Logger } from "@org/common/logger";
import { sleep, TestUtils } from "@org/common/utils";

import { EventDispatcher } from "../event-dispatcher";

class SampleEvent extends Event {}

const sampleEvent1 = new SampleEvent({
  id: "any_event_id",
  name: "sample_event_1",
  payload: {},
  tenantId: "any_tenant",
});

const createSut = () => {
  const eventRepository = TestUtils.mockClass<EventRepository>({
    add: jest.fn(),
    markAsDispatched: jest.fn(),
    nextPending: jest.fn().mockResolvedValue([sampleEvent1]),
  });

  const eventBus = TestUtils.mockClass<EventBus>({
    emit: jest.fn(),
    registerListener: jest.fn(),
  });

  const logger = TestUtils.mockClass<Logger>({ error: jest.fn() });

  const sut = new EventDispatcher({ eventRepository, eventBus, logger });

  return { sut, eventRepository, eventBus };
};

describe("EventDispatcher", () => {
  it("should dispatch Events", async () => {
    const { sut, eventBus, eventRepository } = createSut();
    sut.start();
    await sleep(10);
    sut.stop();
    await sleep(10);

    expect(eventBus.emit).toHaveBeenCalledWith(sampleEvent1);
    expect(eventRepository.markAsDispatched).toHaveBeenCalledWith(
      sampleEvent1.id,
    );
  });

  it("should stop running", async () => {
    const { sut, eventBus } = createSut();

    sut.start();
    await sleep(10);
    expect(eventBus.emit).toHaveBeenCalledTimes(1);
    sut.stop();
    await sleep(10);
    expect(eventBus.emit).toHaveBeenCalledTimes(1);
  });
});
