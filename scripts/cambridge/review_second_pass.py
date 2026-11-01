"""Second-pass review (v2) of the 148 rows flagged 'Needs human confirmation' in the v1 AI triage.
Reads v1 CSV (read-only). Writes NEW versioned files; original mapping workbook/JSON and v1 files are untouched."""
import csv, collections, datetime
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.utils import get_column_letter
DIR = "deliverables/cambridge-vocabulary-analysis/review"
V1 = f"{DIR}/PINGVIBE_Cambridge_Candidate_Review_AI_Triage.csv"
DISCLAIMER = "Internal research mapping. PING VIBE is not affiliated with or endorsed by Cambridge. Candidates are unpublished and awaiting educational review."
TRIAGE = "AI-assisted curriculum triage (second pass, v2) — not educator certification, not board-syllabus alignment, and not permission to publish."
rows = list(csv.DictReader(open(V1, encoding="utf-8-sig")))
U, R, H = "Use", "Revise", "Hold"
# word -> (decision, reason, final_category or None=keep v1, final_band or None=keep, pos_fix or None, unresolved_missing_info or None)
S = {
 "back": (U, "Teach the body-part noun (“my back hurts”), the clearest sense for Band 1; adverb and adjective senses later as separate records.", "Body and Health", None, "noun", None),
 "present": (U, "Teach “present” = gift, concrete and familiar from birthdays and festivals; the time and verb senses later.", "Relationships", None, "noun", None),
 "bank": (U, "Money-bank sense; a bank is an abstract institution for ages 3–6, so Band 2 fits better.", "Places", 2, "noun", None),
 "band": (U, "Music-group sense (school band); fits Band 2 better than Band 1.", "Music", 2, "noun", None),
 "address": (U, "Band 2 is right for learning your address; always paired with “never share your address online”.", "Places", 2, None, None),
 "square": (U, "Shape sense for Band 1 (square, circle, triangle); town-square sense not needed now.", "Colours and Shapes", None, "noun, adjective", None),
 "text": (U, "Reading sense (“read the text”) used daily in Indian classrooms; messaging sense later.", "School and Education", None, "noun", None),
 "fat": (R, "Keep only with authored food, animal or object contexts; never about people. A constraint, not a block.", None, None, None, None),
 "bat": (U, "Cricket-bat sense: highly relevant for Indian learners; the animal sense becomes a separate future record.", "Sports and Hobbies", None, "noun", None),
 "change": (U, "Verb “to change” (clothes, shape, places) is the core Band 2 sense; money “change” later in Band 3.", "Actions", None, "verb", None),
 "mean": (U, "Verb sense “What does it mean?”, essential for learning; the adjective sense is not taught here.", "Communication", None, "verb", None),
 "second": (U, "Time unit (“wait a second”) on this card; the ordinal goes in the numbers set.", "Time", None, "noun", None),
 "well": (U, "Health sense (“I feel well”), common in Indian English; other senses separate.", "Body and Health", None, "adjective", None),
 "party": (U, "Social celebration (birthday party); category Relationships.", "Relationships", None, None, None),
 "elevator": (H, "Not a separate card: “lift” is the Indian/British primary form; record elevator as a variant on lift.", None, None, None, None),
 "naughty": (R, "Keep for story characters or animals only, never to label a real child.", None, None, None, None),
 "all": (H, "Function word: teach through Grammar Galaxy and reading, not a vocabulary card.", None, None, None, None),
 "down": (H, "Function word (preposition/adverb): teach with prepositions in Grammar Galaxy.", None, None, None, None),
 "more": (H, "Determiner: teach with comparatives in Grammar Galaxy.", None, None, None, None),
 "most": (H, "Determiner: teach with superlatives in Grammar Galaxy.", None, None, None, None),
 "off": (H, "Function word: teach with phrasal verbs (switch off) and prepositions.", None, None, None, None),
 "only": (H, "Function word: teach in reading and sentence work.", None, None, None, None),
 "out": (H, "Function word: teach with phrasal verbs and prepositions.", None, None, None, None),
 "how": (H, "Question word: taught in Grammar Galaxy (interrogative pronouns/question words).", None, None, None, None),
 "then": (H, "Sequencing word: teach in story-sequencing and writing activities.", None, None, None, None),
 "when": (H, "Question word and conjunction: taught in Grammar Galaxy.", None, None, None, None),
 "why": (H, "Question word: taught in Grammar Galaxy.", None, None, None, None),
 "first": (U, "Ordinal: teach inside a Numbers and ordinals word set (Band 2).", "Time and Frequency", None, None, None),
 "third": (U, "Ordinal: teach inside a Numbers and ordinals word set (Band 2).", "Time and Frequency", None, None, None),
 "hundred": (U, "Number word: teach inside a Numbers word set (Band 2).", "Money and Shopping", None, None, None),
 "thing": (H, "Very general word with little value as a vocabulary card; children meet it naturally in reading.", None, None, None, None),
 "age": (U, "“How old are you? / my age”: useful Band 2 personal-information word (not private).", "Time", None, None, None),
 "treasure": (U, "Common in adventure stories and games; category Arts and Culture (stories).", "Arts and Culture", None, None, None),
 "movie": (H, "Not a separate card: “film” is primary (Indian English also uses “movie” widely), so record movie as a variant on the film card.", None, None, None, None),
 "fair": (U, "Sense “fair = just/equal”, valuable for values education at Band 2; weather and funfair senses later.", "Values and Character", None, None, None),
 "dream": (U, "Familiar noun/verb (dreams, imagination) for Band 2.", "Thinking and Problem-solving", None, None, None),
 "john": (H, "Personal name: story character only, not a vocabulary target.", None, None, None, None),
 "paul": (H, "Personal name: story character only, not a vocabulary target.", None, None, None, None),
 "peter": (H, "Personal name: story character only, not a vocabulary target.", None, None, None, None),
 "jack": (H, "Personal name: story character only, not a vocabulary target.", None, None, None, None),
 "mary": (H, "Personal name: story character only, not a vocabulary target.", None, None, None, None),
 "jim": (H, "Personal name: story character only, not a vocabulary target.", None, None, None, None),
 "charlie": (H, "Personal name: story character only, not a vocabulary target.", None, None, None, None),
 "jane": (H, "Personal name: story character only, not a vocabulary target.", None, None, None, None),
 "fred": (H, "Personal name: story character only, not a vocabulary target.", None, None, None, None),
 "bottom": (U, "Position sense (“at the bottom of the page/stairs”); avoid the body sense.", "Descriptions", None, None, None),
 "noise": (U, "Useful sound word (“too much noise”); no Sounds category, so Descriptions.", "Descriptions", None, None, None),
 "case": (H, "Bare “case” is too ambiguous for Band 2; teach the compound “pencil case” (School and Education) instead.", None, None, None, None),
 "company": (U, "Business sense at Band 4 (Grades 5–7 meet companies in reading); “keep company” later.", "Community Helpers", 4, None, None),
 "group": (U, "Classroom sense (“work in groups”).", "School and Education", None, None, None),
 "studies": (U, "Subject sense (“social studies”) used in Indian schools; POS corrected.", "School and Education", None, "noun (plural)", None),
 "contract": (H, "Adult legal/workplace concept; no child-relevant use.", None, None, None, None),
 "operation": (U, "Medical sense at Band 4 in a calm, factual context (a doctor's operation helps people get well).", "Body and Health", 4, None, None),
 "application": (U, "Software sense (“an application on a phone or computer”) at Band 4; job sense later.", "Technology", 4, None, None),
 "cent": (H, "Foreign coin with low relevance; use rupee/paise.", None, None, None, None),
 "apply": (U, "Child-relevant sense “apply glue/cream/a rule” at Band 3; job sense not taught.", "Actions", 3, None, None),
 "opening hours": (U, "Useful functional phrase (shops, libraries); POS corrected.", "Time", None, "noun (plural phrase)", None),
 "silver": (U, "Colour/metal word; POS corrected from the parsing error.", "Colours and Shapes", None, "adjective, noun", None),
 "dear": (U, "Letter greeting (“Dear Sir/Madam”), central to Indian school letter-writing.", "Communication", None, None, None),
 "boss": (U, "Informal but common in Indian English; Band 4.", "Community Helpers", 4, None, None),
 "web": (U, "Spider-web sense (concrete, Band 3); the internet sense is covered by the candidate “web page”.", "Nature", None, None, None),
 "blog": (U, "Band 4, always with online-safety guidance.", "Technology", 4, None, None),
 "clothes": (U, "Everyday word; Band 2; POS corrected.", "Clothing", 2, "noun (plural only)", None),
 "credit card": (U, "Money-literacy word at Band 4.", "Money and Shopping", 4, None, None),
 "candidate": (U, "Band 4, with school-election contexts (head boy/girl elections are common in Indian schools).", "Community Helpers", 4, None, None),
 "duty-free": (H, "Adult airport-shopping concept with no child-relevant use.", None, None, None, None),
 "facilities": (U, "Useful word (school facilities, library facilities); POS corrected.", "Places", None, "noun (plural)", None),
 "row": (U, "Classroom sense (“sit in a row”); avoid the British “row = quarrel” sense.", "School and Education", None, None, None),
 "employment": (U, "Band 4, receptive (reading and news).", "Community Helpers", 4, None, None),
 "chat show": (H, "Dated British TV term with low local relevance.", None, None, None, None),
 "quit": (U, "Band 4, sense “quit a game/app”.", "Actions", 4, None, None),
 "engaged": (H, "The source sense (telephone line busy) is dated; the marriage sense is not a target.", None, None, None, None),
 "employee": (U, "Band 4, receptive.", "Community Helpers", 4, None, None),
 "immigration": (U, "Band 4, airport passport-control context only (neutral).", "Travel", 4, None, None),
 "soldier": (U, "Band 3 with respectful contexts (Republic Day parade, disaster relief); avoid war scenes.", "Community Helpers", None, None, None),
 "wage": (U, "Band 4, receptive (civics/economics reading).", "Community Helpers", 4, None, None),
 "romantic": (H, "Outside PING VIBE's child content rules (no romance).", None, None, None, None),
 "economics": (U, "School subject name met in Grades 6–7 social science; Band 4.", "School and Education", 4, None, None),
 "hire": (U, "Band 3, with “rent” as the common Indian synonym.", "Money and Shopping", None, None, None),
 "instructions": (U, "Essential classroom word (“read the instructions”); POS corrected.", "School and Education", None, "noun (plural)", None),
 "salary": (U, "Band 4, receptive.", "Community Helpers", 4, None, None),
 "luxury": (U, "Band 4, receptive (descriptive reading).", "Money and Shopping", 4, None, None),
 "look at": (H, "Literal phrase; taught within the existing “look” card.", None, None, None, None),
 "be over": (U, "Sense “finished” (“The class is over”); Band 4.", "Actions", None, None, None),
 "call for": (U, "Sense “need/require” (“The recipe calls for two eggs”); Band 4.", "Actions", None, None, None),
 "call in": (H, "Several low-value senses (visit, summon, phone in); no clear child-relevant target.", None, None, None, None),
 "come on": (H, "Merged with the candidate “come on!” (exclamation); no separate card.", None, None, None, None),
 "get down": (U, "Indian English “get down from the bus/tree” is very common; Band 3.", "Transport", 3, None, None),
 "give in": (U, "Sense “stop trying” in values contexts (“Don't give in!”); Band 4.", "Values and Character", None, None, None),
 "give out": (U, "Sense “distribute” (“The teacher gave out the books”); Band 4.", "Actions", None, None, None),
 "give way": (U, "Road-sign sense “Give Way” (seen on Indian roads), useful for road safety; Band 4.", "Transport", None, None, None),
 "go for": (H, "Ambiguous (choose / try / attack); no clear single child-relevant sense.", None, None, None, None),
 "go off": (U, "Sense “an alarm goes off”; Band 4.", "Actions", None, None, None),
 "go on": (U, "Sense “continue” (“Go on reading”); Band 4.", "Actions", None, None, None),
 "keep in": (H, "Vague senses; low value.", None, None, None, None),
 "put up": (U, "Classroom sense “put up your hand”; Band 3.", "School and Education", 3, None, None),
 "work out": (U, "Sense “solve” (“work out the sum”), common in Indian maths classes; Band 4.", "Thinking and Problem-solving", None, None, None),
 "put down": (U, "Sense “put down your pencil”; Band 4.", "Actions", None, None, None),
 "put through": (H, "Dated telephone-operator phrase.", None, None, None, None),
 "turn up": (U, "Sense “turn up the volume”; Band 4.", "Technology", None, None, None),
 "bring up": (U, "Sense “bring up a question/topic” in discussion; Band 4.", "Communication", None, None, None),
 "break in": (H, "Main sense is burglary (crime); not for children.", None, None, None, None),
 "hold up": (U, "Delay sense only (“Traffic held us up”); Band 4.", "Transport", None, None, None),
 "base on": (U, "Teach as “based on” (“a film based on a book”); Band 4.", "Arts and Culture", None, None, None),
 "write down": (U, "Classroom phrasal verb; Band 3.", "School and Education", 3, None, None),
 "sit down": (U, "Classroom instruction; Band 2.", "School and Education", 2, None, None),
 "throw away": (U, "Everyday phrasal verb with environment links (waste); Band 3.", "Environment", 3, None, None),
 "photographer": (U, "Concrete job word; Band 3.", "Community Helpers", 3, None, None),
 "instrument": (U, "Music word (musical instrument); Band 3.", "Music", 3, None, None),
 "poem": (U, "Read and recited from early grades in India; Band 2.", "Arts and Culture", 2, None, None),
 "wash up": (H, "British “wash up” (dishes) is uncommon in Indian English (“wash the vessels/dishes”), and the US sense differs; low value.", None, None, None, None),
 "detective": (U, "Popular in children's stories; Band 3.", "Community Helpers", 3, None, None),
 "scientist": (U, "Concrete, aspirational job word; Band 3.", "Science", 3, None, None),
 "politician": (U, "Band 4 neutral civic role (Grades 6–7 civics covers government).", "Community Helpers", None, None, None),
 "admission": (U, "School-admission sense, highly relevant in India; Band 4.", "School and Education", None, None, None),
 "knock down": (U, "Sense “knock down a tower/old building” only; Band 4.", "Actions", None, None, None),
 "keyboard": (U, "Computer/music keyboard, familiar; Band 3.", "Technology", 3, None, None),
 "noon": (U, "Time word; Band 3.", "Time", 3, None, None),
 "diary": (U, "School diary is daily vocabulary in Indian schools; Band 3.", "School and Education", 3, None, None),
 "jeans": (U, "Everyday clothing; Band 2; POS corrected.", "Clothing", 2, "noun (plural only)", None),
 "cartoon": (U, "Familiar to young children; Band 2.", "Arts and Culture", 2, None, None),
 "penny": (H, "British coin with low relevance; use rupee/paise.", None, None, None, None),
 "freezing": (U, "Weather/temperature word; Band 3.", "Weather and Seasons", 3, None, None),
 "invention": (U, "Science-curriculum word; Band 3.", "Science", 3, None, None),
 "o'clock": (U, "Telling time is taught in early grades; Band 2.", "Time", 2, None, None),
 "musician": (U, "Concrete job word; Band 3.", "Music", 3, None, None),
 "camping": (U, "Activity word (school camps); Band 3.", "Sports and Hobbies", 3, None, None),
 "dancer": (U, "Concrete, familiar (classical dance is popular); Band 2.", "Arts and Culture", 2, None, None),
 "absent": (U, "Daily roll-call word in Indian schools (“present/absent”); Band 2.", "School and Education", 2, None, None),
 "circus": (U, "Story/entertainment word; Band 3.", "Arts and Culture", 3, None, None),
 "businessman": (R, "Author the card as “businessperson”; keep “businessman” receptive only.", None, None, None, None),
 "chess": (U, "Popular in Indian schools; Band 3.", "Sports and Hobbies", 3, None, None),
 "hobby": (U, "Common early question (“What is your hobby?”); Band 2.", "Sports and Hobbies", 2, None, None),
 "receipt": (U, "Shopping word; Band 3 (silent p spelling tip).", "Money and Shopping", 3, None, None),
 "soap opera": (H, "Adult TV genre with low learning value.", None, None, None, None),
 "thriller": (U, "Band 4, receptive, framed as “mystery thriller book” with non-frightening examples.", "Arts and Culture", None, None, None),
 "unemployed": (U, "Band 4, receptive, neutral reading contexts only (no judgement).", "Community Helpers", None, None, None),
 "beef": (H, "Food word with strong dietary and cultural sensitivity in India.", None, None, None,
          "A school/parent-community policy on meat and food words; whether a balanced, respectful food set (vegetarian and non-vegetarian items) exists; and an educator's sign-off on context."),
 "disabled": (R, "Teach the person-first phrase “persons with disabilities” (as used in India's RPwD Act 2016) and “accessible/ramp”; never as a label for a child.", None, None, None, None),
 "movie theater": (H, "US form; “cinema” is primary in India; record as a variant, no separate card.", None, None, None, None),
 "relax": (U, "Everyday verb; Band 3.", "Actions", 3, None, None),
 "involve": (U, "Academic verb for Band 4 (“the project involves teamwork”).", "Thinking and Problem-solving", None, None, None),
 "pin": (U, "Object sense (safety pin, drawing pin) at Band 4; any PIN mention stresses never sharing it.", "Home and Family", None, None, None),
 "spare": (U, "“Spare time / a spare pencil”; Band 4.", "Descriptions", None, None, None),
 "stranger": (U, "Safety word: move to Band 2 with stranger-safety guidance.", "Relationships", 2, None, None),
 "exam": (U, "Central to Indian school life; Band 3.", "School and Education", 3, None, None),
 "arrangement": (U, "“Make arrangements / flower arrangement”; Band 4.", "Thinking and Problem-solving", None, None, None),
 "inquiry": (R, "Author the headword as “enquiry” (Indian/British form, e.g. the railway Enquiry counter); keep “inquiry” as a variant.", None, None, None, None),
}
out, merged = [], []
for r in rows:
    if r["needs_human_confirmation"] == "Yes":
        w = r["word"]
        if w not in S: raise SystemExit(f"missing second-pass decision for {w}")
        dec, reason, cat, band, pos, missing = S[w]
        rec = {**{k: r[k] for k in ("candidate_id", "word", "band", "grade_range", "part_of_speech", "category_original", "provenance_sources", "provenance_page", "publication_status")},
               "v1_decision": r["review_decision"], "v1_category": r["category_reviewed"], "v1_suggested_band": r["suggested_band"], "v1_flags": r["flags"],
               "v2_decision": dec, "v2_reason": reason, "v2_final_category": cat if cat is not None else (r["category_reviewed"] if dec != "Hold" else ""),
               "v2_final_band": band or (r["suggested_band"] or r["band"] if dec != "Hold" else ""), "v2_pos_correction": pos or "",
               "v2_status": "Unresolved — Hold" if missing else "Resolved", "missing_information": missing or "", "disclaimer": DISCLAIMER}
        out.append(rec)
        merged.append((r, dec, rec["v2_final_category"], rec["v2_final_band"], "second pass (v2)"))
    else:
        merged.append((r, r["review_decision"], r["category_reviewed"], r["suggested_band"] or r["band"], "first pass (v1, no confirmation needed)"))
