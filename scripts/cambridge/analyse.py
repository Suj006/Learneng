"""Cambridge reference analysis → PING VIBE vocabulary mapping (research/internal).
Inputs: parsed Movers A–Z (2014) + scene labels, Preliminary wordlist (2012) entries + topic lists, PING VIBE baseline
(120 published + 757 queued). Output: /tmp/cam/mapping.json. No Cambridge definitions or example sentences are copied:
only headwords, parts of speech and topic tags are used, plus page references for traceability."""
import json, re, collections
from wordfreq import zipf_frequency
import cmudict
CMU = cmudict.dict()
B = json.load(open("/home/user/Learneng/deliverables/phase-1-content/_work/baseline.json"))
PRE = json.load(open("/tmp/cam/prelim.json"))
MOV = json.load(open("/tmp/cam/movers_az.json"))
MOV.append({"headword": "at", "pos": ["prep"], "note": "of time", "raw": "at prep of time"})

THEMES = {
 "toy-shop": ("A favourite toy shop", "Toy Shop Adventure", "roof kangaroo rabbit bear farmer farm panda lion dolphin shark parrot cage pirate clown kitten puppy comic whale skate skates tall fat funny naughty surprised"),
 "party": ("The party", "Birthday Party", "message son grandson glass bottle fly soup bowl cup cheese blonde hair grandparent grandchildren grown-up daughter granddaughter plate cry quiet parent hide band dance present"),
 "doctor": ("At the doctor's", "Doctor's Clinic", "stomach curly moustache tooth teeth earache headache cough fat better tea hurt shoulder neck back cold doctor thin nurse fish stomachache toothache"),
 "hotel": ("Uncle Charlie's hotel", "Hotel Adventure", "address floor dry awake upstairs map world towel elevator lift call road fan shower pool blanket downstairs wash seat basement balcony"),
 "countryside": ("From the countryside to the jungle", "Countryside Explorer", "top salad snow leaf leaves treasure grass bus stop rock rainbow river mountain sandwich ticket vegetable plant field ride city driver jungle town waterfall ground island tractor forest lake station countryside"),
 "weather": ("The weather", "Weather Station", "cloudy wind storm sun windy sunny cloud weather temperature snow rain weekend"),
 "town": ("Our town", "My Town", "circle square slow carry station centre bank market café drop place places straight supermarket library sports"),
 "holidays": ("Dreaming of holidays", "Holiday Planner", "text moon dvd sail sailing hop hopping dress bat website email video laugh fish fishing kick skip travel holiday"),
}
SCENE_OF = collections.defaultdict(list)
for k, (_, _, ws) in THEMES.items():
    for w in ws.split(): SCENE_OF[w].append(k)

TAX = {"Clothes and Accessories": "Clothing", "Colours": "Colours and Shapes", "Communications and Technology": "Technology", "Education": "School and Education",
 "Entertainment and Media": "Arts and Culture", "Environment": "Environment", "Food and Drink": "Food and Nutrition", "Health, Medicine and Exercise": "Body and Health",
 "Hobbies and Leisure": "Sports and Hobbies", "House and Home": "Home and Family", "Language": "Communication", "Personal Feelings, Opinions and Experiences": "Emotions and Feelings",
 "Places: Buildings": "Places", "Places: Countryside": "Nature", "Places: Town and City": "Places", "Services": "Community Helpers", "Shopping": "Money and Shopping",
 "Sport": "Sports and Hobbies", "The Natural World": "Nature", "Time": "Time", "Travel and Transport": "Travel", "Weather": "Weather and Seasons", "Work and Jobs": "Community Helpers"}
