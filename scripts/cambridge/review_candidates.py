"""AI-assisted curriculum triage of the 520 Cambridge-reference candidates for Indian school-age learners.
Reads the ORIGINAL mapping JSON read-only; writes a separate review copy under review/. Imports or publishes nothing."""
import json, csv, collections, datetime
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.utils import get_column_letter
SRC = "deliverables/cambridge-vocabulary-analysis/PINGVIBE_Cambridge_Vocabulary_Mapping.json"
OUT = "deliverables/cambridge-vocabulary-analysis/review"
DISCLAIMER = "Internal research mapping. PING VIBE is not affiliated with or endorsed by Cambridge. Candidates are unpublished and awaiting educational review."
TRIAGE = "AI-assisted curriculum triage — not educator certification, not alignment to CBSE/ICSE/state or any board syllabus, and not permission to publish."
D = json.load(open(SRC)); C = D["candidates"]
BANDS = {1: "Pre-KG–UKG", 2: "Grades 1–2", 3: "Grades 3–4", 4: "Grades 5–7"}

# Review decisions: word -> (decision, reason, action, category_fix, suggested_band, needs_human_confirmation, flags)
# category_fix: None = keep; "" = clear (uncertain); otherwise corrected category. Unlisted words → default Use.
U, R, H = "Use", "Revise", "Hold"
NAMES = "john paul peter jack mary jim charlie jane fred".split()
NOPOS = {"studies", "opening hours", "clothes", "facilities", "instructions", "jeans"}
O = {}
for n in NAMES: O[n] = (H, "Personal name, not a vocabulary target.", "Keep only as a character name in stories; do not create a word card.", "", None, False, ["personal_name"])
def o(words, *v):
    for w in words.split("|"): O[w] = v
