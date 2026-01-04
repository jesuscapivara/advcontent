import { create } from "zustand";

type OnboardingData = {
  // Profile Step
  fullName: string;
  oabNumber: string;
  expertiseAreas: string[];
  toneOfVoice: string;

  // Branding Step
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  fontFamily?: string;
};

type OnboardingStore = {
  currentStep: number;
  data: Partial<OnboardingData>;
  setStep: (step: number) => void;
  updateData: (data: Partial<OnboardingData>) => void;
  reset: () => void;
};

const initialState: Partial<OnboardingData> = {
  fullName: "",
  oabNumber: "",
  expertiseAreas: [],
  toneOfVoice: "TECHNICAL",
  primaryColor: "#0f172a",
  secondaryColor: "#f59e0b",
  logoUrl: undefined,
  fontFamily: undefined,
};

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  currentStep: 0,
  data: initialState,
  setStep: (step) => set({ currentStep: step }),
  updateData: (newData) =>
    set((state) => ({
      data: { ...state.data, ...newData },
    })),
  reset: () => set({ currentStep: 0, data: initialState }),
}));
