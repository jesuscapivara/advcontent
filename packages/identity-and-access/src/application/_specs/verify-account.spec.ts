import { Result } from "@org/common/result";
import { TestUtils } from "@org/common/utils";

import {
  AccountVerification,
  AccountVerificationStatus,
} from "../../domain/account-verification/account-verification";
import { AccountVerificationRepository } from "../../domain/account-verification/account-verification-repository";
import { HashToken } from "../../domain/account-verification/hash-token";
import { Token } from "../../domain/account-verification/token";
import { RoleType } from "../../domain/role/role-type";
import { Tenant } from "../../domain/tenant/tenant";
import { TenantRepository } from "../../domain/tenant/tenant-repository";
import { TenantStatus } from "../../domain/tenant/tenant-status";
import { User } from "../../domain/user/user";
import { UserRepository } from "../../domain/user/user-repository";
import { UserStatus } from "../../domain/user/user-status";
import { VerifyAccountUseCase } from "../verify-account/verify-account";

const createSut = () => {
  const tenant = Tenant.create(
    "tenant_id",
    { ownerId: "owner_id", email: "tenant_id@email.com" },
    "Default",
    "default",
  );
  const user = new User({
    id: "owner_id",
    email: "email@email.com",
    name: "Owner",
    role: { roleId: "any_role", type: RoleType.TenantOwner, permissions: [] },
    status: UserStatus.PendingForEmailConfirmation,
    tenantId: "tenant_id",
  });

  const accountVerification = AccountVerification.create(
    "account_verification_id",
    "tenant_id",
    "owner_id",
    HashToken.fromToken(new Token("token")),
  );

  const accountVerificationRepository =
    TestUtils.mockClass<AccountVerificationRepository>({
      getByHashToken: jest
        .fn()
        .mockResolvedValue(Result.ok(accountVerification)),
      save: jest.fn(),
    });

  const userRepository = TestUtils.mockClass<UserRepository>({
    getById: jest.fn().mockResolvedValue(Result.ok(user)),
    save: jest.fn(),
  });

  const tenantRepository = TestUtils.mockClass<TenantRepository>({
    getById: jest.fn().mockResolvedValue(Result.ok(tenant)),
    save: jest.fn(),
  });

  const sut = new VerifyAccountUseCase({
    accountVerificationRepository,
    userRepository,
    tenantRepository,
  });

  return {
    sut,
    accountVerificationRepository,
    userRepository,
    tenantRepository,
    accountVerification,
    user,
    tenant,
  };
};

