"use server";

import { z } from "zod";
import { updateWorkout } from "@/data/workouts";

const UpdateWorkoutSchema = z.object({
  name: z.string().min(1, "Name is required"),
  startedAt: z.string().datetime({ local: true }),
});

export type UpdateWorkoutInput = z.infer<typeof UpdateWorkoutSchema>;

export async function updateWorkoutAction(
  workoutId: number,
  input: UpdateWorkoutInput
) {
  const parsed = UpdateWorkoutSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error("Invalid input");
  }

  await updateWorkout(workoutId, {
    name: parsed.data.name,
    startedAt: new Date(parsed.data.startedAt),
  });
}
