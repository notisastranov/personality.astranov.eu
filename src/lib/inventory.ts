import { BANK } from "@/lib/bank";

export type Mark = "T" | "F" | "?";

export type ScaleId =
  | "guard"
  | "rare"
  | "distress"
  | "drive"
  | "apart"
  | "body"
  | "wary";

export type Band = "quiet" | "mixed" | "raised";

export type EditionId = "tiny" | "small" | "medium" | "full";

export type Item = {
  id: number;
  text: string;
  scale: ScaleId;
  /** The mark that endorses the scale. */
  when: "T" | "F";
};

export type ScaleInfo = {
  id: ScaleId;
  name: string;
  cousin: string;
};

/** Both True is a contradiction — a toy stand-in for an inconsistency pair. */
export const CLASHES: ReadonlyArray<readonly [number, number]> = [
  [1, 8],
  [4, 12],
  [5, 16],
];

export const EDITIONS: readonly {
  id: EditionId;
  name: string;
  length: number;
}[] = [
  { id: "tiny", name: "Very small", length: 7 },
  { id: "small", name: "Small", length: 16 },
  { id: "medium", name: "Medium", length: 49 },
  { id: "full", name: "Full", length: 112 },
];

const LENGTH: Record<EditionId, number> = {
  tiny: 7,
  small: 16,
  medium: 49,
  full: 112,
};

export function isEdition(value: unknown): value is EditionId {
  return value === "tiny" || value === "small" || value === "medium" || value === "full";
}

export function editionOf(value: unknown): EditionId {
  return isEdition(value) ? value : "small";
}

export const SCALES: readonly ScaleInfo[] = [
  { id: "guard", name: "Guarded", cousin: "L" },
  { id: "rare", name: "Unusual", cousin: "F" },
  { id: "distress", name: "Low mood", cousin: "D" },
  { id: "body", name: "Body focus", cousin: "Hs" },
  { id: "wary", name: "Wary", cousin: "Pa" },
  { id: "apart", name: "Keeps apart", cousin: "Si" },
  { id: "drive", name: "Drive", cousin: "Ma" },
];

const OPENING: readonly Item[] = [
  { id: 1, scale: "distress", when: "T", text: "I have felt sad or empty for days at a time." },
  { id: 2, scale: "guard", when: "T", text: "I have never felt annoyed at another person." },
  { id: 3, scale: "body", when: "T", text: "Small aches make me wonder if something serious is wrong." },
  { id: 4, scale: "apart", when: "T", text: "I would rather spend the evening alone than with friends." },
  { id: 5, scale: "drive", when: "T", text: "New ideas pull me off whatever I was already doing." },
  { id: 6, scale: "rare", when: "T", text: "I have believed that other people could hear my thoughts." },
  { id: 7, scale: "wary", when: "T", text: "Most people are looking for a way to use me." },
  { id: 8, scale: "distress", when: "F", text: "My mood is generally good these days." },
  { id: 9, scale: "guard", when: "T", text: "I tell the whole truth, including about small things." },
  { id: 10, scale: "body", when: "T", text: "My body feels tense even when nothing is happening." },
  { id: 11, scale: "drive", when: "T", text: "I sleep very little and still feel full of energy." },
  { id: 12, scale: "apart", when: "F", text: "I enjoy being in a room full of people." },
  { id: 13, scale: "rare", when: "T", text: "Familiar places have looked unreal to me, like a set." },
  { id: 14, scale: "wary", when: "F", text: "I trust people until they give me a reason not to." },
  { id: 15, scale: "distress", when: "T", text: "Things I used to like now feel flat." },
  { id: 16, scale: "drive", when: "F", text: "I stay with a task until it is finished, even when it is dull." },
];

export const ALL_ITEMS: readonly Item[] = [...OPENING, ...BANK];

/** The short booklet. Longer editions add lines after these. */
export const ITEMS: readonly Item[] = OPENING;

export function editionItems(edition: EditionId): readonly Item[] {
  return ALL_ITEMS.slice(0, LENGTH[edition]);
}

export function editionClashes(
  edition: EditionId,
): ReadonlyArray<readonly [number, number]> {
  const length = LENGTH[edition];
  return CLASHES.filter(([a, b]) => a <= length && b <= length);
}

export const CRIB: ReadonlyArray<readonly [string, string, string]> = [
  ["?", "Cannot Say", "Too many blanks, and a board treats the protocol as incomplete."],
  ["L", "Lie", "Uncommon virtue. Selection reads this as guarding, not as good character."],
  ["F", "Infrequency", "Rare items. A board settles this before it believes any other scale."],
  ["K", "Correction", "Quieter guarding than L. Used to adjust other scales. Not scored here."],
  ["VRIN", "Inconsistency", "Pairs that should not both be true. Careless or random answering."],
  ["Hs", "Hypochondriasis", "Body focus. Read against physical training and medical fitness, not as a diagnosis."],
  ["D", "Depression", "Low mood and slowing. The emotional-stability question in a long course."],
  ["Hy", "Hysteria", "Body complaints with a social face. Not scored here."],
  ["Pd", "Psychopathic deviate", "Conflict with rules and authority. The conduct scale boards watch most. Not scored here."],
  ["Mf", "Masculinity–Femininity", "Old interest norms. Not used for selection in this form."],
  ["Pa", "Paranoia", "Suspicion. Read against trust in peers and in a chain of command."],
  ["Pt", "Psychasthenia", "Worry and rumination under stress. A training-stress question. Not scored here."],
  ["Sc", "Schizophrenia", "Alienation and unusual experience. Not scored here."],
  ["Ma", "Hypomania", "Energy and a weak brake. Stamina if mild, impulse and risk if clearly raised."],
  ["Si", "Social introversion", "Keeping apart. Read against group living, teamwork, and being seen as a leader."],
];