# Known findings
o("elevator", R, "American form; Indian/British English uses “lift” (already a Band 1 candidate).", "Record as a variant of “lift”; no separate card.", None, None, True, ["variant", "br_am"])
o("movie theater", H, "American form with low local relevance; “cinema” is the usual Indian/British word (already a candidate).", "Record as a US variant of “cinema”; no separate card.", None, None, True, ["variant", "br_am", "local_relevance"])
o("movie", R, "Understood in India, but “film” is the primary Indian/British form (already a candidate).", "Teach “film” as primary; record “movie” as a common variant.", "Arts and Culture", None, True, ["variant", "br_am"])
o("penny", H, "British coin; low relevance for Indian learners.", "Use rupee/paise (or a neutral “coin”) in authored material; keep only if a UK story needs it.", None, None, True, ["local_relevance"])
o("cent", H, "Foreign coin unit; low relevance for Indian learners.", "Prefer rupee/paise; consider “cent” only receptively in Band 4 world-currency contexts.", None, None, True, ["local_relevance"])
o("businessman", R, "Gendered job title.", "Author new material as “businessperson”; keep “businessman” only as a receptive form.", None, None, True, ["inclusive_language"])
o("fat", R, "Sensitive when used about people.", "Use only for food, animals or objects (e.g. “a fat pumpkin”); never to label or judge people. Needs explicit context guidance.", "Descriptions", None, True, ["sensitive_context"])
o("beef", R, "Dietary and cultural sensitivity: students' diets and backgrounds differ.", "Use only in neutral, respectful contexts (e.g. food labels or menus), never as a preferred or default food; consider teaching receptively. Requires educator sign-off.", "Food and Nutrition", None, True, ["sensitive_context", "cultural"])
# Missing POS (correct before lesson creation)
o("studies", R, "Missing part of speech; plural noun (as in “social studies”).", "Set POS = noun (plural) before lesson creation.", None, None, True, ["missing_pos"])
o("opening hours", R, "Missing part of speech; plural noun phrase. Category “Sports and Hobbies” is wrong.", "Set POS = noun (plural phrase); category Time.", "Time", None, True, ["missing_pos", "category_fix"])
o("clothes", R, "Missing part of speech; plural-only noun.", "Set POS = noun (plural only); consider Band 1–2, as this is an early everyday word.", None, 2, True, ["missing_pos", "band_change"])
o("facilities", R, "Missing part of speech; plural noun. Category “Sports and Hobbies” is wrong.", "Set POS = noun (plural); category Places.", "Places", None, True, ["missing_pos", "category_fix"])
o("instructions", R, "Missing part of speech; plural noun.", "Set POS = noun (plural); very useful classroom word.", None, None, True, ["missing_pos"])
o("jeans", R, "Missing part of speech; plural-only noun. Band 4 is too high for an everyday clothing word.", "Set POS = noun (plural only); move to Band 2.", None, 2, True, ["missing_pos", "band_change"])
# Sense clarity (multiple meanings)
o("back", R, "Several meanings (body part / adverb / adjective).", "Band 1: teach the body-part sense first (“my back”); add other senses as separate records later.", None, None, True, ["sense"])
o("present", R, "Several meanings (gift / now / to present).", "Band 1: teach “present” = gift; create separate sense records for the others.", None, None, True, ["sense"])
o("bank", R, "Two unrelated meanings (money / river bank).", "Teach the money sense in Places; add “river bank” as a separate record.", None, None, True, ["sense"])
o("band", R, "Several meanings (music group / rubber band / hair band).", "Choose one sense per card; the Movers scene uses the music sense.", None, None, True, ["sense"])
o("bat", R, "Two senses: the animal (source scene) and a cricket bat (very relevant in India). Category Sports fits only the cricket sense.", "Create separate records for the animal (Animals) and the cricket bat (Sports and Hobbies).", None, None, True, ["sense"])
o("well", R, "Several meanings (healthy / adverb “well done” / water well).", "Teach “I feel well” (health) first; keep the other senses separate.", None, None, True, ["sense"])
o("mean", R, "Verb “mean” (signify) versus adjective “mean” (unkind).", "Teach the verb sense (“What does it mean?”); handle the adjective separately and kindly.", None, None, True, ["sense"])
o("change", R, "Verb sense (to change) versus noun “change” (money returned). Category Money fits the noun only.", "Decide the target sense; if Money and Shopping, POS = noun.", None, None, True, ["sense"])
o("second", R, "Ordinal (2nd) versus time unit (a second).", "Separate the ordinal (number set) and the time unit (Time); do not mix them on one card.", None, None, True, ["sense"])
o("case", R, "Ambiguous (suitcase / pencil case / “in case”).", "Specify the sense (e.g. pencil case, School and Education); avoid the legal sense.", "", None, True, ["sense", "category_uncertain"])
o("fair", R, "Ambiguous (fair weather / fair play / a fair).", "Choose the sense; “fair = just” is valuable for values education.", None, None, True, ["sense"])
o("text", R, "Noun (a text to read) versus verb (to send a text message) senses.", "Teach the reading sense in Band 2; the messaging sense at a later band with online-safety notes.", None, None, True, ["sense"])
o("web", R, "Spider web versus the internet sense.", "Separate the records: spider web (Nature) and web (Technology).", None, None, True, ["sense"])
o("engaged", H, "Main sense in the source is a British telephone line “engaged” (dated); the other sense (to be married) is not a target.", "Do not create a card now.", None, None, True, ["sense", "dated"])
o("pin", R, "Pin (sewing/notice board) versus PIN number.", "Teach the object sense; in any PIN reference, stress never sharing PINs.", "", None, True, ["sense", "safety"])
o("application", R, "Job application versus phone/computer app.", "Choose a sense; children meet “app” more often; job sense is Band 4 only.", "", 4, True, ["sense", "band_change"])
o("apply", R, "Adult job/form sense in Band 3.", "Use “apply glue/cream” or “apply a rule” for children; job sense Band 4.", "", 4, True, ["sense", "band_change"])
o("dear", R, "Category wrong; letter greeting (“Dear Sir/Madam”) / “Oh dear”.", "Category Communication; teach with letter-writing.", "Communication", None, True, ["category_fix"])
o("matter", R, "Mainly useful in the phrase “What's the matter?”.", "Teach as a phrase card (Communication).", "Communication", None, False, ["phrase"])
o("company", R, "Business sense is abstract for Band 2.", "Teach “keep someone company” at Band 2 or move the business sense to Band 4.", None, 4, True, ["sense", "band_change"])
# Age fit — adult workplace and finance words placed too low
for w in "contract|employment|wage|salary|employee|candidate|quit|luxury|credit card|economics".split("|"):
    O[w] = (R, "Adult workplace/finance concept placed in Band 3 (Grades 3–4).", "Move to Band 4 with child-relevant contexts (e.g. a class election candidate, saving pocket money).", None, 4, True, ["age_fit", "band_change"])
