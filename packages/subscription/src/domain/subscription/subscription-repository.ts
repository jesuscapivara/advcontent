import { Subscription } from "./subscription";

interface SubscriptionRepository {
  add(subscription: Subscription): Promise<void>;
  save(subscription: Subscription): Promise<void>;
  nextIdentity(): string;
}

export type { SubscriptionRepository };
