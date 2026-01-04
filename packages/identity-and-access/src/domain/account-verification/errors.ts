import { DomainError } from "@org/common/error";

class AccountVerificationNotFoundError extends DomainError {
  constructor() {
    super(
      "An AccountVerification was not found",
      "iam.account_verification.account_verification_not_found_error",
    );
  }
}

class AccountVerificationConflictError extends DomainError {
  constructor() {
    super(
      `There was an error conflict when trying to save a AccountVerification`,
      "iam.account_verification.account_verification_conflict_error",
    );
  }
}

export { AccountVerificationNotFoundError, AccountVerificationConflictError };
