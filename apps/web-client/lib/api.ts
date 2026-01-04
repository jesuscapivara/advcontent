const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

export const api = {
  marketing: {
    createDraft: async (data: {
      topic: string;
      tone: string;
      legalArea: string;
    }) => {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/marketing/posts/draft`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Erro ao gerar post");
      }

      return response.json();
    },
  },
};