describe("VerifyAccountUseCase", () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2025-01-01T00:00:00.000Z"));
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it("should verify account and activate for tenant owner", async () => {
    const {
      sut,
      accountVerificationRepository,
      userRepository,
      tenantRepository,
      accountVerification,
    } = createSut();

    await sut.execute({ token: "token" });

    expect(accountVerificationRepository.getByHashToken).toHaveBeenCalledWith(
      accountVerification.hashToken,
    );

    expect(tenantRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "tenant_id",
        status: TenantStatus.Active,
      }),
    );

    expect(userRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "owner_id",
        status: UserStatus.Active,
      }),
    );

    expect(accountVerificationRepository.save).toHaveBeenCalledWith({
      id: "account_verification_id",
      tenantId: "tenant_id",
      userId: "owner_id",
      expiresAt: new Date("2025-01-08T00:00:00.000Z"),
      hashToken: { value: expect.any(String) },
      status: AccountVerificationStatus.Used,
      version: 0,
      createdAt: new Date("2025-01-01T00:00:00.000Z"),
      updatedAt: new Date("2025-01-01T00:00:00.000Z"),
    });
  });

  it("should verify account and activate for user", async () => {
    const {
      sut,
      accountVerificationRepository,
      userRepository,
      tenantRepository,
      user,
      accountVerification,
    } = createSut();

    user.assignRole({
      roleId: "another",
      type: RoleType.Custom,
      permissions: [],
    });
    user.id = "custom_id";
    userRepository.getById = jest.fn().mockResolvedValue(Result.ok(user));

    accountVerification.userId = "custom_id";
    accountVerificationRepository.getByHashToken = jest
      .fn()
      .mockResolvedValue(Result.ok(accountVerification));

    await sut.execute({ token: "token" });

    expect(tenantRepository.getById).not.toHaveBeenCalled();

    expect(userRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "custom_id",
        status: UserStatus.Active,
      }),
    );

    expect(accountVerificationRepository.save).toHaveBeenCalledWith({
      id: "account_verification_id",
      tenantId: "tenant_id",
      userId: "custom_id",
      expiresAt: new Date("2025-01-08T00:00:00.000Z"),
      hashToken: { value: expect.any(String) },
      status: AccountVerificationStatus.Used,
      version: 0,
      createdAt: new Date("2025-01-01T00:00:00.000Z"),
      updatedAt: new Date("2025-01-01T00:00:00.000Z"),
    });
  });

  it("should throw if token is expired", async () => {
    const {
      sut,
      accountVerificationRepository,
      tenantRepository,
      userRepository,
      accountVerification,
    } = createSut();

    accountVerification.expiresAt = new Date("2024-12-31T23:59:59.999Z");
    accountVerificationRepository.getByHashToken = jest
      .fn()
      .mockResolvedValue(Result.ok(accountVerification));

    await expect(sut.execute({ token: "token_value" })).rejects.toThrow();
    expect(tenantRepository.save).not.toHaveBeenCalled();
    expect(userRepository.save).not.toHaveBeenCalled();
    expect(accountVerificationRepository.save).not.toHaveBeenCalled();
  });

  it("should do nothing if account is verified", async () => {
    const {
      sut,
      accountVerificationRepository,
      tenantRepository,
      userRepository,
      accountVerification,
    } = createSut();

    accountVerification.status = AccountVerificationStatus.Used;
    accountVerificationRepository.getByHashToken = jest
      .fn()
      .mockResolvedValue(Result.ok(accountVerification));

    await sut.execute({ token: "token_value" });
    expect(tenantRepository.save).not.toHaveBeenCalled();
    expect(userRepository.save).not.toHaveBeenCalled();
    expect(accountVerificationRepository.save).not.toHaveBeenCalled();
  });

  it("should throw if account verification not found", async () => {
    const {
      sut,
      accountVerificationRepository,
      tenantRepository,
      userRepository,
    } = createSut();
    accountVerificationRepository.getByHashToken = jest
      .fn()
      .mockResolvedValue(Result.fail(new Error("Not found")));

    await expect(sut.execute({ token: "token_value" })).rejects.toThrow(
      "Not found",
    );
    expect(tenantRepository.save).not.toHaveBeenCalled();
    expect(userRepository.save).not.toHaveBeenCalled();
    expect(accountVerificationRepository.save).not.toHaveBeenCalled();
  });

  it("should throw if user not found", async () => {
    const {
      sut,
      tenantRepository,
      userRepository,
      accountVerificationRepository,
    } = createSut();
    userRepository.getById = jest
      .fn()
      .mockResolvedValue(Result.fail(new Error("User not found")));

    await expect(sut.execute({ token: "token_value" })).rejects.toThrow(
      "User not found",
    );
    expect(tenantRepository.save).not.toHaveBeenCalled();
    expect(userRepository.save).not.toHaveBeenCalled();
    expect(accountVerificationRepository.save).not.toHaveBeenCalled();
  });

  it("should throw if tenant not found", async () => {
    const {
      sut,
      tenantRepository,
      userRepository,
      accountVerificationRepository,
    } = createSut();
    tenantRepository.getById = jest
      .fn()
      .mockResolvedValue(Result.fail(new Error("Tenant not found")));

    await expect(sut.execute({ token: "token_value" })).rejects.toThrow(
      "Tenant not found",
    );
    expect(tenantRepository.save).not.toHaveBeenCalled();
    expect(userRepository.save).not.toHaveBeenCalled();
    expect(accountVerificationRepository.save).not.toHaveBeenCalled();
  });
});
