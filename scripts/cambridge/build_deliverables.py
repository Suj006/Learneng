"""Builds the Cambridge vocabulary mapping workbook + JSON (internal research deliverables, not for redistribution)."""
import json, collections, re, datetime
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.utils import get_column_letter
D = json.load(open("/tmp/cam/mapping.json"))
rows, pv = D["rows"], D["pv"]
OUT = "deliverables/cambridge-vocabulary-analysis"
TODAY = datetime.date.today().isoformat()
CATS = ["Home and Family", "School and Education", "Animals", "Food and Nutrition", "Body and Health", "Nature", "Weather and Seasons", "Transport", "Sports and Hobbies", "Emotions and Feelings", "Colours and Shapes", "Clothing", "Time", "Places", "Community Helpers", "Technology", "Science", "Geography", "Environment", "Travel", "Arts and Culture", "Music", "Communication", "Actions", "Descriptions", "Relationships", "Time and Frequency", "Money and Shopping", "Thinking and Problem-solving", "Values and Character"]
REALLIFE = {"Food and Nutrition": "restaurant; food-counter; grocery", "Travel": "airport; bus-station; railway; travel-desk; hotel", "Transport": "bus-station; railway; airport", "Places": "asking-help; post-office; mall; library",
 "Body and Health": "clinic", "Money and Shopping": "grocery; mall; bookshop", "Weather and Seasons": "weather", "School and Education": "school; presentation; library", "Sports and Hobbies": "sports-club; park",
 "Community Helpers": "community-helpers; post-office", "Arts and Culture": "museum", "Home and Family": "birthday; new-friend", "Relationships": "new-friend; birthday", "Communication": "telephone; presentation", "Technology": "telephone", "Nature": "park", "Clothing": "mall", "Emotions and Feelings": "new-friend", "Animals": "park"}
SCENE_RL = {"toy-shop": "mall", "party": "birthday", "doctor": "clinic", "hotel": "hotel", "countryside": "park; bus-station", "weather": "weather", "town": "asking-help; post-office", "holidays": "travel-desk; airport"}
def grammar_link(pos):
    if "phrasal verb" in pos: return "verbs (phrasal verbs, band 4)"
    if "verb" in pos: return "verbs; tenses"
    if "adjective" in pos: return "adjectives; comparative-superlative-adjectives"
    if "adverb" in pos: return "adverbs"
    if "noun" in pos: return "nouns; articles"
    return ""
def phonics_link(w):
    w = w.lower()
    for pat, unit in (("sh", "digraphs (sh)"), ("ch", "digraphs (ch)"), ("th", "digraphs (th)"), ("ph", "digraphs (ph)"), ("wh", "digraphs (wh)"), ("ai", "vowel teams (ai)"), ("ee", "vowel teams (ee)"), ("oa", "vowel teams (oa)"), ("igh", "vowel teams (igh)")):
        if pat in w: return unit
    if re.fullmatch(r"[^aeiou]*[aeiou][^aeiou]e", w): return "long vowels (magic e)"
    if re.match(r"^(bl|br|cr|tr|st|sp|sn|fr|gr|pl|dr|cl|fl|gl|sl|sm|sw)", w): return "consonant blends"
    if re.fullmatch(r"[^aeiou][aeiou][^aeiou]", w): return "CVC blending"
    return "syllables / decoding" if len(w) > 6 else ""
H = Font(bold=True, color="FFFFFF"); HF = PatternFill("solid", fgColor="852DEB")
def sheet(wb, title, header, data, widths=None, note=None):
    ws = wb.create_sheet(title[:31]); r0 = 1
    if note: ws.cell(1, 1, note).font = Font(italic=True, color="555555"); r0 = 3
    for c, h in enumerate(header, 1):
        x = ws.cell(r0, c, h); x.font = H; x.fill = HF; x.alignment = Alignment(wrap_text=True, vertical="top")
    for i, row in enumerate(data, r0 + 1):
        for c, v in enumerate(row, 1): ws.cell(i, c, "; ".join(map(str, v)) if isinstance(v, (list, tuple)) else (", ".join(f"{a}: {b}" for a, b in v.items()) if isinstance(v, dict) else v))
    for c in range(1, len(header) + 1): ws.column_dimensions[get_column_letter(c)].width = (widths or {}).get(c, 16)
    ws.freeze_panes = ws.cell(r0 + 1, 2)
    ws.auto_filter.ref = f"A{r0}:{get_column_letter(len(header))}{r0 + max(1, len(data))}"
    return ws