SCENE_TAX = {"toy-shop": "Animals", "party": "Relationships", "doctor": "Body and Health", "hotel": "Places", "countryside": "Nature", "weather": "Weather and Seasons", "town": "Places", "holidays": "Travel"}
TAG_TAX = {"action": "Actions", "descriptive": "Descriptions", "nature": "Nature", "academic": "Thinking and Problem-solving", "phrasal_verb": "Actions", "idiom": "Communication"}
FUNCTION_POS = {"determiner", "pronoun", "preposition", "conjunction", "modal verb", "auxiliary verb", "prepositional phrase", "det", "pron", "prep", "conj", "int", "poss", "dis"}
SENSITIVE = set("army arrest attack bleed blood cigarette crime criminal drunk gamble gun kill murder prison prisoner rob robber robbery smoke smoking steal thief violence violent weapon wine beer alcohol bar pub drug drugs divorce divorced die dead death funeral enemy fight war bomb shoot shot terror horror nightclub casino bet lottery".split())
DATED = set("cd;cd player;cd-rom;dvd;dvd player;mp3 player;fax;answerphone;disk;disc;disc/disk;dial;dial up;cassette;video recorder;walkman;floppy;printer;mouse mat;pc;operator;telephone box;phone box;phonecard".split(";"))
MODALS = set("must;have to;has to;had to;should;could;would;might;may;shall;ought to;can;will;be able to;need to".split(";"))
TECH = set("email;website;text;internet;dvd;video;computer;laptop;online".split(";"))
SENSITIVE |= {"fool", "split up", "break up", "kiss", "boyfriend", "girlfriend", "marry", "married", "pregnant", "ghost", "lie"}
VARIANTS = {"color": "colour", "favorite": "favourite", "center": "centre", "theater": "theatre", "organize": "organise", "realize": "realise", "jewelry": "jewellery", "gray": "grey", "program": "programme", "traveler": "traveller", "meter": "metre", "neighbor": "neighbour", "honor": "honour", "labor": "labour", "behavior": "behaviour", "humor": "humour", "flavor": "flavour", "practice": "practise", "elevator": "lift", "movie": "film", "apartment": "flat", "fall": "autumn", "candy": "sweets", "cookie": "biscuit", "soccer": "football", "pants": "trousers", "sneakers": "trainers", "vacation": "holiday", "garbage": "rubbish", "truck": "lorry", "mom": "mum", "eraser": "rubber", "math": "maths"}

def norm(w):
    import unicodedata
    w = unicodedata.normalize("NFKC", w).lower().replace("’", "'").strip()
    w = re.sub(r"\s*\([^)]*\)", "", w)            # drop parenthetical notes
    w = re.sub(r"\s+", " ", w).strip(" .")
    return w
def lemma(w):
    for suf, rep in (("ies", "y"), ("ves", "f"), ("ches", "ch"), ("shes", "sh"), ("sses", "ss"), ("xes", "x"), ("s", "")):
        if w.endswith(suf) and len(w) > len(suf) + 2: return w[: -len(suf)] + rep
    return w
def stem(w):
    for suf in ("ically", "ation", "ition", "ment", "ness", "ful", "less", "ly", "er", "est", "ing", "ed", "ion", "al", "ity", "ive", "ous"):
        if w.endswith(suf) and len(w) - len(suf) >= 4: return w[: -len(suf)]
    return w
def syl(w):
    p = CMU.get(w.split()[0]) if w else None
    return sum(1 for ph in p[0] if ph[-1].isdigit()) if p else None

# ── PING VIBE existing ──
pv = {}
for v in B["vocabulary"]:
    pv[norm(v["word"])] = {"word": v["word"], "status": "published", "band": v["band"], "pos": v["part_of_speech"], "tag": None}
for h in B["headwords"]:
    k = norm(h["word"])
    if k not in pv: pv[k] = {"word": h["word"], "status": "queued", "band": h["band"], "pos": None, "tag": h["category"]}
    else: pv[k].setdefault("also_queued", True)
pv_lemmas = {lemma(k): k for k in pv}
pv_stems = collections.defaultdict(list)
for k in pv: pv_stems[stem(k)].append(k)

# ── topic membership (Preliminary appendix 2) ──
topic_of = collections.defaultdict(set)
for topic, lines in PRE["topic_lines"].items():
    for l in lines:
        for part in re.split(r"\s*[/|I]\s+|\s{2,}", l):
            k = norm(part)
            if k and len(k) > 1 and not k.isdigit(): topic_of[k].add(topic)