O["contract"] = (H, "Adult legal/workplace concept with little value for children.", "Do not create a card now.", None, None, True, ["age_fit"])
O["duty-free"] = (H, "Adult airport-shopping concept; low value for children.", "Do not create a card now.", None, None, True, ["age_fit"])
O["immigration"] = (R, "Airport procedure word; sensitive political sense possible.", "Band 4 travel context only (passport control).", None, 4, True, ["age_fit", "band_change", "sensitive_context"])
O["boss"] = (R, "Informal, workplace.", "Band 4; prefer “manager” or “team leader” in authored material.", None, 4, True, ["age_fit", "band_change"])
O["hire"] = (R, "British “hire” (rent); Indian English often uses “rent”. Category is wrong.", "Category Money and Shopping; teach with “rent” as a synonym.", "Money and Shopping", None, True, ["br_am", "category_fix"])
# Cultural / age sensitivity
o("romantic", H, "Romance is outside PING VIBE's child content rules.", "Do not create a card.", None, None, True, ["sensitive_context"])
o("soap opera", H, "Adult TV genre with low learning value.", "Do not create a card.", None, None, True, ["age_fit"])
o("chat show", H, "Dated British TV term with low relevance.", "Do not create a card.", None, None, True, ["dated", "local_relevance"])
o("break in", H, "Main phrasal sense is burglary (crime).", "Do not create a card for children.", None, None, True, ["sensitive_context"])
o("knock down", R, "Senses include a vehicle hitting someone (distressing) or demolishing a building.", "Teach only “knock down a tower of blocks / an old building”.", None, None, True, ["sensitive_context", "sense"])
o("hold up", R, "Senses include robbery and delay.", "Teach only the delay sense (“The traffic held us up”).", None, None, True, ["sensitive_context", "sense"])
o("put down", R, "Senses include insulting someone and putting an animal to sleep.", "Teach only “put down your pencil”.", None, None, True, ["sensitive_context", "sense"])
o("disabled", R, "Sensitive; needs respectful, person-first language.", "Use in “disabled access/ramp” and “people with disabilities”; never as a label for a child. Educator review required.", "Community Helpers", None, True, ["sensitive_context", "inclusive_language"])
o("unemployed", R, "Sensitive for some families.", "Band 4 only, neutral context; avoid judgemental framing.", None, None, True, ["sensitive_context"])
o("soldier", R, "Sensitive: conflict associations.", "Use respectful contexts (Independence Day, disaster relief); avoid war.", None, None, True, ["sensitive_context"])
o("politician", R, "Politics is a sensitive topic.", "Neutral civic-role context only (e.g. “people elect leaders”).", None, None, True, ["sensitive_context"])
o("naughty", R, "Can be used to label children negatively.", "Use for story characters or animals (“the naughty monkey”), never to describe a real child.", "Descriptions", None, True, ["sensitive_context", "category_fix"])
o("thriller", R, "Genre can involve fear/violence.", "Band 4, framed as “mystery thriller book”; avoid frightening examples.", None, None, True, ["age_fit"])
o("operation", R, "Medical surgery sense can worry young children.", "Calm, factual context; or teach the “machine operation” sense.", None, None, True, ["sensitive_context", "sense"])
o("stranger", U, "Important for safety education.", "Pair with safety guidance (“Don't go with strangers; tell a trusted adult”).", None, None, False, ["safety"])
o("address", R, "Band 1 is early; online-safety sensitivity.", "Move to Band 2; teach never to share your home address online.", "Places", 2, True, ["safety", "band_change", "category_fix"])
o("password", U, "Relevant digital-literacy word.", "Always pair with “never share your password”.", None, None, False, ["safety"])
o("blog", R, "Online publishing needs safety framing.", "Band 4 with online-safety context.", None, 4, True, ["safety", "band_change"])
o("blond", R, "Low relevance to most Indian learners' descriptions.", "Receptive only (story characters); prefer black/brown/curly/straight hair descriptions.", "Descriptions", None, False, ["local_relevance", "category_fix"])
o("hip hop", R, "Narrow, low-priority genre word.", "Lower priority; keep receptive.", None, None, False, ["local_relevance"])
o("cruise", R, "Luxury-travel concept with low relevance.", "Lower priority; receptive only.", None, None, False, ["local_relevance"])
o("basement", R, "Less common in Indian homes.", "Teach receptively (hotel/building context).", None, None, False, ["local_relevance"])
o("actress", R, "Modern usage often uses “actor” for all genders.", "Teach “actor” as primary; keep “actress” receptive.", None, None, False, ["inclusive_language"])
o("ring up", R, "British phone phrasal verb; Indian English usually says “call”.", "Teach as a synonym of “call” (receptive).", None, None, False, ["br_am"])
o("ring back", R, "British phone phrasal verb; Indian English usually says “call back”.", "Teach as a synonym of “call back” (receptive).", None, None, False, ["br_am"])
o("put through", H, "Dated telephone-operator phrase.", "Do not create a card.", None, None, True, ["dated"])
o("wash up", R, "Means wash the dishes (British) or wash your hands (American).", "Teach the British sense with a clear example.", None, None, True, ["br_am", "sense"])
o("silver", R, "Part of speech parsed incorrectly as “adverb”.", "Correct POS to adjective/noun (a colour and a metal).", None, None, True, ["pos_error"])
o("celebrity", R, "Word-family link to “celebration” is a FALSE match (unrelated meaning).", "Remove the link; keep as its own Band 4 word with neutral contexts.", None, None, False, ["false_overlap"])
# Band corrections (frequency-based band too high for everyday classroom words)
for w, b in {"o'clock": 2, "noon": 3, "diary": 3, "absent": 2, "hobby": 2, "poem": 2, "cartoon": 2, "dancer": 2, "camping": 3, "musician": 3, "keyboard": 3, "freezing": 3, "instrument": 3, "chess": 3, "circus": 3, "invention": 3, "scientist": 3, "detective": 3, "photographer": 3, "receipt": 3, "relax": 3, "exam": 3, "sit down": 2, "throw away": 3, "write down": 3}.items():
    if w not in O: O[w] = (R, f"Everyday/classroom word placed too high by frequency banding (absent is used in daily roll call in Indian schools)." if w == "absent" else "Everyday or classroom word placed too high by frequency banding.", f"Move to Band {b}.", None, b, True, ["band_change"])
