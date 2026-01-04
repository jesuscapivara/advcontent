import { Entity, EntityProps } from "@org/common/entity";

import { HashToken } from "./hash-token";

enum AccountVerificationStatus {
  Pending = "pending",
  Used = "used",
  Expired = "expired",
}

type Props = {
  tenantId: string;
  userId: string;
  status: AccountVerificationStatus;
  hashToken: HashToken;
  expiresAt: Date;
} & EntityProps;

class AccountVerification extends Entity {
  tenantId: string;

  userId: string;

  status: AccountVerificationStatus;

  hashToken: HashToken;

  expiresAt: Date;

  constructor(props: Props) {
    super(props);
    this.tenantId = props.tenantId;
    this.userId = props.userId;

    this.status = props.status;
    this.hashToken = props.hashToken;
    this.expiresAt = props.expiresAt;
  }

  get isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  get isVerified() {
    return this.status === AccountVerificationStatus.Used;
  }

  verify() {
    if (this.isExpired) throw new Error("Token has expired");

    this.status = AccountVerificationStatus.Used;
  }

  static create(
    id: string,
    tenantId: string,
    userId: string,
    hashToken: HashToken,
  ) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    return new AccountVerification({
      id,
      tenantId,
      userId,
      expiresAt,
      hashToken,
      status: AccountVerificationStatus.Pending,
    });
  }
}

export { AccountVerification, AccountVerificationStatus };
