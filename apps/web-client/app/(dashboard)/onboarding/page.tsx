"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Palette,
  User,
  Mic,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOnboardingStore } from "@/lib/store/onboarding-store";
import axios from "axios";

const API_URL = "http://localhost:3333/api/v1/onboarding/complete";

// Step 1: Profile Schema
const profileSchema = z.object({
  fullName: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  oabNumber: z.string().optional(),
  expertiseAreas: z.array(z.string()).min(1, "Selecione pelo menos uma área"),
  toneOfVoice: z.enum(["COMBATIVE", "EMPATHETIC", "TECHNICAL", "SIMPLIFIED"]),
});

// Step 2: Branding Schema
const brandingSchema = z.object({
  primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
  secondaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
  logoUrl: z.string().url().optional().or(z.literal("")),
  fontFamily: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;
type BrandingFormData = z.infer<typeof brandingSchema>;

const EXPERTISE_AREAS = [
  { value: "CIVIL", label: "Direito Civil" },
  { value: "CRIMINAL", label: "Direito Criminal" },
  { value: "TRABALHISTA", label: "Direito Trabalhista" },
  { value: "FAMILIA", label: "Direito de Família" },
  { value: "TRIBUTARIO", label: "Direito Tributário" },
  { value: "CONSUMIDOR", label: "Direito do Consumidor" },
  { value: "EMPRESARIAL", label: "Direito Empresarial" },
  { value: "GERAL", label: "Geral" },
];

const TONE_OPTIONS = [
  { value: "COMBATIVE", label: "Combativo" },
  { value: "EMPATHETIC", label: "Empático" },
  { value: "TECHNICAL", label: "Técnico" },
  { value: "SIMPLIFIED", label: "Simplificado" },
];

const TONE_LABELS: Record<string, string> = {
  COMBATIVE: "Combativo",
  EMPATHETIC: "Empático",
  TECHNICAL: "Técnico",
  SIMPLIFIED: "Simplificado",
};

export default function OnboardingPage() {
  const router = useRouter();
  const { currentStep, data, setStep, updateData, reset } =
    useOnboardingStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: data.fullName || "",
      oabNumber: data.oabNumber || "",
      expertiseAreas: data.expertiseAreas || [],
      toneOfVoice: (data.toneOfVoice as any) || "TECHNICAL",
    },
  });

  const brandingForm = useForm<BrandingFormData>({
    resolver: zodResolver(brandingSchema),
    defaultValues: {
      primaryColor: data.primaryColor || "#0f172a",
      secondaryColor: data.secondaryColor || "#f59e0b",
      logoUrl: data.logoUrl || "",
      fontFamily: data.fontFamily || "",
    },
  });

  const handleProfileSubmit = (formData: ProfileFormData) => {
    updateData(formData);
    setStep(1);
  };

  const generationSteps = [
    "Salvando sua identidade visual...",
    `Analisando seu perfil (Tom: ${TONE_LABELS[data.toneOfVoice as string] || "Técnico"})...`,
    "Consultando jurisprudência recente...",
    "Criando 3 sugestões de pauta exclusivas...",
    "Finalizando sua Sala de Guerra...",
  ];

  const handleBrandingSubmit = async (formData: BrandingFormData) => {
    updateData(formData);
    setIsSubmitting(true);
    setIsGenerating(true);
    setGenerationStep(0);

    try {
      // Dispara o request (Backend inicia o processo assíncrono)
      await axios.post(
        API_URL,
        {
          branding: {
            primaryColor: formData.primaryColor,
            secondaryColor: formData.secondaryColor,
            logoUrl: formData.logoUrl || undefined,
            fontFamily: formData.fontFamily || undefined,
          },
          profile: {
            fullName: data.fullName,
            oabNumber: data.oabNumber || undefined,
            expertiseAreas: data.expertiseAreas,
            toneOfVoice: data.toneOfVoice,
          },
        },
        {
          headers: { "x-tenant-slug": "testing" },
        }
      );

      // Simula o progresso visualmente enquanto o Worker roda no backend
      // Isso dá tempo (5-8s) para o Worker criar os posts antes de redirecionar
      for (let i = 0; i < generationSteps.length; i++) {
        setGenerationStep(i);
        await new Promise((r) => setTimeout(r, 1500)); // 1.5s por passo
      }

      reset();
      router.push("/editor"); // Agora sim, vai ter dados lá!
    } catch (error) {
      console.error("Erro ao completar onboarding:", error);
      setIsGenerating(false);
      setIsSubmitting(false);
      alert("Erro ao salvar. Tente novamente.");
    }
  };

  const steps = [
    {
      title: "Perfil Profissional",
      icon: User,
      component: (
        <form
          onSubmit={profileForm.handleSubmit(handleProfileSubmit)}
          className="space-y-6"
        >
          <div className="space-y-2">
            <Label htmlFor="fullName">Nome Completo</Label>
            <Input
              id="fullName"
              {...profileForm.register("fullName")}
              placeholder="Dr. João Silva"
            />
            {profileForm.formState.errors.fullName && (
              <p className="text-sm text-red-500">
                {profileForm.formState.errors.fullName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="oabNumber">Número OAB (Opcional)</Label>
            <Input
              id="oabNumber"
              {...profileForm.register("oabNumber")}
              placeholder="OAB/SP 123456"
            />
          </div>

          <div className="space-y-2">
            <Label>Áreas de Atuação</Label>
            <div className="grid grid-cols-2 gap-2">
              {EXPERTISE_AREAS.map((area) => (
                <label
                  key={area.value}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    value={area.value}
                    checked={profileForm
                      .watch("expertiseAreas")
                      .includes(area.value)}
                    onChange={(e) => {
                      const current = profileForm.getValues("expertiseAreas");
                      const newAreas = e.target.checked
                        ? [...current, area.value]
                        : current.filter((a) => a !== area.value);
                      profileForm.setValue("expertiseAreas", newAreas);
                    }}
                    className="rounded"
                  />
                  <span className="text-sm">{area.label}</span>
                </label>
              ))}
            </div>
            {profileForm.formState.errors.expertiseAreas && (
              <p className="text-sm text-red-500">
                {profileForm.formState.errors.expertiseAreas.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="toneOfVoice">Tom de Voz</Label>
            <Select
              value={profileForm.watch("toneOfVoice")}
              onValueChange={(value) =>
                profileForm.setValue("toneOfVoice", value as any)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TONE_OPTIONS.map((tone) => (
                  <SelectItem key={tone.value} value={tone.value}>
                    {tone.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full">
            Continuar <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>
      ),
    },
    {
      title: "Identidade Visual",
      icon: Palette,
      component: (
        <form
          onSubmit={brandingForm.handleSubmit(handleBrandingSubmit)}
          className="space-y-6"
        >
          <div className="space-y-2">
            <Label htmlFor="primaryColor">Cor Primária</Label>
            <div className="flex gap-2">
              <Input
                id="primaryColor"
                type="color"
                {...brandingForm.register("primaryColor")}
                className="w-20 h-10"
              />
              <Input
                {...brandingForm.register("primaryColor")}
                placeholder="#0f172a"
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="secondaryColor">Cor Secundária</Label>
            <div className="flex gap-2">
              <Input
                id="secondaryColor"
                type="color"
                {...brandingForm.register("secondaryColor")}
                className="w-20 h-10"
              />
              <Input
                {...brandingForm.register("secondaryColor")}
                placeholder="#f59e0b"
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="logoUrl">URL do Logo (Opcional)</Label>
            <Input
              id="logoUrl"
              {...brandingForm.register("logoUrl")}
              placeholder="https://exemplo.com/logo.png"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fontFamily">Fonte (Opcional)</Label>
            <Input
              id="fontFamily"
              {...brandingForm.register("fontFamily")}
              placeholder="Inter, sans-serif"
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(0)}
              className="flex-1"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Finalizar"}
              {!isSubmitting && <Check className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </form>
      ),
    },
  ];

  const currentStepData = steps[currentStep];

  // Tela de Espera (Sala de Espera)
  if (isGenerating) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-xl">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Configurando sua IA
            </h2>
            <p className="text-slate-500">Isso leva menos de um minuto.</p>
          </div>

          <div className="space-y-4">
            {generationSteps.map((text, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 transition-all duration-500 ${
                  index > generationStep ? "opacity-30" : "opacity-100"
                }`}
              >
                {index < generationStep ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : index === generationStep ? (
                  <Loader2 className="h-5 w-5 text-indigo-600 animate-spin" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-slate-200" />
                )}
                <span
                  className={`text-sm font-medium ${
                    index === generationStep
                      ? "text-indigo-900"
                      : "text-slate-600"
                  }`}
                >
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center">
              <currentStepData.icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Configuração Inicial
              </h1>
              <p className="text-slate-500">
                Passo {currentStep + 1} de {steps.length}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`flex-1 h-2 rounded-full ${
                  index <= currentStep ? "bg-slate-900" : "bg-slate-200"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            {currentStepData.title}
          </h2>
          <p className="text-slate-600">
            {currentStep === 0
              ? "Conte-nos sobre você e sua área de atuação"
              : "Personalize a identidade visual do seu escritório"}
          </p>
        </div>

        {currentStepData.component}
      </div>
    </div>
  );
}
