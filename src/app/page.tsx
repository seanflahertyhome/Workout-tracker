import { auth } from "@/auth";
import { redirect } from "next/navigation";
import WorkoutTracker from "./WorkoutTracker";

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <WorkoutTracker user={session.user} />
    </main>
  );
}