O["chess"] = (R, "Everyday hobby word placed too high; category should be Sports and Hobbies.", "Move to Band 3; category Sports and Hobbies.", "Sports and Hobbies", 3, True, ["band_change", "category_fix"])
O["circle"] = (R, "Category wrong for young learners (shape, not place).", "Category Colours and Shapes.", "Colours and Shapes", None, False, ["category_fix"])
O["square"] = (R, "Shape versus town square; category should suit young learners.", "Band 1: shape sense (Colours and Shapes); the town-square sense separately.", "Colours and Shapes", None, True, ["sense", "category_fix"])
# Function/structure words → grammar, not vocabulary cards
for w in "all|more|most|only|then|how|when|why|off|out|down".split("|"):
    O[w] = (H, "Function/structure word, better taught through Grammar Galaxy and reading than on a vocabulary card.", "Route to grammar/reading activities; no vocabulary card.", "", None, False, ["function_word"])
for w in "always|never|often|sometimes|how often".split("|"):
    O[w] = (U, "High-value frequency word.", "Teach in a Time and Frequency set (with a sentence frame).", "Time and Frequency", None, False, ["category_fix"])
for w in "first|third|hundred".split("|"):
    O[w] = (R, "Number or ordinal word; belongs in a numbers set rather than a single vocabulary card.", "Teach in a numbers/ordinals word set; no taxonomy category fits.", "", None, False, ["word_set"])
for w in "best|worst|worse|better".split("|"):
    O.setdefault(w, (R, "Comparative/superlative form.", "Teach with Grammar Galaxy comparatives, linked to good/bad.", "Descriptions", None, False, ["grammar_link", "category_fix"]))
# Phrasal verbs: keep distinct multiword expressions; hold literal or vague ones
for w in "look up|fill in|write down|throw away|grow up|get along|put away|hand in|hand out|look forward to|turn on|try on|check in|check out|cross out|keep up|keep on|give back|turn into|end up|deal with|set out|put out|cut up|stay behind|wear out|fill up|get in|get back|go out|hang out|look out|hang up|take up|sit down|get off|get on|get up|dress up|get dressed|go shopping".split("|"):
    if w not in O: O[w] = (U, "Distinct, useful multi-word expression.", "Teach in context (story or Real Life) and link to the base verb.", "Actions", None, False, ["phrasal_verb", "category_fix"])
