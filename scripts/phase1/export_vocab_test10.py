"""Exports batch B0002 (10-day local-test vocabulary pack) and builds the per-grade 10-day schedules.
Reads deliverables/phase-1-content/vocab-10day-test/_work/state.json (written by vocab_test10.ts). No API calls, no DB writes,
no import or publishing. Writes cards (JSON/CSV/XLSX), schedules, and the B0002 registry batch spec (registration is a separate step)."""
import json, csv, collections, datetime
import cmudict, pyphen
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.utils import get_column_letter

D = "deliverables/phase-1-content/vocab-10day-test"; W = f"{D}/_work"
CMU = cmudict.dict(); HY = pyphen.Pyphen(lang="en_GB")
ns = {}; exec(open("scripts/cambridge/pronunciation.py").read().split("words = [")[0], ns); ipa = ns["ipa"]
DISCLAIMER = "Internal research mapping. PING VIBE is not affiliated with or endorsed by Cambridge. Candidates are unpublished and awaiting educational review."
NOTE = "LOCAL TEST ONLY — AI-generated drafts with AI-assisted validation. Status: local-test / in review. Not approved, not published, not imported."
STATUS = "local-test/in-review"
BATCH = "B0002-vocab-10day-test-localtest"
GRADE = {1: ("UKG", "Band 1"), 2: ("G1", "Band 2"), 3: ("G4", "Band 3"), 4: ("G5", "Band 4")}

state = json.load(open(f"{W}/state.json")); ledger = json.load(open(f"{W}/cost-ledger.json"))
passed = [s for s in state.values() if s["status"] == "passed"]
assert len(passed) == 60 and all(sum(1 for s in passed if s["band"] == b) == 15 for b in (1, 2, 3, 4)), "need exactly 15 passed cards per band"

def syll(word):
    if " " in word or "-" in word: return None, None
    if word not in CMU: return None, None
    n = sum(1 for x in CMU[word][0] if x[-1].isdigit()); h = HY.inserted(word).replace("-", "·")
    return (h if h.count("·") + 1 == n else None), n

cards = []
for s in sorted(passed, key=lambda s: (s["band"], ["Beginner", "Developing", "Intermediate", "Advanced", "Challenge"].index(s["card"]["difficulty"]), s["word"])):
    c = s["card"]; last = s["reviews"][-1]; i = ipa(c["word"]); sy, n = syll(c["word"])
    cards.append({
        "batch_id": BATCH, "candidate_id": s["source"]["candidate_id"], "word": c["word"], "sense": c["simple_meaning"], "band": s["band"], "for_grade": GRADE[s["band"]][0],
        "category": s["category"], "part_of_speech": c["part_of_speech"],
        "ipa": i or "", "ipa_source": "CMU Pronouncing Dictionary — US English pronunciation" if i else "not in CMU — pending", "syllables": sy or "", "syllable_count": n or "",
        "simple_meaning": c["simple_meaning"], "explanation": c["explanation"], "example_sentence": c["example_sentence"], "real_world_usage": c["real_world_usage"],
        "synonyms": c["synonyms"], "antonyms": c["antonyms"], "word_family": c["word_family"], "collocations": c["collocations"], "spelling_guidance": c["spelling_guidance"],
        "related_words": c["related_words"], "difficulty": c["difficulty"], "applicable_grades": c["applicable_grades"], "learning_objective": c["learning_objective"],
        "illustration_brief": c["illustration_brief"], "emoji": c["emoji"], "generated_category": c["category"],
        "audio_status": "not produced (out of scope; app TTS can read the word)", "illustration_status": "not produced (emoji placeholder)",
        "validation": {"gates": last["gates"], "extra_checks": last["extra"], "readability_grade": last["grade"], "review_rounds": len(s["reviews"]), "fix_rounds": len(s["reviews"]) - 1,
                       "reviewer_issues_last_round": last["issues"], "replacement_for": s.get("reserve_for")},
        "provenance": s["source"]["provenance"], "generator_model": s["generator_model"], "reviewer_model": last["reviewer_model"],
        "review_status": STATUS, "approved": False, "published": False, "local_test": True, "disclaimer": DISCLAIMER,
    })

