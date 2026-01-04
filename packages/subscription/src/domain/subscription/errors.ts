import { DomainError } from "@org/common/error";
import { PermissionCode } from "@org/identity-and-access/permission";

class SubscriptionExpiredError extends DomainError {
  constructor() {
    super(
      `Subscription has expired`,
      "subscription.subscription.subscription_expired_error",
    );
  }
}

class FeatureNotAvailableError extends DomainError {
  constructor(code: PermissionCode) {
    super(
      `Feature with code ${code} is not included in the plan`,
      "subscription.subscription.feature_not_available_error",
    );
  }
}

export { SubscriptionExpiredError, FeatureNotAvailableError };