for w in "work out|give in|give out|give way|go off|call for|call in|be over|base on|put up|turn up|bring up|get down|go for|come on|go on|keep in".split("|"):
    if w not in O: O[w] = (R, "Phrasal verb with several or idiomatic senses.", "Choose one child-relevant sense and author a clear example (e.g. “based on” for base on; “go on = continue”).", "Actions", None, True, ["phrasal_verb", "sense", "category_fix"])
O["keep in"] = (H, "Vague sense (detention / keep indoors); low value.", "Do not create a card now.", "", None, True, ["phrasal_verb", "sense"])
O["come on"] = (R, "Overlaps with the candidate “come on!” (exclamation).", "Merge into one card with two clearly separated uses, or keep only the exclamation for Band 2.", "Communication", None, True, ["overlap", "sense"])
O["look at"] = (H, "Literal phrase; meaning is not distinct from the existing word “look”.", "Teach within the “look” card examples; no separate card.", "", None, False, ["overlap", "literal_phrase"])
# Overlap entries (manual review)
O["comic book"] = (R, "Overlaps with the candidate “comic” (same meaning).", "Merge with “comic”: one card, “comic book” as an example.", "Arts and Culture", None, False, ["overlap"])
O["all right"] = (U, "Distinct fixed expression (not the same as “right”).", "Teach as a Communication phrase; link to “right”.", "Communication", None, False, ["overlap", "phrase"])
O["quickly"] = (U, "Valid word-family form of existing “quick”.", "Teach as a linked adverb (quick → quickly).", "Descriptions", None, False, ["word_family"])
O["slowly"] = (U, "Valid word-family form of existing “slow”.", "Teach as a linked adverb (slow → slowly).", "Descriptions", None, False, ["word_family"])
O["exciting"] = (U, "Valid family with existing “excited”; the -ed/-ing contrast is a key teaching point.", "Teach exciting versus excited together.", None, None, False, ["word_family"])
for w in "primary school|travel agent|shop assistant|swimming pool|sports centre|bus stop|bus station|police officer|text message|credit card|digital camera|web page|video clip|seat belt|film maker".split("|"):
    if w in O: continue
    O[w] = (U, "Distinct compound noun with its own meaning.", "Keep as a separate card; link to the base word.", None, None, False, ["compound"])
# Category corrections (obvious errors only)
CAT_FIX = {"city": "Places", "world": "Geography", "country": "Geography", "area": "Places", "ground": "Nature", "top": "Descriptions", "driver": "Transport", "bus stop": "Transport", "bus station": "Transport",
 "drop": "Actions", "awake": "Descriptions", "pirate": "Arts and Culture", "clown": "Arts and Culture", "skate": "Sports and Hobbies", "shark": "Animals", "dolphin": "Animals", "kangaroo": "Animals",
 "swimming pool": "Places", "sports centre": "Places", "restaurant": "Places", "theatre": "Arts and Culture", "gallery": "Arts and Culture", "fiction": "Arts and Culture", "sculpture": "Arts and Culture",
 "safe": "Descriptions", "dangerous": "Descriptions", "damaged": "Descriptions", "difficult": "Descriptions", "easy": "Descriptions", "different": "Descriptions", "wrong": "Descriptions", "bad": "Descriptions",
 "know": "Thinking and Problem-solving", "idea": "Thinking and Problem-solving", "mistake": "Thinking and Problem-solving", "difference": "Thinking and Problem-solving", "think": "Thinking and Problem-solving",
 "operate": "Actions", "exit": "Places", "pet": "Animals", "uncle": "Relationships", "aunt": "Relationships", "tooth": "Body and Health", "beard": "Body and Health", "carefully": "Descriptions", "badly": "Descriptions",
 "need": "Actions", "take": "Actions", "bring": "Actions", "wait": "Actions", "lose": "Actions", "help": "Actions", "wake": "Actions", "relax": "Actions", "succeed": "Actions", "slip": "Actions", "forgive": "Values and Character",
 "realise": "Thinking and Problem-solving", "convince": "Communication", "be called": "Communication", "come on!": "Communication", "excuse me": "Communication", "how much": "Money and Shopping",
 "monday": "Time", "tuesday": "Time", "wednesday": "Time", "thursday": "Time", "friday": "Time", "saturday": "Time", "sunday": "Time", "treasure": "", "exam": "School and Education", "examination": "School and Education",
 "shocked": "Emotions and Feelings", "seat belt": "Transport", "tune": "Music", "classical": "Music", "guitar": "Music", "concert": "Music", "musician": "Music", "instrument": "Music", "opera": "Music",
 "tourism": "Travel", "last": "Time", "write down": "Actions", "sit down": "Actions", "throw away": "Actions", "ring back": "Communication", "wrap": "Actions", "hold up": "Actions", "put down": "Actions", "knock down": "Actions", "group": "", "row": "", "intelligent": "Descriptions", "challenging": "Descriptions", "frequent": "Time and Frequency", "powder": "Home and Family", "pump": "Transport", "inside": "Descriptions", "outside": "Descriptions", "near": "Descriptions", "far": "Descriptions"}
