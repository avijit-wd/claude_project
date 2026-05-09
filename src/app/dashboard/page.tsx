import { Suspense } from "react";
import { getWorkoutsForDate } from "@/data/workouts";
import { WorkoutList } from "./workout-list";

export const unstable_instant = { prefetch: "static" };

export default function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  return (
    <Suspense fallback={<div className="container mx-auto max-w-2xl p-6">Loading...</div>}>
      {searchParams.then(({ date: dateParam }) => {
        const date = dateParam ? new Date(dateParam) : new Date();
        return <WorkoutData date={date} />;
      })}
    </Suspense>
  );
}

async function WorkoutData({ date }: { date: Date }) {
  const workouts = await getWorkoutsForDate(date);
  return <WorkoutList date={date} workouts={workouts} />;
}
