import { FastifyInstance } from "fastify";

import { env as _env } from "@org/common/env";
import { LoggerFactory } from "@org/common/event";
import { MongoTenantRepository } from "@org/identity-and-access/tenant";

import { CreatePlanController } from "./controllers/create-plan-controller";
import { CreateTenantController } from "./controllers/create-tenant-controller";
import { EditPlanController } from "./controllers/edit-plan-controller";
import { GetAllPlansController } from "./controllers/get-all-plans-controller";
import { VerifyAccountController } from "./controllers/verify-account-controller";
import { CompleteOnboardingController } from "./controllers/complete-onboarding-controller";
import { CreateDraftPostController } from "./controllers/marketing/create-draft-post-controller";
import { GetEditorialFeedController } from "./controllers/marketing/get-editorial-feed-controller";
import { GetTenantBrandingController } from "./controllers/get-tenant-branding-controller";
import { detectTenantMiddleware } from "./middlewares/detect-tenant";
import { errorHandlerMiddleware } from "./middlewares/error-handler";

const registerRoutes = (server: FastifyInstance, env = _env) => {
  server.setErrorHandler(
    errorHandlerMiddleware(LoggerFactory.createDefault(env))
  );

  // ==================System Admin Routes==================
  server.register(
    (systemRoutes) => {
      systemRoutes.post("/plans", (request, reply) =>
        new CreatePlanController(request, reply, env).handle()
      );

      systemRoutes.put("/plans", (request, reply) =>
        new EditPlanController(request, reply, env).handle()
      );

      systemRoutes.get("/plans", (request, reply) =>
        new GetAllPlansController(request, reply, env).handle()
      );
    },
    { prefix: "/api/v1/system" }
  );
  // ===================================================

  // ==================Tenant Routes==================
  server.register(
    (routes) => {
      const tenantRepository = new MongoTenantRepository({
        tenantId: "system",
        env,
      });

      routes.addHook("preHandler", (request, reply) =>
        detectTenantMiddleware(request, reply, tenantRepository, env)
      );

      routes.post("/tenants", (request, reply) =>
        new CreateTenantController(request, reply, env).handle()
      );

      routes.post("/accounts-verification/verify-account", (request, reply) =>
        new VerifyAccountController(request, reply, env).handle()
      );

      routes.post("/onboarding/complete", (request, reply) =>
        new CompleteOnboardingController(request, reply, env).handle()
      );

      routes.get("/tenant/branding", (request, reply) =>
        new GetTenantBrandingController(request, reply, env).handle()
      );
    },
    { prefix: "/api/v1" }
  );
  // ===================================================

  // ==================Marketing Routes==================
  server.register(
    (marketingRoutes) => {
      const tenantRepository = new MongoTenantRepository({
        tenantId: "system",
        env,
      });

      marketingRoutes.addHook("preHandler", (request, reply) =>
        detectTenantMiddleware(request, reply, tenantRepository, env)
      );

      marketingRoutes.post("/posts/draft", (request, reply) =>
        new CreateDraftPostController(request, reply, env).handle()
      );

      marketingRoutes.get("/feed", (request, reply) =>
        new GetEditorialFeedController(request, reply, env).handle()
      );

      // Futuro: Rota para listar o calendário
      // marketingRoutes.get("/posts", ...);
    },
    { prefix: "/api/v1/marketing" }
  );
  // ===================================================
};

export { registerRoutes };
