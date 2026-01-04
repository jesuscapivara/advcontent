import { v7 } from "uuid";

type Props<Payload extends object> = {
  id?: string;
  tenantId: string;
  occurredAt?: Date;
  name: string;
  payload: Payload;
};

class Event<Payload extends object = object> {
  static name: string;

  id: string;

  name: string;

  tenantId: string;

  occurredAt: Date;

  payload: Payload;

  constructor(props: Props<Payload>) {
    this.id = props.id || v7();
    this.tenantId = props.tenantId;
    this.occurredAt = props.occurredAt || new Date();
    this.name = props.name;
    this.payload = props.payload;
  }
}

export { Event };
export type { Props as EventProps };
