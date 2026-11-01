"""Pilot v2: manual corrections of the 30 'Draft – needs fixes' cards from the recorded review notes (no API calls).
Reads the original pilot JSON read-only; writes pilot/v2/. Re-runs the deterministic gates on all 40 cards."""
import json, csv, re, copy, datetime, collections
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.utils import get_column_letter
SRC = "deliverables/phase-1-content/pilot/PINGVIBE_Vocab_Pilot_Cards.json"; OUT = "deliverables/phase-1-content/pilot/v2"
DISCLAIMER = "Internal research mapping. PING VIBE is not affiliated with or endorsed by Cambridge. Candidates are unpublished and awaiting educational review."
NOTE = "Pilot v2: manual corrections from recorded review notes (no API calls). Not educator-approved, not published, not imported."
L = lambda *x: "; ".join(x)
FIX = {
 "doctor": dict(simple_meaning="A doctor helps sick people get well.", explanation="When you are sick, a doctor checks you. Doctors work in clinics and hospitals.", example_sentence="The doctor looked at my throat when I had a cold.", antonyms="", related_words=L("nurse", "patient", "hospital", "medicine")),
 "driver": dict(simple_meaning="A driver is a person who drives a car, bus or truck.", explanation="A driver sits at the wheel. A driver takes people or things where they need to go.", example_sentence="Our bus driver waves to us each day.", antonyms="", related_words=L("passenger", "bus", "car", "road")),
 "market": dict(emoji="🧺", simple_meaning="A market is a place where people buy and sell things.", explanation="At a market, people sell fruit and flowers at small stalls.", example_sentence="Amma buys fish and greens at the market.", word_family=L("markets (plural)", "marketplace")),
 "shower": dict(simple_meaning="A shower sprays water on you so you can wash.", explanation="Water comes down from the shower like rain. You stand under it to get clean.", example_sentence="I took a shower after I played cricket.", real_world_usage="I want to take a shower now. I am all sweaty!", word_family=L("showers (plural)", "showered (verb)", "showering (verb)"), collocations=L("take a shower", "hot shower", "cold shower")),
 "daughter": dict(simple_meaning="A daughter is a girl child in a family.", explanation="A girl is a daughter in her home. Some girls live with two parents. Some live with one parent or with grandparents.", example_sentence="Meera is the only daughter in her home.", real_world_usage="Riya is Amma's daughter.", antonyms="", related_words=L("son", "family", "parent", "granddaughter"), illustration_brief="A smiling girl with her family. The family can be one parent, two parents or grandparents, shown warmly together."),
 "seat": dict(synonyms="", example_sentence="Please stay in your seat while Teacher reads the story."),
 "call": dict(explanation="When you call someone, you use a phone to talk. You can talk even when they are far away. Call can also mean to say a name loudly.", example_sentence="On Diwali morning, I call Nani to wish her.", related_words=L("mobile", "answer", "voice", "talk")),
 "video": dict(simple_meaning="A video is moving pictures that you can watch.", explanation="You can watch a video on a TV or phone. Most videos have sound.", example_sentence="Our teacher showed us a video about butterflies.", synonyms="", word_family="videos (plural)", spelling_guidance="Say it in parts: vid-ee-oh. Spell it v-i-d-e-o. It ends with the letters e and o.", category="Technology", illustration_brief="A classroom where children watch a screen that shows a butterfly coming out of its chrysalis and spreading its wings.", related_words=L("film", "clip", "camera", "screen")),
 "website": dict(simple_meaning="A website is a set of pages on the internet.", explanation="You can open a website on a phone or a computer. Each website has its own name.", example_sentence="We looked at a website about animals for our project.", synonyms="site", related_words=L("web page", "internet", "computer", "screen")),
 "straight": dict(synonyms="directly", antonyms="", collocations=L("go straight", "walk straight", "straight ahead", "straight home")),
 "drop": dict(explanation="When you drop something, you let it fall. Sometimes we drop things by mistake, and sometimes on purpose.", synonyms="let fall", antonyms=L("catch", "pick up"), collocations=L("drop a cup", "drop a pencil", "drop it in the bin"), real_world_usage="Oops! I dropped my pencil under the desk."),
 "hurt": dict(simple_meaning="When a part of your body hurts, it feels painful. To hurt can also mean to cause pain.", synonyms="ache", antonyms="", word_family=L("hurts", "hurting"), related_words=L("pain", "bandage", "heal", "feel better")),
 "holiday": dict(emoji="🚆", simple_meaning="A holiday is a time with no school or work.", explanation="On a holiday, families may travel or rest. The summer holidays are a long break from school.", example_sentence="In the summer holiday, we took a train to the hills.", synonyms=L("break", "vacation (American English)"), antonyms=L("school day", "working day"), word_family=L("holidays (plural)", "holidaymaker"), related_words=L("trip", "travel", "suitcase", "train")),
 "temperature": dict(simple_meaning="Temperature tells how hot or cold something is.", explanation="It tells us if a day is hot or cold. On a hot day, the temperature is high.", example_sentence="In May, the temperature is high, so we drink lots of water.", synonyms="", real_world_usage="The temperature is so low today that I need my sweater.", word_family="temperatures (plural)"),
 "comic": dict(simple_meaning="A comic tells a story with pictures and speech bubbles.", explanation="It has drawings in small boxes. The people in it talk in bubbles.", example_sentence="After homework, I read a funny comic about a monkey.", synonyms="comic book", word_family=L("comics (plural)", "comical (= funny)")),
 "information": dict(example_sentence="Our teacher gave us information about the school trip.", simple_meaning="Information is facts or details about something.", explanation="When you learn facts about a topic, you get information. We find information in books, from teachers or by asking.", synonyms=L("facts", "details"), spelling_guidance="Break it into parts: in-for-ma-tion; '-tion' sounds like 'shun'. It has no plural: say 'some information', not 'informations'."),
 "history": dict(synonyms="", antonyms="", applicable_grades="G3, G4, G5"),
 "computer": dict(explanation="A computer follows instructions to help us work, learn and play. Many computers have a screen, a keyboard and a mouse.", synonyms="", word_family=L("compute", "computing"), related_words=L("PC (personal computer)", "keyboard", "mouse", "laptop")),
 "manager": dict(synonyms="supervisor", antonyms="", related_words=L("staff", "team", "office", "leader")),
 "scene": dict(synonyms="", collocations=L("opening scene", "final scene", "act out a scene", "funny scene")),
 "spend": dict(explanation="When you spend money, you give it to get something you want or need. You can also spend time, like 'I spend Sundays with Nani.' It is wise to spend money carefully.", synonyms="", antonyms="save", related_words=L("money", "buy", "earn", "price")),
 "direction": dict(synonyms="way", real_world_usage="In which direction is the railway station?", word_family=L("direct", "directly", "director")),
 "museum": dict(synonyms="", word_family="museums (plural)"),
 "translate": dict(explanation="When you translate, you keep the meaning the same but say or write it in a different language. In India, many people translate between their home language, English and other Indian languages every day.", example_sentence="Meera translated the English school notice into Tamil for her grandmother.", synonyms="", spelling_guidance="Split it as 'trans' + 'late'. 'Trans' means across, so you carry words across languages. 'Translation' drops the final 'e' before '-ion'."),
 "recover": dict(explanation="When you recover, your body slowly gets better after a fever, cold or injury. Rest, good food and medicine from a doctor can help. Recover can also mean to get back something lost, as in 'The police recovered the stolen bicycle.'", example_sentence="Priya stayed at home with a fever, but she should recover in time for the school trip.", synonyms=L("get better", "get well"), antonyms="get worse", spelling_guidance="Spelling trick: re + cover (it does not mean 'cover again'). Add -y to make the noun recovery."),
 "delete": dict(simple_meaning="To remove something, such as a word, file or message, especially on a computer or device.", synonyms=L("erase", "remove"), antonyms=L("insert", "restore"), spelling_guidance="Two syllables: de-LETE. Both vowels after 'l' are 'e', and the final 'e' is silent."),
 "satisfied": dict(example_sentence="After making the rangoli for Diwali, Ananya stepped back and felt satisfied with the bright pattern.", synonyms=L("pleased", "content"), antonyms=L("dissatisfied", "disappointed"), related_words=L("proud", "relieved", "grateful", "accomplished")),
 "forgive": dict(synonyms=L("pardon", "excuse"), antonyms="resent", spelling_guidance="Think 'for' + 'give'. The verb is irregular: past tense 'forgave', past participle 'forgiven'."),
 "succeed": dict(example_sentence="After weeks of practice, Fatima finally succeeded in playing the whole tune on her harmonium.", synonyms=L("do well", "make it"), antonyms="fail", difficulty="Intermediate"),
 "realise": dict(simple_meaning="To understand or become aware of something, often suddenly.", example_sentence="Halfway to school, Dev suddenly realised he had left his tiffin box on the kitchen table.", real_world_usage="I've only just realised that the answer was in the first paragraph!", synonyms=L("understand", "become aware"), antonyms=L("overlook", "miss")),
}
# Gate logic copied from scripts/phase1/review_pilot.ts / src/server/content/validate.ts (same thresholds; not weakened).
UNSAFE = re.compile(r"\b(kill|killing|blood|gun|weapon|knife attack|suicide|sex|sexy|porn|drug|drugs|alcohol|beer|wine|cigarette|smoking|gamble|gambling|bet|casino|hate|stupid|idiot|dumb|naked|horror|scary death|die|dead body)\b", re.I)
def syl(w): return max(1, len(re.findall(r"[aeiouy]+", re.sub(r"e$", "", w.lower()))))
def grade(t):
    s = max(1, len(re.findall(r"[.!?]+", t))); w = re.findall(r"[A-Za-z']+", t)
    return 0.39 * (len(w) / s) + 11.8 * (sum(syl(x) for x in w) / len(w)) - 15.59 if w else 0