# ── 10-day schedules: days 1–6 = the 30 published words (portal order: easiest first), day 7 = review, days 8–10 = the 15 new cards ──
base = json.load(open("deliverables/phase-1-content/_work/baseline.json"))["vocabulary"]
sched = {}
for b in (1, 2, 3, 4):
    pub = sorted([v for v in base if v["band"] == b], key=lambda v: (v["difficulty"], v["word"]))
    new = [c for c in cards if c["band"] == b]
    assert len(pub) == 30 and len(new) == 15
    days = []; intro = []
    for d in range(1, 11):
        if d == 7:
            days.append({"day": 7, "type": "weekly review / test day", "new_words": [], "review_words": [w for w in intro],
                         "note": "No new words. Weekly Vocabulary Quest (10 questions) and Revision Boost use only words introduced on days 1–6."}); continue
        k = d - 1 if d < 7 else d - 2
        if k < 6: words = [{"word": v["word"], "source": "published (already in the local test portal)"} for v in pub[k * 5:(k + 1) * 5]]
        else: words = [{"word": c["word"], "source": f"new card {BATCH} (local-test, in review)", "candidate_id": c["candidate_id"]} for c in new[(k - 6) * 5:(k - 5) * 5]]
        intro += [w["word"] for w in words]
        days.append({"day": d, "type": "new-word day", "new_words": words, "review_words": "due words chosen by the portal's spaced-repetition schedule (up to 8 in the Daily Word Quest)"})
    allw = [w["word"] for x in days for w in x["new_words"]]
    assert len(allw) == 45 and len(set(allw)) == 45 and all(len(x["new_words"]) == (0 if x["day"] == 7 else 5) for x in days)
    sched[GRADE[b][0]] = {"grade": GRADE[b][0], "band": b, "unique_new_words": 45, "published_words": 30, "new_cards": 15, "days": days}

json.dump({"generated": datetime.date.today().isoformat(), "batch_id": BATCH, "disclaimer": DISCLAIMER, "note": NOTE, "status": STATUS, "count": len(cards), "cards": cards},
          open(f"{D}/PINGVIBE_Vocab_10Day_Test_Cards.json", "w"), indent=1, ensure_ascii=False)
json.dump({"generated": datetime.date.today().isoformat(), "disclaimer": DISCLAIMER, "note": NOTE,
           "rules": "5 new words per new-word day; day 7 is a review/test day with no new words; 45 unique words per grade (30 published + 15 new cards). "
                    "Days 8–10 use the B0002 cards, which are in review and NOT in the portal; they need human approval before a test learner can receive them.",
           "schedules": sched}, open(f"{D}/PINGVIBE_Vocab_10Day_Test_Schedule.json", "w"), indent=1, ensure_ascii=False)

flat = lambda v: "; ".join(v) if isinstance(v, list) else v
H = ["batch_id", "candidate_id", "word", "for_grade", "band", "category", "part_of_speech", "ipa", "ipa_source", "syllables", "simple_meaning", "explanation", "example_sentence",
     "real_world_usage", "synonyms", "antonyms", "word_family", "collocations", "spelling_guidance", "related_words", "difficulty", "applicable_grades", "learning_objective",
     "illustration_brief", "emoji", "review_status", "approved", "published"]
GH = [g["gate"] for g in cards[0]["validation"]["gates"]] + [x["check"] for x in cards[0]["validation"]["extra_checks"]]
def vrow(c):
    v = c["validation"]
    return [*["PASS" if g["passed"] else "FAIL" for g in v["gates"]], *["PASS" if x["passed"] else "FAIL" for x in v["extra_checks"]], v["readability_grade"], v["fix_rounds"], v["replacement_for"] or ""]
with open(f"{D}/PINGVIBE_Vocab_10Day_Test_Cards.csv", "w", newline="", encoding="utf-8-sig") as fh:
    w = csv.writer(fh); w.writerow(H + GH + ["readability_grade", "fix_rounds", "replacement_for"])
    for c in cards: w.writerow([flat(c[h]) for h in H] + vrow(c))
with open(f"{D}/PINGVIBE_Vocab_10Day_Test_Schedule.csv", "w", newline="", encoding="utf-8-sig") as fh:
    w = csv.writer(fh); w.writerow(["grade", "band", "day", "type", "words", "word_sources"])
    for g, s in sched.items():
        for d in s["days"]:
            w.writerow([g, s["band"], d["day"], d["type"], "; ".join(x["word"] for x in d["new_words"]) or "(review: " + ", ".join(d["review_words"]) + ")", "; ".join(sorted({x["source"].split(" (")[0] for x in d["new_words"]}))])

