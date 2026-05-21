import { Router, type IRouter } from "express";
import { Expo, type ExpoPushMessage } from "expo-server-sdk";

const router: IRouter = Router();
const expo = new Expo();

const registeredTokens = new Set<string>();

export function getRegisteredTokens(): Set<string> {
  return registeredTokens;
}

export async function sendPushNotifications(messages: ExpoPushMessage[]): Promise<void> {
  const validMessages = messages.filter(
    (msg) =>
      typeof msg.to === "string" && Expo.isExpoPushToken(msg.to)
  );

  if (validMessages.length === 0) return;

  try {
    const chunks = expo.chunkPushNotifications(validMessages);
    for (const chunk of chunks) {
      await expo.sendPushNotificationsAsync(chunk);
    }
  } catch (err) {
    console.error("[push] Failed to send push notifications:", err);
  }
}

router.post("/push-tokens", (req, res) => {
  const { token } = req.body as { token?: string };

  if (!token || typeof token !== "string") {
    res.status(400).json({ error: "Missing or invalid token" });
    return;
  }

  if (!Expo.isExpoPushToken(token)) {
    res.status(400).json({ error: "Invalid Expo push token format" });
    return;
  }

  registeredTokens.add(token);
  console.log(`[push] Token registered. Total tokens: ${registeredTokens.size}`);
  res.status(200).json({ ok: true, tokenCount: registeredTokens.size });
});

export default router;
