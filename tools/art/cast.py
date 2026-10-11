"""The Maatalu family as layered, animatable SVG parts.

Every character is drawn in one shared actor frame (VIEWBOX): feet near y=192, centred on x=0.
Each layer (arm, body, head, eyes, mouth, head-top) is a full-frame SVG so the app can stack
them and rotate a layer around its pivot (shoulder, neck) with native transforms.
"""
from chars import (OL, SKIN as KID_SKIN, SKIN_D as KID_SKIN_D, MOUTH, TONGUE, W, P, E,
                   hair_back as kid_hair_back, hair_front as kid_hair_front, brows as kid_brows,
                   eyes as kid_eyes, mouth_raw, hand, BOY, GIRL)

VIEWBOX = (-240, -520, 480, 740)
VISEMES = ["rest", "MBP", "A", "E", "O", "U", "FV", "smile"]
EYES = ["open", "half", "closed", "happy"]


def g(content, t):
    return f'<g transform="{t}">{content}</g>'


# ------------------------------------------------------------------ arms

def arm(side, shoulder, length, skin, sleeve, sleeve_frac, width=23, hand_scale=0.56, bangles=None, cuff=None):
    """A relaxed arm hanging from the shoulder, slightly bent, open hand pointing down."""
    sx, sy = shoulder
    m = 1 if side == "r" else -1
    ex, ey = sx + m * 12, sy + length * 0.5
    wx, wy = sx + m * 8, sy + length
    d = f"M{sx} {sy} Q{ex} {ey} {wx} {wy}"
    s = P(d, stroke=OL, sw=width + 9) + P(d, stroke=skin, sw=width)
    # sleeve: the upper part of the same curve
    t = sleeve_frac
    mx = (1 - t) ** 2 * sx + 2 * (1 - t) * t * ex + t * t * wx
    my = (1 - t) ** 2 * sy + 2 * (1 - t) * t * ey + t * t * wy
    cx = (1 - t) * sx + t * ex
    cy = (1 - t) * sy + t * ey
    sd = f"M{sx} {sy} Q{cx} {cy} {mx} {my}"
    s += P(sd, stroke=OL, sw=width + 21) + P(sd, stroke=sleeve, sw=width + 12)
    if cuff:
        s += P(f"M{mx - (width + 10) / 2} {my} L{mx + (width + 10) / 2} {my}", stroke=cuff, sw=5)
    if bangles:
        by = wy - 12
        s += P(f"M{wx - 13} {by} Q{wx} {by + 6} {wx + 13} {by}", stroke=OL, sw=8) + P(f"M{wx - 13} {by} Q{wx} {by + 6} {wx + 13} {by}", stroke=bangles, sw=5)
        s += P(f"M{wx - 13} {by - 8} Q{wx} {by - 2} {wx + 13} {by - 8}", stroke=OL, sw=8) + P(f"M{wx - 13} {by - 8} Q{wx} {by - 2} {wx + 13} {by - 8}", stroke="#D7263D", sw=5)
    s += g(hand_skin(skin), f"translate({wx},{wy}) rotate(180) scale({hand_scale}) translate(0,-58)")
    return s


def hand_skin(skin):
    return hand("open").replace(f'fill="{KID_SKIN}"', f'fill="{skin}"')


# ------------------------------------------------------------------ faces (head-local coordinates)

def adult_eyes(kind, lashes=False):
    out = ""
    for x in (-36, 36):
        y = 4
        side = -1 if x < 0 else 1
        lash = ""
        if lashes:
            ox = x + side * 13
            lash = P(f"M{ox} {y - 9} l{side * 8} -6", sw=3.5) if kind in ("open", "half") else P(f"M{ox} {y + 2} l{side * 7} 3", sw=3.5)
        if kind == "closed":
            out += P(f"M{x - 13} {y} Q{x} {y + 8} {x + 13} {y}", sw=5) + lash
        elif kind == "happy":
            out += P(f"M{x - 13} {y + 5} Q{x} {y - 9} {x + 13} {y + 5}", sw=5) + lash
        elif kind == "half":
            out += (P(f"M{x - 12} {y} Q{x} {y + 16} {x + 12} {y} Z", fill="#2B1B14", sw=2)
                    + P(f"M{x - 14} {y} L{x + 14} {y}", sw=4.5) + lash)
        else:
            out += (E(x, y, 11.5, 15, "#2B1B14") + E(x + 4, y - 5, 4.5, 4.5, "#fff") + E(x - 4, y + 7, 2, 2, "#fff")
                    + P(f"M{x - 14} {y - 10} Q{x} {y - 21} {x + 14} {y - 10}", sw=4.5) + lash)
    return out


