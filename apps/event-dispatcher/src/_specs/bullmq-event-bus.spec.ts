import IORedis from "ioredis";

import { Event, EventListener } from "@org/common/event";
import { Logger } from "@org/common/logger";
import { sleep, TestUtils } from "@org/common/utils";

import { BullMQEventBus } from "../bullmq-event-bus";

class EventExample extends Event {
  constructor() {
    super({ name: "EventExample", payload: {}, tenantId: "any_tenant" });
  }
}

class ExampleListener extends EventListener {
  static listenerName = "ExampleListener";
  static eventName = "EventExample";

  execute(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}

const eventExample = new EventExample();

describe("BullMQEventBus", () => {
  let connection: IORedis;

  beforeAll(() => {
    connection = new IORedis();
  });

  afterAll(async () => {
    await connection.quit();
  });

  afterEach(async () => {
    await connection.flushdb();
  });

  it("should register a Listener correctly", async () => {
    const sut = new BullMQEventBus(connection, TestUtils.mockClass<Logger>({}));

    sut.registerListener(ExampleListener.asObject());

    await sleep(200);

    const [queue] = await connection.keys(
      `*${ExampleListener.createQueueName()}*`,
    );
    expect(queue).toBeTruthy();
  });

  it("should throw when registering duplicated Listener", async () => {
    const sut = new BullMQEventBus(connection, TestUtils.mockClass<Logger>({}));
    sut.registerListener(ExampleListener.asObject());

    await expect(
      sut.registerListener(ExampleListener.asObject()),
    ).rejects.toThrow();
  });

  it("should emit Event correctly", async () => {
    const sut = new BullMQEventBus(connection, TestUtils.mockClass<Logger>({}));

    sut.registerListener(ExampleListener.asObject());

    await sleep(200);

    await sut.emit(eventExample);

    await sleep(200);

    const [queue] = await connection.keys(
      `*${ExampleListener.createQueueName()}*`,
    );
    expect(queue).toBeTruthy();
  });

  it("should throw when emitting an Event not registered", async () => {
    const sut = new BullMQEventBus(connection, TestUtils.mockClass<Logger>({}));

    await expect(sut.emit(eventExample)).rejects.toThrow();
  });
});
