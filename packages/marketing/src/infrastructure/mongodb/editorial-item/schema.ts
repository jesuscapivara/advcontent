import { MongoSchema, TenantIdSchema } from "@org/common/mongo";
import { EditorialStatus } from "../../../domain/editorial-calendar/editorial-item";

// Definição da estrutura no Mongo
type EditorialItemSchema = {
  tenantId: TenantIdSchema; // Partition Key lógica
  topic: string;

  content?: {
    caption: string;
    headline: string;
    imageUrl?: string;
  };

  status: EditorialStatus;
  scheduledAt?: Date;

  // Armazenamos o log de compliance para auditoria futura
  complianceCheck?: {
    passed: boolean;
    score: number;
    flaggedTerms: string[];
    reason?: string;
  };

  createdAt: Date;
  updatedAt: Date;
} & MongoSchema;

// Índices sugeridos para performance
// 1. Busca rápida por escritório (Multi-tenancy)
// 2. Busca para popular o Calendário (Range de datas)
// 3. Worker busca posts "Scheduled" que precisam ser publicados agora
const EDITORIAL_COLLECTION_NAME = "marketing_editorial_items";

export type { EditorialItemSchema };
export { EDITORIAL_COLLECTION_NAME };