assert len(out) == 148, len(out)
FIELDS = list(out[0].keys())
with open(f"{DIR}/PINGVIBE_Cambridge_Candidate_Review_v2_SecondPass.csv", "w", newline="", encoding="utf-8-sig") as f:
    w = csv.DictWriter(f, fieldnames=FIELDS); w.writeheader(); w.writerows(out)
HF = PatternFill("solid", fgColor="852DEB"); HFo = Font(bold=True, color="FFFFFF"); FILL = {"Use": "E8F7EC", "Revise": "FFF6DD", "Hold": "FDE7E7"}
def sheet(wb, title, header, data, dcol=None, widths=None):
    ws = wb.create_sheet(title); ws.cell(1, 1, DISCLAIMER).font = Font(bold=True, color="B00020"); ws.cell(2, 1, TRIAGE).font = Font(italic=True, color="555555")
    for i, h in enumerate(header, 1):
        c = ws.cell(4, i, h); c.font = HFo; c.fill = HF; c.alignment = Alignment(wrap_text=True, vertical="top")
    for ri, row in enumerate(data, 5):
        for i, v in enumerate(row, 1): ws.cell(ri, i, v).alignment = Alignment(wrap_text=True, vertical="top")
        if dcol is not None and row[dcol] in FILL: ws.cell(ri, dcol + 1).fill = PatternFill("solid", fgColor=FILL[row[dcol]])
    for i in range(1, len(header) + 1): ws.column_dimensions[get_column_letter(i)].width = (widths or {}).get(i, 15)
    ws.freeze_panes = "C5"; ws.auto_filter.ref = f"A4:{get_column_letter(len(header))}{4 + max(1, len(data))}"
