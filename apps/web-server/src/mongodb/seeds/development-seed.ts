/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ObjectId } from "mongodb";

import { env } from "@org/common/env";
import { Currency } from "@org/common/money";
import { MongoConnection } from "@org/common/mongo";
import { RoleType } from "@org/identity-and-access/role";
import { TenantSchema, TenantStatus } from "@org/identity-and-access/tenant";
import {
  HashPassword,
  Password,
  UserSchema,
} from "@org/identity-and-access/user";
import { BillingCycleType, PlanSchema } from "@org/subscription/catalog";

const developmentSeed = async () => {
  console.log("Seeding the database with development seed");
  await MongoConnection.getInstance().connect(env.database.uri);

  const db = MongoConnection.getInstance().getDb(env.database.name);

  // Cleanup existing data
  await db
    .collection(MongoConnection.Collections.Tenants)
    .deleteMany({ _id: "testing" as any });
  await db
    .collection(MongoConnection.Collections.Users)
    .deleteMany({ tenantId: "testing" });
  await db.collection(MongoConnection.Collections.PlansCatalog).deleteMany({});

  const ownerId = new ObjectId();

  const tenant: TenantSchema = {
    _id: "testing",
    name: "Development",
    owner: { ownerId, email: "testing@email.com" },
    slug: "testing",
    status: TenantStatus.Active,
    subscription: {
      status: "pending_setup",
      subscriptionId: undefined,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 0,
    contactInformation: undefined,
  };

  const role = await db
    .collection(MongoConnection.Collections.Roles)
    .findOne({ tenantId: "system", type: RoleType.TenantOwner });

  const owner: UserSchema = {
    tenantId: "testing",
    _id: ownerId,
    name: "Owner",
    email: "owner@owner.com",
    roleId: role!._id,
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 0,
    hashPassword: HashPassword.create({
      password: new Password("Password123!"),
    }).value,
  };

  // Create sample plans for the catalog
  const trialPlan: PlanSchema = {
    _id: new ObjectId(),
    name: "Free Trial",
    description: "Start your journey with a 14-day free trial",
    price: {
      amount: 0,
      currency: Currency.BRL,
    },
    features: [
      {
        code: "view_role",
        name: "View Roles",
        description:
          "Ability to view and manage user roles within the organization",
      },
    ],
    billingCycles: [
      {
        durationInDays: 14,
        discount: 1.0,
        isDefault: true,
        type: BillingCycleType.Weekly,
      },
    ],
    isTrial: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 0,
  };

  const basicPlan: PlanSchema = {
    _id: new ObjectId(),
    name: "Basic Plan",
    description:
      "Perfect for small teams getting started with project management",
    price: {
      amount: 29.99,
      currency: Currency.BRL,
    },
    features: [
      {
        code: "view_role",
        name: "View Roles",
        description:
          "Ability to view and manage user roles within the organization",
      },
      {
        code: "create_role",
        name: "Create Roles",
        description: "Create custom roles with specific permissions",
      },
    ],
    billingCycles: [
      {
        durationInDays: 30,
        discount: 1.0,
        isDefault: true,
        type: "monthly",
      },
      {
        durationInDays: 365,
        discount: 0.8,
        isDefault: false,
        type: "yearly",
      },
    ],
    isTrial: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 0,
  };

  const professionalPlan: PlanSchema = {
    _id: new ObjectId(),
    name: "Professional Plan",
    description: "Advanced features for growing teams and organizations",
    price: {
      amount: 79.99,
      currency: Currency.BRL,
    },
    features: [
      {
        code: "view_role",
        name: "View Roles",
        description:
          "Ability to view and manage user roles within the organization",
      },
      {
        code: "create_role",
        name: "Create Roles",
        description: "Create custom roles with specific permissions",
      },
      {
        code: "update_role",
        name: "Update Roles",
        description: "Modify existing roles and their permissions",
      },
    ],
    billingCycles: [
      {
        durationInDays: 30,
        discount: 1.0,
        isDefault: true,
        type: "monthly",
      },
      {
        durationInDays: 365,
        discount: 0.75,
        isDefault: false,
        type: "yearly",
      },
    ],
    isTrial: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 0,
  };

  const enterprisePlan: PlanSchema = {
    _id: new ObjectId(),
    name: "Enterprise Plan",
    description:
      "Complete solution for large organizations with advanced security",
    price: {
      amount: 199.99,
      currency: Currency.BRL,
    },
    features: [
      {
        code: "view_role",
        name: "View Roles",
        description:
          "Ability to view and manage user roles within the organization",
      },
      {
        code: "create_role",
        name: "Create Roles",
        description: "Create custom roles with specific permissions",
      },
      {
        code: "update_role",
        name: "Update Roles",
        description: "Modify existing roles and their permissions",
      },
      {
        code: "delete_role",
        name: "Delete Roles",
        description: "Remove roles that are no longer needed",
      },
    ],
    billingCycles: [
      {
        durationInDays: 30,
        discount: 1.0,
        isDefault: true,
        type: "monthly",
      },
      {
        durationInDays: 365,
        discount: 0.7,
        isDefault: false,
        type: "yearly",
      },
    ],
    isTrial: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 0,
  };

  // Insert data
  await db
    .collection(MongoConnection.Collections.Tenants)
    .insertOne(tenant as any);
  await db
    .collection(MongoConnection.Collections.Users)
    .insertOne(owner as any);
  await db
    .collection(MongoConnection.Collections.PlansCatalog)
    .insertMany([
      trialPlan,
      basicPlan,
      professionalPlan,
      enterprisePlan,
    ] as any);

  console.log("Done");
  await MongoConnection.getInstance().disconnect();
};

// eslint-disable-next-line @typescript-eslint/no-floating-promises
developmentSeed();
