import { UseCase } from "@org/common/use-case";

import { AccountVerificationRepository } from "../../domain/account-verification/account-verification-repository";
import { HashToken } from "../../domain/account-verification/hash-token";
import { Token } from "../../domain/account-verification/token";
import { TenantRepository } from "../../domain/tenant/tenant-repository";
import { UserRepository } from "../../domain/user/user-repository";

type Input = {
  token: string;
};

type Output = void;

type Deps = {
  accountVerificationRepository: AccountVerificationRepository;
  userRepository: UserRepository;
  tenantRepository: TenantRepository;
};

class VerifyAccountUseCase implements UseCase<Input, Output> {
  constructor(private deps: Deps) {}

  async execute(input: Input): Promise<Output> {
    const token = new Token(input.token);
    const hashToken = HashToken.fromToken(token);

    const accountVerification = (
      await this.deps.accountVerificationRepository.getByHashToken(hashToken)
    ).getDataOrThrow();

    if (accountVerification.isVerified) return;

    const user = (
      await this.deps.userRepository.getById(accountVerification.userId)
    ).getDataOrThrow();

    accountVerification.verify();
    user.activate();

    if (user.isTenantOwner) {
      const tenant = (
        await this.deps.tenantRepository.getById(user.tenantId)
      ).getDataOrThrow();

      tenant.activate();

      await this.deps.tenantRepository.save(tenant);
    }

    await this.deps.userRepository.save(user);
    await this.deps.accountVerificationRepository.save(accountVerification);
  }
}

export { VerifyAccountUseCase };
export type { Input as VerifyAccountInput };