def adult_mouth(kind):
    return g(mouth_raw(kind), "translate(0 50) scale(1.2) translate(0 -54)")


def ears(skin, skin_d, earrings=None):
    s = ""
    for sx in (-1, 1):
        s += E(sx * 92, 12, 15, 21, skin, OL, W) + P(f"M{sx * 92} 3 q{-sx * 7} 9 0 18", stroke=skin_d, sw=3)
        if earrings:
            s += E(sx * 92, 38, 6, 6, earrings, OL, 2)
    return s


def face_shape(skin, skin_d, jaw=1.0):
    s = P(f"M-96 0 C-96 -70 -56 -100 0 -100 C56 -100 96 -70 96 0 C96 {58 * jaw} {58 * jaw} {94 * jaw} 0 {94 * jaw} "
          f"C{-58 * jaw} {94 * jaw} -96 {58 * jaw} -96 0 Z", fill=skin, sw=W + 1)
    s += P(f"M-76 50 C-52 {80 * jaw} -22 {88 * jaw} 0 {88 * jaw} C22 {88 * jaw} 52 {80 * jaw} 76 50 "
           f"C62 {84 * jaw} 32 {96 * jaw} 0 {96 * jaw} C-32 {96 * jaw} -62 {84 * jaw} -76 50 Z", fill=skin_d, stroke="none", sw=0, extra='opacity=".45"')
    return s


def nose_blush(skin_d, blush=True, stud=False):
    s = P("M-5 28 Q0 36 7 29", sw=4)
    if stud:
        s += E(9, 30, 3, 3, "#F2B705", OL, 1.5)
    if blush:
        s += E(-58, 36, 14, 8, "#F08C8C", extra='opacity=".45"') + E(58, 36, 14, 8, "#F08C8C", extra='opacity=".45"')
    return s


def glasses(color="#6B3E26"):
    s = ""
    for x in (-36, 36):
        s += f'<circle cx="{x}" cy="4" r="25" fill="#FFFFFF" fill-opacity=".12" stroke="{color}" stroke-width="5"/>'
    s += P("M-11 0 Q0 -6 11 0", stroke=color, sw=5) + P("M-61 0 L-88 -4 M61 0 L88 -4", stroke=color, sw=5)
    return s


def laugh_lines():
    return P("M-66 0 l-9 -4 M-66 10 l-10 2 M66 0 l9 -4 M66 10 l10 2", sw=3)


# ------------------------------------------------------------------ characters

class Character:
    """Holds each layer as SVG in actor coordinates plus pivots."""

    def __init__(self, cid, skin, skin_d, head_pos, head_scale, shoulders, arm_len):
        self.id, self.skin, self.skin_d = cid, skin, skin_d
        self.head_pos, self.head_scale = head_pos, head_scale
        self.shoulders, self.arm_len = shoulders, arm_len
        self.layers = {}

    def head_t(self):
        x, y = self.head_pos
        return f"translate({x} {y}) scale({self.head_scale})"

    def neck(self):
        x, y = self.head_pos
        return (x, y + 92 * self.head_scale)

    def export(self):
        h = lambda s: g(s, self.head_t())
        L = self.layers
        return {
            "armL": L["armL"], "armR": L["armR"], "body": L["body"],
            "head": h(L["head"]), "top": h(L.get("top", "")),
            "eyes": {k: h(v) for k, v in L["eyes"].items()},
            "mouth": {k: h(v) for k, v in L["mouth"].items()},
            "pivots": {"armL": self.shoulders[0], "armR": self.shoulders[1], "neck": self.neck()},
        }


