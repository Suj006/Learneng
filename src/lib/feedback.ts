/** Mistake feedback helpers shared by every game (pure functions, unit-tested). */

/** Age-appropriate wording for mistake reviews (band 1 = Pre-KG–UKG … band 4 = Grades 5–7). */
export function mistakeWords(band: number, correct: string) {
  if (band <= 1) return { title: "Almost! 🌟", line: `It's “${correct}”. Let's say it together!` };
  if (band === 2) return { title: "Nearly there!", line: `The answer is “${correct}”. Let's remember it together!` };
  if (band === 3) return { title: "Good try!", line: `The correct answer is “${correct}”.` };
  return { title: "Not quite.", line: `The correct answer is “${correct}”.` };
}

/** Explains a spelling mistake in one child-friendly sentence (extra, missing, swapped or wrong letter). */
export function spellingTip(typedRaw: string, correctRaw: string) {
  const t = typedRaw.trim().toLowerCase(), c = correctRaw.toLowerCase();
  if (!t) return `Listen again and try spelling “${correctRaw}” letter by letter.`;
  let i = 0; while (i < Math.min(t.length, c.length) && t[i] === c[i]) i++;
  if (t.length === c.length + 1 && t.slice(0, i) + t.slice(i + 1) === c) return `Remember: there's no extra “${t[i]}” in “${correctRaw}”.`;
  if (c.length === t.length + 1 && c.slice(0, i) + c.slice(i + 1) === t) return `Don't forget the “${c[i]}” — it's “${correctRaw}”.`;
  if (t.length === c.length && t[i] === c[i + 1] && t[i + 1] === c[i] && t.slice(i + 2) === c.slice(i + 2)) return `The letters “${c[i]}${c[i + 1]}” go in that order.`;
  if (t.length === c.length && t.slice(i + 1) === c.slice(i + 1)) return `Letter ${i + 1} is “${c[i]}”, not “${t[i]}”.`;
  return `Look closely: ${correctRaw.toUpperCase().split("").join(" ")}.`;
}


/** Approximate "sound it out" chunks (vowel-group heuristic) — a reading aid, not dictionary syllabification. */
export function soundOut(word: string): string[] {
  const w = word.toLowerCase();
  if (w.length <= 3 || /\s/.test(w)) return [word];
  const parts = w.match(/[^aeiouy]*[aeiouy]+(?:[^aeiouy]*$|[^aeiouy](?=[^aeiouy]))?/g) ?? [w];
  // Fold a trailing silent "e" chunk back into the previous part (e.g. "ti" + "me" → "time").
  if (parts.length > 1 && /^[^aeiouy]*e$/.test(parts[parts.length - 1])) { const last = parts.pop()!; parts[parts.length - 1] += last; }
  return parts.join("") === w ? parts : [word];
}