MAXG = {1: 3.5, 2: 5, 3: 7.5, 4: 11}; DIFF = {1: ["Beginner", "Developing"], 2: ["Beginner", "Developing", "Intermediate"], 3: ["Developing", "Intermediate", "Advanced"], 4: ["Intermediate", "Advanced", "Challenge"]}
def mech(s): return bool(re.match(r'^["“\'(]?[A-Z0-9]', s.strip())) and bool(re.search(r'[.!?]["”\')]?$', s.strip())) and not re.search(r"\s{2,}", s) and not re.search(r"\b(\w+)\s+\1\b", s, re.I)
published = {v["word"].lower() for v in json.load(open("deliverables/phase-1-content/_work/baseline.json"))["vocabulary"]}
HOLD = {"beef", "john", "paul", "peter", "jack", "mary", "jim", "charlie", "jane", "fred", "contract", "cent", "duty-free", "chat show", "engaged", "romantic", "look at", "keep in", "put through", "break in", "penny", "soap opera", "movie theater", "elevator", "movie", "come on", "call in", "go for", "wash up", "thing", "case", "all", "down", "more", "most", "off", "only", "out", "how", "then", "when", "why"}
src = json.load(open(SRC)); out = []; seen = set()
for c0 in src["cards"]:
    c = copy.deepcopy(c0); w = c["word"]; assert w not in HOLD
    edited = w in FIX
    if edited:
        for k, v in FIX[w].items(): assert k in c, (w, k); c[k] = v
        c["content_version"] = 2
    prose = " ".join([c["simple_meaning"], c["explanation"], c["example_sentence"]]); g = grade(prose)
    gates = {
      "1 safety moderation": not UNSAFE.search(json.dumps(c, ensure_ascii=False)),
      "2 grade readability": g <= MAXG[c["band"]],
      "3 grammar & mechanics": mech(c["example_sentence"]) and re.search(rf"\b{re.escape(w)}", c["example_sentence"], re.I) is not None,
      "5 duplicate detection": w.lower() not in published and w.lower() not in seen,
      "6 difficulty validation": c["difficulty"] in DIFF[c["band"]],
    }
    seen.add(w.lower())
    for k in [k for k in c if k[0].isdigit() or "(AI)" in k]: c.pop(k)
    c["readability_grade"] = round(g, 1)
    for k, v in gates.items(): c[k] = "PASS" if v else "FAIL"
    if edited:
        c["AI gates 4 & 7 + accuracy checks"] = "Not re-run (no API calls). Manual re-review against every recorded note: addressed."
        c["changes_v2"] = "; ".join(f"{k}" for k in FIX[w])
        prior_ai = "v1 AI checks failed; corrections applied manually"
    else:
        c["AI gates 4 & 7 + accuracy checks"] = "PASS in v1 AI review (card unchanged)"
        c["changes_v2"] = "none (passed v1)"
    det_ok = all(gates.values())
    c["validation_status"] = ("Validated – awaiting human approval" if not edited else "Corrected – awaiting AI re-review and human approval") if det_ok else "Draft – needs fixes"
    c["ipa_source"] = "CMU Pronouncing Dictionary — US English pronunciation" if c["ipa"] else "not in CMU — pending"
    c["publication_status"] = "not_published"; c["disclaimer"] = DISCLAIMER
    out.append(c)
