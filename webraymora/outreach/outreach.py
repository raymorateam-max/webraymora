#!/usr/bin/env python3
"""Raymora outreach tooling — collect, render, send.

Subcommands:
  collect   -> fetch each contact URL, extract emails, write prospects.json
  render    -> render per-recipient email previews into messages/
  send      -> add previews + dry-run (actual SMTP send is gated on user approval)
"""
import os, re, json, time, argparse
import urllib.request, urllib.error, urllib.parse
from xml.etree import ElementTree as ET

BASE = os.path.dirname(os.path.abspath(__file__))
XLSX = os.path.abspath(os.path.join(BASE, "..", "..", "_prospects_data.xlsx"))
PROSPECTS = os.path.join(BASE, "prospects.json")
MSG_DIR = os.path.join(BASE, "messages")
LOG = os.path.join(BASE, "send_log.jsonl")

# Agencies whose positioning is explicitly white-label / "for agencies"
WHITE_LABEL = {
    "DoodleWeb", "Web Hero", "Direct First", "Web Designer Factory",
    "White Label Website Development", "The UI Coders", "Stack Decode",
    "Prateeksha", "KYVEON",
}

NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}

# --------------------------------------------------------------------------- #
# xlsx reading (stdlib)
# --------------------------------------------------------------------------- #
def load_xlsx():
    import zipfile
    z = zipfile.ZipFile(XLSX)
    ss = []
    root = ET.fromstring(z.read("xl/sharedStrings.xml"))
    T = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"
    for si in root.iter(T + "si"):
        ss.append("".join(t.text or "" for t in si.iter(T + "t")))
    sroot = ET.fromstring(z.read("xl/worksheets/sheet1.xml"))
    col = lambda ref: re.match(r"([A-Z]+)", ref).group(1) if ref else ""
    rows = []
    for row in sroot.iter(T + "row"):
        cells = {}
        for c in row.iter(T + "c"):
            v = c.find(T + "v")
            val = ""
            if c.get("t") == "s" and v is not None and v.text is not None:
                val = ss[int(v.text)]
            elif v is not None and v.text is not None:
                val = v.text
            cells[col(c.get("r"))] = val.strip()
        rows.append(cells)
    out = []
    for r in rows[1:]:  # skip header
        if not r.get("B"):
            continue
        out.append({
            "idx": int(r.get("A", 0)),
            "name": r.get("B", ""),
            "market": r.get("C", ""),
            "services": r.get("D", ""),
            "contact_url": r.get("E", ""),
        })
    return out

# --------------------------------------------------------------------------- #
# email extraction
# --------------------------------------------------------------------------- #
def decode_obfuscated(text):
    """Decode HTML-entity / charCode obfuscated emails."""
    if "&#" not in text and "&#x" not in text:
        return text
    def sub(m):
        try:
            if m.group(1).startswith("x"):
                return chr(int(m.group(1)[1:], 16))
            return chr(int(m.group(1)))
        except Exception:
            return m.group(0)
    return re.sub(r"&#(x[0-9a-fA-F]+|\d+);", sub, text)

EMAIL_RE = re.compile(r"[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}")

def extract_emails(html):
    """Return deduped list of emails found in raw HTML."""
    if not html:
        return []
    decoded = decode_obfuscated(html)
    found = set()
    # mailto links (case-insensitive, may be encoded)
    for m in re.finditer(r"mailto\s*:\s*([^\"'<> >]+)", decoded, re.I):
        em = m.group(1).strip().rstrip("?").split("?")[0]
        if EMAIL_RE.fullmatch(em):
            found.add(em.lower())
    # reverse-charCode trick: "ved.rra@..." encoded as reversed char codes
    if "&#" in decoded:
        reversed_codes = re.findall(r"(?:&#(?:\d+);){6,}", decoded)
        for blob in reversed_codes:
            s = decode_obfuscated(blob)
            if "@" in s:
                found.add(s.lower())
    # generic
    for em in EMAIL_RE.findall(decoded):
        eml = em.lower()
        # drop obvious image/file/domain noise
        if eml.endswith((".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp",
                          ".css", ".js")):
            continue
        if "@" not in eml or eml.startswith(("example", "your", "email@")):
            continue
        found.add(eml)
    return sorted(found)

