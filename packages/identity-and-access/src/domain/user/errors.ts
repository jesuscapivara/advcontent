import { DomainError } from "@org/common/error";

class ConfirmPasswordError extends DomainError {
  constructor() {
    super(
      "Password and ConfirmPassword do not match",
      "iam.user.confirm_password_error",
    );
  }
}

class UserNotFoundError extends DomainError {
  constructor(userId: string) {
    super(
      `The following User was not found. userId = ${userId}`,
      "iam.user.user_not_found_error",
    );
  }
}

class UserConflictError extends DomainError {
  constructor() {
    super(
      `There was an error conflict when trying to save a User`,
      "iam.user.user_conflict_error",
    );
  }
}

export { ConfirmPasswordError, UserNotFoundError, UserConflictError };