def kid(gender):
    c = Character(gender, KID_SKIN, KID_SKIN_D, (0, -196), 1.0, [(-58, -50), (58, -50)], 112)
    if gender == "boy":
        col = BOY
        body = ""
        for x in (-30, 30):
            body += P(f"M{x} 80 L{x} 160", stroke=OL, sw=40) + P(f"M{x} 80 L{x} 160", stroke=col["pants"], sw=30)
            body += P(f"M{x - 28} 192 Q{x - 28} 164 {x} 164 Q{x + 28} 164 {x + 28} 182 L{x + 28} 192 Z", fill="#FFFFFF", sw=W)
            body += P(f"M{x - 26} 184 L{x + 26} 184", stroke="#FF8A1E", sw=5)
        body += P("M-62 56 L62 56 L58 96 L4 96 L0 80 L-4 96 L-58 96 Z", fill=col["pants"], sw=W)
        body += P("M-60 -62 Q0 -80 60 -62 L72 76 Q0 90 -72 76 Z", fill=col["top"], sw=W + 1)
        for x, y in ((-40, -30), (-20, 10), (36, -20), (44, 30), (-44, 46), (20, 56), (40, 2), (-30, 70)):
            body += P(f"M{x} {y - 5} L{x + 5} {y} L{x} {y + 5} L{x - 5} {y} Z", fill=col["top_d"], stroke="none", sw=0, extra='opacity=".75"')
        body += P("M-16 -74 Q0 -78 16 -74 L16 -62 Q0 -58 -16 -62 Z", fill=col["trim"], sw=3.5)
        body += P("M0 -60 L0 10", stroke=col["trim"], sw=5)
        for y in (-44, -26, -8):
            body += E(0, y, 4, 4, "#FFE9A8", OL, 1.5)
        body += P("M-70 64 Q0 78 70 64", stroke=col["trim"], sw=6)
        sleeve, frac = col["top"], 0.42
    else:
        col = GIRL
        body = ""
        for x in (-26, 26):
            body += P(f"M{x} 100 L{x} 164", stroke=OL, sw=32) + P(f"M{x} 100 L{x} 164", stroke=KID_SKIN, sw=23)
            body += P(f"M{x - 24} 192 Q{x - 24} 166 {x} 166 Q{x + 24} 166 {x + 24} 192 Z", fill="#B01A2E", sw=W)
            body += P(f"M{x - 14} 176 Q{x} 166 {x + 14} 176", stroke="#F2B705", sw=3)
        body += P("M-58 -62 Q0 -78 58 -62 L62 6 Q0 14 -62 6 Z", fill=col["frock"], sw=W + 1)
        body += P("M-62 4 Q0 14 62 4 L100 118 Q0 140 -100 118 Z", fill=col["frock"], sw=W + 1)
        body += P("M-94 100 Q0 122 94 100 L100 118 Q0 140 -100 118 Z", fill=col["border"], sw=W)
        body += P("M-86 108 Q0 128 86 108", stroke="#B8860B", sw=3, extra='stroke-dasharray="3 9"')
        body += P("M-40 30 L-50 110 M0 18 L0 124 M40 30 L50 110", stroke=col["frock_d"], sw=3, extra='opacity=".7"')
        body += P("M-62 0 Q0 12 62 0", stroke=col["border"], sw=8)
        body += P("M-24 -72 Q0 -54 24 -72", fill=col["border"], sw=3.5)
        for x, y in ((-30, -36), (30, -36), (0, -24), (-60, 60), (60, 60), (-24, 80), (24, 80)):
            body += E(x, y, 4, 4, "#FFE9A8", OL, 1.5)
        sleeve, frac = col["sleeve"], 0.3
    body = E(0, 196, 110, 14, "#000", extra='opacity=".13"') + body
    body += P("M-14 -100 L-14 -68 Q0 -60 14 -68 L14 -100 Z", fill=KID_SKIN_D, sw=W)
    c.layers["body"] = body
    c.layers["armL"] = arm("l", (-58, -50), 112, KID_SKIN, sleeve, frac, hand_scale=0.55, bangles="#F2B705" if gender == "girl" else None)
    c.layers["armR"] = arm("r", (58, -50), 112, KID_SKIN, sleeve, frac, hand_scale=0.55, bangles="#F2B705" if gender == "girl" else None)

    # head: everything except eyes and mouth
    head = kid_hair_back(gender)
    for sx in (-1, 1):
        head += E(sx * 98, 12, 17, 23, KID_SKIN, OL, W) + P(f"M{sx * 98} 2 q{-sx * 8} 10 0 20", stroke=KID_SKIN_D, sw=3)
        if gender == "girl":
            head += E(sx * 98, 38, 5, 5, "#F2B705", OL, 2)
    head += P("M-102 0 C-102 -72 -60 -106 0 -106 C60 -106 102 -72 102 0 C102 62 62 98 0 98 C-62 98 -102 62 -102 0 Z", fill=KID_SKIN, sw=W + 1)
    head += P("M-80 52 C-56 84 -24 92 0 92 C24 92 56 84 80 52 C66 88 34 100 0 100 C-34 100 -66 88 -80 52 Z", fill=KID_SKIN_D, stroke="none", sw=0, extra='opacity=".45"')
    head += kid_hair_front(gender)
    head += kid_brows("normal", "#3E2618" if gender == "boy" else "#24150F")
    if gender == "girl":
        head += E(0, -16, 4.5, 4.5, "#D7263D")
    head += P("M-4 30 Q1 37 7 31", sw=4)
    head += E(-62, 38, 15, 9, "#F08C8C", extra='opacity=".5"') + E(62, 38, 15, 9, "#F08C8C", extra='opacity=".5"')
    c.layers["head"] = head
    c.layers["eyes"] = {k: kid_eyes(k, gender == "girl") for k in EYES}
    c.layers["mouth"] = {k: g(mouth_raw(k), "translate(0 54) scale(1.4) translate(0 -54)") for k in VISEMES}
    return c


