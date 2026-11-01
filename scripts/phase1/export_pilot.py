"""Exports the vocabulary pilot (40 cards + per-card validation) to a review workbook/CSV/JSON. No import, no publishing."""
import json, glob, csv, collections, datetime
import cmudict, pyphen
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.utils import get_column_letter
import importlib.util
spec = importlib.util.spec_from_file_location("pr", "scripts/cambridge/pronunciation.py")
CMU = cmudict.dict(); HY = pyphen.Pyphen(lang="en_GB")
# reuse IPA conversion from the pronunciation script without running its file-writing main block
src = open("scripts/cambridge/pronunciation.py").read().split("words = [")[0]
ns = {}; exec(src, ns); ipa = ns["ipa"]
G = "deliverables/phase-1-content/_work/gen"; OUT = "deliverables/phase-1-content/pilot"
DISCLAIMER = "Internal research mapping. PING VIBE is not affiliated with or endorsed by Cambridge. Candidates are unpublished and awaiting educational review."
NOTE = "AI-generated drafts with AI-assisted validation — not educator-approved, not published, not imported."
rows = []; usage = {"gen_in": 0, "gen_out": 0, "rev_in": 0, "rev_out": 0}
for f in sorted(glob.glob(f"{G}/vocab_pilot/*.json")):
    d = json.load(open(f)); usage["gen_in"] += d["_usage"]["input_tokens"]; usage["gen_out"] += d["_usage"]["output_tokens"]
    for req, c in zip(d["requested"], d["items"]):
        rv = json.load(open(f"{G}/vocab_pilot_review/{c['word']}.json"))
        usage["rev_in"] += rv["usage"]["input_tokens"]; usage["rev_out"] += rv["usage"]["output_tokens"]
        i = ipa(c["word"]); n = sum(1 for x in CMU.get(c["word"], [[]])[0] if x[-1].isdigit()) if c["word"] in CMU else None
        h = HY.inserted(c["word"]).replace("-", "·"); syl = h if n and h.count("·") + 1 == n else None
        gates_ok = all(g["passed"] for g in rv["gates"]); extra_ok = all(x["passed"] for x in rv["extra"])
        status = "Validated – awaiting human approval" if gates_ok and extra_ok else "Draft – needs fixes"
        rows.append({"candidate_id": req["candidate_id"], "word": c["word"], "band": d["band"], "grade_range": req["grade_range"], "category": req["category"],
            "part_of_speech": c["part_of_speech"], "ipa": i or "", "ipa_source": "CMU Pronouncing Dictionary (US English)" if i else "not in CMU — pending", "syllables": syl or "", "syllable_count": n or "",
            "simple_meaning": c["simple_meaning"], "explanation": c["explanation"], "example_sentence": c["example_sentence"], "real_world_usage": c["real_world_usage"],
            "synonyms": "; ".join(c["synonyms"]), "antonyms": "; ".join(c["antonyms"]), "word_family": "; ".join(c["word_family"]), "collocations": "; ".join(c["collocations"]),
            "spelling_guidance": c["spelling_guidance"], "related_words": "; ".join(c["related_words"]), "difficulty": c["difficulty"], "applicable_grades": ", ".join(c["applicable_grades"]),
            "learning_objective": c["learning_objective"], "illustration_brief": c["illustration_brief"], "emoji": c["emoji"],
            "audio_status": "to be produced (TTS available in app)", "illustration_status": "to be produced (emoji placeholder)",
            **{g["gate"]: ("PASS" if g["passed"] else "FAIL — " + g["detail"]) for g in rv["gates"]},
            **{x["check"]: ("PASS" if x["passed"] else "FAIL") for x in rv["extra"]},
            "reviewer_issues": " | ".join(rv["issues"]), "suggested_fixes": " | ".join(rv["suggested_fixes"]),
            "validation_status": status, "publication_status": "not_published", "content_version": 1, "generator_model": d["_model"], "reviewer_model": rv["reviewer_model"], "disclaimer": DISCLAIMER})
