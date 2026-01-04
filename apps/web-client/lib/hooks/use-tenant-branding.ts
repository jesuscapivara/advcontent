import useSWR from "swr";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

interface TenantBranding {
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  fontFamily?: string;
  fullName?: string;
}

export function useTenantBranding() {
  const { data, error, isLoading } = useSWR<TenantBranding>(
    "/api/v1/tenant/branding",
    async (url) => {
      const response = await axios.get(`${API_BASE_URL}${url}`, {
        headers: { "x-tenant-slug": "testing" }, // TODO: Trocar por tenant real
      });
      return response.data;
    },
    {
      fallbackData: {
        primaryColor: "#0f172a",
        secondaryColor: "#f59e0b",
      },
    }
  );

  return {
    branding: data || {
      primaryColor: "#0f172a",
      secondaryColor: "#f59e0b",
    },
    isLoading,
    isError: error,
  };
}
