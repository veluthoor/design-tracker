import { Suspense } from "react";
import DesignTracker from "@/components/DesignTracker";

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-pink-50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-rose-500">
          <div className="w-4 h-4 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
          Loading...
        </div>
      </div>
    }>
      <DesignTracker />
    </Suspense>
  );
}