def match_pv(k):
    if k in pv: return "exact", k
    if lemma(k) in pv: return "plural/singular", lemma(k)
    if k in pv_lemmas: return "plural/singular", pv_lemmas[k]
    if k in VARIANTS and VARIANTS[k] in pv: return "British/American variant", VARIANTS[k]
    inv = {v: kk for kk, v in VARIANTS.items()}
    if k in inv and inv[k] in pv: return "British/American variant", inv[k]
    if " " not in k and stem(k) in pv_stems and stem(k) != k: return "word family", pv_stems[stem(k)][0]
    if " " in k and any(p in pv for p in k.split() if len(p) > 3): return "multi-word contains existing word", next(p for p in k.split() if p in pv)
    return None, None

POSN = {"pl": "noun", "n pl": "noun", "sing": "noun", "n": "noun", "v": "verb", "adj": "adjective", "adv": "adverb", "prep": "preposition", "conj": "conjunction", "det": "determiner", "pron": "pronoun", "excl": "exclamation", "int": "interrogative", "poss": "possessive", "dis": "discourse marker"}
CONCRETE = {"Clothes and Accessories", "Colours", "Food and Drink", "House and Home", "The Natural World", "Sport", "Places: Buildings", "Places: Countryside", "Places: Town and City", "Travel and Transport", "Weather", "Education", "Health, Medicine and Exercise"}
def suggest(k, pos, src, in_movers, topics=()):
    concrete = "noun" in pos and bool(set(topics) & CONCRETE)
    z = zipf_frequency(k, "en")
    s = syl(k)
    if in_movers:
        band, grades, diff = 2, "G1–G3", "Developing"
        if SCENE_OF.get(k) and (s or 1) <= 2 and z >= 4.5 and "noun" in pos and k not in TECH: band, grades, diff = 1, "UKG–G2", "Beginner"
    elif " " in k and ("phrasal verb" in pos):
        band, grades, diff = 4, "G5–G7", "Advanced"
    elif concrete and (s or 3) <= 2 and z >= 3.6: band, grades, diff = 2, "G1–G4", "Developing"
    elif concrete and z >= 3.6: band, grades, diff = 3, "G3–G5", "Intermediate"
    elif z >= 5.0: band, grades, diff = 2, "G1–G3", "Developing"
    elif z >= 4.3: band, grades, diff = 3, "G3–G5", "Intermediate"
    elif z >= 3.6: band, grades, diff = 4, "G5–G7", "Advanced"
    else: band, grades, diff = 4, "G6–G7", "Challenge"
    rp = "productive" if (z >= 4.3 or in_movers or concrete) else "receptive"
    return band, grades, diff, rp, round(z, 2), s

rows = []
def add(src, head, pos, page=None, note=None, theme=None, topics=None):
    k = norm(head)
    parts = [k] if "/" not in k or " " in k else k.split("/")
    for kk in parts:
        kk = kk.strip()
        if not kk: continue
        posn = sorted({POSN.get(p, p) for p in pos})
        mt, mw = match_pv(kk)
        excl = None
        if kk in MODALS: excl = "modal/semi-modal verb → teach in Grammar Galaxy"
        elif kk in DATED: excl = "dated technology word — low value for today's children"
        elif set(posn) and set(posn) <= FUNCTION_POS: excl = "function word → teach in Grammar Galaxy, not as a vocabulary card"
        elif kk in SENSITIVE or any(w in SENSITIVE for w in kk.split()): excl = "age suitability: sensitive topic for children (review before any use)"
        elif kk in VARIANTS and VARIANTS[kk] not in ("lift", "film", "flat"): excl = f"American English form — use British/Indian English ‘{VARIANTS[kk]}’ as the primary form (keep as variant)"
        elif "abbreviation" in posn or re.fullmatch(r"[a-z]\.?[a-z]?\.?", kk) or kk.isupper(): excl = "abbreviation / letters — low priority"
        rows.append({"source": src, "headword": head.strip(), "key": kk, "pos": posn, "page": page, "has_usage_note": bool(note),
                     "scene_themes": theme or [], "source_topics": sorted(topics or []), "pv_match_type": mt, "pv_match": mw,
                     "pv_status": pv[mw]["status"] if mw else None, "pv_band": pv[mw]["band"] if mw else None, "exclusion": excl})

