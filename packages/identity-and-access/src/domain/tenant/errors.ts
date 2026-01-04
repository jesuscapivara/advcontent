import { DomainError } from "@org/common/error";

import { Slug } from "./slug";

class TenantSlugInUseError extends DomainError {
  constructor(slug: Slug) {
    super(
      `The following Slug is already being used. Slug = ${slug.value}`,
      "iam.tenant.tenant_slug_in_use_error",
    );
  }
}

class TenantInUseError extends DomainError {
  constructor(email: string) {
    super(
      `The following email already has a Tenant registered. Email = ${email}`,
      "iam.tenant.tenant_slug_in_use_error",
    );
  }
}

class TenantNotFoundError extends DomainError {
  constructor(tenantId: string) {
    super(
      `The following Tenant was not found. Tenant = ${tenantId}`,
      "iam.tenant.tenant_not_found_error",
    );
  }
}

export { TenantSlugInUseError, TenantNotFoundError, TenantInUseError };