o("chat", R, "Online chat needs safety framing for children.", "Teach “chat” as talking with friends; online sense with safety rules (never chat with strangers).", None, None, False, ["safety"])
o("inquiry", R, "Indian/British English prefers “enquiry” (e.g. railway Enquiry counter).", "Use “enquiry” as the primary form; record “inquiry” as a variant.", "Communication", None, True, ["br_am", "variant"])
o("check-in", R, "Overlaps with the phrasal verb “check in” (noun versus verb).", "Keep one card with both forms (to check in / the check-in desk).", None, None, False, ["overlap"])
o("film maker", R, "Modern spelling is “filmmaker”.", "Author as “filmmaker”.", None, None, False, ["spelling"])
o("admission", R, "Two senses: entry to a museum or event, and school admission (very relevant in India).", "Choose the sense per card; school admission belongs in School and Education.", "", None, True, ["sense", "category_uncertain"])
o("party", U, "Common social word; the original category “Sports and Hobbies” is not accurate.", "Author an original card; a person should choose the category.", "", None, False, ["category_uncertain"])
SAFE_DEFAULT = ("Use", "Common, concrete and age-appropriate for the stated band; useful for Indian learners.", "Author an original card through the Content Studio pipeline (7 gates, then human approval).")

rows = []
for c in C:
    w = c["word"]
    dec, reason, action, catfix, band_s, confirm, flags = O.get(w, (*SAFE_DEFAULT, None, None, False, []))
    flags = list(flags)
    new_cat = c["category"]
    if w in CAT_FIX and (catfix is None):
        catfix = CAT_FIX[w]
    if catfix is not None:
        if catfix == "": new_cat = None; flags.append("category_uncertain") if c["category"] is None or "category_uncertain" not in flags else None
        elif catfix != c["category"]: new_cat = catfix; flags.append("category_fix") if "category_fix" not in flags else None
    if c["category"] is None and new_cat is None and "category_uncertain" not in flags: flags.append("category_uncertain")
    if new_cat and c["category"] and new_cat != c["category"] and dec == "Use": confirm = confirm or False
    if band_s and band_s != c["band"] and "band_change" not in flags: flags.append("band_change")
    if band_s == c["band"]: band_s = None
    if c["link_type"] and not any(f in flags for f in ("overlap", "word_family", "false_overlap", "compound", "phrasal_verb", "phrase", "literal_phrase")): flags.append("overlap_reviewed")
    rows.append({
        "candidate_id": c["candidate_id"], "word": w, "band": c["band"], "band_label": BANDS[c["band"]], "grade_range": c["grade_range"], "part_of_speech": ", ".join(c["part_of_speech"]) or "(missing)",
        "category_original": c["category"] or "", "category_reviewed": new_cat or "", "provenance_sources": " + ".join(c["provenance"]["sources"]), "provenance_page": c["provenance"].get("page_ref") or "",
        "publication_status": c["publication_status"], "linked_existing_word": c["linked_existing_word"] or "", "link_type": c["link_type"] or "",
        "review_decision": dec, "reason": reason, "recommended_action": action, "suggested_band": band_s or "", "needs_human_confirmation": "Yes" if (confirm or dec == "Hold" or "band_change" in flags or "category_uncertain" in flags) else "No",
        "flags": ", ".join(dict.fromkeys(f for f in flags if f)), "review_type": "AI-assisted triage (not certification)", "disclaimer": DISCLAIMER,
    })

# ── write CSV (UTF-8 with BOM for Excel) ──
FIELDS = list(rows[0].keys())
with open(f"{OUT}/PINGVIBE_Cambridge_Candidate_Review_AI_Triage.csv", "w", newline="", encoding="utf-8-sig") as f:
    wr = csv.DictWriter(f, fieldnames=FIELDS); wr.writeheader(); wr.writerows(rows)

