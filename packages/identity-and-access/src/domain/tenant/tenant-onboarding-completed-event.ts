import { Event, EventProps } from "@org/common/event";

import { ExpertiseArea, ToneOfVoice } from "./professional-profile";

type Payload = {
  tenantId: string;
  expertiseAreas: ExpertiseArea[];
  toneOfVoice: ToneOfVoice;
};

type Props = EventProps<Payload>;

class TenantOnboardingCompletedEvent extends Event<Payload> {
  static name = "iam.tenant.onboarding_completed_event";

  constructor(props: Props) {
    super(props);
  }

  static create(payload: Payload) {
    return new TenantOnboardingCompletedEvent({
      payload,
      name: this.name,
      tenantId: payload.tenantId,
    });
  }
}

export { TenantOnboardingCompletedEvent };
