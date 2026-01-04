import z from "zod";

import { EventRepository } from "@org/common/event";
import { Result } from "@org/common/result";
import { TestUtils } from "@org/common/utils";

import { RoleRepository } from "../../domain/role/role-repository";
import {
  TenantInUseError,
  TenantSlugInUseError,
} from "../../domain/tenant/errors";
import { Slug } from "../../domain/tenant/slug";
import { Subscription } from "../../domain/tenant/subscription";
import { TenantRepository } from "../../domain/tenant/tenant-repository";
import { TenantStatus } from "../../domain/tenant/tenant-status";
import { ConfirmPasswordError } from "../../domain/user/errors";
import { HashPassword } from "../../domain/user/hash-password";
import { UserRepository } from "../../domain/user/user-repository";
import { UserStatus } from "../../domain/user/user-status";
import { roleFixture } from "../../utils/role-test/role-fixture";
import {
  CreateTenantInput,
  CreateTenantUseCase,
} from "../create-tenant/create-tenant";

const createSut = () => {
  const eventRepository = TestUtils.mockClass<EventRepository>({
    add: jest.fn(),
  });
  const roleRepository = TestUtils.mockClass<RoleRepository>({
    getSystemRole: jest.fn().mockResolvedValue(roleFixture.tenantOwner),
  });
  const tenantRepository = TestUtils.mockClass<TenantRepository>({
    add: jest.fn(),
    nextIdentity: () => "any_tenant_id",
    slugExists: jest.fn().mockResolvedValue(false),
    isUnique: jest.fn().mockResolvedValue(Result.ok(true)),
  });
  const userRepository = TestUtils.mockClass<UserRepository>({
    add: jest.fn(),
    nextIdentity: () => "any_user_id",
  });

  const sut = new CreateTenantUseCase({
    eventRepository,
    roleRepository,
    tenantRepository,
    userRepository,
  });

  return {
    sut,
    eventRepository,
    roleRepository,
    tenantRepository,
    userRepository,
  };
};