by_key = collections.defaultdict(list)
for r in rows: by_key[r["key"]].append(r)
wb = Workbook(); wb.remove(wb.active)
NOTE = "INTERNAL RESEARCH — maps PING VIBE vocabulary against Cambridge English reference lists for curriculum planning. Not affiliated with or endorsed by Cambridge. Do not redistribute source lists."

# 1. Existing audit
audit = []
for k, v in sorted(pv.items(), key=lambda kv: (kv[1]["band"], kv[0])):
    m = by_key.get(k, [])
    mov = any(r["source"] == "Movers 2014" for r in m); pre = any(r["source"] == "Preliminary 2012" for r in m)
    sug = sorted({r["suggested_band"] for r in m})
    agree = "" if not sug else ("agrees" if v["band"] in sug or any(abs(v["band"] - s) <= 1 for s in sug) else f"review: Cambridge-based suggestion band {sug}")
    action = "keep (published)" if v["status"] == "published" else ("remove from queue: already published" if v.get("also_queued") else "enrich via Content Studio pipeline → review")
    audit.append([v["word"], v["status"], v["band"], v.get("pos") or "", v.get("tag") or "", v.get("category") or "Unmapped (needs categorisation)", "yes" if mov else "", "yes" if pre else "", sug, agree, action])
sheet(wb, "Existing Vocabulary Audit", ["Word", "PING VIBE status", "PV band", "Part of speech", "Queue tag", "Taxonomy category (inferred)", "In Movers", "In Preliminary", "Cambridge-based band suggestion", "Band check", "Recommended action"], audit, {1: 22, 6: 26, 10: 30, 11: 36}, NOTE)

def maprow(r):
    return [r["headword"], r["key"], r["pos"], r.get("page"), r["scene_themes"], r["source_topics"], r["pv_category"] or "", r["pv_match_type"] or "new", r["pv_match"] or "", r["pv_status"] or "", r["suggested_band"], r["suggested_grades"], r["suggested_difficulty"], r["receptive_productive"], r["zipf_frequency"], r["syllables_cmu"] or "", "yes" if r["multi_meaning_flag"] else "", r["exclusion"] or "", "recommended (wave 1)" if r["recommended"] else ("reserve" if r.get("reserve") else ("covered" if r["pv_match_type"] in ("exact", "plural/singular", "British/American variant") else "not recommended"))]
MH = ["Source headword", "Normalised key", "Part(s) of speech", "Source page", "Scene theme(s)", "Source topic(s)", "PV taxonomy category", "Match vs PING VIBE", "Matched PV word", "PV status", "Suggested band", "Suggested grades", "Suggested difficulty", "Receptive/productive", "Zipf frequency", "Syllables (CMU)", "Senses constrained in source", "Exclusion reason", "Decision"]
sheet(wb, "Movers Vocabulary Mapping", MH, [maprow(r) for r in rows if r["source"] == "Movers 2014"], {1: 20, 8: 22, 18: 40, 19: 20}, NOTE)
sheet(wb, "Preliminary Vocabulary Mapping", MH, [maprow(r) for r in rows if r["source"] == "Preliminary 2012"], {1: 22, 8: 22, 18: 40, 19: 20}, NOTE)

# 4. Duplicates & overlap
dup = []
for k, v in pv.items():
    if v.get("also_queued"): dup.append(["PING VIBE internal", v["word"], "", "exact duplicate", "published word also in the 757 queue", "remove from queue (keep published record and its ID)"])