wb = Workbook(); wb.remove(wb.active)
rd = wb.create_sheet("README")
for i, line in enumerate([DISCLAIMER, TRIAGE, "", f"Version 2 · {datetime.date.today().isoformat()} · Second pass over the 148 rows marked “Needs human confirmation” in v1 (PINGVIBE_Cambridge_Candidate_Review_AI_Triage.xlsx).",
    "v1 files, the original mapping workbook and the original JSON are unchanged. Nothing was imported or published.",
    "Use = recommended as framed (still requires authoring, the 7 content gates and human approval) · Revise = recommended with the stated constraint/correction · Hold = not a vocabulary card now.",
    "Unresolved Holds list the missing information needed for a decision."], 1):
    rd.cell(i, 1, line).font = Font(bold=i <= 2); rd.column_dimensions["A"].width = 150
H2 = ["Candidate ID", "Word", "Band (original)", "POS (original)", "v1 decision", "v1 category", "v1 suggested band", "v2 decision", "v2 reason", "v2 final category", "v2 final band", "v2 POS correction", "v2 status", "Missing information", "Provenance", "Publication status"]
sheet(wb, "Second Pass (148)", H2, [[o["candidate_id"], o["word"], o["band"], o["part_of_speech"], o["v1_decision"], o["v1_category"], o["v1_suggested_band"], o["v2_decision"], o["v2_reason"], o["v2_final_category"], o["v2_final_band"], o["v2_pos_correction"], o["v2_status"], o["missing_information"], o["provenance_sources"], o["publication_status"]] for o in out], 7, {2: 16, 9: 60, 10: 20, 14: 50})
HM = ["Candidate ID", "Word", "Band (original)", "Final decision", "Final category", "Final band", "Decision source", "Publication status"]
sheet(wb, "Combined Status (520)", HM, [[r["candidate_id"], r["word"], r["band"], d, c, b, src, r["publication_status"]] for r, d, c, b, src in merged], 3, {2: 16, 5: 22, 7: 32})
c2 = collections.Counter(o["v2_decision"] for o in out); cm = collections.Counter(d for _, d, *_ in merged)
byb = collections.Counter((int(r["band"]), d) for r, d, *_ in merged)
summ = [["Second pass (148 rows)", c2["Use"], c2["Revise"], c2["Hold"], 148, sum(o["v2_status"].startswith("Unresolved") for o in out)],
        ["Combined final status (520)", cm["Use"], cm["Revise"], cm["Hold"], 520, sum(o["v2_status"].startswith("Unresolved") for o in out)]] + \
       [[f"  Band {b}", byb[(b, "Use")], byb[(b, "Revise")], byb[(b, "Hold")], sum(byb[(b, d)] for d in ("Use", "Revise", "Hold")), ""] for b in (1, 2, 3, 4)]
sheet(wb, "Summary", ["Scope", "Use", "Revise", "Hold", "Total", "Unresolved Holds"], summ, None, {1: 30})
wb.save(f"{DIR}/PINGVIBE_Cambridge_Candidate_Review_v2_SecondPass.xlsx")
print("second pass", dict(c2), "| combined", dict(cm), "| unresolved", [o["word"] for o in out if o["v2_status"].startswith("Unresolved")])
for s in summ: print(s)
print("v2 band changes from original:", sum(1 for o in out if o["v2_final_band"] and str(o["v2_final_band"]) != o["band"]), "| POS corrections:", sum(1 for o in out if o["v2_pos_correction"]))
