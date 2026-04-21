export const SPECIES_EMOJI: Record<string, string> = {
  pikolet: "🐦",
  lorti: "🐦",
  djek: "🐦",
  "twa-twa": "🐦",
};

export const SPECIES_LABEL: Record<string, string> = {
  pikolet: "Pikolèt",
  lorti: "Lorti",
  djek: "Djek",
  "twa-twa": "Twa-twa",
};

export const SPECIES_OPTIONS = [
  { key: "pikolet", label: "🐦 Pikolèt", scientific: "Sporophila minuta" },
  { key: "lorti", label: "🐦 Lorti", scientific: "Forpus passerinus" },
  { key: "djek", label: "🐦 Djek", scientific: "Sporophila americana" },
  { key: "twa-twa", label: "🐦 Twa-twa", scientific: "Sporophila maximiliani" },
] as const;