def fetch(url, timeout=25, retries=2):
    headers = {
        "User-Agent": ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                       "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"),
        "Accept-Language": "en-US,en;q=0.9",
    }
    last = None
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                raw = resp.read()
            ctype = resp.headers.get("Content-Type", "")
            enc = re.search(r"charset=([\w\-]+)", ctype)
            enc = enc.group(1) if enc else "utf-8"
            try:
                return raw.decode(enc, "ignore")
            except Exception:
                return raw.decode("utf-8", "ignore")
        except urllib.error.HTTPError as e:
            if e.code in (429, 500, 502, 503, 504):
                last = f"http={e.code}"
                time.sleep(2)
                continue
            return ""
        except Exception as e:
            last = f"{type(e).__name__}: {e}"
            time.sleep(1)
    return ""

def page_title(html):
    m = re.search(r"<title[^>]*>(.*?)</title>", html, re.S | re.I)
    if m:
        return re.sub(r"\s+", " ", m.group(1)).strip()[:160]
    return ""

# --------------------------------------------------------------------------- #
# collect
# --------------------------------------------------------------------------- #
def cmd_collect(args):
    pros = load_xlsx()
    for p in pros:
        p["segment"] = "white_label" if p["name"] in WHITE_LABEL else "general"
        p["status"] = "collecting"
        html = fetch(p["contact_url"])
        emails = extract_emails(html) if html else []
        p["emails"] = emails
        p["title"] = page_title(html) if html else ""
        if emails:
            p["status"] = "found"
        elif html:
            p["status"] = "form_only"
        else:
            p["status"] = "fetch_failed"
        print(f"[{p['idx']:>2}] {p['status']:<12} {p['name']:<28} {','.join(emails)[:60]}")
        time.sleep(0.4)  # be nice to servers
    with open(PROSPECTS, "w", encoding="utf-8") as f:
        json.dump(pros, f, indent=2, ensure_ascii=False)
    stats = {s: sum(1 for p in pros if p["status"] == s)
             for s in ("found", "form_only", "fetch_failed")}
    print("\nstats:", stats)

# --------------------------------------------------------------------------- #
# extract — bulk candidate discovery (from directory sweep) -> verified emails
# --------------------------------------------------------------------------- #
CANDIDATES = os.path.join(BASE, "candidates.json")
NEW_PROSPECTS = os.path.join(BASE, "prospects_new.json")

def find_contact_url(html, base):
    """Return a plausible contact URL found on the page, else None."""
    for pat in (r"href=[\"']([^\"']*contact[^\"']*)[\"']",
                r"href=[\"']([^\"']*about[^\"']*)[\"']"):
        m = re.search(pat, html, re.I)
        if m:
            href = m.group(1)
            return urllib.parse.urljoin(base, href)
    return None