def ammamma():
    skin, skin_d = "#C68A5C", "#A8703F"
    c = Character("ammamma", skin, skin_d, (0, -376), 0.9, [(-62, -262), (62, -262)], 158)
    saree, saree_d, gold = "#A3264A", "#7E1A38", "#F2B705"
    b = E(0, 196, 120, 15, "#000", extra='opacity=".13"')
    b += E(-28, 186, 22, 10, skin, OL, W) + E(28, 186, 22, 10, skin, OL, W)
    b += P("M-62 -270 Q0 -288 62 -270 L80 -130 Q96 40 100 176 Q0 194 -100 176 Q-96 40 -80 -130 Z", fill=saree, sw=W + 1)
    b += P("M-98 140 Q0 160 98 140 L100 176 Q0 194 -100 176 Z", fill=gold, sw=W)
    b += P("M-96 152 Q0 170 96 152", stroke=saree_d, sw=3, extra='stroke-dasharray="4 8"')
    for x in (-34, -12, 10, 32):
        b += P(f"M{x} -40 Q{x - 4} 60 {x - 2} 150", stroke=saree_d, sw=3, extra='opacity=".55"')
    b += P("M-70 -150 Q0 -138 72 -150 L74 -128 Q0 -116 -72 -128 Z", fill=skin, sw=3.5)
    # pallu over her left shoulder, falling across the front
    b += P("M24 -284 Q60 -280 66 -262 L74 -128 Q10 -60 -60 -40 L-74 -84 Q-10 -110 30 -200 Z", fill=saree_d, sw=W)
    b += P("M28 -276 Q44 -180 -66 -66", stroke=gold, sw=6)
    b += P("M60 -262 Q70 -170 -52 -48", stroke=gold, sw=5)
    for x, y in ((40, -220), (10, -150), (-30, -96), (58, -190)):
        b += E(x, y, 4, 4, "#FFE08A")
    b += P("M-16 -306 L-16 -276 Q0 -268 16 -276 L16 -306 Z", fill=skin_d, sw=W)
    b += P("M-30 -278 Q0 -262 30 -278", stroke="#F2B705", sw=4)
    c.layers["body"] = b
    c.layers["armL"] = arm("l", (-62, -262), 158, skin, saree, 0.22, width=24, hand_scale=0.62, bangles=gold)
    c.layers["armR"] = arm("r", (62, -262), 158, skin, saree, 0.22, width=24, hand_scale=0.62, bangles=gold)
    hair, hair_d = "#CFCFD9", "#9D9DAC"
    head = E(56, -92, 34, 32, "#BDBDC9", OL, W) + P("M40 -104 q18 -8 30 6", stroke="#E6E6EE", sw=4)
    head += E(0, -6, 100, 104, hair, OL, W + 1)
    head += ears(skin, skin_d, "#F2B705")
    head += face_shape(skin, skin_d, 0.98)
    head += P("M-94 -6 C-96 -82 -44 -110 0 -108 C44 -110 96 -82 94 -6 C86 -44 64 -66 18 -70 L0 -86 L-18 -70 C-64 -66 -86 -44 -94 -6 Z", fill=hair, sw=W + 1)
    head += P("M-60 -86 Q-80 -60 -84 -30 M60 -86 Q80 -60 84 -30 M-36 -94 Q-58 -74 -64 -52 M36 -94 Q58 -74 64 -52", stroke=hair_d, sw=3)
    head += P("M0 -104 L0 -84", stroke="#D7263D", sw=4)
    head += P("M-56 -34 Q-38 -42 -20 -36 M20 -36 Q38 -42 56 -34", stroke="#9D9DAC", sw=6)
    head += E(0, -34, 7, 7, "#D7263D", OL, 2)
    head += laugh_lines() + nose_blush(skin_d, True, True)
    c.layers["head"] = head
    c.layers["top"] = glasses()
    c.layers["eyes"] = {k: adult_eyes(k, False) for k in EYES}
    c.layers["mouth"] = {k: adult_mouth(k) for k in VISEMES}
    return c


