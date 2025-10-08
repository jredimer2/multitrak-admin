import { Suspense } from "react";
import ReceiveCodeContent from "./receive-code-content";

export default function ReceiveCodePage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto p-6 rounded-lg border bg-white/80">Loading...</div>}>
      <ReceiveCodeContent />
    </Suspense>
  );
}