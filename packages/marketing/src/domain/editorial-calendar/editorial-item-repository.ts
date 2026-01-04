import { EditorialItem, EditorialStatus } from "./editorial-item";

interface EditorialItemRepository {
  add(item: EditorialItem): Promise<void>;
  save(item: EditorialItem): Promise<void>;
  getById(id: string): Promise<EditorialItem | null>;
  findScheduledToPublish(now: Date): Promise<EditorialItem[]>;
  findByMonth(tenantId: string, month: number, year: number): Promise<EditorialItem[]>;
  nextIdentity(): string;
}

export type { EditorialItemRepository };
