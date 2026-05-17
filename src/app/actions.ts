"use server";

import { db } from "@/db";
import { workouts, schedules } from "@/db/schema";
import { auth } from "@/auth";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getWorkout(date: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [workout] = await db
    .select()
    .from(workouts)
    .where(and(eq(workouts.userId, session.user.id), eq(workouts.date, date)))
    .limit(1);

  return workout?.data || null;
}

export async function saveWorkout(date: string, data: any) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;

  const [existing] = await db
    .select()
    .from(workouts)
    .where(and(eq(workouts.userId, userId), eq(workouts.date, date)))
    .limit(1);

  if (existing) {
    await db
      .update(workouts)
      .set({ data })
      .where(eq(workouts.id, existing.id));
  } else {
    await db.insert(workouts).values({
      userId,
      date,
      data,
    });
  }

  revalidatePath("/");
}

export async function getSchedule() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [schedule] = await db
    .select()
    .from(schedules)
    .where(eq(schedules.userId, session.user.id))
    .limit(1);

  return schedule?.scheduleData || null;
}

export async function saveSchedule(scheduleData: any) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;

  const [existing] = await db
    .select()
    .from(schedules)
    .where(eq(schedules.userId, userId))
    .limit(1);

  if (existing) {
    await db
      .update(schedules)
      .set({ scheduleData, updatedAt: new Date() })
      .where(eq(schedules.id, existing.id));
  } else {
    await db.insert(schedules).values({
      userId,
      scheduleData,
    });
  }

  revalidatePath("/");
}