# ── workbook ──
HF = PatternFill("solid", fgColor="852DEB"); HFont = Font(bold=True, color="FFFFFF")
FILL = {"Use": "E8F7EC", "Revise": "FFF6DD", "Hold": "FDE7E7"}
def sheet(wb, title, header, data, widths=None):
    ws = wb.create_sheet(title); ws.cell(1, 1, DISCLAIMER).font = Font(bold=True, color="B00020"); ws.cell(2, 1, TRIAGE).font = Font(italic=True, color="555555")
    for i, h in enumerate(header, 1):
        x = ws.cell(4, i, h); x.font = HFont; x.fill = HF; x.alignment = Alignment(wrap_text=True, vertical="top")
    for r, row in enumerate(data, 5):
        for i, v in enumerate(row, 1): ws.cell(r, i, v).alignment = Alignment(wrap_text=True, vertical="top")
        if "Review decision" in header:
            d = row[header.index("Review decision")]; ws.cell(r, header.index("Review decision") + 1).fill = PatternFill("solid", fgColor=FILL[d])
    for i in range(1, len(header) + 1): ws.column_dimensions[get_column_letter(i)].width = (widths or {}).get(i, 16)
    ws.freeze_panes = "C5"; ws.auto_filter.ref = f"A4:{get_column_letter(len(header))}{4 + max(1, len(data))}"
    return ws
wb = Workbook(); wb.remove(wb.active)
readme = wb.create_sheet("README")
for i, line in enumerate([DISCLAIMER, TRIAGE, "",
    f"Generated {datetime.date.today().isoformat()} from the ORIGINAL file PINGVIBE_Cambridge_Vocabulary_Mapping.json (read-only). The original workbook and JSON are unchanged.",
    "Decisions: Use = suitable as framed (still needs the 7 content gates and human approval) · Revise = suitable after the stated correction · Hold = not a vocabulary target now.",
    "needs_human_confirmation = Yes for every Hold, band change, sense choice, sensitive item or uncertain category.",
    "Criteria: age fit for the stated band, sense clarity, usefulness for Indian learners, Indian/British usage, cultural sensitivity, category accuracy.",
    "No candidate was imported, published or changed in the application. No board-syllabus (CBSE/ICSE/state) alignment is claimed."], 1):
    readme.cell(i, 1, line).font = Font(bold=(i <= 2)); readme.column_dimensions["A"].width = 140
H1 = ["Candidate ID", "Word", "Band", "Band label", "Grade range", "Part of speech", "Category (original)", "Category (reviewed)", "Provenance", "Source page", "Publication status", "Linked existing word", "Link type", "Review decision", "Reason", "Recommended action", "Suggested band", "Needs human confirmation", "Flags"]
sheet(wb, "Candidate Review", H1, [[r["candidate_id"], r["word"], r["band"], r["band_label"], r["grade_range"], r["part_of_speech"], r["category_original"], r["category_reviewed"], r["provenance_sources"], r["provenance_page"], r["publication_status"], r["linked_existing_word"], r["link_type"], r["review_decision"], r["reason"], r["recommended_action"], r["suggested_band"], r["needs_human_confirmation"], r["flags"]] for r in rows],
      {2: 18, 7: 20, 8: 20, 9: 22, 14: 12, 15: 50, 16: 55, 19: 30})
