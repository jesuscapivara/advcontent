import { z } from "zod";

import { ConfirmPasswordError } from "./errors";

const PasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/\d/, "Password must contain at least one number")
  .regex(
    /[^a-zA-Z0-9]/,
    "Password must contain at least one special character",
  );

type CreateInput = {
  password: string;
  confirmPassword: string;
};

class Password {
  value: string;

  constructor(value: string) {
    PasswordSchema.parse(value);

    this.value = value;
  }

  static create({ password, confirmPassword }: CreateInput) {
    if (password !== confirmPassword) throw new ConfirmPasswordError();

    return new Password(password);
  }
}

export { Password };