for c in out:
    if c["2 grade readability"] == "FAIL": print("READABILITY FAIL", c["word"], c["band"], c["readability_grade"])
    if "FAIL" in [c[k] for k in c if k[0] in "12356" and k[1] == " "]: print("FAIL", c["word"], {k: c[k] for k in c if k[0] in "12356" and k[1] == " "})
json.dump({"generated": datetime.date.today().isoformat(), "version": 2, "disclaimer": DISCLAIMER, "note": NOTE, "api_calls": 0, "source": SRC, "cards": out}, open(f"{OUT}/PINGVIBE_Vocab_Pilot_Cards_v2.json", "w"), indent=1, ensure_ascii=False)
H = list(out[0].keys())
with open(f"{OUT}/PINGVIBE_Vocab_Pilot_Cards_v2.csv", "w", newline="", encoding="utf-8-sig") as fh:
    wr = csv.DictWriter(fh, fieldnames=H, extrasaction="ignore"); wr.writeheader(); [wr.writerow({k: c.get(k, "") for k in H}) for c in out]
wb = Workbook(); wb.remove(wb.active); HF = PatternFill("solid", fgColor="852DEB")
def sh(t, head, data, sc=None, widths=None):
    ws = wb.create_sheet(t); ws.cell(1, 1, DISCLAIMER).font = Font(bold=True, color="B00020"); ws.cell(2, 1, NOTE).font = Font(italic=True, color="555555")
    for i, h in enumerate(head, 1): x = ws.cell(4, i, h); x.font = Font(bold=True, color="FFFFFF"); x.fill = HF; x.alignment = Alignment(wrap_text=True, vertical="top")
    for r, row in enumerate(data, 5):
        for i, v in enumerate(row, 1): ws.cell(r, i, v).alignment = Alignment(wrap_text=True, vertical="top")
        if sc is not None: ws.cell(r, sc + 1).fill = PatternFill("solid", fgColor="E8F7EC" if str(row[sc]).startswith("Validated") else "EAF2FF" if str(row[sc]).startswith("Corrected") else "FFF6DD")
    for i in range(1, len(head) + 1): ws.column_dimensions[get_column_letter(i)].width = (widths or {}).get(i, 18)
    ws.freeze_panes = "C5"