def tatayya():
    skin, skin_d = "#B57A4E", "#96603A"
    c = Character("tatayya", skin, skin_d, (0, -390), 0.9, [(-66, -276), (66, -276)], 164)
    kurta, kurta_d, gold = "#F7F3E8", "#DDD3BC", "#E2A62A"
    b = E(0, 196, 122, 15, "#000", extra='opacity=".13"')
    b += P("M-46 190 Q-46 172 -24 172 Q0 172 0 190 Z M0 190 Q0 172 24 172 Q46 172 46 190 Z", fill="#7A4422", sw=W)
    b += P("M-70 -20 L70 -20 L84 178 Q0 190 -84 178 Z", fill="#FFFFFF", sw=W + 1)
    b += P("M-82 160 Q0 172 82 160", stroke=gold, sw=7)
    b += P("M0 -10 L-6 176 M-30 0 L-40 170", stroke=kurta_d, sw=3)
    b += P("M-66 -284 Q0 -300 66 -284 Q82 -150 80 10 Q0 30 -80 10 Q-82 -150 -66 -284 Z", fill=kurta, sw=W + 1)
    b += P("M-60 -150 Q0 -120 60 -150", stroke=kurta_d, sw=3)
    b += P("M0 -288 L0 -180", stroke=kurta_d, sw=4)
    for y in (-264, -238, -212):
        b += E(0, y, 4.5, 4.5, gold, OL, 1.5)
    b += P("M-18 -320 L-18 -290 Q0 -282 18 -290 L18 -320 Z", fill=skin_d, sw=W)
    b += P("M-30 -292 Q0 -278 30 -292 L28 -300 Q0 -290 -28 -300 Z", fill=kurta, sw=3.5)
    # kanduva (shoulder towel) over his left shoulder
    b += P("M24 -298 Q62 -300 76 -276 L86 -110 Q70 -100 56 -108 L48 -250 Q36 -262 20 -268 Z", fill="#E8862E", sw=W)
    b += P("M56 -240 L80 -242 M58 -200 L82 -202 M60 -160 L84 -162", stroke="#FFF2C8", sw=4)
    b += P("M56 -108 l4 14 M66 -104 l2 14 M76 -106 l0 14", stroke="#E8862E", sw=4)
    c.layers["body"] = b
    c.layers["armL"] = arm("l", (-66, -276), 164, skin, kurta, 0.62, width=25, hand_scale=0.64, cuff=kurta_d)
    c.layers["armR"] = arm("r", (66, -276), 164, skin, kurta, 0.62, width=25, hand_scale=0.64, cuff=kurta_d)
    head = ears(skin, skin_d)
    head += face_shape(skin, skin_d, 1.02)
    for sx in (-1, 1):
        head += P(f"M{sx * 94} 6 Q{sx * 104} -40 {sx * 70} -70 Q{sx * 84} -30 {sx * 80} 10 Z", fill="#E4E4EA", sw=W)
    head += P("M-40 -88 Q0 -100 40 -88", stroke="#FFFFFF", sw=7, extra='opacity=".3"')
    head += P("M-56 -32 Q-38 -42 -20 -36 M20 -36 Q38 -42 56 -32", stroke="#E9E9EF", sw=8)
    head += P("M-56 -32 Q-38 -42 -20 -36 M20 -36 Q38 -42 56 -32", stroke=OL, sw=2, extra='opacity=".4"')
    head += laugh_lines() + nose_blush(skin_d, True, False)
    head += P("M-26 -60 Q0 -52 26 -60", stroke="#FFFFFF", sw=3, extra='opacity=".7"')
    head += P("M-20 -56 Q0 -50 20 -56", stroke="#D7263D", sw=3, extra='opacity=".0"')
    c.layers["head"] = head
    c.layers["top"] = glasses("#3A2A20") + P("M-34 44 Q-18 32 0 40 Q18 32 34 44 Q22 54 0 48 Q-22 54 -34 44 Z", fill="#F2F2F6", sw=3.5)
    c.layers["eyes"] = {k: adult_eyes(k, False) for k in EYES}
    c.layers["mouth"] = {k: g(adult_mouth(k), "translate(0 6)") for k in VISEMES}
    return c


