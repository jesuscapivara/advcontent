import { Result } from "@org/common/result";

import { AccountVerification } from "./account-verification";
import { AccountVerificationNotFoundError } from "./errors";
import { HashToken } from "./hash-token";

interface AccountVerificationRepository {
  add(accountVerification: AccountVerification): Promise<void>;
  save(accountVerification: AccountVerification): Promise<void>;
  getByHashToken(
    hashToken: HashToken,
  ): Promise<Result<AccountVerification, AccountVerificationNotFoundError>>;
  hasExisting(userId: string): Promise<boolean>;
  nextIdentity(): string;
}

export type { AccountVerificationRepository };
