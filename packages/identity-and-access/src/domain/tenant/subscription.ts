enum SubscriptionStatus {
  Ready = "ready",
  PendingSetup = "pending_setup",
}

type Props = {
  status: SubscriptionStatus;
  subscriptionId?: string;
};

class Subscription {
  static Status = SubscriptionStatus;

  subscriptionId?: string;

  status: SubscriptionStatus;

  constructor(props: Props) {
    this.subscriptionId = props.subscriptionId;
    this.status = props.status;
  }
}

export { Subscription };
export type { Props as SubscriptionProps };
