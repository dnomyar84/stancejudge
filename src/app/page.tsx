import { Suspense } from "react";
import { WushuApp } from "@/components/wushu-app";

export default function Home() {
  return (
    <Suspense fallback={null}>
      <WushuApp />
    </Suspense>
  );
}
