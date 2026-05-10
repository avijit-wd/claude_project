import { notFound } from "next/navigation";
import { getWorkout } from "@/data/workouts";
import { EditWorkoutForm } from "./edit-workout-form";

type Props = {
  params: Promise<{ workoutId: string }>;
};

export default async function EditWorkoutPage({ params }: Props) {
  const { workoutId } = await params;
  const id = Number(workoutId);

  if (isNaN(id)) notFound();

  const workout = await getWorkout(id);

  if (!workout) notFound();

  return (
    <div className="flex min-h-screen items-start justify-center p-8">
      <EditWorkoutForm workout={workout} />
    </div>
  );
}