cost_usd = (usage["gen_in"] + usage["rev_in"]) * 4e-6 + (usage["gen_out"] + usage["rev_out"]) * 20e-6
json.dump({"generated": datetime.date.today().isoformat(), "disclaimer": DISCLAIMER, "note": NOTE, "usage": usage, "cost_usd": round(cost_usd, 3), "cards": rows}, open(f"{OUT}/PINGVIBE_Vocab_Pilot_Cards.json", "w"), indent=1, ensure_ascii=False)
with open(f"{OUT}/PINGVIBE_Vocab_Pilot_Cards.csv", "w", newline="", encoding="utf-8-sig") as fh:
    w = csv.DictWriter(fh, fieldnames=list(rows[0].keys())); w.writeheader(); w.writerows(rows)
wb = Workbook(); wb.remove(wb.active)
H = list(rows[0].keys()); HF = PatternFill("solid", fgColor="852DEB")
def sh(title, header, data, widths=None, status_col=None):
    ws = wb.create_sheet(title); ws.cell(1, 1, DISCLAIMER).font = Font(bold=True, color="B00020"); ws.cell(2, 1, NOTE).font = Font(italic=True, color="555555")
    for i, h in enumerate(header, 1): c = ws.cell(4, i, h); c.font = Font(bold=True, color="FFFFFF"); c.fill = HF; c.alignment = Alignment(wrap_text=True, vertical="top")
    for r, row in enumerate(data, 5):
        for i, v in enumerate(row, 1): ws.cell(r, i, v).alignment = Alignment(wrap_text=True, vertical="top")
        if status_col is not None: ws.cell(r, status_col + 1).fill = PatternFill("solid", fgColor="E8F7EC" if str(row[status_col]).startswith("Validated") else "FFF6DD")
    for i in range(1, len(header) + 1): ws.column_dimensions[get_column_letter(i)].width = (widths or {}).get(i, 18)
    ws.freeze_panes = "C5"; ws.auto_filter.ref = f"A4:{get_column_letter(len(header))}{4 + max(1, len(data))}"
sh("Cards (40)", H, [[r[h] for h in H] for r in rows], status_col=H.index("validation_status"))
gate_cols = [h for h in H if h[0].isdigit() or "(AI)" in h]
sh("Validation", ["candidate_id", "word", "band", "validation_status", *gate_cols, "reviewer_issues", "suggested_fixes"], [[r["candidate_id"], r["word"], r["band"], r["validation_status"], *[r[g] for g in gate_cols], r["reviewer_issues"], r["suggested_fixes"]] for r in rows], {2: 14, 4: 26, 13: 60, 14: 60}, status_col=3)
cnt = collections.Counter((r["band"], r["validation_status"]) for r in rows)
fails = collections.Counter(g for r in rows for g in gate_cols if r[g] != "PASS")
summ = [[b, cnt[(b, "Validated – awaiting human approval")], cnt[(b, "Draft – needs fixes")], 10] for b in (1, 2, 3, 4)] + [["All", sum(cnt[(b, "Validated – awaiting human approval")] for b in (1, 2, 3, 4)), sum(cnt[(b, "Draft – needs fixes")] for b in (1, 2, 3, 4)), 40]]
sh("Summary", ["Band", "Validated – awaiting human approval", "Draft – needs fixes", "Total"], summ + [[]] + [["Check failures", "", "", ""]] + [[k, v, "", ""] for k, v in fails.most_common()] + [[]] +
   [["API usage", f"generation in {usage['gen_in']} / out {usage['gen_out']}", f"review in {usage['rev_in']} / out {usage['rev_out']}", f"≈ ${cost_usd:.2f} (≈ ₹{cost_usd*96:.0f} at ₹96/$)"]], {1: 44, 2: 34, 3: 34, 4: 30})
wb.save(f"{OUT}/PINGVIBE_Vocab_Pilot_Cards.xlsx")
print(dict(cnt), "| fails", dict(fails), "| cost $%.3f ₹%.0f" % (cost_usd, cost_usd * 96), "| ipa missing", [r["word"] for r in rows if not r["ipa"]])
