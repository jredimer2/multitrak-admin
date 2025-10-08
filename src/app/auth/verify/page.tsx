import { Suspense } from "react";
import VerifyContent from "./verify-content";

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto p-6 rounded-lg border bg-white/80">Loading...</div>}>
      <VerifyContent />
    </Suspense>
  );
}