for r in rows:
    if r["pv_match_type"]: dup.append([r["source"] + " vs PING VIBE", r["headword"], r["pv_match"], r["pv_match_type"], f"PV status {r['pv_status']}, band {r['pv_band']}",
        {"exact": "no new record; add provenance tag", "plural/singular": "same lexeme; no new record", "British/American variant": "keep British/Indian spelling; record variant", "word family": "separate record allowed (different word); link as word family", "multi-word contains existing word": "separate expression; link to base word"}[r["pv_match_type"]]])
mk = {r["key"] for r in rows if r["source"] == "Movers 2014"}
for r in rows:
    if r["source"] == "Preliminary 2012" and r["key"] in mk: dup.append(["Movers ∩ Preliminary", r["headword"], r["key"], "in both sources", "", "one candidate record; earliest band (Movers) wins"])
cnt = collections.Counter((r["source"], r["key"]) for r in rows)
for (src, k), n in cnt.items():
    if n > 1: dup.append([f"{src} internal", k, "", "multiple entries (different senses/POS)", f"{n} entries", "keep separate sense records; do not merge meanings"])
sheet(wb, "Duplicate and Overlap Analysis", ["Comparison", "Headword", "Matched with", "Match type", "Detail", "Handling"], dup, {2: 22, 4: 28, 5: 30, 6: 48}, NOTE)

# 5. Grade & difficulty
gd = []
for src in ("Movers 2014", "Preliminary 2012"):
    for b in (1, 2, 3, 4):
        for d in ("Beginner", "Developing", "Intermediate", "Advanced", "Challenge"):
            n = sum(1 for r in rows if r["source"] == src and r["suggested_band"] == b and r["suggested_difficulty"] == d and not r["exclusion"])
            if n: gd.append([src, b, {1: "Pre-KG–UKG", 2: "Grades 1–2", 3: "Grades 3–4", 4: "Grades 5–7"}[b], d, n])
mism = [[a[0], a[2], a[8], a[9]] for a in audit if a[9].startswith("review")]
ws = sheet(wb, "Grade and Difficulty Mapping", ["Source", "Suggested band", "Grades", "Difficulty", "Entries (excluding exclusions)"], gd, {1: 20, 3: 14, 5: 16},
           "Rules: Movers → band 2 (G1–G3), concrete scene nouns band 1; Preliminary banded by corpus frequency (wordfreq Zipf) + concreteness + syllables; phrasal verbs band 4. Grade ranges overlap on purpose; ability is tracked separately by the learning intelligence.")
start = len(gd) + 6
ws.cell(start, 1, "Existing PING VIBE words whose band differs by 2+ from the Cambridge-based suggestion (review, do not auto-change):").font = Font(bold=True)
for i, m in enumerate([["Word", "PV band", "Suggested", "Note"]] + mism, start + 1):
    for c, v in enumerate(m, 1): ws.cell(i, c, "; ".join(map(str, v)) if isinstance(v, list) else v)

# 6. Gap analysis
gap = []
for c in CATS:
    pub = sum(1 for v in pv.values() if v.get("category") == c and v["status"] == "published")
    que = sum(1 for v in pv.values() if v.get("category") == c and v["status"] == "queued")
    mov = len({r["key"] for r in rows if r["source"] == "Movers 2014" and r["pv_category"] == c})
    pre = len({r["key"] for r in rows if r["source"] == "Preliminary 2012" and r["pv_category"] == c})
    rec = len({r["key"] for r in rows if r["recommended"] and r["pv_category"] == c})
    total = pub + que
    rating = "critical gap" if total < 10 else "gap" if total < 25 else "adequate" if total < 50 else "strong"
    gap.append([c, pub, que, total, mov, pre, rec, rating])
