import { doublePrecision, pgTable, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const sensorHistory = pgTable("sensor_history", {
  id: serial("id").primaryKey(),
  temperature: doublePrecision("temperature").notNull(),
  humidity: doublePrecision("humidity").notNull(),
  vibration: doublePrecision("vibration").notNull(),
  power: doublePrecision("power").notNull(),
  recordedAt: timestamp("recorded_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertSensorHistorySchema = createInsertSchema(sensorHistory).omit({
  id: true,
  recordedAt: true,
});

export type SensorHistory = typeof sensorHistory.$inferSelect;
export type InsertSensorHistory = z.infer<typeof insertSensorHistorySchema>;
