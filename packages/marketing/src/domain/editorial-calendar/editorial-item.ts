import { ObjectId } from "mongodb";
import z from "zod";
import { Entity, EntityProps } from "@org/common/entity";

// Status do Workflow de Aprovação
export enum EditorialStatus {
  Draft = "draft", // Rascunho inicial
  PendingReview = "review", // IA gerou, aguardando advogado
  Approved = "approved", // Advogado deu ok
  Scheduled = "scheduled", // Na fila do BullMQ
  Published = "published", // No Instagram
  Rejected = "rejected", // Bloqueado pelo Compliance ou Advogado
}

// O Objeto de Valor do Compliance (A blindagem ética)
export type ComplianceCheckProps = {
  passed: boolean;
  score: number; // 0 a 100 de risco
  flaggedTerms: string[]; // Ex: ["resultado garantido", "melhor do brasil"]
  reason?: string;
};

// Props para criar/hidratar a entidade
type Props = {
  tenantId: string; // Vínculo com o escritório
  topic: string; // Ex: "Pensão Alimentícia 2025"

  content?: {
    caption: string;
    headline: string;
    imageUrl?: string;
  };

  status: EditorialStatus;
  scheduledAt?: Date;

  complianceCheck?: ComplianceCheckProps;
} & EntityProps;

// Validação de Schema (Invariant Protection)
const EditorialItemSchema = z.object({
  tenantId: z.string().min(1),
  topic: z.string().min(3),
  status: z.nativeEnum(EditorialStatus),
});

export class EditorialItem extends Entity {
  tenantId: string;
  topic: string;

  content?: {
    caption: string;
    headline: string;
    imageUrl?: string;
  };

  status: EditorialStatus;
  scheduledAt?: Date;
  complianceCheck?: ComplianceCheckProps;

  constructor(props: Props) {
    super(props);
    this.tenantId = props.tenantId;
    this.topic = props.topic;
    this.content = props.content;
    this.status = props.status;
    this.scheduledAt = props.scheduledAt;
    this.complianceCheck = props.complianceCheck;

    this.validate();
  }

  private validate() {
    EditorialItemSchema.parse(this);
  }

  // --- Regras de Negócio (Behavior) ---

  // Regra 1: Só agenda se estiver aprovado E compliance OK
  public schedule(date: Date) {
    if (this.status !== EditorialStatus.Approved) {
      throw new Error(
        "O post precisa ser aprovado pelo advogado antes de agendar.",
      );
    }

    if (this.complianceCheck && !this.complianceCheck.passed) {
      throw new Error(
        "BLOQUEIO ÉTICO: O post contém termos proibidos pela OAB.",
      );
    }

    if (date < new Date()) {
      throw new Error("Não é possível agendar para o passado.");
    }

    this.scheduledAt = date;
    this.status = EditorialStatus.Scheduled;
  }

  // Regra 2: Atualizar conteúdo reseta o status para Draft (segurança)
  public updateContent(headline: string, caption: string) {
    this.content = { ...this.content, headline, caption };
    this.status = EditorialStatus.Draft; // Volta para rascunho para obrigar nova revisão
    this.scheduledAt = undefined;
  }

  // Factory para criar um novo rascunho rápido
  static createDraft(tenantId: string, topic: string) {
    return new EditorialItem({
      id: new ObjectId().toHexString(),
      tenantId,
      topic,
      status: EditorialStatus.Draft,
    });
  }
}