def cmd_extract(args):
    """Read candidates.json (from the directory sweep), fetch each website,
    find a contact page, extract emails -> prospects_new.json."""
    if not os.path.exists(CANDIDATES):
        print("No candidates.json — run the discovery sweep first."); return 1
    cands = json.load(open(CANDIDATES, encoding="utf-8"))
    out = []
    for i, c in enumerate(cands, start=1):
        name = c.get("name", "?")
        site = c.get("website", "")
        status = "collecting"
        emails = []
        title = ""
        html = ""
        if site:
            html = fetch(site)
            if not html:
                # retry on https vs http swap
                alt = site.replace("https://", "http://", 1) if site.startswith("https://") else site.replace("http://", "https://", 1)
                html = fetch(alt)
            title = page_title(html) if html else ""
            if html:
                contact = find_contact_url(html, site)
                if contact and contact != site:
                    html2 = fetch(contact)
                    if html2:
                        html = html2
                        if not title:
                            title = page_title(html2)
                emails = extract_emails(html)
        status = "found" if emails else ("form_only" if html else "fetch_failed")
        rec = {**c, "idx": i, "status": status, "emails": emails, "title": title}
        if emails:
            rec["primary"] = emails[0]
        out.append(rec)
        print(f"[{i:>3}] {status:<12} {name:<32} {','.join(emails)[:60]}")
        time.sleep(0.4)
    with open(NEW_PROSPECTS, "w", encoding="utf-8") as f:
        json.dump(out, f, indent=2, ensure_ascii=False)
    stats = {s: sum(1 for p in out if p["status"] == s)
             for s in ("found", "form_only", "fetch_failed")}
    print("\nstats:", stats)
    print("sendable:", sum(1 for p in out if p.get("primary")))

# --------------------------------------------------------------------------- #
# message template + rendering
# --------------------------------------------------------------------------- #
SUBJECT = "A behind-the-scenes web dev partner for your clients"

def render_message(prospect):
    name = prospect["name"]
    seg = prospect["segment"]
    lead = ""
    if seg == "white_label":
        lead = ("Being in the white-label web development space yourself, you know exactly how "
                "valuable a reliable behind-the-scenes build partner is.\n\n")
    body = (
        f"Hi {name},\n\n"
        f"{lead}I run Raymora, a web design and development team, and I think there could be a "
        f"good fit between what we do and what {name} delivers for your clients.\n\n"
        "Here's the idea: whenever one of your clients needs a website, we design, build, and "
        "deploy it — you keep the client relationship, we handle 100% of the technical work "
        "behind the scenes.\n\n"
        "To prove the quality of our work with zero risk on your end, we'll build and deploy "
        "your first 2 client websites completely free — no cost to you or your client. After "
        "that, we'd move to a fixed per-project rate, so you always know your margin upfront.\n\n"
        "To give you a feel for our quality without any back-and-forth, here's our portfolio "
        "and a few live sites we've built:\n"
        "- Portfolio: https://webraymora.vercel.app\n"
        "- Hospital site: https://swasthya-hospital.vercel.app\n"
        "- School site: https://brightleaf-schools.vercel.app\n"
        "- Restaurant site: https://restaurant-website-red-pi.vercel.app\n"
        "- Salon site: https://kamboja-salon.vercel.app\n\n"
        "This is our opening offer, and we're genuinely open to adjusting it based on your "
        "volume or how you'd rather structure it — if you have something else in mind, let's "
        "talk it through.\n\n"
        "Would you be open to a quick call this week? I can walk you through the specifics and "
        "we can see if this makes sense.\n\n"
        "Best,\n"
        "Raymora Team\n"
        "raymora.team@gmail.com | wa.me/923712385700"
    )
    return subject_for(prospect), body

def subject_for(prospect):
    return SUBJECT

def cmd_render(args):
    pros = json.load(open(PROSPECTS, encoding="utf-8"))
    os.makedirs(MSG_DIR, exist_ok=True)
    for p in pros:
        if not p.get("primary"):
            continue
        subj, body = render_message(p)
        to = p["primary"]
        out = os.path.join(MSG_DIR, f"{p['idx']:02d}_{p['name'].replace('/', '-')}.txt")
        with open(out, "w", encoding="utf-8") as f:
            f.write(f"TO: {to}\nSUBJECT: {subj}\n\n{body}\n")
    print(f"Rendered {sum(1 for p in pros if p.get('primary'))} previews into {MSG_DIR}")

