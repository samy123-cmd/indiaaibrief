import type {
  ClassificationResult,
  ClassifyInput,
  ImpactLevel,
  IndiaRelevance,
  SignalCategory,
} from "@/lib/editorial/types";

const INDIAN_CITIES = [
  "bangalore",
  "bengaluru",
  "mumbai",
  "delhi",
  "new delhi",
  "hyderabad",
  "chennai",
  "pune",
  "kolkata",
  "ahmedabad",
  "gurgaon",
  "gurugram",
  "noida",
  "jaipur",
  "kochi",
  "chandigarh",
];

const INDIAN_COMPANIES = [
  "tcs",
  "infosys",
  "wipro",
  "hcl",
  "reliance",
  "jio",
  "tata",
  "ola",
  "flipkart",
  "swiggy",
  "zomato",
  "byju",
  "unacademy",
  "physics wallah",
  "sarvam",
  "krutrim",
  "corover",
  "cropin",
  "dehaat",
  "ninjacart",
  "bhashini",
  "ai4bharat",
  "fractal",
  "yellow.ai",
  "haptik",
  "dhruva",
  "gnani",
];

const GOVERNMENT_BODIES = [
  "meity",
  "niti aayog",
  "dpiit",
  "digital india",
  "indiaai",
  "india ai",
  "startup india",
  "uidai",
  "nic",
  "cdac",
];

const REGULATORS = ["rbi", "sebi", "trai", "cci", "irdai", "dpdp"];

const POLICIES = [
  "dpdp",
  "digital personal data protection",
  "ai governance",
  "indiaai mission",
  "national ai strategy",
  "bhashini",
  "indiaai",
  "it act",
  "meity advisory",
];

const INDIC_LANGUAGES = [
  "hindi",
  "tamil",
  "telugu",
  "bengali",
  "marathi",
  "kannada",
  "malayalam",
  "gujarati",
  "punjabi",
  "odia",
  "assamese",
  "indic",
];

const INDIA_TERMS = [
  "india",
  "indian",
  "bharat",
  "bharatiya",
  "inr",
  "₹",
  "rupee",
  "crore",
  "lakh",
  "make in india",
  "atmanirbhar",
];

const INDIRECT_GLOBAL_TERMS = [
  "openai",
  "anthropic",
  "claude",
  "chatgpt",
  "gemini",
  "google ai",
  "microsoft",
  "azure",
  "aws",
  "nvidia",
  "meta ai",
  "llama",
  "api pricing",
  "price cut",
  "gpu",
  "model release",
];

const CATEGORY_RULES: Array<{ category: SignalCategory; patterns: RegExp[] }> =
  [
    {
      category: "funding",
      patterns: [
        /\bfund(ing|raise|ed)?\b/i,
        /\bseries [a-d]\b/i,
        /\bseed round\b/i,
        /\binvest(ment|ors?)?\b/i,
        /\bcrore\b/i,
        /\$\d+/i,
      ],
    },
    {
      category: "regulation",
      patterns: [
        /\bregulat(ion|ory|e)\b/i,
        /\bbanned?\b/i,
        /\bcompliance\b/i,
        /\bdpdp\b/i,
        /\bgovernance framework\b/i,
      ],
    },
    {
      category: "policy",
      patterns: [
        /\bpolicy\b/i,
        /\bmeity\b/i,
        /\bniti\b/i,
        /\bparliament\b/i,
        /\bgovernment\b/i,
        /\bmission\b/i,
      ],
    },
    {
      category: "acquisition",
      patterns: [/\bacqui(re|red|sition)\b/i, /\bmerger\b/i, /\bbought\b/i],
    },
    {
      category: "partnership",
      patterns: [
        /\bpartner(ship|s|ed)?\b/i,
        /\bcollaborat(e|ion)\b/i,
        /\bmoU\b/i,
        /\bsigns? deal\b/i,
      ],
    },
    {
      category: "product_launch",
      patterns: [
        /\blaunch(es|ed)?\b/i,
        /\breleases?\b/i,
        /\bunveils?\b/i,
        /\bintroduces?\b/i,
        /\bga\b/i,
        /\bgenerally available\b/i,
      ],
    },
    {
      category: "research",
      patterns: [
        /\bresearch\b/i,
        /\bpaper\b/i,
        /\barxiv\b/i,
        /\bstudy\b/i,
        /\biit\b/i,
        /\biisc\b/i,
        /\bbenchmark\b/i,
      ],
    },
    {
      category: "controversy",
      patterns: [
        /\bcontroversy\b/i,
        /\bleak\b/i,
        /\bscam\b/i,
        /\blawsuit\b/i,
        /\bbacklash\b/i,
        /\bethics\b/i,
      ],
    },
    {
      category: "opportunity",
      patterns: [
        /\btender\b/i,
        /\brfp\b/i,
        /\bgrant\b/i,
        /\bopportunity\b/i,
        /\bcall for\b/i,
      ],
    },
  ];

