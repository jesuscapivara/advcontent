import { AbstractController } from "./abstract-controller";

export class GetTenantBrandingController extends AbstractController<void> {
  async handle() {
    // O tenant já está disponível via middleware detectTenantMiddleware
    // Não precisa buscar novamente no banco
    return this.reply.status(200).send({
      primaryColor: this.tenant.branding?.primaryColor || "#0f172a",
      secondaryColor: this.tenant.branding?.secondaryColor || "#f59e0b",
      logoUrl: this.tenant.branding?.logoUrl,
      fontFamily: this.tenant.branding?.fontFamily,
      fullName: this.tenant.profile?.fullName,
    });
  }
}
