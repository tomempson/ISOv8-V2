import type { ImageMetadata } from "astro";
import phase1 from "../assets/images/phase-1.jpg";
import phase2 from "../assets/images/phase-2.jpg";
import phase3 from "../assets/images/phase-3.jpg";
import phase4 from "../assets/images/phase-4.jpg";
import phase5 from "../assets/images/phase-5.jpg";

export interface SectionTaxonomy {
  sidebarId: string;
  sanityValue: string;
  label: string;
}

export interface PhaseTaxonomy {
  sidebarId: string;
  sanityValue: string;
  label: string;
  image: ImageMetadata;
  sections: SectionTaxonomy[];
}

export const TAXONOMY: PhaseTaxonomy[] = [
  {
    sidebarId: "phase-1",
    sanityValue: "understand",
    label: "Phase 1 - Understand",
    image: phase1,
    sections: [
      { sidebarId: "base-platforms", sanityValue: "base-platforms-and-structural-principles", label: "Base Platforms & Structural Principles" },
      { sidebarId: "structural-behaviour", sanityValue: "structural-behavior-and-modification-limits", label: "Structural Behaviour, & Modification Limits" },
      { sidebarId: "performance-comfort", sanityValue: "performance-comfort-and-longevity", label: "Performance, Comfort & Longevity" },
      { sidebarId: "planning-legal", sanityValue: "planning-legal-and-compliance", label: "Planning, Legal and Compliance" },
      { sidebarId: "commercial-financial", sanityValue: "commercial-and-financial-hub", label: "Commercial & Financial Hub" },
    ],
  },
  {
    sidebarId: "phase-2",
    sanityValue: "define",
    label: "Phase 2 - Define",
    image: phase2,
    sections: [
      { sidebarId: "decision-frameworks", sanityValue: "decision-framework", label: "Decision Frameworks" },
      { sidebarId: "red-flag-warnings", sanityValue: "red-flag-warnings", label: "Red Flag Warnings" },
      { sidebarId: "reality-chq", sanityValue: "reality-chq", label: "Reality CHQ™" },
      { sidebarId: "platform-selection", sanityValue: "platform-section", label: "Platform Selection" },
    ],
  },
  {
    sidebarId: "phase-3",
    sanityValue: "see",
    label: "Phase 3 - See",
    image: phase3,
    sections: [
      { sidebarId: "real-world-examples", sanityValue: "real-world-product-examples", label: "Real-World Product Examples" },
      { sidebarId: "industries-operational", sanityValue: "industries-and-operational-use", label: "Industries & Operational Use" },
    ],
  },
  {
    sidebarId: "phase-4",
    sanityValue: "perform",
    label: "Phase 4 - Perform",
    image: phase4,
    sections: [
      { sidebarId: "from-a-to-done", sanityValue: "from-a-to-done", label: "From A to Done™" },
      { sidebarId: "internal-finishes", sanityValue: "internal-finishes-and-fit-out-options", label: "Internal Finishes & Fit-Out Options" },
      { sidebarId: "maintenance-aftercare", sanityValue: "maintenance-condition-control-and-aftercare", label: "Maintenance, Condition Control & Aftercare" },
      { sidebarId: "practical-execution", sanityValue: "practical-execution-and-ownership", label: "Practical Execution & Ownership" },
    ],
  },
  {
    sidebarId: "phase-5",
    sanityValue: "align",
    label: "Phase 5 - Align",
    image: phase5,
    sections: [
      { sidebarId: "technical-reference", sanityValue: "technical-reference-hub", label: "Technical Reference Hub" },
      { sidebarId: "project-definition", sanityValue: "project-definition-and-alignment", label: "Project Definition & Alignment" },
      { sidebarId: "transport-geography", sanityValue: "transport-and-geography", label: "Transport and Geography" },
    ],
  },
];

// Legacy "Phase / Section" shape used by sidebar/menu/footer templates.
export interface Section {
  id: string;
  label: string;
}

export interface Phase {
  id: string;
  label: string;
  image: ImageMetadata;
  sections: Section[];
}

export const phases: Phase[] = TAXONOMY.map((p) => ({
  id: p.sidebarId,
  label: p.label,
  image: p.image,
  sections: p.sections.map((s) => ({ id: s.sidebarId, label: s.label })),
}));

const allSections = TAXONOMY.flatMap((p) =>
  p.sections.map((s) => ({ ...s, phase: p }))
);

export const phaseSidebarToSanity: Record<string, string> = Object.fromEntries(
  TAXONOMY.map((p) => [p.sidebarId, p.sanityValue])
);

export const phaseSanityToSidebar: Record<string, string> = Object.fromEntries(
  TAXONOMY.map((p) => [p.sanityValue, p.sidebarId])
);

export const phaseSanityToLabel: Record<string, string> = Object.fromEntries(
  TAXONOMY.map((p) => [p.sanityValue, p.label])
);

export const sectionSidebarToSanity: Record<string, string> = Object.fromEntries(
  allSections.map((s) => [s.sidebarId, s.sanityValue])
);

export const sectionSanityToSidebar: Record<string, string> = Object.fromEntries(
  allSections.map((s) => [s.sanityValue, s.sidebarId])
);

export const sectionSanityToLabel: Record<string, string> = Object.fromEntries(
  allSections.map((s) => [s.sanityValue, s.label])
);
