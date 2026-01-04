import { EventRepository } from "@org/common/event";
import { UseCase } from "@org/common/use-case";

import { RoleRepository } from "../../domain/role/role-repository";
import { RoleType } from "../../domain/role/role-type";
import { Tenant } from "../../domain/tenant/tenant";
import { TenantCreatedEvent } from "../../domain/tenant/tenant-created-event";
import { TenantRepository } from "../../domain/tenant/tenant-repository";
import { HashPassword } from "../../domain/user/hash-password";
import { Password } from "../../domain/user/password";
import { User } from "../../domain/user/user";
import { UserRepository } from "../../domain/user/user-repository";
import { UserRole } from "../../domain/user/user-role";
import { UserStatus } from "../../domain/user/user-status";

type Input = {
  tenantName: string;
  tenantSlug: string;

  ownerName: string;
  ownerEmail: string;
  password: string;
  confirmPassword: string;
};

type Output = { id: string };

type Deps = {
  tenantRepository: TenantRepository;
  userRepository: UserRepository;
  roleRepository: RoleRepository;
  eventRepository: EventRepository;
};

class CreateTenantUseCase implements UseCase<Input, Output> {
  constructor(private deps: Deps) {}

  async execute(input: Input): Promise<Output> {
    const tenantId = this.deps.tenantRepository.nextIdentity();
    const ownerId = this.deps.userRepository.nextIdentity();

    const tenant = Tenant.create(
      tenantId,
      { ownerId, email: input.ownerEmail },
      input.tenantName,
      input.tenantSlug,
    );

    const password = Password.create({
      password: input.password,
      confirmPassword: input.confirmPassword,
    });

    const hashPassword = HashPassword.create({ password });

    const role = await this.deps.roleRepository.getSystemRole(
      RoleType.TenantOwner,
    );

    const user = new User({
      tenantId: tenant.id,
      id: ownerId,
      role: UserRole.fromRole(role),

      email: input.ownerEmail,
      name: input.ownerName,
      hashPassword,
      status: UserStatus.PendingForEmailConfirmation,
    });

    const isUnique = await this.deps.tenantRepository.isUnique(tenant);

    isUnique.getDataOrThrow();

    await this.deps.tenantRepository.add(tenant);
    await this.deps.userRepository.add(user);
    await this.deps.eventRepository.add(
      TenantCreatedEvent.create({
        tenantId: tenant.id,
        email: user.email,
        name: user.name,
        ownerId: user.id,
      }),
    );

    return { id: tenant.id };
  }
}

export { CreateTenantUseCase };
export type { Input as CreateTenantInput, Output as CreateTenantOutput };
