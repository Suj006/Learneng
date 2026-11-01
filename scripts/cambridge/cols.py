import re, sys, subprocess
def page_layout(pdf, p):
    return subprocess.run(["pdftotext","-f",str(p),"-l",str(p),"-layout",pdf,"-"],capture_output=True,text=True).stdout
def columns(text):
    lines=[l for l in text.split("\n") if l.strip() and not re.search(r"Page \d+ of 51|Vocabulary List|^\s*2012\s|Cambridge English: Preliminary", l)]
    width=max((len(l) for l in lines), default=0)
    # column starts: positions where a non-space follows >=2 spaces (or line start) on many lines
    starts={}
    for l in lines:
        for m in re.finditer(r"(?:^|\s{2,})(\S)", l):
            starts[m.start(1)]=starts.get(m.start(1),0)+1
    cand=sorted(s for s,c in starts.items() if c>=max(4,len(lines)*0.15))
    merged=[]
    for s in cand:
        if not merged or s-merged[-1]>8: merged.append(s)
    cols=[[] for _ in merged]
    for l in lines:
        for i,s in enumerate(merged):
            e=merged[i+1] if i+1<len(merged) else width+1
            seg=l[s:e] if len(l)>s else ""
            # include chars slightly left of start (bullets)
            pre=l[max(0,s-4):s]
            if pre.strip() and i>0: seg=pre.strip()+" "+seg
            cols[i].append(seg.rstrip())
    out=[]
    for c in cols: out.extend(x for x in c if x.strip())
    return out
if __name__=="__main__":
    pdf,a,b=sys.argv[1],int(sys.argv[2]),int(sys.argv[3])
    for p in range(a,b+1):
        print(f"=== PAGE {p}")
        print("\n".join(columns(page_layout(pdf,p))))