for m in MOV:
    add("Movers 2014", m["headword"], m["pos"], page="A–Z p25–29", note=m.get("note"), theme=SCENE_OF.get(norm(m["headword"])), topics=topic_of.get(norm(m["headword"])))
for e in PRE["entries"]:
    add("Preliminary 2012", e["headword"], e["pos"], page=f"p{e['page']}", note=e["notes"], topics=topic_of.get(norm(e["headword"])))

movers_keys = {r["key"] for r in rows if r["source"] == "Movers 2014"}
prelim_keys = {r["key"] for r in rows if r["source"] == "Preliminary 2012"}
for r in rows:
    band, grades, diff, rp, z, s = suggest(r["key"], r["pos"], r["source"], r["key"] in movers_keys, r["source_topics"])
    cats = [TAX[t] for t in r["source_topics"] if t in TAX] + [SCENE_TAX[t] for t in r["scene_themes"]]
    r.update({"suggested_band": band, "suggested_grades": grades, "suggested_difficulty": diff, "receptive_productive": rp, "zipf_frequency": z, "syllables_cmu": s,
              "pv_category": collections.Counter(cats).most_common(1)[0][0] if cats else None, "in_both_sources": r["key"] in movers_keys and r["key"] in prelim_keys,
              "multi_meaning_flag": r["has_usage_note"] and r["source"] == "Preliminary 2012"})

# ── recommendation scoring ──
pv_cat_counts = collections.Counter()
for k, v in pv.items():
    t = topic_of.get(k); sc = SCENE_OF.get(k)
    cat = TAX.get(next(iter(t))) if t else (SCENE_TAX.get(sc[0]) if sc else TAG_TAX.get(v.get("tag") or ""))
    v["category"] = cat
    pv_cat_counts[cat or "Unmapped"] += 1
seen_rec = set()
for r in rows:
    r["recommended"] = False; r["priority"] = 0
    if r["exclusion"] or r["pv_match_type"] in ("exact", "plural/singular", "British/American variant"): continue
    p = 0
    p += 25 if r["source"] == "Movers 2014" else 0
    p += 15 if r["scene_themes"] else 0
    p += min(25, max(0, (r["zipf_frequency"] - 3.0) * 10))
    p += 10 if r["pv_category"] and pv_cat_counts.get(r["pv_category"], 0) < 30 else 0
    p += 8 if "phrasal verb" in r["pos"] else 0
    p += 5 if r["in_both_sources"] else 0
    p -= 10 if r["pv_match_type"] == "word family" else 0
    p -= 15 if r["suggested_difficulty"] == "Challenge" else 0
    p += 14 if r["source"] == "Preliminary 2012" and r["suggested_band"] in (3, 4) and r["zipf_frequency"] >= 3.9 else 0
    r["priority"] = round(p, 1)
CAP = {1: 60, 2: 180, 3: 150, 4: 150}   # first review wave per band (balanced, quality over quantity)
taken = collections.Counter()
for r in sorted(rows, key=lambda x: -x["priority"]):
    eligible = r["key"] not in seen_rec and r["exclusion"] is None and r["pv_match_type"] not in ("exact", "plural/singular", "British/American variant")
    if not eligible: continue
    seen_rec.add(r["key"])
    if r["priority"] >= 25 and taken[r["suggested_band"]] < CAP[r["suggested_band"]]:
        r["recommended"] = True; taken[r["suggested_band"]] += 1
    else: r["reserve"] = True
json.dump({"rows": rows, "pv": pv, "pv_category_counts": pv_cat_counts, "themes": THEMES, "taxonomy_map": TAX}, open("/tmp/cam/mapping.json", "w"), indent=1, default=list)
c = collections.Counter
print("rows", len(rows), c(r["source"] for r in rows))
print("unique keys movers", len(movers_keys), "prelim", len(prelim_keys), "both", len(movers_keys & prelim_keys))
print("match types", c(r["pv_match_type"] for r in rows))
print("exclusions", c((r["exclusion"] or "")[:30] for r in rows))
rec = [r for r in rows if r["recommended"]]
print("recommended", len(rec), c(r["suggested_band"] for r in rec), c(r["source"] for r in rec))
print("pv categories", pv_cat_counts.most_common(40))
