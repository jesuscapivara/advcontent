import { UseCase } from "@org/common/use-case";

import { AccountVerification } from "../../domain/account-verification/account-verification";
import { AccountVerificationRepository } from "../../domain/account-verification/account-verification-repository";
import {
  AccountVerificationService,
  EmailVerification,
} from "../../domain/account-verification/account-verification-service";
import { HashToken } from "../../domain/account-verification/hash-token";
import { Token } from "../../domain/account-verification/token";
import { TenantRepository } from "../../domain/tenant/tenant-repository";
import { UserRepository } from "../../domain/user/user-repository";

type Input = {
  tenantId: string;
  userId: string;
};

type Output = void;

type Deps = {
  tenantRepository: TenantRepository;
  userRepository: UserRepository;
  accountVerificationRepository: AccountVerificationRepository;
  accountVerificationService: AccountVerificationService;
};

class RequestAccountVerificationUseCase implements UseCase<Input, Output> {
  constructor(private deps: Deps) {}

  async execute(input: Input): Promise<Output> {
    const hasExisting =
      await this.deps.accountVerificationRepository.hasExisting(input.userId);
    if (hasExisting) return;

    const tenant = (
      await this.deps.tenantRepository.getById(input.tenantId)
    ).getDataOrThrow();
    const owner = (
      await this.deps.userRepository.getById(input.userId)
    ).getDataOrThrow();

    if (tenant.isActive || owner.isActive) return;

    const token = Token.create();
    const accountVerification = AccountVerification.create(
      this.deps.accountVerificationRepository.nextIdentity(),
      input.tenantId,
      input.userId,
      HashToken.fromToken(token),
    );

    await this.deps.accountVerificationRepository.add(accountVerification);
    await this.deps.accountVerificationService.sendEmailVerification(
      new EmailVerification({ to: owner.email }),
    );
  }
}

export { RequestAccountVerificationUseCase };
export type { Input as RequestAccountVerificationInput };