unm = sum(1 for v in pv.values() if not v.get("category"))
gap.append(["Unmapped existing words (need a category)", sum(1 for v in pv.values() if not v.get("category") and v["status"] == "published"), sum(1 for v in pv.values() if not v.get("category") and v["status"] == "queued"), unm, "", "", "", "categorise in CMS"])
sheet(wb, "Vocabulary Gap Analysis", ["Taxonomy category", "PV published", "PV queued", "PV total", "Movers entries", "Preliminary entries", "Recommended additions (wave 1)", "Coverage rating"], gap, {1: 34, 8: 18},
      "Category inference for existing words uses Cambridge topic/scene membership or queue tags; Science, Geography, Music, Values and Time & Frequency have little or no Cambridge topic support and need PING VIBE-authored words.")

# 7. Recommended additions
rec_rows, cand = [], []
for i, r in enumerate(sorted([r for r in rows if r["recommended"]], key=lambda x: (x["suggested_band"], -x["priority"]))):
    cid = f"PV-CAM-{r['suggested_band']}-{i + 1:04d}"
    rl = "; ".join(filter(None, [SCENE_RL.get(t) for t in r["scene_themes"]])) or REALLIFE.get(r["pv_category"] or "", "")
    rec_rows.append([cid, r["key"], r["pos"], r["suggested_band"], r["suggested_grades"], r["suggested_difficulty"], r["receptive_productive"], r["pv_category"] or "to categorise", r["scene_themes"], grammar_link(r["pos"]), phonics_link(r["key"]), rl, r["pv_match_type"] or "", r["source"] + (" + Preliminary 2012" if r["in_both_sources"] and r["source"] == "Movers 2014" else ""), r["priority"], "Candidate — awaiting educational review"])
    cand.append({"candidate_id": cid, "word": r["key"], "source_headword": r["headword"], "part_of_speech": r["pos"], "band": r["suggested_band"], "grade_range": r["suggested_grades"],
                 "difficulty": r["suggested_difficulty"], "receptive_productive": r["receptive_productive"], "category": r["pv_category"] or None, "scene_themes": r["scene_themes"],
                 "related_grammar": grammar_link(r["pos"]), "related_phonics": phonics_link(r["key"]), "related_real_life": rl, "linked_existing_word": r["pv_match"], "link_type": r["pv_match_type"],
                 "frequency_zipf": r["zipf_frequency"], "syllables_cmu": r["syllables_cmu"], "priority": r["priority"],
                 "provenance": {"type": "cambridge-reference-derived", "sources": [r["source"]] + (["Preliminary 2012"] if r["in_both_sources"] and r["source"] == "Movers 2014" else []), "page_ref": r.get("page"), "note": "Headword and part of speech only; all learning content to be authored originally by PING VIBE."},
                 "validation_status": "candidate_awaiting_review", "publication_status": "not_published"})
sheet(wb, "Recommended Additions", ["Candidate ID", "Word / expression", "Part(s) of speech", "Band", "Grade range", "Difficulty", "Receptive/productive", "Category", "Scene theme(s)", "Related grammar", "Related phonics", "Related Real Life scenario(s)", "Link to existing word", "Source provenance", "Priority (0–100)", "Status"], rec_rows, {2: 22, 8: 24, 12: 26, 14: 26, 16: 34}, NOTE)

