"use server";

import { z } from "zod";
import { createWorkout } from "@/data/workouts";

const CreateWorkoutSchema = z.object({
  name: z.string().min(1, "Name is required"),
  startedAt: z.string().datetime({ local: true }),
});

export type CreateWorkoutInput = z.infer<typeof CreateWorkoutSchema>;

export async function createWorkoutAction(input: CreateWorkoutInput) {
  const parsed = CreateWorkoutSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error("Invalid input");
  }

  await createWorkout({
    name: parsed.data.name,
    startedAt: new Date(parsed.data.startedAt),
  });
}
