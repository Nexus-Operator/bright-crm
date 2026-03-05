export interface StagePreset {
  name: string;
  probability: number;
  color: string;
}

export interface IndustryPreset {
  id: string;
  name: string;
  icon: string;
  description: string;
  pipelineName: string;
  stages: StagePreset[];
  sampleLeadStatuses: string[];
  entityLabels?: {
    leads?: string;
    contacts?: string;
    accounts?: string;
    deals?: string;
  };
}

export const industryPresets: IndustryPreset[] = [
  {
    id: "general",
    name: "General Sales",
    icon: "Briefcase",
    description:
      "Standard B2B/B2C sales pipeline. Works for most businesses with a traditional sales cycle.",
    pipelineName: "Sales Pipeline",
    stages: [
      { name: "Prospecting", probability: 10, color: "#6B7280" },
      { name: "Qualification", probability: 20, color: "#3B82F6" },
      { name: "Proposal", probability: 50, color: "#8B5CF6" },
      { name: "Negotiation", probability: 75, color: "#F59E0B" },
      { name: "Closed Won", probability: 100, color: "#10B981" },
      { name: "Closed Lost", probability: 0, color: "#EF4444" },
    ],
    sampleLeadStatuses: ["New", "Contacted", "Qualified", "Unqualified"],
  },
  {
    id: "hrt_supplements",
    name: "HRT & Supplements",
    icon: "Heart",
    description:
      "Hormone replacement therapy & wellness supplement sales. Track patients from outreach through lab work to consultation and onboarding.",
    pipelineName: "Patient Pipeline",
    stages: [
      { name: "Outreach", probability: 10, color: "#6366F1" },
      { name: "Lab Work Follow-up", probability: 25, color: "#8B5CF6" },
      { name: "Labs In", probability: 40, color: "#3B82F6" },
      { name: "Consultation Scheduled", probability: 60, color: "#0EA5E9" },
      { name: "Consultation Complete", probability: 80, color: "#F59E0B" },
      { name: "New Patient", probability: 100, color: "#10B981" },
      { name: "Lost", probability: 0, color: "#EF4444" },
    ],
    sampleLeadStatuses: [
      "New",
      "Contacted",
      "Interested",
      "Not Interested",
    ],
    entityLabels: {
      deals: "Patient Cases",
      contacts: "Patients",
    },
  },
  {
    id: "real_estate",
    name: "Real Estate",
    icon: "Home",
    description:
      "Property sales and listings pipeline. Track buyers from first showing through closing.",
    pipelineName: "Property Pipeline",
    stages: [
      { name: "New Lead", probability: 10, color: "#6B7280" },
      { name: "Showing Scheduled", probability: 25, color: "#6366F1" },
      { name: "Showing Complete", probability: 40, color: "#3B82F6" },
      { name: "Offer Made", probability: 60, color: "#8B5CF6" },
      { name: "Under Contract", probability: 80, color: "#F59E0B" },
      { name: "Closed", probability: 100, color: "#10B981" },
      { name: "Lost", probability: 0, color: "#EF4444" },
    ],
    sampleLeadStatuses: ["New", "Contacted", "Qualified", "Unqualified"],
  },
  {
    id: "saas",
    name: "SaaS / Software",
    icon: "Monitor",
    description:
      "Software-as-a-service sales cycle. From discovery calls through demos, trials, and subscriptions.",
    pipelineName: "SaaS Pipeline",
    stages: [
      { name: "Discovery", probability: 10, color: "#6B7280" },
      { name: "Demo Scheduled", probability: 20, color: "#6366F1" },
      { name: "Demo Complete", probability: 35, color: "#3B82F6" },
      { name: "Trial", probability: 50, color: "#8B5CF6" },
      { name: "Proposal", probability: 70, color: "#F59E0B" },
      { name: "Negotiation", probability: 85, color: "#0EA5E9" },
      { name: "Closed Won", probability: 100, color: "#10B981" },
      { name: "Closed Lost", probability: 0, color: "#EF4444" },
    ],
    sampleLeadStatuses: ["New", "Contacted", "Qualified", "Unqualified"],
  },
  {
    id: "recruiting",
    name: "Recruiting / Staffing",
    icon: "Users",
    description:
      "Talent acquisition and placement pipeline. Track candidates from sourcing through placement.",
    pipelineName: "Recruiting Pipeline",
    stages: [
      { name: "Sourced", probability: 5, color: "#6B7280" },
      { name: "Contacted", probability: 15, color: "#6366F1" },
      { name: "Screened", probability: 30, color: "#3B82F6" },
      { name: "Submitted to Client", probability: 50, color: "#8B5CF6" },
      { name: "Interview", probability: 70, color: "#F59E0B" },
      { name: "Offer", probability: 90, color: "#0EA5E9" },
      { name: "Placed", probability: 100, color: "#10B981" },
      { name: "Rejected", probability: 0, color: "#EF4444" },
    ],
    sampleLeadStatuses: ["New", "Contacted", "Screened", "Not a Fit"],
    entityLabels: {
      contacts: "Candidates",
      deals: "Placements",
      accounts: "Client Companies",
    },
  },
  {
    id: "insurance",
    name: "Insurance",
    icon: "Shield",
    description:
      "Insurance policy sales pipeline. From needs analysis through underwriting to policy issuance.",
    pipelineName: "Policy Pipeline",
    stages: [
      { name: "Lead", probability: 10, color: "#6B7280" },
      { name: "Needs Analysis", probability: 25, color: "#6366F1" },
      { name: "Quote Provided", probability: 40, color: "#3B82F6" },
      { name: "Application", probability: 60, color: "#8B5CF6" },
      { name: "Underwriting", probability: 80, color: "#F59E0B" },
      { name: "Policy Issued", probability: 100, color: "#10B981" },
      { name: "Declined", probability: 0, color: "#EF4444" },
    ],
    sampleLeadStatuses: ["New", "Contacted", "Qualified", "Unqualified"],
    entityLabels: {
      deals: "Policies",
    },
  },
  {
    id: "healthcare",
    name: "Healthcare / Medical",
    icon: "Stethoscope",
    description:
      "Patient acquisition and care management. Track from initial inquiry through active treatment.",
    pipelineName: "Patient Care Pipeline",
    stages: [
      { name: "Inquiry", probability: 10, color: "#6B7280" },
      { name: "Appointment Scheduled", probability: 30, color: "#6366F1" },
      { name: "Initial Visit", probability: 50, color: "#3B82F6" },
      { name: "Treatment Plan", probability: 70, color: "#8B5CF6" },
      { name: "In Treatment", probability: 85, color: "#F59E0B" },
      { name: "Active Patient", probability: 100, color: "#10B981" },
      { name: "Churned", probability: 0, color: "#EF4444" },
    ],
    sampleLeadStatuses: ["New", "Contacted", "Scheduled", "No Show"],
    entityLabels: {
      contacts: "Patients",
      deals: "Treatment Plans",
      accounts: "Referring Providers",
    },
  },
  {
    id: "consulting",
    name: "Consulting / Agency",
    icon: "Lightbulb",
    description:
      "Professional services and consulting engagements. From lead to signed statement of work.",
    pipelineName: "Engagement Pipeline",
    stages: [
      { name: "Lead", probability: 10, color: "#6B7280" },
      { name: "Discovery Call", probability: 20, color: "#6366F1" },
      { name: "Scoping", probability: 40, color: "#3B82F6" },
      { name: "Proposal Sent", probability: 60, color: "#8B5CF6" },
      { name: "SOW Review", probability: 80, color: "#F59E0B" },
      { name: "Signed", probability: 100, color: "#10B981" },
      { name: "Lost", probability: 0, color: "#EF4444" },
    ],
    sampleLeadStatuses: ["New", "Contacted", "Qualified", "Unqualified"],
    entityLabels: {
      deals: "Engagements",
    },
  },
];

export function getPresetById(id: string): IndustryPreset | undefined {
  return industryPresets.find((p) => p.id === id);
}
