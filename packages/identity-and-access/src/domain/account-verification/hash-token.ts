import { createHash } from "crypto";

import { Token } from "./token";

class HashToken {
  value: string;

  constructor(value: string) {
    this.value = value;
  }

  static fromToken(token: Token) {
    const hashToken = createHash("sha256").update(token.value).digest("hex");

    return new HashToken(hashToken);
  }
}

export { HashToken };
