import type { Metadata } from "next";
import { AiImpactCalculator } from "./calculator";

export const metadata: Metadata = {
  title: "AI Environmental Impact Calculator",
  description:
    "Estimate the water usage and carbon footprint of your AI model usage, based on real research data from Microsoft, Google, and academic sources.",
};

export default function Page() {
  return <AiImpactCalculator />;
}
