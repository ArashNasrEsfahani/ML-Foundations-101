/**
 * A concept is one idea explained three times over, at three depths.
 *
 * The book explains most things once, at one depth, and a reader who is not
 * ready for that depth is simply stuck. Every term the course marks up with
 * `[[id]]` resolves to one of these, and the reader picks how deep to go:
 *
 *   simple    — what you would tell a curious friend on a walk. No symbols,
 *               no jargon, and no hedging. If it needs a second sentence to
 *               make the picture land, use one.
 *   technical — what a practitioner means: the mechanism, when it matters,
 *               and what it trades away. Jargon is fine here, provided the
 *               jargon itself is either explained or linked with [[…]].
 *   math      — the formal statement. Inline `$tex$`, and enough words around
 *               the symbols that the equation is read rather than displayed.
 *
 * All three are markdown-lite (`**bold**`, `*em*`, `` `code` ``, `$tex$`,
 * `[[concept]]`, `[text](sec:section-id)`), so a concept may lean on other
 * concepts instead of re-explaining them.
 */
export interface Concept {
  /** kebab-case, globally unique, stable — it is what prose refers to */
  id: string;
  /** display name, sentence case unless it is a proper noun */
  term: string;
  simple: string;
  technical: string;
  math: string;
  /**
   * What to search StatQuest for. Josh Starmer has not covered everything, so
   * leave this off rather than sending the reader somewhere empty — a link
   * that lands on "no results" is worse than no link.
   */
  statquest?: string;
  /**
   * A specific video URL, when one has actually been confirmed to exist. Takes
   * precedence over `statquest`, which only ever produces a channel search.
   */
  video?: string;
  /** the section that teaches this properly — becomes a "read the section" link */
  teachesAt?: string;
  /** neighbouring ideas, offered as follow-on chips at the bottom of the card */
  see?: string[];
}

/**
 * A search inside StatQuest's own channel. Deliberately a search rather than a
 * guessed `watch?v=` id: the search always lands somewhere real, and it keeps
 * working when a video is re-uploaded.
 */
export function statquestUrl(query: string): string {
  return `https://www.youtube.com/@statquest/search?query=${encodeURIComponent(query)}`;
}

/** The link to offer for a concept, if any. */
export function conceptVideo(c: Concept): { url: string; exact: boolean } | null {
  if (c.video) return { url: c.video, exact: true };
  if (c.statquest) return { url: statquestUrl(c.statquest), exact: false };
  return null;
}