wb = Workbook(); wb.remove(wb.active); HF = PatternFill("solid", fgColor="852DEB")
def sh(title, header, rows, widths=18):
    ws = wb.create_sheet(title); ws.cell(1, 1, DISCLAIMER).font = Font(bold=True, color="B00020"); ws.cell(2, 1, NOTE).font = Font(italic=True, color="555555")
    for i, h in enumerate(header, 1): x = ws.cell(4, i, h); x.font = Font(bold=True, color="FFFFFF"); x.fill = HF; x.alignment = Alignment(wrap_text=True, vertical="top")
    for r, row in enumerate(rows, 5):
        for i, v in enumerate(row, 1): ws.cell(r, i, v).alignment = Alignment(wrap_text=True, vertical="top")
    for i in range(1, len(header) + 1): ws.column_dimensions[get_column_letter(i)].width = widths
    ws.freeze_panes = "D5"
sh("Cards (60)", H + GH + ["readability_grade", "fix_rounds", "replacement_for"], [[flat(c[h]) for h in H] + vrow(c) for c in cards])
for g, s in sched.items():
    sh(f"Schedule {g}", ["day", "type", "word 1", "word 2", "word 3", "word 4", "word 5", "source"],
       [[d["day"], d["type"], *([x["word"] for x in d["new_words"]] or ["review only: " + ", ".join(d["review_words"]), "", "", "", ""]), "; ".join(sorted({x["source"].split(" (")[0] for x in d["new_words"]})) or "words from days 1–6"] for d in s["days"]], 22)
usd = ledger["usd"]; steps = collections.Counter(); su = collections.defaultdict(float)
for c in ledger["calls"]: k = c["step"].split(" ")[0]; steps[k] += 1; su[k] += c["usd"]
sh("Summary", ["Item", "Value"], [["Cards", 60], *[[f"{GRADE[b][0]} (Band {b})", 15] for b in (1, 2, 3, 4)], ["All gates + AI checks passed", sum(1 for c in cards if all(g["passed"] for g in c["validation"]["gates"]) and all(x["passed"] for x in c["validation"]["extra_checks"]))],
    ["Passed first time", sum(1 for c in cards if c["validation"]["fix_rounds"] == 0)], ["Needed 1 fix", sum(1 for c in cards if c["validation"]["fix_rounds"] == 1)], ["Needed 2 fixes", sum(1 for c in cards if c["validation"]["fix_rounds"] == 2)],
    ["Replaced (unfixable)", ", ".join(f"{s['word']} → {s['replaced_by']}" for s in state.values() if s["status"] == "unfixable")],
    *[[f"API calls: {k}", f"{steps[k]} calls, ${su[k]:.3f}"] for k in steps], ["Total API cost", f"${usd:.3f} ≈ ₹{usd*96:.0f} (₹96/$; cap ₹350)"]], 40)
wb.save(f"{D}/PINGVIBE_Vocab_10Day_Test_Cards.xlsx")

# Registry batch spec (registration is done with: npx tsx scripts/registry/word-registry.ts register <spec>)
spec = {"batch_id": BATCH, "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds"),
        "description": "10-day local-test vocabulary pack: 15 new cards each for UKG (Band 1), G1 (Band 2), G4 (Band 3), G5 (Band 4). All seven content gates and per-card AI checks passed. Local test, in review; not approved, not published, not imported.",
        "cards_source": f"{D}/PINGVIBE_Vocab_10Day_Test_Cards.json",
        "entries": [{"word": c["word"], "band": c["band"], "sense": c["sense"], "part_of_speech": c["part_of_speech"], "category": c["category"],
                     "grade_range": c["for_grade"], "source": {"kind": "cambridge", "candidate_id": c["candidate_id"], "provenance": c["provenance"]}, "card_index": i} for i, c in enumerate(cards)]}
json.dump(spec, open(f"{W}/B0002-batch-spec.json", "w"), indent=1, ensure_ascii=False)
print("cards", len(cards), "| ipa missing", [c["word"] for c in cards if not c["ipa"]], "| cost $%.3f ₹%.0f" % (usd, usd * 96), "| calls", len(ledger["calls"]), dict(steps))
