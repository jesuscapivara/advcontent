import { Event, EventProps } from "@org/common/event";

type Payload = {
  tenantId: string;
  ownerId: string;
  email: string;
  name: string;
};

type Props = EventProps<Payload>;

class TenantCreatedEvent extends Event<Payload> {
  static name = "iam.tenant.tenant_created_event";

  constructor(props: Props) {
    super(props);
  }

  static create(payload: Payload) {
    return new TenantCreatedEvent({
      payload,
      name: this.name,
      tenantId: payload.tenantId,
    });
  }
}

export { TenantCreatedEvent };
export type { Props as TenantCreatedEventProps };