sh("Cards v2 (40)", H, [[c.get(k, "") for k in H] for c in out], H.index("validation_status"))
GK = ["1 safety moderation", "2 grade readability", "3 grammar & mechanics", "5 duplicate detection", "6 difficulty validation"]
sh("Recheck (40)", ["word", "band", "content_version", "readability_grade", *GK, "AI gates 4 & 7 + accuracy checks", "changes_v2", "validation_status"],
   [[c["word"], c["band"], c["content_version"], c["readability_grade"], *[c[k] for k in GK], c["AI gates 4 & 7 + accuracy checks"], c["changes_v2"], c["validation_status"]] for c in out], 11, {9: 50, 10: 50, 11: 34})
st = collections.Counter(c["validation_status"] for c in out)
sh("Summary", ["Item", "Value"], [["Cards", 40], ["Edited (v2)", sum(c["content_version"] == 2 for c in out)], *[[k, v] for k, v in st.items()],
   *[[f"{k} — PASS", sum(c[k] == "PASS" for c in out)] for k in GK], ["API calls made", 0], ["IPA source", "CMU Pronouncing Dictionary — US English pronunciation"]], None, {1: 50, 2: 60})
wb.save(f"{OUT}/PINGVIBE_Vocab_Pilot_Cards_v2.xlsx")
print("status", dict(st)); print({k: sum(c[k] == "PASS" for c in out) for k in GK})