cnt = collections.Counter((r["band"], r["review_decision"]) for r in rows)
summ = [[b, BANDS[b], cnt[(b, "Use")], cnt[(b, "Revise")], cnt[(b, "Hold")], sum(cnt[(b, d)] for d in ("Use", "Revise", "Hold")), sum(1 for r in rows if r["band"] == b and r["needs_human_confirmation"] == "Yes")] for b in (1, 2, 3, 4)]
summ.append(["All", "", *[sum(x[i] for x in summ) for i in (2, 3, 4, 5, 6)]])
sheet(wb, "Summary by Band", ["Band", "Grades", "Use", "Revise", "Hold", "Total", "Needs human confirmation"], summ, {2: 14, 7: 22})
PRIORITY = [
 ("1", "Hold the 9 personal names as vocabulary targets", "john, paul, peter, jack, mary, jim, charlie, jane, fred", "Keep only as story character names."),
 ("2", "Fix the 6 entries with a missing part of speech", "studies, opening hours, clothes, facilities, instructions, jeans", "Set POS before any lesson is created."),
 ("3", "Sensitive contexts", "fat, beef, disabled, unemployed, soldier, politician, naughty, operation, knock down, hold up, put down", "Author only with the stated respectful contexts; educator sign-off."),
 ("4", "Hold items outside child content rules", "romantic, soap opera, break in, contract, duty-free, chat show, put through, engaged, keep in", "No cards."),
 ("5", "Indian/British primary forms", "lift (primary) / elevator (variant); film / movie; cinema / movie theater; rupee-paise over penny and cent; businessperson over businessman; actor over actress", "Variants recorded on the primary card; no duplicate cards."),
 ("6", "Choose one meaning per card", "back, present, bank, band, bat, well, mean, change, second, case, fair, text, web, pin, application, apply, square, company", "Separate sense records; never merge meanings."),
 ("7", "Band corrections", "absent, o'clock, jeans, clothes, hobby, poem, cartoon, dancer → Band 2; noon, diary, camping, musician, keyboard, freezing, chess and others → Band 3; adult workplace/finance words → Band 4", "Teacher confirmation before changing bands."),
 ("8", "Category errors and uncategorised entries", "e.g. shark, dolphin, kangaroo → Animals; pirate, clown → Arts and Culture; restaurant → Places; gallery, fiction, sculpture → Arts and Culture; dear → Communication; days of the week → Time", "Uncertain categories left blank for a person to decide."),
 ("9", "Overlaps", "comic book (merge with comic), look at (teach within look), come on / come on! (merge), celebrity–celebration (false link); quickly/slowly/exciting kept as word-family links", "Manual check against existing records before authoring."),
 ("10", "Data error", "silver tagged as adverb", "Correct POS to adjective/noun."),
]
sheet(wb, "Priority Corrections", ["Priority", "Correction", "Entries", "Action"], [list(p) for p in PRIORITY], {2: 40, 3: 80, 4: 50})
catrows = [[r["candidate_id"], r["word"], r["category_original"] or "(none)", r["category_reviewed"] or "(left blank — uncertain)", r["needs_human_confirmation"]] for r in rows if r["category_original"] != r["category_reviewed"]]
sheet(wb, "Category Review", ["Candidate ID", "Word", "Original category", "Reviewed category", "Needs human confirmation"], catrows, {2: 18, 3: 26, 4: 30})
ov = [[r["candidate_id"], r["word"], r["linked_existing_word"], r["link_type"], r["review_decision"], r["recommended_action"]] for r in rows if r["link_type"] or "overlap" in r["flags"]]
sheet(wb, "Overlap Review", ["Candidate ID", "Word", "Linked existing word / candidate", "Link type", "Decision", "Action"], ov, {2: 18, 3: 22, 4: 30, 6: 60})
lim = wb.create_sheet("Limitations")
for i, line in enumerate([DISCLAIMER, TRIAGE, "",
    "• This review was produced by an AI assistant using general knowledge of Indian school English and the PING VIBE content rules. It has not been checked by a qualified educator.",
    "• No CBSE, ICSE, state board or other syllabus documents were consulted; nothing here asserts syllabus alignment.",
    "• “Use” is not approval: every card must still be authored originally, pass the seven content gates, and be approved by a person before publication.",
    "• Band, sense and category suggestions are recommendations for teacher confirmation; frequency-based banding was the original method and has known weaknesses for concrete classroom words.",
    "• Cultural-sensitivity notes are cautious defaults; schools and families differ and educators should adapt them.",
    "• The original mapping workbook and JSON are unchanged; no candidate was imported, published or edited in the application."], 1):
    lim.cell(i, 1, line).font = Font(bold=(i <= 2)); lim.column_dimensions["A"].width = 150
wb.save(f"{OUT}/PINGVIBE_Cambridge_Candidate_Review_AI_Triage.xlsx")
json.dump({"summary": summ, "rows": rows}, open("/tmp/cam/review_rows.json", "w"))
print("rows", len(rows), "decisions", collections.Counter(r["review_decision"] for r in rows), "confirm", sum(r["needs_human_confirmation"] == "Yes" for r in rows))
print("uncategorised orig", sum(1 for r in rows if not r["category_original"]), "→ still blank", sum(1 for r in rows if not r["category_reviewed"]), "| category changes", len(catrows))
for s in summ: print(s)