def amma():
    skin, skin_d = "#D9A272", "#BF8355"
    c = Character("amma", skin, skin_d, (0, -392), 0.88, [(-60, -276), (60, -276)], 160)
    kurta, kurta_d, gold = "#1F8A7A", "#156A5E", "#F2B705"
    hair = "#20140F"
    b = E(0, 196, 110, 14, "#000", extra='opacity=".13"')
    # long braid behind her back (shows at her side)
    for i in range(7):
        b += E(70 + i * 1.5, -250 + i * 34, 15, 18, hair, OL, W)
    b += E(82, -2, 9, 9, "#FFFFFF", OL, 2) + E(70, 6, 8, 8, "#FFFFFF", OL, 2)
    for x in (-26, 26):
        b += P(f"M{x} 40 L{x} 170", stroke=OL, sw=36) + P(f"M{x} 40 L{x} 170", stroke="#F6E7C8", sw=27)
        b += P(f"M{x - 22} 192 Q{x - 22} 172 {x} 172 Q{x + 22} 172 {x + 22} 192 Z", fill="#B5652A", sw=W)
    b += P("M-60 -284 Q0 -300 60 -284 L80 60 Q0 76 -80 60 Z", fill=kurta, sw=W + 1)
    b += P("M-80 40 Q0 56 80 40 L80 60 Q0 76 -80 60 Z", fill=gold, sw=W)
    b += P("M-24 -288 Q0 -258 24 -288", fill=gold, sw=3.5)
    for x, y in ((-34, -200), (30, -170), (-20, -100), (36, -60), (-40, -20), (10, 0), (0, -230)):
        b += f'<g transform="translate({x} {y})">' + "".join(
            E(0, -6, 3.5, 6, "#FFD98A", extra=f'transform="rotate({k * 72})"') for k in range(5)) + "</g>"
    # dupatta draped from both shoulders
    b += P("M-62 -282 Q-90 -150 -60 -40 L-36 -44 Q-64 -150 -40 -284 Z", fill="#F2B705", sw=W)
    b += P("M62 -282 Q90 -150 60 -40 L36 -44 Q64 -150 40 -284 Z", fill="#F2B705", sw=W)
    b += P("M-16 -320 L-16 -290 Q0 -282 16 -290 L16 -320 Z", fill=skin_d, sw=W)
    c.layers["body"] = b
    c.layers["armL"] = arm("l", (-60, -276), 160, skin, kurta, 0.55, width=22, hand_scale=0.6, bangles=gold)
    c.layers["armR"] = arm("r", (60, -276), 160, skin, kurta, 0.55, width=22, hand_scale=0.6, bangles=gold)
    head = E(0, -6, 102, 104, hair, OL, W + 1)
    head += ears(skin, skin_d, "#F2B705")
    head += face_shape(skin, skin_d, 0.96)
    head += P("M-96 -2 C-98 -84 -46 -112 0 -110 C46 -112 98 -84 96 -2 C88 -46 60 -68 14 -72 L0 -88 L-14 -72 C-60 -68 -88 -46 -96 -2 Z", fill=hair, sw=W + 1)
    head += P("M-60 -96 Q-30 -112 -4 -104", stroke="#5A3A28", sw=5) + P("M14 -104 Q46 -110 66 -92", stroke="#5A3A28", sw=5)
    head += P("M0 -106 L0 -88", stroke="#D7263D", sw=4)
    head += P("M-54 -32 Q-38 -42 -20 -34 M20 -34 Q38 -42 54 -32", stroke=hair, sw=6)
    head += E(0, -30, 6, 6, "#D7263D", OL, 2)
    head += nose_blush(skin_d, True, True)
    c.layers["head"] = head
    c.layers["eyes"] = {k: adult_eyes(k, True) for k in EYES}
    c.layers["mouth"] = {k: adult_mouth(k) for k in VISEMES}
    return c


