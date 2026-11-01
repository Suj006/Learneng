import re, json, subprocess, sys
sys.path.insert(0, "/tmp/cam")
from cols import columns, page_layout
PDF = "/tmp/cam/movers.pdf"  # NB: content1.pdf = Preliminary wordlist
POS_RE = r"\(((?:n|v|adj|adv|prep|conj|det|pron|exclam|mv|av|phr ?v|prep phr|abbrev|pl|sing|n pl)(?:[^()]*))\)"
ENTRY = re.compile(r"^([A-Za-z0-9][A-Za-z0-9 '’\-/\.,!?]*?(?:\([a-z ]+\))?)\s*" + POS_RE + r"(.*)$")
entries = []
for p in range(5, 44):
    for line in columns(page_layout(PDF, p)):
        s = line.strip()
        if re.fullmatch(r"[A-Z]", s): continue
        m = ENTRY.match(s)
        if m and not s.startswith("•"):
            head, pos, rest = m.group(1).strip(), m.group(2).strip(), m.group(3).strip()
            e = {"headword": head, "pos_raw": pos, "notes": [], "variant": None, "page": p}
            vm = re.search(r"\((Br Eng|Am Eng)\)\s*\((Am Eng|Br Eng):?\s*([^)]*)", s)
            if vm: e["variant"] = {"this": vm.group(1), "other": vm.group(2), "other_form": vm.group(3).strip()}
            entries.append(e)
        elif s.startswith("•") and entries:
            entries[-1]["notes"].append(s.lstrip("• ").strip())
        elif entries and entries[-1]["notes"] and not ENTRY.match(s):
            entries[-1]["notes"][-1] += " " + s
        elif entries and entries[-1]["variant"] is None and re.match(r"^[a-z]+\)$", s):
            pass
POSMAP = {"n": "noun", "v": "verb", "adj": "adjective", "adv": "adverb", "prep": "preposition", "conj": "conjunction", "det": "determiner", "pron": "pronoun", "exclam": "exclamation", "mv": "modal verb", "av": "auxiliary verb", "phr v": "phrasal verb", "phrv": "phrasal verb", "prep phr": "prepositional phrase", "abbrev": "abbreviation"}
for e in entries:
    toks = re.split(r"\s*(?:,|&|and)\s*", re.sub(r"\((Br|Am) Eng.*", "", e["pos_raw"]))
    e["pos"] = sorted({POSMAP.get(t.strip(), t.strip()) for t in toks if t.strip() and POSMAP.get(t.strip())})
    e["multiword"] = " " in e["headword"].strip()
    e["phrasal_verb"] = "phrasal verb" in e["pos"]
# topic lists
TOPICS = ["Clothes and Accessories", "Colours", "Communications and Technology", "Education", "Entertainment and Media", "Environment", "Food and Drink", "Health, Medicine and Exercise", "Hobbies and Leisure", "House and Home", "Language", "Personal Feelings, Opinions and Experiences", "Places: Buildings", "Places: Countryside", "Places: Town and City", "Services", "Shopping", "Sport", "The Natural World", "Time", "Travel and Transport", "Weather", "Work and Jobs"]
topic_words, cur = {}, None
for p in range(45, 56):
    for line in columns(page_layout(PDF, p)):
        s = line.strip()
        hit = next((t for t in TOPICS if s and t.startswith(s[:14]) and len(s) >= 5 and s[0].isupper() and (s in t or t.startswith(s))), None)
        if hit: cur = hit; continue
        if cur is None or not s or s.startswith("s, O") or s in ("Topic Lists", "Appendix 2"): continue
        topic_words.setdefault(cur, []).append(s)
word_sets = subprocess.run(["pdftotext", "-f", "44", "-l", "44", PDF, "-"], capture_output=True, text=True).stdout
json.dump({"entries": entries, "topic_lines": topic_words, "appendix1": word_sets}, open("/tmp/cam/prelim.json", "w"), indent=1)
print("entries", len(entries), "with notes", sum(1 for e in entries if e["notes"]), "variants", sum(1 for e in entries if e["variant"]), "phrasal", sum(e["phrasal_verb"] for e in entries), "multiword", sum(e["multiword"] for e in entries))
print({k: len(v) for k, v in topic_words.items()})
print([e["headword"] for e in entries[:5]], [e["headword"] for e in entries[-5:]])