function includesAny(text: string, terms: string[]): string[] {
  const lower = text.toLowerCase();
  return terms.filter((term) => lower.includes(term.toLowerCase()));
}

function countMatches(text: string, terms: string[]): number {
  return includesAny(text, terms).length;
}

function detectCategory(text: string): SignalCategory {
  for (const rule of CATEGORY_RULES) {
    if (rule.patterns.some((p) => p.test(text))) {
      return rule.category;
    }
  }
  return "opportunity";
}

function parseFundingUsdMillions(text: string): number | null {
  const dollarM = text.match(/\$\s*(\d+(?:\.\d+)?)\s*(m|million|mn)\b/i);
  if (dollarM) return Number(dollarM[1]);

  const dollarB = text.match(/\$\s*(\d+(?:\.\d+)?)\s*(b|billion|bn)\b/i);
  if (dollarB) return Number(dollarB[1]) * 1000;

  const crore = text.match(/₹?\s*(\d+(?:\.\d+)?)\s*crore/i);
  if (crore) return (Number(crore[1]) * 10_000_000) / 83_000_000; // rough INR→USD M

  const plainDollar = text.match(/\$(\d+(?:\.\d+)?)\b/);
  if (plainDollar) {
    const n = Number(plainDollar[1]);
    if (n >= 1000) return n / 1_000_000;
  }

  return null;
}

function detectImpact(
  text: string,
  category: SignalCategory,
  indiaRelevance: IndiaRelevance,
): ImpactLevel {
  const lower = text.toLowerCase();
  const fundingM = parseFundingUsdMillions(text);

  if (
    /ban(ned|s)?|regulatory ban|major policy|national framework|indiaai mission/i.test(
      text,
    ) ||
    (fundingM !== null && fundingM >= 50) ||
    /big tech.*(india|indian)|openai.*(india|indian)|google.*(india|mumbai|hyderabad)/i.test(
      text,
    )
  ) {
    return "critical";
  }

  if (
    (fundingM !== null && fundingM >= 10) ||
    category === "regulation" ||
    /state (policy|government)|significant partnership|major product launch/i.test(
      text,
    ) ||
    (indiaRelevance === "direct" &&
      (category === "policy" || category === "product_launch"))
  ) {
    return "high";
  }

  if (
    (fundingM !== null && fundingM >= 1) ||
    category === "research" ||
    /minor (update|release)|paper|study/i.test(lower)
  ) {
    return "medium";
  }

  if (
    /opinion|hire|hiring|event|conference|webinar|podcast/i.test(lower) ||
    indiaRelevance === "global_context"
  ) {
    return "low";
  }

  return "medium";
}

function detectIndiaRelevance(text: string): IndiaRelevance {
  const directHits =
    countMatches(text, INDIA_TERMS) +
    countMatches(text, INDIAN_CITIES) +
    countMatches(text, INDIAN_COMPANIES) +
    countMatches(text, GOVERNMENT_BODIES) +
    countMatches(text, REGULATORS) +
    countMatches(text, INDIC_LANGUAGES);

  if (directHits > 0) return "direct";

  const indirectHits = countMatches(text, INDIRECT_GLOBAL_TERMS);
  if (indirectHits > 0) return "indirect";

  return "global_context";
}

/** Exported for UI highlighting of India-specific terms. */
export function getIndiaHighlightTerms(): string[] {
  return [
    ...INDIA_TERMS,
    ...INDIAN_CITIES,
    ...INDIAN_COMPANIES,
    ...GOVERNMENT_BODIES,
    ...REGULATORS,
    ...INDIC_LANGUAGES,
    ...POLICIES,
  ];
}

export function classifyIndiaRelevance(
  signal: ClassifyInput,
): ClassificationResult {
  const text = [signal.title, signal.summary ?? "", signal.rawContent ?? ""]
    .join("\n")
    .trim();

  const indiaRelevance = detectIndiaRelevance(text);
  const category = detectCategory(text);
  const impactLevel = detectImpact(text, category, indiaRelevance);

  const relatedStartups = includesAny(text, INDIAN_COMPANIES).map((name) =>
    name
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" "),
  );

  const relatedPolicies = includesAny(text, POLICIES).map((name) =>
    name.toUpperCase().includes("DPDP")
      ? "DPDP Act"
      : name
          .split(" ")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" "),
  );

  const tags = Array.from(
    new Set([
      ...includesAny(text, INDIC_LANGUAGES),
      ...includesAny(text, GOVERNMENT_BODIES),
      category,
      indiaRelevance,
      ...(signal.source ? [signal.source] : []),
    ]),
  );

  return {
    indiaRelevance,
    impactLevel,
    category,
    relatedStartups,
    relatedPolicies,
    tags,
  };
}
