export interface Section {
  id: string;
  label: string;
}

export interface Phase {
  id: string;
  label: string;
  image: string;
  sections: Section[];
}

export const phases: Phase[] = [
  {
    id: "phase-1",
    label: "Phase 1 - Understand",
    image: "/assets/images/phase-1.jpg",
    sections: [
      { id: "base-platforms", label: "Base Platforms & Structural Principles" },
      { id: "structural-behaviour", label: "Structural Behaviour, & Modification Limits" },
      { id: "performance-comfort", label: "Performance, Comfort & Longevity" },
      { id: "planning-legal", label: "Planning, Legal and Compliance" },
      { id: "commercial-financial", label: "Commercial & Financial Hub" },
    ],
  },
  {
    id: "phase-2",
    label: "Phase 2 - Define",
    image: "/assets/images/phase-2.jpg",
    sections: [
      { id: "decision-frameworks", label: "Decision Frameworks" },
      { id: "red-flag-warnings", label: "Red Flag Warnings" },
      { id: "reality-chq", label: "Reality CHQ™" },
      { id: "platform-selection", label: "Platform Selection" },
    ],
  },
  {
    id: "phase-3",
    label: "Phase 3 - See",
    image: "/assets/images/phase-3.jpg",
    sections: [
      { id: "real-world-examples", label: "Real-World Product Examples" },
      { id: "industries-operational", label: "Industries & Operational Use" },
    ],
  },
  {
    id: "phase-4",
    label: "Phase 4 - Perform",
    image: "/assets/images/phase-4.jpg",
    sections: [
      { id: "from-a-to-done", label: "From A to Done™" },
      { id: "internal-finishes", label: "Internal Finishes & Fit-Out Options" },
      { id: "maintenance-aftercare", label: "Maintenance, Condition Control & Aftercare" },
      { id: "practical-execution", label: "Practical Execution & Ownership" },
    ],
  },
  {
    id: "phase-5",
    label: "Phase 5 - Align",
    image: "/assets/images/phase-5.jpg",
    sections: [
      { id: "technical-reference", label: "Technical Reference Hub" },
      { id: "project-definition", label: "Project Definition & Alignment" },
      { id: "transport-geography", label: "Transport and Geography" },
    ],
  },
];
