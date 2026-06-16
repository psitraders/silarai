# -*- coding: utf-8 -*-
"""Generate a jewellery product catalog (CSV) + a standalone demo storefront HTML.

CSV columns match ReplyCart import format:
  title, description, price, sale_price, category, variants, image_url

Images: LoremFlickr returns REAL keyword-matched photos and always resolves.
A per-product `lock` seed keeps each image stable across reloads.
"""
import csv, json, random, html

random.seed(42)

API_KEY  = "rc_bot_5ee2c6fe68c14acda6f02aaaee43894b"
API_BASE = "https://silarai-fbahb2bsg4cng3hq.southindia-01.azurewebsites.net"
WIDGET   = "https://silarai.com/chatbot-widget.js"

# subcategory -> (image keywords, price range, variant pool, variant label)
SUBCATS = {
    "Necklaces":   ("necklace,jewellery,gold",     (1499, 18999), ["Gold", "Rose Gold", "Silver"], "finish"),
    "Earrings":    ("earrings,jewellery",          (499, 8999),   ["Gold", "Rose Gold", "Silver", "Oxidised"], "finish"),
    "Rings":       ("ring,jewellery,diamond",      (799, 24999),  ["6", "7", "8", "9", "10", "12"], "size"),
    "Bangles":     ("bangle,jewellery,gold",       (999, 15999),  ["2.4", "2.6", "2.8", "2.10"], "size"),
    "Bracelets":   ("bracelet,jewellery",          (699, 11999),  ["Gold", "Rose Gold", "Silver"], "finish"),
    "Pendants":    ("pendant,necklace,jewellery",  (499, 7999),   ["Gold", "Rose Gold", "Silver"], "finish"),
    "Anklets":     ("anklet,silver,jewellery",     (399, 4999),   ["Silver", "Oxidised", "Gold"], "finish"),
    "NosePins":    ("nose,ring,jewellery",         (299, 3999),   ["Gold", "Rose Gold", "Silver"], "finish"),
    "Mangalsutra": ("mangalsutra,necklace,gold",   (1999, 21999), ["Gold", "Rose Gold"], "finish"),
    "MaangTikka":  ("tikka,jewellery,bridal",      (699, 9999),   ["Gold", "Kundan", "Silver"], "finish"),
    "Chains":      ("chain,gold,jewellery",        (899, 16999),  ["Gold", "Rose Gold", "Silver"], "finish"),
    "JewellerySets": ("jewellery,set,bridal,gold", (2999, 49999), ["Gold", "Rose Gold", "Silver"], "finish"),
    "ToeRings":    ("toe,ring,silver",             (199, 1999),   ["Silver", "Oxidised"], "finish"),
    "Brooches":    ("brooch,jewellery",            (399, 5999),   ["Gold", "Silver", "Antique"], "finish"),
    "Nathiya":     ("nath,jewellery,bridal",       (799, 8999),   ["Gold", "Kundan"], "finish"),
}

MATERIALS = ["Gold-Plated", "Sterling Silver", "Kundan", "Polki", "American Diamond",
             "Pearl", "Temple", "Oxidised Silver", "Meenakari", "Jadau", "Antique",
             "Rose Gold", "Diamond-Cut", "Cubic Zirconia", "Beaded", "Filigree"]
STYLES = ["Traditional", "Contemporary", "Bridal", "Minimalist", "Statement",
          "Ethnic", "Office Wear", "Party Wear", "Festive", "Handcrafted",
          "Designer", "Vintage", "Boho", "Royal", "Everyday"]
MOTIFS = ["Floral", "Peacock", "Lotus", "Geometric", "Paisley", "Heart",
          "Infinity", "Teardrop", "Chandbali", "Jhumka", "Solitaire", "Cluster",
          "Layered", "Choker", "Temple Coin", "Leaf"]