# --------------------------------------------------------------------------- #
# send
# --------------------------------------------------------------------------- #
def load_creds():
    env = {}
    pth = os.path.join(BASE, ".env")
    if os.path.exists(pth):
        for line in open(pth, encoding="utf-8"):
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, _, v = line.partition("=")
                env[k.strip()] = v.strip()
    # GMAIL_ADDRESS = the account the app password belongs to (the From sender).
    # TEAM_ADDRESS  = where replies land; defaults to the Raymora inbox.
    return (env.get("GMAIL_ADDRESS", ""),
            env.get("GMAIL_APP_PASSWORD", ""),
            env.get("TEAM_ADDRESS", "raymora.team@gmail.com"))

def cmd_check(args):
    addr, pwd, _team = load_creds()
    if not pwd:
        print("No password set in .env (GMAIL_APP_PASSWORD). Refusing.")
        return 1
    if not addr:
        print("No sender set in .env (GMAIL_ADDRESS). Refusing.")
        return 1
    import smtplib
    try:
        s = smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=30)
        s.login(addr, pwd.replace(" ", ""))
        print(f"SMTP login OK: {addr}")
        s.quit()
        return 0
    except Exception as e:
        print(f"SMTP login FAILED: {e}")
        return 1

def cmd_send(args):
    addr, pwd, team = load_creds()
    if not pwd:
        print("No password in .env. Refusing."); return 1
    if not addr:
        print("No sender (GMAIL_ADDRESS) in .env. Refusing."); return 1
    pros = json.load(open(PROSPECTS, encoding="utf-8"))
    if args.pilot:
        want = {36, 37, 38, 40, 42}
    elif args.idx:
        want = {int(x) for x in args.idx}
    elif args.all:
        want = {p["idx"] for p in pros if p.get("primary")}
    else:
        print("Specify --pilot / --idx N M / --all"); return 1
    targets = [p for p in pros if p["idx"] in want and p.get("primary")]
    if not targets:
        print("No matching sendable prospects."); return 1
    print(f"Sending to {len(targets)}: {[p['name'] for p in targets]}")

    import smtplib
    from email.message import EmailMessage
    s = smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=40)
    s.login(addr, pwd.replace(" ", ""))
    os.makedirs(os.path.dirname(LOG), exist_ok=True)
    for i, p in enumerate(targets):
        subj, body = render_message(p)
        msg = EmailMessage()
        msg["Subject"] = subj
        msg["From"] = addr
        msg["To"] = p["primary"]
        msg.add_header("Reply-To", team)
        msg.set_content(body)
        status = "sent"
        err = ""
        try:
            s.send_message(msg)
        except Exception as e:
            status, err = "error", str(e)
        ts = time.strftime("%Y-%m-%dT%H:%M:%S")
        with open(LOG, "a", encoding="utf-8") as f:
            f.write(json.dumps({"idx": p["idx"], "name": p["name"], "to": p["primary"],
                                "status": status, "error": err, "ts": ts}) + "\n")
        print(f"  [{p['idx']:>2}] {status:<6} {p['name']:<28} -> {p['primary']}" + (f"  ERR: {err}" if err else ""))
        if status == "sent" and i < len(targets) - 1:
            time.sleep(8)  # light in-wave spacing
    s.quit()
    print("Done. Log:", LOG)

# --------------------------------------------------------------------------- #
def main():
    ap = argparse.ArgumentParser(prog="outreach")
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("collect")
    sub.add_parser("extract")
    sub.add_parser("render")
    sub.add_parser("check")
    sp = sub.add_parser("send")
    sp.add_argument("--pilot", action="store_true", help="send pilot batch (idx 36,37,38,40,42)")
    sp.add_argument("--idx", nargs="*", default=[], help="specific prospect idx numbers")
    sp.add_argument("--all", action="store_true", help="all sendable")
    args = ap.parse_args()
    if args.cmd == "collect":
        cmd_collect(args)
    elif args.cmd == "render":
        cmd_render(args)
    elif args.cmd == "check":
        raise SystemExit(cmd_check(args))
    elif args.cmd == "send":
        raise SystemExit(cmd_send(args))

if __name__ == "__main__":
    main()