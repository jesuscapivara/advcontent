/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { FastifyReply, FastifyRequest } from "fastify";
import { ObjectId } from "mongodb";

import { Env } from "@org/common/env";
import { Tenant } from "@org/identity-and-access/tenant";

export abstract class AbstractController<TBody = unknown> {
  constructor(
    protected readonly request: FastifyRequest,
    protected readonly reply: FastifyReply,
    protected readonly env: Env,
  ) {}

  abstract handle(): Promise<unknown>;

  protected get tenant(): Tenant {
    const tenant = (this.request as any).tenant;
    if (!tenant) {
      throw new Error(
        "Tenant não encontrado no request. Verifique o middleware.",
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return tenant;
  }

  protected get tenantId() {
    return new ObjectId(this.tenant.id);
  }

  protected get body(): TBody {
    return this.request.body as TBody;
  }
}
