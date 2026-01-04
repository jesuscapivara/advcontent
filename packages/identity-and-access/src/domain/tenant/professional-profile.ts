import z from "zod";

export enum ExpertiseArea {
  Civil = "CIVIL",
  Criminal = "CRIMINAL",
  Trabalhista = "TRABALHISTA",
  Familia = "FAMILIA",
  Tributario = "TRIBUTARIO",
  Consumidor = "CONSUMIDOR",
  Empresarial = "EMPRESARIAL",
  Geral = "GERAL",
}

export enum ToneOfVoice {
  Combative = "COMBATIVE",
  Empathetic = "EMPATHETIC",
  Technical = "TECHNICAL",
  Simplified = "SIMPLIFIED",
}

const ProfessionalProfileSchema = z.object({
  fullName: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  oabNumber: z.string().optional(),
  expertiseAreas: z
    .array(z.nativeEnum(ExpertiseArea))
    .min(1, "Selecione pelo menos uma área de atuação"),
  toneOfVoice: z.nativeEnum(ToneOfVoice),
});

type ProfessionalProfileProps = z.infer<typeof ProfessionalProfileSchema>;

class ProfessionalProfile {
  fullName: string;
  oabNumber?: string;
  expertiseAreas: ExpertiseArea[];
  toneOfVoice: ToneOfVoice;

  constructor(props: ProfessionalProfileProps) {
    ProfessionalProfileSchema.parse(props);
    this.fullName = props.fullName;
    this.oabNumber = props.oabNumber;
    this.expertiseAreas = props.expertiseAreas;
    this.toneOfVoice = props.toneOfVoice;
  }

  static create(props: ProfessionalProfileProps): ProfessionalProfile {
    return new ProfessionalProfile(props);
  }
}

export { ProfessionalProfile };
export type { ProfessionalProfileProps };
