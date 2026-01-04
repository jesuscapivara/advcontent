import { Role } from "../../domain/role/role";
import { RoleType } from "../../domain/role/role-type";

const tenantOwner = new Role({
  type: RoleType.TenantOwner,
  name: "Tenant Owner",
  description: "Owner of the Tenant",
  id: RoleType.TenantOwner,
  tenantId: "default",
  permissions: [],
});

const roleFixture = {
  tenantOwner,
};

export { roleFixture };
