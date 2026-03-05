"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Heart,
  Home,
  Monitor,
  Users,
  Shield,
  Stethoscope,
  Lightbulb,
  Check,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { industryPresets } from "@/lib/presets";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Briefcase,
  Heart,
  Home,
  Monitor,
  Users,
  Shield,
  Stethoscope,
  Lightbulb,
};

export default function SetupPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"select" | "confirm">("select");

  const selectedPreset = industryPresets.find((p) => p.id === selected);

  const handleSetup = async () => {
    if (!selected) return;
    setLoading(true);

    const res = await fetch("/api/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ presetId: selected }),
    });

    if (res.ok) {
      router.push("/dashboard");
      router.refresh();
    } else if (res.status === 401) {
      // Stale session — redirect to login
      router.push("/login");
    } else {
      setLoading(false);
      alert("Setup failed. Please try logging out and back in.");
    }
  };

  return (
    <div className="min-h-screen bg-[#1B2A4A]">
      {/* Header */}
      <div className="bg-[#1B2A4A] border-b border-white/10 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 bg-[#0070D2] rounded flex items-center justify-center font-bold text-white">
            B
          </div>
          <span className="font-semibold text-white">Bright CRM Setup</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {step === "select" ? (
          <>
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-white mb-3">
                Welcome to Bright CRM
              </h1>
              <p className="text-white/60 text-lg max-w-2xl mx-auto">
                Choose an industry preset to configure your pipeline stages,
                workflows, and terminology. You can always customize everything
                later in Settings.
              </p>
            </div>

            {/* Preset Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {industryPresets.map((preset) => {
                const Icon = iconMap[preset.icon] || Briefcase;
                const isSelected = selected === preset.id;

                return (
                  <button
                    key={preset.id}
                    onClick={() => setSelected(preset.id)}
                    className={`relative text-left p-5 rounded-lg border-2 transition-all ${
                      isSelected
                        ? "bg-white border-[#0070D2] shadow-lg shadow-blue-500/20"
                        : "bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-6 h-6 bg-[#0070D2] rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <Icon
                      className={`w-8 h-8 mb-3 ${
                        isSelected ? "text-[#0070D2]" : "text-white/70"
                      }`}
                    />
                    <h3
                      className={`font-semibold text-sm mb-1 ${
                        isSelected ? "text-[#3E3E3C]" : "text-white"
                      }`}
                    >
                      {preset.name}
                    </h3>
                    <p
                      className={`text-xs leading-relaxed ${
                        isSelected ? "text-[#706E6B]" : "text-white/50"
                      }`}
                    >
                      {preset.description}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Continue button */}
            <div className="text-center">
              <button
                onClick={() => selected && setStep("confirm")}
                disabled={!selected}
                className={`bc-btn px-8 py-3 text-base ${
                  selected
                    ? "bc-btn-primary"
                    : "bg-white/10 text-white/30 border-white/10 cursor-not-allowed"
                }`}
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          /* Confirmation step */
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-white mb-2">
                Confirm Your Setup
              </h1>
              <p className="text-white/60">
                Here&apos;s what we&apos;ll configure for{" "}
                <span className="text-white font-semibold">
                  {selectedPreset?.name}
                </span>
              </p>
            </div>

            {selectedPreset && (
              <div className="bc-card overflow-hidden mb-6">
                {/* Pipeline preview */}
                <div className="bc-section-header">
                  {selectedPreset.pipelineName}
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-1 mb-4">
                    {selectedPreset.stages.map((stage, i) => (
                      <div
                        key={i}
                        className="flex-1 py-2 px-2 text-center text-xs font-semibold text-white rounded"
                        style={{ backgroundColor: stage.color }}
                      >
                        <div className="truncate">{stage.name}</div>
                        <div className="text-[10px] opacity-75 font-normal">
                          {stage.probability}%
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Stage details table */}
                  <table className="bc-table">
                    <thead>
                      <tr>
                        <th>Stage</th>
                        <th>Win Probability</th>
                        <th>Color</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPreset.stages.map((stage, i) => (
                        <tr key={i}>
                          <td className="font-medium">{stage.name}</td>
                          <td>{stage.probability}%</td>
                          <td>
                            <div
                              className="w-5 h-5 rounded border border-[#DDDBDA]"
                              style={{ backgroundColor: stage.color }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Entity labels if customized */}
                {selectedPreset.entityLabels && (
                  <div className="border-t border-[#DDDBDA] p-4">
                    <p className="text-xs font-bold text-[#706E6B] uppercase mb-2">
                      Suggested Terminology
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {Object.entries(selectedPreset.entityLabels).map(
                        ([key, label]) => (
                          <div
                            key={key}
                            className="text-xs bg-[#F4F6F9] px-3 py-1.5 rounded"
                          >
                            <span className="text-[#706E6B] capitalize">
                              {key}:
                            </span>{" "}
                            <span className="font-semibold text-[#3E3E3C]">
                              {label}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setStep("select")}
                className="bc-btn bc-btn-neutral px-6 py-2.5"
              >
                Back
              </button>
              <button
                onClick={handleSetup}
                disabled={loading}
                className="bc-btn bc-btn-primary px-8 py-2.5"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    Launch Bright CRM
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            <p className="text-center text-white/40 text-xs mt-6">
              All settings can be changed later in Settings &rarr; Pipeline
              Management
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
