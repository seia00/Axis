"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ChevronRight, ChevronLeft, Check } from "lucide-react";

const focusAreas = [
  { value: "Environment", label: "Environment & Sustainability" },
  { value: "Technology", label: "Technology & Innovation" },
  { value: "Social Impact", label: "Social Impact" },
  { value: "Arts", label: "Arts & Culture" },
  { value: "Entrepreneurship", label: "Entrepreneurship" },
  { value: "Education", label: "Education" },
  { value: "Health", label: "Health & Wellness" },
  { value: "STEM", label: "STEM" },
  { value: "Other", label: "Other" },
];

const steps = ["Basic Info", "Your Idea", "Team & Traction", "Support Needed"];

export function VentureApplicationForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    focusArea: "Social Impact",
    foundingTeam: "",
    targetStudents: "",
    problemStatement: "",
    proposedSolution: "",
    currentTraction: "",
    supportNeeded: "",
  });

  const update = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { name, focusArea, ...applicationData } = form;
      await fetch("/api/ventures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, focusArea, applicationData }),
      });
      router.push("/ventures/apply/success");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 transition-colors ${
              i < step ? "bg-emerald-600 text-white" :
              i === step ? "bg-indigo-600 text-white" :
              "bg-[var(--surface-overlay)] text-[var(--muted-foreground)]"
            }`}>
              {i < step ? <Check className="w-3 h-3" /> : i + 1}
            </div>
            <span className={`text-xs hidden sm:block ${i === step ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)]"}`}>
              {s}
            </span>
            {i < steps.length - 1 && (
              <div className={`h-px flex-1 ml-1 ${i < step ? "bg-emerald-600/50" : "bg-[var(--border)]"}`} />
            )}
          </div>
        ))}
      </div>

      <div className="space-y-4 min-h-[280px]">
        {step === 0 && (
          <>
            <Input
              label="Initiative Name"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="e.g. Tokyo Youth Climate Action"
            />
            <Select
              label="Focus Area"
              options={focusAreas}
              value={form.focusArea}
              onChange={(e) => update("focusArea", e.target.value)}
            />
            <Textarea
              label="Target Student Population"
              value={form.targetStudents}
              onChange={(e) => update("targetStudents", e.target.value)}
              placeholder="Who are you trying to reach? What schools, grades, interests?"
              rows={3}
            />
          </>
        )}

        {step === 1 && (
          <>
            <Textarea
              label="Problem Statement"
              value={form.problemStatement}
              onChange={(e) => update("problemStatement", e.target.value)}
              placeholder="What specific problem are you solving? Why does it matter?"
              rows={4}
            />
            <Textarea
              label="Proposed Solution"
              value={form.proposedSolution}
              onChange={(e) => update("proposedSolution", e.target.value)}
              placeholder="How does your initiative address this problem?"
              rows={4}
            />
          </>
        )}

        {step === 2 && (
          <>
            <Textarea
              label="Founding Team"
              value={form.foundingTeam}
              onChange={(e) => update("foundingTeam", e.target.value)}
              placeholder="Who is on your team? What are their backgrounds? (You can apply solo too)"
              rows={3}
            />
            <Textarea
              label="Current Traction"
              value={form.currentTraction}
              onChange={(e) => update("currentTraction", e.target.value)}
              placeholder="What have you done so far? Events, members, partnerships, prototypes?"
              rows={3}
            />
          </>
        )}

        {step === 3 && (
          <Textarea
            label="What Support Do You Need?"
            value={form.supportNeeded}
            onChange={(e) => update("supportNeeded", e.target.value)}
            placeholder="Mentorship, legal help, design support, peer community, accountability? Be specific."
            rows={6}
            hint="The more specific you are, the better we can match you with the right resources."
          />
        )}
      </div>

      <div className="flex items-center justify-between mt-8 pt-4 border-t border-[var(--border)]">
        <Button
          variant="ghost"
          onClick={() => setStep(s => s - 1)}
          disabled={step === 0}
          className="gap-1.5"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>

        {step < steps.length - 1 ? (
          <Button onClick={() => setStep(s => s + 1)} className="gap-1.5">
            Next <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} loading={loading}>
            Submit Application
          </Button>
        )}
      </div>
    </div>
  );
}
