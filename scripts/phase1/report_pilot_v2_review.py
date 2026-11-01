"""Writes the AI re-review results for the 30 corrected v2 cards to separate files (v2 card files are not modified)."""
import json, glob, csv, datetime
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.utils import get_column_letter
OUT = "deliverables/phase-1-content/pilot/v2"
DISCLAIMER = "Internal research mapping. PING VIBE is not affiliated with or endorsed by Cambridge. Candidates are unpublished and awaiting educational review."
NOTE = "AI-assisted accuracy re-review of the 30 corrected cards (cards not edited). Not educator-approved, not published, not imported."
K = [("spelling_ok", "Gate 4 spelling (AI)"), ("grammar_ok", "Gate 4 grammar (AI)"), ("age_appropriate", "Gate 7 age suitability (AI)"), ("educational", "Gate 7 educational value (AI)"),
     ("culturally_sensitive_ok", "Gate 7 cultural sensitivity (AI)"), ("meaning_accurate", "Meaning accuracy (AI)"), ("synonyms_antonyms_accurate", "Synonym/antonym/word-family accuracy (AI)"), ("indian_british_usage_ok", "Indian/British usage (AI)")]
R = sorted([json.load(open(f)) for f in glob.glob("deliverables/phase-1-content/_work/gen/vocab_pilot_v2_review/*.json")], key=lambda r: (r["band"], r["word"]))
v2 = {c["word"]: c for c in json.load(open(f"{OUT}/PINGVIBE_Vocab_Pilot_Cards_v2.json"))["cards"]}
rows = []
for r in R:
    v = r["review"]; ok = all(v[k] for k, _ in K)
    rows.append({"candidate_id": r["candidate_id"], "word": r["word"], "band": r["band"], **{lab: "PASS" if v[k] else "FAIL" for k, lab in K},
                 "ai_result": "PASS (all AI checks)" if ok else "FAIL — " + ", ".join(lab for k, lab in K if not v[k]),
                 "reviewer_notes": " | ".join(v["issues"]), "suggested_fixes": " | ".join(v["suggested_fixes"]),
                 "recommended_status": "AI checks passed – awaiting human approval" if ok else "Needs fix before human approval",
                 "reviewer_model": r["reviewer_model"], "stop_reason": r["reviewer_stop"], "input_tokens": r["usage"]["input_tokens"], "output_tokens": r["usage"]["output_tokens"], "disclaimer": DISCLAIMER})
tin = sum(x["input_tokens"] for x in rows); tout = sum(x["output_tokens"] for x in rows); usd = tin * 4e-6 + tout * 20e-6
combined = []
for w, c in v2.items():
    if c["content_version"] == 2:
        rr = next(x for x in rows if x["word"] == w); st = rr["recommended_status"]; src = "v2 AI re-review"
    else:
        st, src = "AI checks passed – awaiting human approval", "v1 AI review (card unchanged)"
    combined.append([c["candidate_id"], w, c["band"], c["content_version"], st, src])
with open(f"{OUT}/PINGVIBE_Vocab_Pilot_v2_AI_Recheck.csv", "w", newline="", encoding="utf-8-sig") as fh:
    wr = csv.DictWriter(fh, fieldnames=list(rows[0].keys())); wr.writeheader(); wr.writerows(rows)
wb = Workbook(); wb.remove(wb.active); HF = PatternFill("solid", fgColor="852DEB")
def sh(t, head, data, sc=None, widths=None):
    ws = wb.create_sheet(t); ws.cell(1, 1, DISCLAIMER).font = Font(bold=True, color="B00020"); ws.cell(2, 1, NOTE).font = Font(italic=True, color="555555")
    for i, h in enumerate(head, 1): x = ws.cell(4, i, h); x.font = Font(bold=True, color="FFFFFF"); x.fill = HF; x.alignment = Alignment(wrap_text=True, vertical="top")
    for ri, row in enumerate(data, 5):
        for i, v in enumerate(row, 1): ws.cell(ri, i, v).alignment = Alignment(wrap_text=True, vertical="top")
        if sc is not None: ws.cell(ri, sc + 1).fill = PatternFill("solid", fgColor="E8F7EC" if str(row[sc]).startswith(("PASS", "AI checks passed")) else "FDE7E7")
    for i in range(1, len(head) + 1): ws.column_dimensions[get_column_letter(i)].width = (widths or {}).get(i, 16)
    ws.freeze_panes = "C5"
H = list(rows[0].keys())
sh("AI Recheck (30)", H, [[x[h] for h in H] for x in rows], H.index("ai_result"), {2: 14, 12: 30, 13: 70, 14: 70, 15: 34})
sh("Combined status (40)", ["candidate_id", "word", "band", "content_version", "recommended status", "source of AI result"], combined, 4, {2: 14, 5: 40, 6: 30})
sh("Summary", ["Item", "Value"], [["Cards re-reviewed", len(rows)], ["Passed all AI checks", sum(x["ai_result"].startswith("PASS") for x in rows)],
    ["Failed", ", ".join(x["word"] for x in rows if not x["ai_result"].startswith("PASS")) or "none"],
    *[[lab, f"{sum(x[lab] == 'PASS' for x in rows)}/30 pass"] for _, lab in K],
    ["API calls", f"{len(rows)} (model {rows[0]['reviewer_model']}, effort low; refusals: {sum(x['stop_reason'] == 'refusal' for x in rows)})"],
    ["Tokens", f"input {tin} / output {tout}"], ["Cost", f"${usd:.3f} (≈ ₹{usd*96:.0f} at ₹96/$; excl. bank rate/markup/taxes)"]], None, {1: 44, 2: 70})
wb.save(f"{OUT}/PINGVIBE_Vocab_Pilot_v2_AI_Recheck.xlsx")
print("passed", sum(x["ai_result"].startswith("PASS") for x in rows), "cost $%.3f ₹%.0f" % (usd, usd * 96))
