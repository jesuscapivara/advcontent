import { UseCase } from "@org/common/use-case";
import { EditorialItemRepository } from "../domain/editorial-calendar/editorial-item-repository";

type Input = {
  tenantId: string;
};

type Output = {
  posts: Array<{
    id: string;
    headline: string;
    caption: string;
    topic: string;
    status: string;
    createdAt: Date;
  }>;
};

export class GetTenantEditorialItemsUseCase implements UseCase<Input, Output> {
  constructor(private readonly repository: EditorialItemRepository) {}

  async execute(input: Input): Promise<Output> {
    const items = await this.repository.findByTenant(input.tenantId);

    const posts = items.map((item) => ({
      id: item.id,
      headline: item.content?.headline || "Sem título",
      caption: item.content?.caption || "",
      topic: item.topic,
      status: item.status,
      createdAt: item.createdAt,
    }));

    return { posts };
  }
}
