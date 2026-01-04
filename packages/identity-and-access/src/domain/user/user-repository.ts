import { Result } from "@org/common/result";

import { UserNotFoundError } from "./errors";
import { User } from "./user";

interface UserRepository {
  add(user: User): Promise<void>;
  save(user: User): Promise<void>;
  getById(id: string): Promise<Result<User, UserNotFoundError>>;
  nextIdentity(): string;
}

export type { UserRepository };
