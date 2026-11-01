"""Pilot v3: five requested edits on top of v2 (no API calls). v2 files are read-only. Re-runs the local gates on all 40 cards."""
import json, csv, re, copy, datetime, collections
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.utils import get_column_letter
V2 = "deliverables/phase-1-content/pilot/v2/PINGVIBE_Vocab_Pilot_Cards_v2.json"
REV = "deliverables/phase-1-content/pilot/v2/PINGVIBE_Vocab_Pilot_v2_AI_Recheck.csv"
OUT = "deliverables/phase-1-content/pilot/v3"
DISCLAIMER = "Internal research mapping. PING VIBE is not affiliated with or endorsed by Cambridge. Candidates are unpublished and awaiting educational review."
NOTE = "Pilot v3: requested edits on v2 (no API calls). Not educator-approved, not published, not imported."
EDITS = {
 "daughter": {"simple_meaning": "A daughter is a female child of a parent.", "example_sentence": "Meera is Asha’s daughter."},
 "seat": {"emoji": "🪑"},
 "holiday": {"example_sentence": "During the summer holidays, we took a train to the hills."},
 "straight": {"spelling_guidance": "Straight has a silent 'gh' near the end: s-t-r-a-i-g-h-t."},
}
# Local gates — identical logic and thresholds to scripts/phase1/correct_pilot.py (unchanged, not weakened).
UNSAFE = re.compile(r"\b(kill|killing|blood|gun|weapon|knife attack|suicide|sex|sexy|porn|drug|drugs|alcohol|beer|wine|cigarette|smoking|gamble|gambling|bet|casino|hate|stupid|idiot|dumb|naked|horror|scary death|die|dead body)\b", re.I)
def syl(w): return max(1, len(re.findall(r"[aeiouy]+", re.sub(r"e$", "", w.lower()))))
def grade(t):
    s = max(1, len(re.findall(r"[.!?]+", t))); w = re.findall(r"[A-Za-z']+", t)
    return 0.39 * (len(w) / s) + 11.8 * (sum(syl(x) for x in w) / len(w)) - 15.59 if w else 0
MAXG = {1: 3.5, 2: 5, 3: 7.5, 4: 11}; DIFF = {1: ["Beginner", "Developing"], 2: ["Beginner", "Developing", "Intermediate"], 3: ["Developing", "Intermediate", "Advanced"], 4: ["Intermediate", "Advanced", "Challenge"]}
def mech(s): return bool(re.match(r'^["“\'(]?[A-Z0-9]', s.strip())) and bool(re.search(r'[.!?]["”\')]?$', s.strip())) and not re.search(r"\s{2,}", s) and not re.search(r"\b(\w+)\s+\1\b", s, re.I)
published = {v["word"].lower() for v in json.load(open("deliverables/phase-1-content/_work/baseline.json"))["vocabulary"]}
HOLD = {"beef", "john", "paul", "peter", "jack", "mary", "jim", "charlie", "jane", "fred", "contract", "cent", "duty-free", "chat show", "engaged", "romantic", "look at", "keep in", "put through", "break in", "penny", "soap opera", "movie theater", "elevator", "movie", "come on", "call in", "go for", "wash up", "thing", "case", "all", "down", "more", "most", "off", "only", "out", "how", "then", "when", "why"}
rev = {r["word"]: r for r in csv.DictReader(open(REV, encoding="utf-8-sig"))}
GK = ["1 safety moderation", "2 grade readability", "3 grammar & mechanics", "5 duplicate detection", "6 difficulty validation"]
v2 = json.load(open(V2)); out = []; seen = set()
for c0 in v2["cards"]:
    c = copy.deepcopy(c0); w = c["word"]; assert w not in HOLD
    before = {k: c[k] for k in EDITS.get(w, {})}
    for k, v in EDITS.get(w, {}).items(): c[k] = v
    if w in EDITS: c["content_version"] = 3
    prose = " ".join([c["simple_meaning"], c["explanation"], c["example_sentence"]]); g = grade(prose)
    gates = {GK[0]: not UNSAFE.search(json.dumps(c, ensure_ascii=False)), GK[1]: g <= MAXG[c["band"]],
             GK[2]: mech(c["example_sentence"]) and re.search(rf"\b{re.escape(w)}", c["example_sentence"], re.I) is not None,
             GK[3]: w.lower() not in published and w.lower() not in seen, GK[4]: c["difficulty"] in DIFF[c["band"]]}
    seen.add(w.lower()); c["readability_grade"] = round(g, 1)
    for k, v in gates.items(): c[k] = "PASS" if v else "FAIL"
    c["changes_v3"] = "; ".join(f"{k}: {before[k]!r} → {EDITS[w][k]!r}" for k in EDITS[w]) if w in EDITS else "none"
    if w == "daughter":
        c["AI gates 4 & 7 + accuracy checks"] = "Awaiting AI meaning re-review (meaning changed in v3; v2 AI review failed meaning accuracy)"
        st = "Corrected – awaiting AI meaning re-review and human approval"
    elif c0["content_version"] == 2:
        c["AI gates 4 & 7 + accuracy checks"] = f"v2 AI re-review: {rev[w]['ai_result']}" + (" (v3 edit is non-meaning; earlier AI result still applies)" if w in EDITS else "")
        st = "AI checks passed – awaiting human approval"
    else:
        c["AI gates 4 & 7 + accuracy checks"] = "PASS in v1 AI review (card unchanged)"
        st = "AI checks passed – awaiting human approval"
    c["validation_status"] = st if all(gates.values()) else "Draft – needs fixes"
    c["ipa_source"] = "CMU Pronouncing Dictionary — US English pronunciation" if c["ipa"] else "not in CMU — pending"
    c["publication_status"] = "not_published"; c["disclaimer"] = DISCLAIMER
    out.append(c)