def nanna():
    skin, skin_d = "#BE8253", "#9F6838"
    c = Character("nanna", skin, skin_d, (0, -404), 0.9, [(-68, -284), (68, -284)], 166)
    shirt, shirt_d = "#3C6FD1", "#2B54A8"
    hair = "#1D130E"
    b = E(0, 196, 122, 15, "#000", extra='opacity=".13"')
    for x in (-30, 30):
        b += P(f"M{x} -70 L{x} 166", stroke=OL, sw=46) + P(f"M{x} -70 L{x} 166", stroke="#2C3E66", sw=36)
        b += P(f"M{x - 28} 192 Q{x - 28} 168 {x} 168 Q{x + 28} 168 {x + 28} 184 L{x + 28} 192 Z", fill="#EDE7DC", sw=W)
    b += P("M-58 -80 L58 -80 L60 -30 L4 -30 L0 -40 L-4 -30 L-60 -30 Z", fill="#2C3E66", sw=W)
    b += P("M-68 -292 Q0 -308 68 -292 L72 -66 Q0 -54 -72 -66 Z", fill=shirt, sw=W + 1)
    b += P("M-30 -296 L0 -260 L30 -296", fill="#FFFFFF", sw=3.5)
    b += P("M0 -260 L0 -70", stroke=shirt_d, sw=4)
    for y in (-236, -200, -164, -128, -92):
        b += E(0, y, 4, 4, "#FFFFFF", OL, 1.5)
    b += P("M-50 -230 L-22 -230 L-22 -204 L-50 -204 Z", fill="none", stroke=shirt_d, sw=3)
    b += P("M-60 -72 L60 -72", stroke="#7A4422", sw=8)
    b += P("M-18 -330 L-18 -296 Q0 -288 18 -296 L18 -330 Z", fill=skin_d, sw=W)
    c.layers["body"] = b
    c.layers["armL"] = arm("l", (-68, -284), 166, skin, shirt, 0.3, width=25, hand_scale=0.64)
    c.layers["armR"] = arm("r", (68, -284), 166, skin, shirt, 0.3, width=25, hand_scale=0.64)
    head = ears(skin, skin_d)
    head += face_shape(skin, skin_d, 1.05)
    head += P("M-80 30 Q-74 92 0 100 Q74 92 80 30 Q66 70 40 72 Q0 62 -40 72 Q-66 70 -80 30 Z", fill=hair, sw=W, extra='opacity=".88"')
    head += P("M-96 -4 C-104 -84 -50 -116 6 -114 C66 -112 104 -80 96 -4 C88 -36 74 -52 56 -58 C40 -46 10 -46 -10 -54 C-30 -46 -58 -50 -78 -58 C-88 -42 -94 -24 -96 -4 Z", fill=hair, sw=W + 1)
    head += P("M-40 -100 Q0 -112 40 -102", stroke="#FFFFFF", sw=6, extra='opacity=".22"')
    head += P("M-56 -32 Q-38 -42 -20 -36 M20 -36 Q38 -42 56 -32", stroke=hair, sw=8)
    head += nose_blush(skin_d, False, False)
    c.layers["head"] = head
    c.layers["eyes"] = {k: adult_eyes(k, False) for k in EYES}
    # lips sit on a skin patch so the beard does not hide them
    c.layers["mouth"] = {k: E(0, 52, 30, 18, skin) + adult_mouth(k) for k in VISEMES}
    return c


def all_characters():
    return {"boy": kid("boy"), "girl": kid("girl"), "ammamma": ammamma(), "tatayya": tatayya(), "amma": amma(), "nanna": nanna()}


def compose(ch, eye="open", mouth="smile", rotL=0, rotR=0):
    """Whole character as one SVG group (for previews and stills)."""
    d = ch.export()
    (lx, ly), (rx, ry) = d["pivots"]["armL"], d["pivots"]["armR"]
    return (f'<g transform="rotate({rotL} {lx} {ly})">{d["armL"]}</g>' + d["body"]
            + f'<g transform="rotate({rotR} {rx} {ry})">{d["armR"]}</g>'
            + d["head"] + d["eyes"][eye] + d["mouth"][mouth] + d["top"])
