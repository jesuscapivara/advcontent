import { DomainError } from "@org/common/error";
import { PermissionCode } from "@org/identity-and-access/permission";

class PermissionDuplicatedError extends DomainError {
  constructor(permissionCode: PermissionCode) {
    super(
      `The following Permission is duplicated on features list. Permission = ${permissionCode}`,
      "subscription.catalog.plan.permission_duplicated_error",
    );
  }
}

class PlanNotFoundErrorError extends DomainError {
  constructor(planId: string) {
    super(
      `The following Plan was not found. Plan = ${planId}`,
      "subscription.catalog.plan.plan_not_found_error",
    );
  }
}

class DuplicatedDefaultBillingCycleError extends DomainError {
  constructor() {
    super(
      "A Plan should have only one default Billing cycle",
      "subscription.catalog.plan.duplicated_default_billing_cycle_error",
    );
  }
}

class DefaultBillingCycleRequiredError extends DomainError {
  constructor() {
    super(
      "A Plan should have at least one default Billing cycle",
      "subscription.catalog.plan.default_billing_cycle_required_error",
    );
  }
}

export {
  PermissionDuplicatedError,
  PlanNotFoundErrorError,
  DuplicatedDefaultBillingCycleError,
  DefaultBillingCycleRequiredError,
};