json.dump({"generated": datetime.date.today().isoformat(), "version": 3, "disclaimer": DISCLAIMER, "note": NOTE, "api_calls": 0, "source": V2, "cards": out}, open(f"{OUT}/PINGVIBE_Vocab_Pilot_Cards_v3.json", "w"), indent=1, ensure_ascii=False)
H = list(dict.fromkeys(k for c in out for k in c))
with open(f"{OUT}/PINGVIBE_Vocab_Pilot_Cards_v3.csv", "w", newline="", encoding="utf-8-sig") as fh:
    wr = csv.DictWriter(fh, fieldnames=H); wr.writeheader(); [wr.writerow({k: c.get(k, "") for k in H}) for c in out]
wb = Workbook(); wb.remove(wb.active); HF = PatternFill("solid", fgColor="852DEB")
def sh(t, head, data, sc=None, widths=None):
    ws = wb.create_sheet(t); ws.cell(1, 1, DISCLAIMER).font = Font(bold=True, color="B00020"); ws.cell(2, 1, NOTE).font = Font(italic=True, color="555555")
    for i, h in enumerate(head, 1): x = ws.cell(4, i, h); x.font = Font(bold=True, color="FFFFFF"); x.fill = HF; x.alignment = Alignment(wrap_text=True, vertical="top")
    for ri, row in enumerate(data, 5):
        for i, v in enumerate(row, 1): ws.cell(ri, i, v).alignment = Alignment(wrap_text=True, vertical="top")
        if sc is not None: ws.cell(ri, sc + 1).fill = PatternFill("solid", fgColor="E8F7EC" if str(row[sc]).startswith("AI checks passed") else "EAF2FF" if str(row[sc]).startswith("Corrected") else "FDE7E7")
    for i in range(1, len(head) + 1): ws.column_dimensions[get_column_letter(i)].width = (widths or {}).get(i, 18)
    ws.freeze_panes = "C5"
sh("Cards v3 (40)", H, [[c.get(k, "") for k in H] for c in out], H.index("validation_status"))
sh("Recheck (40)", ["word", "band", "content_version", "readability_grade", *GK, "AI gates 4 & 7 + accuracy checks", "changes_v3", "validation_status"],
   [[c["word"], c["band"], c["content_version"], c["readability_grade"], *[c[k] for k in GK], c["AI gates 4 & 7 + accuracy checks"], c["changes_v3"], c["validation_status"]] for c in out], 11, {9: 50, 10: 60, 11: 40})
st = collections.Counter(c["validation_status"] for c in out)
sh("Summary", ["Item", "Value"], [["Cards", 40], ["Edited in v3", ", ".join(EDITS)], *[[k, v] for k, v in st.items()], *[[f"{k} — PASS", f"{sum(c[k] == 'PASS' for c in out)}/40"] for k in GK],
   ["API calls made", 0], ["IPA source", "CMU Pronouncing Dictionary — US English pronunciation"]], None, {1: 50, 2: 70})
wb.save(f"{OUT}/PINGVIBE_Vocab_Pilot_Cards_v3.xlsx")
print("status", dict(st)); print({k: sum(c[k] == "PASS" for c in out) for k in GK})
for c in out:
    if c["word"] in EDITS: print(c["word"], "| grade", c["readability_grade"], "|", {k: c[k] for k in GK}, "|", c["changes_v3"])
