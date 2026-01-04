import { FastifyReply, FastifyRequest } from "fastify";

import { Env } from "@org/common/env";
import {
  Slug,
  TenantNotFoundError,
  TenantRepository,
} from "@org/identity-and-access/tenant";

const detectTenantMiddleware = async (
  request: FastifyRequest,
  reply: FastifyReply,
  tenantRepository: TenantRepository,
  env: Env,
) => {
  const host = request.headers.host || "";
  let slugString = host.split(".")[0] || "";
  if (env.environment === "development") {
    slugString = "testing";
  }
  const slug = new Slug(slugString);

  if (slug.value === "system") {
    throw new TenantNotFoundError(slug.value);
  }

  const tenant = await tenantRepository.getBySlug(slug);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
  (request as any).tenant = tenant.getDataOrThrow();
};

export { detectTenantMiddleware };
