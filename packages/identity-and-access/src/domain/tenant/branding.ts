import z from "zod";

const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

const BrandingSchema = z.object({
  primaryColor: z
    .string()
    .regex(hexColorRegex, "Cor primária deve ser um hex válido"),
  secondaryColor: z
    .string()
    .regex(hexColorRegex, "Cor secundária deve ser um hex válido"),
  logoUrl: z.string().url().optional(),
  fontFamily: z.string().optional(),
});

type BrandingProps = z.infer<typeof BrandingSchema>;

class Branding {
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  fontFamily?: string;

  constructor(props: BrandingProps) {
    BrandingSchema.parse(props);
    this.primaryColor = props.primaryColor;
    this.secondaryColor = props.secondaryColor;
    this.logoUrl = props.logoUrl;
    this.fontFamily = props.fontFamily;
  }

  static create(props: BrandingProps): Branding {
    return new Branding(props);
  }
}

export { Branding };
export type { BrandingProps };
