import { Role } from "./role";
import { RoleType } from "./role-type";

interface RoleRepository {
  getSystemRole(role: RoleType): Promise<Role>;
}

export type { RoleRepository };
