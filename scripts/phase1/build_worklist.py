"""Builds the deduplicated vocabulary work list: existing queued headwords + supplementary words (Phase 1 seeds and
taxonomy gap-fillers). Published words are never re-created. Output: _work/vocab_worklist.json"""
import json, collections
B = json.load(open("deliverables/phase-1-content/_work/baseline.json"))
published = {v["word"].lower() for v in B["vocabulary"]}
SEEDS = {  # Phase 1 brief §5.3 (seed examples; deduplicated below)
 1: "cat sun cup ball tree fish book rain happy jump soft small friend flower water",
 2: "curious journey careful whisper borrow helpful excited problem collect describe compare imagine organise remember prepare",
 3: "adventure discover explore enormous confident protect experiment environment courage solution creative investigate celebrate habitat destination",
 4: "extraordinary responsibility determination magnificent conservation communicate independent perseverance biodiversity transformation interpretation sustainable appreciation opportunity achievement",
}
# Taxonomy gap-fillers (body & health, weather, transport, emotions, colours & shapes, clothing, time, places, helpers,
# technology, science, geography, environment, travel, arts, music, communication, money, thinking, values).
EXTRA = {
 1: "nose ear eye mouth knee red yellow green circle square star heart triangle cap dress shirt skirt morning night today doctor teacher farmer baker park zoo car ship plane bicycle drum song share sorry thank please mother father baby sister brother cheek elbow pink brown spring shell puddle bubble balloon picnic smile",
 2: "doctor nurse pilot police firefighter postman dentist ambulance station airport library market hospital temple purple oval rectangle diamond scarf boots gloves raincoat yesterday tomorrow weekend minute rainbow thunder breeze sunshine guitar flute piano computer phone camera coin price honest brave gentle polite patient careless nervous delighted cottage village harbour signal chapter riddle",
 3: "planet magnet energy oxygen volcano continent desert island ocean forest recycle pollution climate rocket telescope keyboard internet message letter invitation festival culture painting sculpture rhythm melody budget customer receipt season temperature humid vaccine skeleton muscle patient grateful respect fairness honesty teamwork ancient fossil orbit galaxy migrate predator canyon glacier tradition ceremony fragile genuine",
 4: "ecosystem photosynthesis gravity hypothesis evaporation condensation latitude longitude hemisphere renewable carbon technology innovation algorithm database democracy heritage architecture orchestra symphony debate persuade negotiate economy investment profit analyse evaluate strategy reflect empathy integrity resilience compassion generosity accountability tolerance meticulous ambiguous phenomenon infrastructure prototype epidemic philanthropy sovereignty diplomacy collaborate catastrophe meteorology",
}
rows, seen = [], set(published)
dupe_published, dupe_queue = [], []
for h in B["headwords"]:
    w = h["word"].lower().strip()
    if w in published: dupe_published.append(w); continue
    if w in seen: dupe_queue.append(w); continue
    seen.add(w); rows.append({"word": h["word"], "band": h["band"], "source_category": h["category"], "origin": "existing_queue"})
extra_dupes = []
for band, src in [(b, SEEDS[b] + " " + EXTRA[b]) for b in (1, 2, 3, 4)]:
    for w in src.split():
        if w in seen: extra_dupes.append(w); continue
        seen.add(w); rows.append({"word": w, "band": band, "source_category": None, "origin": "phase1_seed" if w in SEEDS[band].split() else "phase1_gapfill"})
for i, r in enumerate(rows): r["work_id"] = i
json.dump({"rows": rows, "dedupe": {"queue_already_published": dupe_published, "queue_internal_duplicates": dupe_queue, "supplementary_skipped_as_duplicates": extra_dupes}},
          open("deliverables/phase-1-content/_work/vocab_worklist.json", "w"), indent=1)
print("work rows", len(rows), collections.Counter(r["band"] for r in rows), collections.Counter(r["origin"] for r in rows))
print("published + work =", len(published) + len(rows), "| skipped supplementary dupes:", len(extra_dupes))
