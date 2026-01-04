import { Result } from "@org/common/result";
import { TestUtils } from "@org/common/utils";

import { AccountVerificationStatus } from "../../domain/account-verification/account-verification";
import { AccountVerificationRepository } from "../../domain/account-verification/account-verification-repository";
import { AccountVerificationService } from "../../domain/account-verification/account-verification-service";
import { RoleType } from "../../domain/role/role-type";
import { TenantNotFoundError } from "../../domain/tenant/errors";
import { Tenant } from "../../domain/tenant/tenant";
import { TenantRepository } from "../../domain/tenant/tenant-repository";
import { TenantStatus } from "../../domain/tenant/tenant-status";
import { UserNotFoundError } from "../../domain/user/errors";
import { User } from "../../domain/user/user";
import { UserRepository } from "../../domain/user/user-repository";
import { UserStatus } from "../../domain/user/user-status";
import { RequestAccountVerificationUseCase } from "../request-account-verification/request-account-verification";

const createSut = () => {
  const tenant1 = Tenant.create(
    "any_tenant_id",
    { ownerId: "any_owner_id", email: "any_tenant_id@email.com" },
    "Default",
    "default",
  );
  const owner = new User({
    id: "any_owner_id",
    email: "email@email.com",
    name: "Owner",
    role: {
      roleId: "any_role_id",
      type: RoleType.TenantOwner,
      permissions: [],
    },
    status: UserStatus.PendingForEmailConfirmation,
    tenantId: "any_tenant_id",
  });

  const userRepository = TestUtils.mockClass<UserRepository>({
    getById: jest.fn().mockResolvedValue(Result.ok(owner)),
  });

  const tenantRepository = TestUtils.mockClass<TenantRepository>({
    getById: jest.fn().mockResolvedValue(Result.ok(tenant1)),
  });

  const accountVerificationRepository =
    TestUtils.mockClass<AccountVerificationRepository>({
      hasExisting: jest.fn().mockResolvedValue(false),
      add: jest.fn(),
      nextIdentity: () => "any_id",
    });

  const accountVerificationService =
    TestUtils.mockClass<AccountVerificationService>({
      sendEmailVerification: jest.fn(),
    });

  const sut = new RequestAccountVerificationUseCase({
    accountVerificationRepository,
    accountVerificationService,
    tenantRepository,
    userRepository,
  });

  return {
    sut,
    userRepository,
    tenantRepository,
    accountVerificationRepository,
    accountVerificationService,
    tenant1,
    owner,
  };
};

describe("RequestAccountVerificationUseCase", () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2025-01-01T00:00:00.000Z"));
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it("should request account verification correctly", async () => {
    const {
      sut,
      accountVerificationRepository,
      accountVerificationService,
      owner,
      tenant1,
    } = createSut();

    await sut.execute({ tenantId: tenant1.id, userId: owner.id });

    expect(accountVerificationRepository.add).toHaveBeenCalledWith({
      id: "any_id",
      tenantId: "any_tenant_id",
      userId: "any_owner_id",

      status: AccountVerificationStatus.Pending,
      expiresAt: new Date("2025-01-08T00:00:00.000Z"),
      hashToken: {
        value: expect.any(String),
      },

      version: 0,
      updatedAt: new Date("2025-01-01T00:00:00.000Z"),
      createdAt: new Date("2025-01-01T00:00:00.000Z"),
    });

    expect(
      accountVerificationService.sendEmailVerification,
    ).toHaveBeenCalledWith({
      from: "org@email.com",
      subject: "Verificacao de conta...",
      to: "email@email.com",
    });
  });

  it("should throw when Tenant was not found", async () => {
    const {
      sut,
      accountVerificationRepository,
      accountVerificationService,
      tenantRepository,
      owner,
      tenant1,
    } = createSut();
    const error = new TenantNotFoundError("any_tenant_id");
    tenantRepository.getById = jest.fn().mockResolvedValue(Result.fail(error));

    await expect(
      sut.execute({ tenantId: tenant1.id, userId: owner.id }),
    ).rejects.toThrow(error);

    expect(accountVerificationRepository.add).not.toHaveBeenCalled();
    expect(
      accountVerificationService.sendEmailVerification,
    ).not.toHaveBeenCalled();
  });

  it("should throw when User was not found", async () => {
    const {
      sut,
      accountVerificationRepository,
      accountVerificationService,
      userRepository,
      owner,
      tenant1,
    } = createSut();
    const error = new UserNotFoundError("any_owner_id");
    userRepository.getById = jest.fn().mockResolvedValue(Result.fail(error));

    await expect(
      sut.execute({ tenantId: tenant1.id, userId: owner.id }),
    ).rejects.toThrow(error);

    expect(accountVerificationRepository.add).not.toHaveBeenCalled();
    expect(
      accountVerificationService.sendEmailVerification,
    ).not.toHaveBeenCalled();
  });

  it("should do nothing when User already has requested account verification", async () => {
    const {
      sut,
      accountVerificationRepository,
      accountVerificationService,
      owner,
      tenant1,
    } = createSut();

    accountVerificationRepository.hasExisting = jest
      .fn()
      .mockResolvedValue(true);

    await sut.execute({ tenantId: tenant1.id, userId: owner.id });

    expect(accountVerificationRepository.add).not.toHaveBeenCalled();
    expect(
      accountVerificationService.sendEmailVerification,
    ).not.toHaveBeenCalled();
  });

  it("should do nothing when User or Tenant is already active", async () => {
    const {
      sut,
      accountVerificationRepository,
      accountVerificationService,
      userRepository,
      tenantRepository,
      owner,
      tenant1,
    } = createSut();
    owner.status = UserStatus.Active;
    tenant1.status = TenantStatus.Active;

    userRepository.getById = jest.fn().mockResolvedValue(Result.ok(owner));
    tenantRepository.getById = jest.fn().mockResolvedValue(Result.ok(tenant1));

    await sut.execute({ tenantId: tenant1.id, userId: owner.id });

    expect(accountVerificationRepository.add).not.toHaveBeenCalled();
    expect(
      accountVerificationService.sendEmailVerification,
    ).not.toHaveBeenCalled();
  });
});
