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

export const SCALES: readonly ScaleInfo[] = [
  { id: "guard", name: "Guarded", cousin: "L" },
  { id: "rare", name: "Unusual", cousin: "F" },
  { id: "distress", name: "Low mood", cousin: "D" },
  { id: "body", name: "Body focus", cousin: "Hs" },
  { id: "wary", name: "Wary", cousin: "Pa" },
  { id: "apart", name: "Keeps apart", cousin: "Si" },
  { id: "drive", name: "Drive", cousin: "Ma" },
];

export const ITEMS: readonly Item[] = [
  {
    id: 1,
    scale: "distress",
    when: "T",
    text: "I have felt sad or empty for days at a time.",
  },
  {
    id: 2,
    scale: "guard",
    when: "T",
    text: "I have never felt annoyed at another person.",
  },
  {
    id: 3,
    scale: "body",
    when: "T",
    text: "Small aches make me wonder if something serious is wrong.",
  },
  {
    id: 4,
    scale: "apart",
    when: "T",
    text: "I would rather spend the evening alone than with friends.",
  },
  {
    id: 5,
    scale: "drive",
    when: "T",
    text: "New ideas pull me off whatever I was already doing.",
  },
  {
    id: 6,
    scale: "rare",
    when: "T",
    text: "I have believed that other people could hear my thoughts.",
  },
  {
    id: 7,
    scale: "wary",
    when: "T",
    text: "Most people are looking for a way to use me.",
  },
  {
    id: 8,
    scale: "distress",
    when: "F",
    text: "My mood is generally good these days.",
  },
  {
    id: 9,
    scale: "guard",
    when: "T",
    text: "I tell the whole truth, including about small things.",
  },
  {
    id: 10,
    scale: "body",
    when: "T",
    text: "My body feels tense even when nothing is happening.",
  },
  {
    id: 11,
    scale: "drive",
    when: "T",
    text: "I sleep very little and still feel full of energy.",
  },
  {
    id: 12,
    scale: "apart",
    when: "F",
    text: "I enjoy being in a room full of people.",
  },
  {
    id: 13,
    scale: "rare",
    when: "T",
    text: "Familiar places have looked unreal to me, like a set.",
  },
  {
    id: 14,
    scale: "wary",
    when: "F",
    text: "I trust people until they give me a reason not to.",
  },
  {
    id: 15,
    scale: "distress",
    when: "T",
    text: "Things I used to like now feel flat.",
  },
  {
    id: 16,
    scale: "drive",
    when: "F",
    text: "I stay with a task until it is finished, even when it is dull.",
  },
];

export const CRIB: ReadonlyArray<readonly [string, string, string]> = [
  ["?", "Cannot Say", "Too many blanks, and the rest of a protocol gets shaky."],
  ["L", "Lie", "Uncommon virtue. The record looks too perfect."],
  ["F", "Infrequency", "Rare experiences. Read this before believing symptoms."],
  ["K", "Correction", "A quieter kind of guarding than L. Not scored here."],
  ["VRIN", "Inconsistency", "Pairs that should not be endorsed together."],
  ["Hs", "Hypochondriasis", "Concern about the body."],
  ["D", "Depression", "Low mood and slowing."],
  ["Hy", "Hysteria", "Body complaints with a social face. Not scored here."],
  ["Pd", "Psychopathic deviate", "Conflict with rules. Not scored here."],
  ["Mf", "Masculinity–Femininity", "Old interest norms. Not in this form."],
  ["Pa", "Paranoia", "Suspicion, a sense of being used."],
  ["Pt", "Psychasthenia", "Anxiety, doubt, rumination. Not scored here."],
  ["Sc", "Schizophrenia", "Alienation and unusual experience. Not scored here."],
  ["Ma", "Hypomania", "Energy, speed, impatience."],
  ["Si", "Social introversion", "Keeping apart from people."],
];

const CONTENT_LINE: Record<Exclude<ScaleId, "guard" | "rare">, string> = {
  distress:
    "Low mood is what rose. That is the shape of a depression-style elevation, not a diagnosis.",
  body: "Attention to the body is what rose. That is a somatic shape, not a medical finding.",
  wary: "Distrust is what rose. That is a suspicion shape, not a finding about other people.",
  apart: "Preference for being apart is what rose. That is an introversion shape.",
  drive: "Energy and impatience are what rose. That is a hypomania-style shape, not a diagnosis.",
};

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

export function score(answers: Record<number, Mark>): Profile {
  const counts = emptyCounts();
  const max = emptyCounts();
  let blank = 0;
  let trueCount = 0;
  let falseCount = 0;

  for (const item of ITEMS) {
    max[item.scale] += 1;
    const mark = answers[item.id];
    if (mark === "?") blank += 1;
    if (mark === "T") trueCount += 1;
    if (mark === "F") falseCount += 1;
    if (mark && mark === item.when) counts[item.scale] += 1;
  }

  const clashPairs: Array<[number, number]> = [];
  for (const pair of CLASHES) {
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

  if (profile.blank >= 4) {
    lines.push(
      "Several items were passed. A high Cannot Say count makes the rest of a protocol hard to trust.",
    );
  }

  if (profile.clash >= 2) {
    lines.push(
      "More than one pair contradicts. Treat this as a consistency problem before reading any scale.",
    );
  } else if (profile.clash === 1) {
    const [a, b] = profile.clashPairs[0];
    lines.push(
      `Items ${a} and ${b} were both True. One slip is common; note it and keep going.`,
    );
  }

  const guard = band(profile.counts.guard, profile.max.guard);
  const rare = band(profile.counts.rare, profile.max.rare);

  if (guard === "raised") {
    lines.push(
      "Virtue items are marked in the extreme. That pattern is read as guarding, not as proof of a spotless record.",
    );
  }

  if (rare === "raised") {
    lines.push(
      "Unusual experiences are endorsed often. On a real report that is read before any symptom scale is believed.",
    );
  }

  const marked = profile.trueCount + profile.falseCount;
  const style =
    marked >= 12 &&
    (profile.trueCount / marked >= 0.85 || profile.falseCount / marked >= 0.85);

  if (style && profile.clash < 2) {
    if (profile.trueCount / marked >= 0.85) {
      lines.push(
        "Nearly every item is True. That response style can lift many scales at once.",
      );
    } else {
      lines.push(
        "Nearly every item is False. A nay-saying style can flatten scales that are keyed True.",
      );
    }
  }

  const validityLoud =
    guard === "raised" || rare === "raised" || profile.clash >= 2 || style;

  if (!validityLoud) {
    const content = SCALES.filter(
      (scale) => scale.id !== "guard" && scale.id !== "rare",
    )
      .map((scale) => ({
        id: scale.id as Exclude<ScaleId, "guard" | "rare">,
        ratio: profile.counts[scale.id] / profile.max[scale.id],
        level: band(profile.counts[scale.id], profile.max[scale.id]),
      }))
      .sort((a, b) => b.ratio - a.ratio);

    const top = content[0];
    if (top && top.level === "raised") {
      lines.push(CONTENT_LINE[top.id]);
    } else if (lines.length === 0) {
      lines.push("Nothing stands out. Quiet protocols are read by what fails to rise.");
    }
  }

  return lines.slice(0, 3);
}