/** How a military-school board reads the cousin of this scale. Not a decision. */
export function boardLine(id: ScaleId, level: Band): string | null {
  if (level === "quiet") return null;
  const raised = level === "raised";
  const lines: Record<ScaleId, readonly [string, string]> = {
    guard: [
      "Some uncommon virtue. A board calls that mild guarding, not good character.",
      "The booklet looks too perfect. L is read as defensiveness. It is not scored as conduct.",
    ],
    rare: [
      "A few rare items. They are noted, and the rest is read more carefully.",
      "Unusual items are frequent. F is settled before any training scale is believed. A high F can stop a file.",
    ],
    distress: [
      "Some low mood. A board asks whether energy will hold through a long, stressful course.",
      "Low mood is the shape that rose. That is the emotional-stability question, not a diagnosis of depression.",
    ],
    body: [
      "Some attention to the body. Asked against physical training, not treated as a medical finding.",
      "Body focus is high. Selection asks whether that concern would interfere with training and duty.",
    ],
    wary: [
      "Some distrust. Relevant to roommates, peers, and taking orders without feeling singled out.",
      "Suspicion is high. Read as trouble trusting the group or the chain of command, not as proof that anyone is against you.",
    ],
    apart: [
      "Some preference for being apart. Group living will be part of the interview, not an automatic problem.",
      "Keeping apart is marked. Boards ask how that sits with barracks life, teamwork, and leadership visibility.",
    ],
    drive: [
      "Energy is up. Mild drive can look like stamina. They still ask about finishing what was started.",
      "Drive is high. That is read as impatience and a weak brake — a discipline and safety question, not ambition.",
    ],
  };
  return lines[id][raised ? 1 : 0];
}

export type Profile = {
  counts: Record<ScaleId, number>;
  max: Record<ScaleId, number>;
  clash: number;
  clashPairs: Array<[number, number]>;
  blank: number;
  trueCount: number;
  falseCount: number;
};

function emptyCounts(): Record<ScaleId, number> {
  return {
    guard: 0,
    rare: 0,
    distress: 0,
    drive: 0,
    apart: 0,
    body: 0,
    wary: 0,
  };
}

export function score(answers: Record<number, Mark>, edition: EditionId = "small"): Profile {
  const counts = emptyCounts();
  const max = emptyCounts();
  let blank = 0;
  let trueCount = 0;
  let falseCount = 0;

  for (const item of editionItems(edition)) {
    max[item.scale] += 1;
    const mark = answers[item.id];
    if (mark === "?") blank += 1;
    if (mark === "T") trueCount += 1;
    if (mark === "F") falseCount += 1;
    if (mark && mark === item.when) counts[item.scale] += 1;
  }

  const clashPairs: Array<[number, number]> = [];
  for (const pair of editionClashes(edition)) {
    const [a, b] = pair;
    if (answers[a] === "T" && answers[b] === "T") {
      clashPairs.push([a, b]);
    }
  }

  return {
    counts,
    max,
    clash: clashPairs.length,
    clashPairs,
    blank,
    trueCount,
    falseCount,
  };
}

export function band(n: number, m: number): Band {
  if (m <= 0 || n <= 0) return "quiet";
  if (n * 3 >= m * 2) return "raised";
  if (n * 3 >= m) return "mixed";
  return "quiet";
}

export function read(profile: Profile): string[] {
  const lines: string[] = [];
  const size = Object.values(profile.max).reduce((sum, n) => sum + n, 0);

  if (profile.blank >= Math.max(2, Math.round(size * 0.25))) {
    lines.push(
      "Too many items were passed. A board treats a high Cannot Say count as an incomplete protocol and does not trust the rest.",
    );
  }

  if (profile.clash >= 2) {
    lines.push(
      "More than one pair contradicts. That is the inconsistency problem (the VRIN idea). Content scales are not believed until answering looks careful.",
    );
  } else if (profile.clash === 1) {
    const [a, b] = profile.clashPairs[0];
    lines.push(
      `Items ${a} and ${b} were both True. One inconsistent pair is common. It is noted, not treated as a failed protocol.`,
    );
  }

  const guard = band(profile.counts.guard, profile.max.guard);
  const rare = band(profile.counts.rare, profile.max.rare);

  const marked = profile.trueCount + profile.falseCount;
  const style =
    size > 0 &&
    marked >= Math.max(6, Math.round(size * 0.75)) &&
    (profile.trueCount / marked >= 0.85 || profile.falseCount / marked >= 0.85);

  if (style && profile.clash < 2) {
    if (profile.trueCount / marked >= 0.85) {
      lines.push(
        "Nearly every item is True. All-true answering can lift many scales at once, so a board discounts the heights.",
      );
    } else {
      lines.push(
        "Nearly every item is False. All-false answering flattens scales that are keyed True, so a quiet profile may be a style, not stability.",
      );
    }
  }

  const contentRaised = SCALES.some(
    (scale) =>
      scale.id !== "guard" &&
      scale.id !== "rare" &&
      band(profile.counts[scale.id], profile.max[scale.id]) === "raised",
  );
  const validityLoud = guard === "raised" || rare === "raised" || profile.clash >= 2 || style;

  if (validityLoud && contentRaised) {
    lines.push(
      "Training scales did move. A board would not use them until the validity problem is settled.",
    );
  } else if (lines.length === 0 && !contentRaised && guard === "quiet" && rare === "quiet") {
    lines.push(
      "Nothing stands out. A quiet protocol is what selection hopes to see. They still interview, and they still look at K, Pd, and Pt, which this form does not score.",
    );
  }

  return lines.slice(0, 4);
}