describe("CreateTenantUseCase", () => {
  it("should create a Tenant correctly", async () => {
    const { sut, tenantRepository, userRepository, eventRepository } =
      createSut();

    const input: CreateTenantInput = {
      tenantName: "any_tenant_name",
      tenantSlug: "any-tenant-slug",
      ownerEmail: "any_email@email.com",
      ownerName: "any_full_name",
      password: "Password123@",
      confirmPassword: "Password123@",
    };

    await sut.execute(input);

    expect(tenantRepository.add).toHaveBeenCalledWith({
      id: "any_tenant_id",
      owner: { email: "any_email@email.com", ownerId: "any_user_id" },
      name: "any_tenant_name",
      slug: {
        value: "any-tenant-slug",
      },
      contactAddress: undefined,
      updatedAt: expect.any(Date),
      createdAt: expect.any(Date),
      status: TenantStatus.PendingForEmailConfirmation,
      subscription: {
        status: Subscription.Status.PendingSetup,
        subscriptionId: undefined,
      },
      version: 0,
    });

    expect(userRepository.add).toHaveBeenCalledWith({
      tenantId: "any_tenant_id",
      id: "any_user_id",
      role: {
        roleId: roleFixture.tenantOwner.id,
        type: roleFixture.tenantOwner.type,
        permissions: roleFixture.tenantOwner.permissions,
      },
      email: "any_email@email.com",
      name: "any_full_name",
      hashPassword: expect.any(HashPassword),
      status: UserStatus.PendingForEmailConfirmation,
      updatedAt: expect.any(Date),
      createdAt: expect.any(Date),
      version: 0,
    });

    expect(eventRepository.add).toHaveBeenCalledWith({
      id: expect.any(String),
      tenantId: "any_tenant_id",
      name: "iam.tenant.tenant_created_event",
      occurredAt: expect.any(Date),
      payload: {
        tenantId: "any_tenant_id",
        email: "any_email@email.com",
        name: "any_full_name",
        ownerId: "any_user_id",
      },
    });
  });

  it("should throw when Tenant slug already exist", async () => {
    const { sut, tenantRepository, userRepository, eventRepository } =
      createSut();
    tenantRepository.isUnique = jest
      .fn()
      .mockResolvedValue(
        Result.fail(new TenantSlugInUseError(new Slug("any-tenant-slug"))),
      );

    const input: CreateTenantInput = {
      tenantName: "any_tenant_name",
      tenantSlug: "any-tenant-slug",
      ownerEmail: "any_email@email.com",
      ownerName: "any_full_name",
      password: "Password123@",
      confirmPassword: "Password123@",
    };

    await expect(sut.execute(input)).rejects.toThrow(
      new TenantSlugInUseError(new Slug(input.tenantSlug)),
    );
    expect(userRepository.add).not.toHaveBeenCalled();
    expect(eventRepository.add).not.toHaveBeenCalled();
    expect(tenantRepository.add).not.toHaveBeenCalled();
  });

  it("should throw when Owner already has a Tenant", async () => {
    const { sut, tenantRepository, userRepository, eventRepository } =
      createSut();
    tenantRepository.isUnique = jest
      .fn()
      .mockResolvedValue(Result.fail(new TenantInUseError("email@email.com")));

    const input: CreateTenantInput = {
      tenantName: "any_tenant_name",
      tenantSlug: "any-tenant-slug",
      ownerEmail: "any_email@email.com",
      ownerName: "any_full_name",
      password: "Password123@",
      confirmPassword: "Password123@",
    };

    await expect(sut.execute(input)).rejects.toThrow(
      new TenantInUseError("email@email.com"),
    );
    expect(userRepository.add).not.toHaveBeenCalled();
    expect(eventRepository.add).not.toHaveBeenCalled();
    expect(tenantRepository.add).not.toHaveBeenCalled();
  });

  it("should throw when User fields are incorrect", async () => {
    const { sut, tenantRepository, userRepository, eventRepository } =
      createSut();

    const input: CreateTenantInput = {
      tenantName: "any_tenant_name",
      tenantSlug: "any-tenant-slug",
      ownerEmail: "any_email@email.com",
      ownerName: "any_full_name",
      password: "Password123@",
      confirmPassword: "Password123@",
    };

    await expect(
      sut.execute({ ...input, confirmPassword: input.password + "a" }),
    ).rejects.toThrow(new ConfirmPasswordError());

    await expect(
      sut.execute({ ...input, password: "", confirmPassword: "" }),
    ).rejects.toThrow(z.ZodError);

    await expect(
      sut.execute({ ...input, ownerEmail: "", ownerName: "" }),
    ).rejects.toThrow(z.ZodError);

    expect(userRepository.add).not.toHaveBeenCalled();
    expect(eventRepository.add).not.toHaveBeenCalled();
    expect(tenantRepository.add).not.toHaveBeenCalled();
  });

  it("should throw when Tenant fields are incorrect", async () => {
    const { sut, tenantRepository, userRepository, eventRepository } =
      createSut();

    const input: CreateTenantInput = {
      tenantName: "any_tenant_name",
      tenantSlug: "any-tenant-slug",
      ownerEmail: "any_email@email.com",
      ownerName: "any_full_name",
      password: "Password123@",
      confirmPassword: "Password123@",
    };

    await expect(
      sut.execute({ ...input, tenantName: "", tenantSlug: "" }),
    ).rejects.toThrow(z.ZodError);

    await expect(
      sut.execute({ ...input, tenantName: "", tenantSlug: "a-." }),
    ).rejects.toThrow(z.ZodError);

    expect(userRepository.add).not.toHaveBeenCalled();
    expect(eventRepository.add).not.toHaveBeenCalled();
    expect(tenantRepository.add).not.toHaveBeenCalled();
  });
});
