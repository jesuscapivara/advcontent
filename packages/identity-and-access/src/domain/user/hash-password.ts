import bcrypt from "bcrypt";

import { Password } from "./password";

type CreateProps = {
  password: Password;
};

export class HashPassword {
  value: string;

  constructor(value: string) {
    this.value = value;
  }

  static create({ password }: CreateProps) {
    const hashed = bcrypt.hashSync(password.value, 10);

    return new HashPassword(hashed);
  }

  async isEqual(password: Password) {
    return bcrypt.compare(password.value, this.value);
  }
}
