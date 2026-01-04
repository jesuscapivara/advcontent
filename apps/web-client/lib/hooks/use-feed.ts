import useSWR from "swr";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

export function useFeed() {
  const { data, error, isLoading, mutate } = useSWR(
    "/api/v1/marketing/feed",
    async (url) => {
      const response = await axios.get(`${API_BASE_URL}${url}`, {
        headers: { "x-tenant-slug": "testing" }, // TODO: Trocar por tenant real
      });
      return response.data;
    }
  );

  return {
    posts: data?.posts || [],
    isLoading,
    isError: error,
    refresh: mutate,
  };
}