DESC_T = [
    "{mat} {motif} {sub_s} with a {style_l} finish — perfect for {occasion}.",
    "Handcrafted {mat} {sub_s} featuring a {motif} motif, ideal for {occasion}.",
    "Elegant {style_l} {sub_s} in {mat}, designed to elevate any {occasion} look.",
    "{style} {sub_s} with intricate {motif} detailing and a lightweight {mat} body.",
    "A timeless {mat} {sub_s} — {motif}-inspired design that pairs beautifully for {occasion}.",
]
OCCASIONS = ["weddings", "festive occasions", "daily wear", "parties", "gifting",
             "office wear", "anniversaries", "traditional ceremonies"]

SUB_SINGULAR = {
    "Necklaces": "necklace", "Earrings": "earrings", "Rings": "ring",
    "Bangles": "bangle set", "Bracelets": "bracelet", "Pendants": "pendant",
    "Anklets": "anklet", "NosePins": "nose pin", "Mangalsutra": "mangalsutra",
    "MaangTikka": "maang tikka", "Chains": "chain", "JewellerySets": "jewellery set",
    "ToeRings": "toe ring", "Brooches": "brooch", "Nathiya": "nath",
}
SUB_DISPLAY = {
    "NosePins": "Nose Pins", "MaangTikka": "Maang Tikka",
    "JewellerySets": "Jewellery Sets", "ToeRings": "Toe Rings",
    "Nathiya": "Nathiya (Nose Ring)",
}

TARGET = 520
rows, seen, lock = [], set(), 1000
subcat_names = list(SUBCATS.keys())

while len(rows) < TARGET:
    sub = random.choice(subcat_names)
    kw, (lo, hi), vpool, vlabel = SUBCATS[sub]
    mat   = random.choice(MATERIALS)
    style = random.choice(STYLES)
    motif = random.choice(MOTIFS)
    sub_sing = SUB_SINGULAR[sub]
    title = f"{mat} {motif} {style} {SUB_DISPLAY.get(sub, sub.replace('Jewellery','Jewellery '))}"
    title = " ".join(title.split())
    if title in seen:
        continue
    seen.add(title)

    price = random.randint(lo, hi)
    price = int(round(price / 10) * 10) - 1  # ...99 / ...49 style
    sale = ""
    if random.random() < 0.65:
        sale = int(price * random.uniform(0.6, 0.88))
        sale = int(round(sale / 10) * 10) - 1

    # variants: pick 2-4 from the pool
    k = min(len(vpool), random.randint(2, 4))
    variants = ", ".join(random.sample(vpool, k)) if vlabel == "finish" else ", ".join(
        sorted(random.sample(vpool, k), key=lambda x: float(x) if x.replace('.', '').isdigit() else 0))

    desc = random.choice(DESC_T).format(
        mat=mat, motif=motif.lower(), sub_s=sub_sing, style=style,
        style_l=style.lower(), occasion=random.choice(OCCASIONS))

    lock += 1
    img = f"https://loremflickr.com/600/600/{kw}?lock={lock}"

    rows.append({
        "title": title,
        "description": desc,
        "price": str(price),
        "sale_price": str(sale) if sale != "" else "",
        "category": SUB_DISPLAY.get(sub, sub),
        "variants": variants,
        "image_url": img,
    })

