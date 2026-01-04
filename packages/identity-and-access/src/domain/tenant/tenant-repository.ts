import { Result } from "@org/common/result";

import {
  TenantInUseError,
  TenantNotFoundError,
  TenantSlugInUseError,
} from "./errors";
import { Slug } from "./slug";
import { Tenant } from "./tenant";

interface TenantRepository {
  add(tenant: Tenant): Promise<void>;
  save(tenant: Tenant): Promise<void>;
  slugExists(slug: Slug): Promise<boolean>;
  isUnique(
    tenant: Tenant,
  ): Promise<Result<boolean, TenantInUseError | TenantSlugInUseError>>;
  nextIdentity(): string;
  getById(id: string): Promise<Result<Tenant, TenantNotFoundError>>;
  getBySlug(slug: Slug): Promise<Result<Tenant, TenantNotFoundError>>;
}

export type { TenantRepository };
