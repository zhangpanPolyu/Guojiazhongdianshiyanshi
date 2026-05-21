import { customFetch } from "./custom-fetch";

export async function registerPushToken(token: string): Promise<void> {
  await customFetch<{ ok: boolean; tokenCount: number }>("/api/push-tokens", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
}