# ── write CSV ────────────────────────────────────────────────────────────────
cols = ["title", "description", "price", "sale_price", "category", "variants", "image_url"]
with open("jewellery-products.csv", "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=cols, quoting=csv.QUOTE_ALL)
    w.writeheader()
    w.writerows(rows)

print(f"Wrote {len(rows)} products to jewellery-products.csv")
cats = {}
for r in rows:
    cats[r["category"]] = cats.get(r["category"], 0) + 1
for c, n in sorted(cats.items(), key=lambda x: -x[1]):
    print(f"  {c:24} {n}")

# ── write HTML demo store ────────────────────────────────────────────────────
# embed product JSON so the page is fully standalone (works over file:// too)
products_json = json.dumps([
    {"title": r["title"], "description": r["description"], "price": int(r["price"]),
     "salePrice": int(r["sale_price"]) if r["sale_price"] else None,
     "category": r["category"], "variants": r["variants"], "imageUrl": r["image_url"]}
    for r in rows
], ensure_ascii=False)

page = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Aurelia &mdash; Fine Jewellery Demo Store</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#faf7f2;color:#1e293b}
  header{position:sticky;top:0;z-index:50;background:#fff;border-bottom:1px solid #ece6db;box-shadow:0 1px 12px rgba(0,0,0,.04)}
  .bar{max-width:1240px;margin:0 auto;padding:16px 22px;display:flex;align-items:center;gap:18px}
  .logo{font-family:'Georgia',serif;font-size:24px;font-weight:700;letter-spacing:1px;color:#9a6a2f}
  .logo span{color:#1e293b}
  .tag{font-size:11px;color:#94a3b8;letter-spacing:2px;text-transform:uppercase;margin-top:2px}
  .search{flex:1;max-width:420px;margin-left:auto;position:relative}
  .search input{width:100%;padding:11px 16px;border:1.5px solid #ece6db;border-radius:30px;font-size:14px;outline:none;background:#faf7f2}
  .search input:focus{border-color:#caa45a;background:#fff}
  .hero{max-width:1240px;margin:28px auto 8px;padding:0 22px}
  .hero-in{background:linear-gradient(120deg,#1e293b,#3b2f1e);border-radius:22px;padding:46px 40px;color:#fff;position:relative;overflow:hidden}
  .hero-in h1{font-family:'Georgia',serif;font-size:34px;font-weight:700;line-height:1.2;max-width:560px}
  .hero-in p{margin-top:12px;color:#d8cdb8;max-width:520px;font-size:15px;line-height:1.6}
  .hero-in .pill{display:inline-block;margin-top:18px;background:#caa45a;color:#1e293b;font-weight:700;font-size:13px;padding:10px 20px;border-radius:30px}
  .cats{max-width:1240px;margin:22px auto 6px;padding:0 22px;display:flex;gap:10px;flex-wrap:wrap}
  .chip{padding:8px 16px;border:1.5px solid #e7ddc9;border-radius:30px;font-size:13px;font-weight:600;color:#7c6a4a;cursor:pointer;background:#fff;transition:.15s}
  .chip:hover{border-color:#caa45a;color:#9a6a2f}
  .chip.active{background:#9a6a2f;color:#fff;border-color:#9a6a2f}
  .count{max-width:1240px;margin:18px auto 0;padding:0 22px;font-size:13px;color:#94a3b8}
  .grid{max-width:1240px;margin:14px auto 60px;padding:0 22px;display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:22px}
  .card{background:#fff;border-radius:18px;overflow:hidden;border:1px solid #f0e9dc;transition:.18s;cursor:pointer;display:flex;flex-direction:column}
  .card:hover{transform:translateY(-4px);box-shadow:0 14px 34px rgba(154,106,47,.16)}
  .card .imgwrap{position:relative;aspect-ratio:1;background:#f4eee2}
  .card img{width:100%;height:100%;object-fit:cover;display:block}
  .off{position:absolute;top:10px;left:10px;background:#16a34a;color:#fff;font-size:11px;font-weight:700;padding:3px 9px;border-radius:20px}
  .cbody{padding:13px 14px 16px;flex:1;display:flex;flex-direction:column}
  .ccat{font-size:10px;letter-spacing:1px;text-transform:uppercase;color:#caa45a;font-weight:700}
  .ctitle{font-size:14px;font-weight:600;margin:5px 0 8px;line-height:1.4;color:#1e293b;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:38px}
  .cprice{display:flex;align-items:baseline;gap:7px}
  .cnow{font-size:17px;font-weight:800;color:#9a6a2f}
  .cwas{font-size:12px;color:#b9b1a2;text-decoration:line-through}
  .cvars{font-size:11px;color:#94a3b8;margin-top:6px}
  footer{background:#1e293b;color:#cbd5e1;text-align:center;padding:30px 20px;font-size:13px}
  .empty{grid-column:1/-1;text-align:center;padding:60px 0;color:#94a3b8}
</style>
</head>
<body>
<header>
  <div class="bar">
    <div>
      <div class="logo">Aurel<span>ia</span></div>
      <div class="tag">Fine Jewellery</div>
    </div>
    <div class="search"><input id="q" type="text" placeholder="Search necklaces, earrings, rings..."/></div>
  </div>
</header>

<section class="hero"><div class="hero-in">
  <h1>Timeless pieces, crafted for every celebration.</h1>
  <p>Explore our handcrafted collection of necklaces, earrings, rings and bridal sets. Need help choosing? Tap the chat bubble &mdash; our assistant is online.</p>
  <span class="pill">New Festive Collection &bull; Up to 40% Off</span>
</div></section>

<div class="cats" id="cats"></div>
<div class="count" id="count"></div>
<div class="grid" id="grid"></div>

<footer>Aurelia Fine Jewellery &mdash; Demo storefront for ReplyCart chatbot testing.</footer>

<script>
const PRODUCTS = __PRODUCTS__;
const grid = document.getElementById('grid');
const catsEl = document.getElementById('cats');
const countEl = document.getElementById('count');
const q = document.getElementById('q');
let activeCat = 'All', term = '';

const cats = ['All', ...Array.from(new Set(PRODUCTS.map(p => p.category)))];
cats.forEach(c => {
  const b = document.createElement('div');
  b.className = 'chip' + (c === 'All' ? ' active' : '');
  b.textContent = c;
  b.onclick = () => { activeCat = c; document.querySelectorAll('.chip').forEach(x => x.classList.remove('active')); b.classList.add('active'); render(); };
  catsEl.appendChild(b);
});

function inr(n){ return '₹' + n.toLocaleString('en-IN'); }

function render(){
  const list = PRODUCTS.filter(p =>
    (activeCat === 'All' || p.category === activeCat) &&
    (!term || (p.title + ' ' + p.description + ' ' + p.category).toLowerCase().includes(term)));
  countEl.textContent = list.length + ' product' + (list.length === 1 ? '' : 's') +
    (activeCat === 'All' ? '' : ' in ' + activeCat);
  grid.innerHTML = '';
  if (!list.length){ grid.innerHTML = '<div class="empty">No products match your search.</div>'; return; }
  list.slice(0, 120).forEach(p => {
    const off = p.salePrice ? Math.round((1 - p.salePrice / p.price) * 100) : 0;
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML =
      '<div class="imgwrap">' + (off ? '<span class="off">' + off + '% OFF</span>' : '') +
        '<img loading="lazy" src="' + p.imageUrl + '" alt="' + p.title.replace(/"/g,'&quot;') + '"/></div>' +
      '<div class="cbody">' +
        '<div class="ccat">' + p.category + '</div>' +
        '<div class="ctitle">' + p.title + '</div>' +
        '<div class="cprice"><span class="cnow">' + inr(p.salePrice || p.price) + '</span>' +
          (p.salePrice ? '<span class="cwas">' + inr(p.price) + '</span>' : '') + '</div>' +
        '<div class="cvars">' + p.variants + '</div>' +
      '</div>';
    grid.appendChild(card);
  });
  if (list.length > 120){
    const m = document.createElement('div');
    m.className = 'empty';
    m.textContent = 'Showing first 120 of ' + list.length + ' — use search or categories to narrow down.';
    grid.appendChild(m);
  }
}
q.addEventListener('input', () => { term = q.value.trim().toLowerCase(); render(); });
render();
</script>

<!-- ============================================================= -->
<!--  ReplyCart chatbot embed  (paste-anywhere snippet)            -->
<!-- ============================================================= -->
<script>
  window.RCChatbotConfig = {
    apiKey: "__API_KEY__",
    apiBase: "__API_BASE__",
  };
</script>
<script src="__WIDGET__" async></script>
</body>
</html>
"""

page = (page
        .replace("__PRODUCTS__", products_json)
        .replace("__API_KEY__", API_KEY)
        .replace("__API_BASE__", API_BASE)
        .replace("__WIDGET__", WIDGET))

with open("demo-store.html", "w", encoding="utf-8") as f:
    f.write(page)
print("Wrote demo-store.html")
