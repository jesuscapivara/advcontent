import { ObjectId } from "mongodb";

import { EventSchema } from "@org/common/event";
import {
  CollectionType,
  TestingDatabase as TestingDb,
} from "@org/common/mongo";
import { AccountVerificationSchema } from "@org/identity-and-access/account-verification";
import { PermissionSchema } from "@org/identity-and-access/permission";
import { RoleSchema, RoleType } from "@org/identity-and-access/role";
import { TenantSchema, TenantStatus } from "@org/identity-and-access/tenant";
import { UserSchema } from "@org/identity-and-access/user";
import { PlanSchema } from "@org/subscription/catalog";
import { SubscriptionSchema } from "@org/subscription/subscription";
import { EditorialItemSchema } from "@org/marketing";

type Fixtures = {
  [CollectionType.Tenants]: TenantSchema[];
  [CollectionType.Users]: UserSchema[];
  [CollectionType.Roles]: RoleSchema[];
  [CollectionType.Events]: EventSchema[];
  [CollectionType.AccountsVerification]: AccountVerificationSchema[];
  [CollectionType.Permissions]: PermissionSchema[];
  [CollectionType.PlansCatalog]: PlanSchema[];
  [CollectionType.Subscriptions]: SubscriptionSchema[];
  [CollectionType.EditorialItems]: EditorialItemSchema[];
};

class TestingDatabase extends TestingDb<Fixtures> {
  constructor() {
    super();
    const tenantId = "system";

    const permissions: PermissionSchema[] = [
      {
        _id: new ObjectId(),
        tenantId,
        code: "create_role",
        name: "Criar Role",
        description: "Permite criar Roles personalizados",
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 0,
      },
      {
        _id: new ObjectId(),
        tenantId,
        code: "delete_role",
        name: "Deletar Role",
        description: "Permite deletar Roles personalizados",
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 0,
      },
      {
        _id: new ObjectId(),
        tenantId,
        code: "update_role",
        name: "Modificar Role",
        description: "Permite modificar Roles personalizados",
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 0,
      },
      {
        _id: new ObjectId(),
        tenantId,
        code: "view_role",
        name: "Visualizar Role",
        description: "Permite visualizar o gerenciador de Roles",
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 0,
      },
    ];

    const fixtures: Fixtures = {
      tenants: [
        {
          _id: "system",
          name: "System",
          owner: { ownerId: new ObjectId(), email: "system@email.com" },
          slug: "system",
          status: TenantStatus.Active,
          subscription: {
            status: "ready",
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 0,
        },
      ],
      roles: [
        {
          _id: this.createId(RoleType.TenantOwner),
          tenantId,
          name: "Administrador do Tenant",
          description:
            "Usuário principal do Tenant. Tem todas as permissões de administração.",
          type: "tenant_owner",
          permissions: permissions.map((p) => ({
            permissionId: p._id,
            code: p.code,
            name: p.name,
            description: p.description,
          })),
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 0,
        },
      ],
      events: [],
      users: [],
      accounts_verification: [],
      permissions,
      plans_catalog: [],
      subscriptions: [],
      marketing_editorial_items: [],
    };

    this.defaultFixtures = fixtures;
  }
}

export { TestingDatabase };
export type { Fixtures };
