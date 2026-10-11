# 自治体の形(地図のシルエット)のSVGを作るスクリプト
#
# 使い方:
#  1. 国土数値情報「行政区域データ」(https://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-N03-2024.html)から、
#     必要な都道府県のZIPをダウンロードして展開し、N03-20240101_<都道府県コード>.geojson をこのスクリプトと同じ場所に置く
#     (都道府県コード: 10=群馬, 11=埼玉, 12=千葉, 13=東京, 14=神奈川, 17=石川, 22=静岡, 23=愛知, 24=三重 など)
#  2. 下の TARGETS に (都道府県コード, "city"か"pref", 自治体名, ローマ字ファイル名) を追加する
#     ("pref" は都道府県全体の形。"city" は市区町村。政令市は区をまとめた1つの形になる)
#  3. `python make_shapes.py` を実行すると shape_out/ にSVGができる。images/shapes/ にコピーして使う
#
# 出典(画像の下に表示する出所表記に使う): 国土数値情報(国土交通省)を加工して作成 (CC BY 4.0)
import json, math, os

# 国土数値情報 行政区域データ(N03, 令和6年, CC BY 4.0)から、自治体の形のSVG(緑)を作る
# (都道府県コード, 種別 city/pref, 名前, ローマ字)
TARGETS = [
    ("11", "city", "さいたま市", "saitama"), ("11", "city", "狭山市", "sayama"),
    ("12", "city", "浦安市", "urayasu"), ("12", "city", "市川市", "ichikawa"),
    ("12", "city", "柏市", "kashiwa"), ("12", "city", "松戸市", "matsudo"),
    ("13", "city", "墨田区", "sumida"), ("13", "city", "港区", "minato"),
    ("13", "city", "品川区", "shinagawa"), ("13", "city", "荒川区", "arakawa"),
    ("13", "city", "練馬区", "nerima"), ("13", "city", "葛飾区", "katsushika"),
    ("13", "city", "杉並区", "suginami"), ("13", "city", "台東区", "taito"),
    ("13", "city", "足立区", "adachi"), ("13", "city", "世田谷区", "setagaya"),
    ("13", "city", "目黒区", "meguro"), ("13", "city", "文京区", "bunkyo"),
    ("13", "city", "小平市", "kodaira"), ("13", "city", "清瀬市", "kiyose"),
    ("13", "city", "多摩市", "tama"), ("13", "city", "新宿区", "shinjuku"),
    ("14", "city", "横浜市", "yokohama"), ("14", "city", "横須賀市", "yokosuka"),
    ("14", "city", "鎌倉市", "kamakura"), ("14", "city", "寒川町", "samukawa"),
    ("14", "city", "箱根町", "hakone"), ("14", "pref", "神奈川県", "kanagawa"),
    ("22", "city", "御殿場市", "gotemba"), ("22", "city", "沼津市", "numazu"),
    ("23", "pref", "愛知県", "aichi"), ("24", "pref", "三重県", "mie"),
    ("10", "city", "高崎市", "takasaki"), ("17", "city", "加賀市", "kaga"),
]
FILL, LINE = "#66bb6a", "#2e7d32"
OUT = "shape_out"
os.makedirs(OUT, exist_ok=True)
cache = {}

def load(p):
    if p not in cache:
        cache[p] = json.load(open("N03-20240101_%s.geojson" % p, encoding="utf-8"))
    return cache[p]

def rdp(points, eps):
    n = len(points)
    if n < 4:
        return points
    keep = [False] * n
    keep[0] = keep[-1] = True
    stack = [(0, n - 1)]
    while stack:
        a, b = stack.pop()
        ax, ay = points[a]; bx, by = points[b]
        dx, dy = bx - ax, by - ay
        norm = math.hypot(dx, dy) or 1e-12
        dmax, idx = 0.0, -1
        for i in range(a + 1, b):
            px, py = points[i]
            d = abs(dy * (px - ax) - dx * (py - ay)) / norm
            if d > dmax:
                dmax, idx = d, i
        if dmax > eps and idx != -1:
            keep[idx] = True
            stack.append((a, idx)); stack.append((idx, b))
    return [p for p, k in zip(points, keep) if k]

report = []
for pref, kind, name, romaji in TARGETS:
    key = "N03_001" if kind == "pref" else "N03_004"
    rings = []
    for f in load(pref)["features"]:
        if f["properties"].get(key) == name:
            rings.extend(f["geometry"]["coordinates"])
    if not rings:
        print("見つからない:", name); continue

    lat0 = sum(pt[1] for r in rings for pt in r) / sum(len(r) for r in rings)
    k = math.cos(math.radians(lat0))
    prings = [[(pt[0] * k, -pt[1]) for pt in r] for r in rings]
    xs = [p[0] for r in prings for p in r]; ys = [p[1] for r in prings for p in r]
    ext = max(max(xs) - min(xs), max(ys) - min(ys))
    eps = ext * 0.0025
    min_size = ext * 0.012

    kept = []
    for r in prings:
        rx = [p[0] for p in r]; ry = [p[1] for p in r]
        if max(max(rx) - min(rx), max(ry) - min(ry)) < min_size:
            continue
        m = max(range(len(r)), key=lambda i: (r[i][0] - r[0][0]) ** 2 + (r[i][1] - r[0][1]) ** 2)
        s = rdp(r[:m + 1], eps) + rdp(r[m:], eps)[1:]
        if len(s) >= 4:
            kept.append(s)
    xs = [p[0] for r in kept for p in r]; ys = [p[1] for r in kept for p in r]
    x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
    sc = 176.0 / max(x1 - x0, y1 - y0)
    ox = (200 - (x1 - x0) * sc) / 2 - x0 * sc
    oy = (200 - (y1 - y0) * sc) / 2 - y0 * sc
    d = "".join("M" + "L".join("%.1f,%.1f" % (p[0] * sc + ox, p[1] * sc + oy) for p in r) + "Z" for r in kept)

    svg = (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" role="img" aria-label="%s">\n'
        '  <path d="%s" fill="%s" stroke="%s" stroke-width="6" stroke-linejoin="round" fill-rule="evenodd"/>\n'
        '  <path d="%s" fill="%s" stroke="%s" stroke-width="2" stroke-linejoin="round" fill-rule="evenodd"/>\n'
        '</svg>\n' % (name, d, LINE, LINE, d, FILL, FILL)
    )
    open(os.path.join(OUT, romaji + ".svg"), "w", encoding="utf-8").write(svg)
    report.append((name, romaji, len(kept), len(svg.encode()) / 1024))
    print("%s -> %s.svg : %d環 / %.1fKB" % (name, romaji, len(kept), len(svg.encode()) / 1024))

json.dump({n: r for n, r, *_ in report}, open(OUT + "/mapping.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("合計: %d個 / %.0fKB" % (len(report), sum(x[3] for x in report)))