# 8. Source & validation summary
c = collections.Counter
summ = [
 ["Source 1", "Cambridge English: Movers Word List Picture Book (©UCLES 2014) — supplied as content2.pdf, 21 PDF pages (spreads)"],
 ["Source 2", "Cambridge English: Preliminary and Preliminary for Schools Vocabulary List (©UCLES 2012) — supplied as content1.pdf, 56 pages"],
 ["Movers A–Z entries parsed", len([r for r in rows if r["source"] == "Movers 2014"])],
 ["Preliminary alphabetical entries parsed", len([r for r in rows if r["source"] == "Preliminary 2012"])],
 ["Unique keys (Movers / Preliminary / both)", f"{len(mk)} / {len({r['key'] for r in rows if r['source'] == 'Preliminary 2012'})} / {len(mk & {r['key'] for r in rows if r['source'] == 'Preliminary 2012'})}"],
 ["PING VIBE existing records audited", f"{len(pv)} unique ({sum(1 for v in pv.values() if v['status']=='published')} published + {sum(1 for v in pv.values() if v['status']=='queued')} queued); 877 source rows incl. {sum(1 for v in pv.values() if v.get('also_queued'))} queue/published duplicates"],
 ["Matches vs PING VIBE", dict(c(r["pv_match_type"] or "no match" for r in rows))],
 ["Exclusions", dict(c((r["exclusion"] or "none").split(" ")[0] for r in rows))],
 ["Recommended additions (wave 1)", f"{len(cand)} — band split {dict(c(x['band'] for x in cand))}"],
 ["Reserve candidates", sum(1 for r in rows if r.get("reserve"))],
 ["Validation performed", "normalisation (case, ligatures, parentheses), plural/singular, British/American variants, word-family stems, multi-word expressions, within-source sense duplicates, function-word routing, age-suitability screen, dated-technology screen, American-form preference, band/difficulty heuristic, category mapping"],
 ["Seven content gates", "NOT yet run on candidates: they contain no learning content yet. Gates run when each candidate is enriched through the existing Content Studio pipeline; human approval required before publication."],
 ["Copyright", "Only headwords, parts of speech, topic tags and page references were used. No Cambridge definitions, example sentences, illustrations, layouts, stories or exercise wording are reproduced in PING VIBE content. Licensing to be confirmed before any commercial redistribution of source-derived lists."],
 ["Generated", TODAY],
]
sheet(wb, "Source and Validation Summary", ["Item", "Value"], summ, {1: 40, 2: 120})
wb.save(f"{OUT}/PINGVIBE_Cambridge_Vocabulary_Mapping.xlsx")
reserve = [{"word": r["key"], "pos": r["pos"], "band": r["suggested_band"], "difficulty": r["suggested_difficulty"], "category": r["pv_category"], "source": r["source"], "priority": r["priority"]} for r in rows if r.get("reserve")]
json.dump({"generated": TODAY, "disclaimer": "Internal research mapping. PING VIBE is not affiliated with or endorsed by Cambridge. Candidates are not published.",
           "schema": {"candidate_id": "PV-CAM-<band>-<seq>, stable", "band": "1–4 (PING VIBE registry)", "difficulty": "Beginner|Developing|Intermediate|Advanced|Challenge", "validation_status": "candidate_awaiting_review → (pipeline) validated → awaiting_human_approval → approved → published"},
           "summary": {"movers_entries": len([r for r in rows if r["source"] == "Movers 2014"]), "preliminary_entries": len([r for r in rows if r["source"] == "Preliminary 2012"]), "existing_audited": len(pv), "recommended": len(cand), "reserve": len(reserve)},
           "candidates": cand, "reserve_candidates": reserve,
           "existing_audit": [dict(zip(["word", "status", "band", "pos", "queue_tag", "category", "in_movers", "in_preliminary", "cambridge_band_suggestion", "band_check", "action"], a)) for a in audit],
           "duplicates_and_overlaps": [dict(zip(["comparison", "headword", "matched_with", "match_type", "detail", "handling"], d)) for d in dup],
           "gap_analysis": [dict(zip(["category", "pv_published", "pv_queued", "pv_total", "movers", "preliminary", "recommended", "rating"], g)) for g in gap]},
          open(f"{OUT}/PINGVIBE_Cambridge_Vocabulary_Mapping.json", "w"), indent=1, ensure_ascii=False)
json.dump(cand, open("/tmp/cam/candidates.json", "w"), ensure_ascii=False)
print("sheets", wb.sheetnames, "| audit", len(audit), "dup", len(dup), "recommended", len(cand), "reserve", len(reserve), "band mismatches", len(mism))
print("gaps", [(g[0], g[3], g[7]) for g in gap if g[7] in ("critical gap", "gap")])
