"""Maatalu kids: Chinnu (boy) and Chinni (girl). One face rig, two looks.
Head local coords: centre (0,0), face ~ 204 wide. Full body: feet ~ y 192, head centre y -196."""
OL = "#4A2A1A"
SKIN = "#D49A6A"
SKIN_D = "#BF8355"
MOUTH = "#6B1F24"
TONGUE = "#EF7E86"
W = 4.5

LOOK = {
    "boy": dict(hair="#3E2618", hair_l="#7A4E32", brow="#3E2618"),
    "girl": dict(hair="#24150F", hair_l="#5A3A28", brow="#24150F"),
}


def P(d, fill="none", stroke=OL, sw=W, extra=""):
    return f'<path d="{d}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" stroke-linejoin="round" stroke-linecap="round" {extra}/>'


def E(cx, cy, rx, ry, fill, stroke="none", sw=0, extra=""):
    return f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" {extra}/>'


# ------------------------------------------------------------------ face parts

def brows(kind, color):
    shapes = {
        "normal": ("M-58 -30 Q-42 -40 -24 -33", "M24 -33 Q42 -40 58 -30"),
        "raised": ("M-58 -42 Q-42 -56 -24 -46", "M24 -46 Q42 -56 58 -42"),
        "sad": ("M-58 -28 Q-42 -30 -24 -42", "M24 -42 Q42 -30 58 -28"),
        "angry": ("M-58 -42 Q-42 -38 -22 -26", "M22 -26 Q42 -38 58 -42"),
    }
    l, r = shapes[kind]
    return P(l, stroke=color, sw=7) + P(r, stroke=color, sw=7)


def one_eye(x, kind, lashes):
    y = 4
    side = -1 if x < 0 else 1
    lash = ""
    if lashes and kind not in ("closed", "happy"):
        ox = x + side * 15
        lash = P(f"M{ox} {y-12} l{side*9} -7 M{ox-side*2} {y-6} l{side*10} -2", sw=3.5)
    if lashes and kind in ("closed", "happy"):
        ox = x + side * 16
        lash = P(f"M{ox} {y+(6 if kind=='happy' else 0)} l{side*8} {-6 if kind=='happy' else 4}", sw=3.5)
    if kind == "closed":
        return P(f"M{x-16} {y} Q{x} {y+10} {x+16} {y}", sw=5.5) + lash
    if kind == "happy":
        return P(f"M{x-16} {y+6} Q{x} {y-12} {x+16} {y+6}", sw=5.5) + lash
    if kind == "half":
        return (P(f"M{x-15} {y} Q{x} {y+22} {x+15} {y} Z", fill="#2B1B14", sw=2)
                + E(x + 5, y + 6, 4, 3, "#fff") + P(f"M{x-17} {y} L{x+17} {y}", sw=5) + lash)
    if kind == "wide":
        return (E(x, y, 20, 25, "#fff", OL, 3) + E(x, y + 2, 12, 16, "#2B1B14")
                + E(x + 4, y - 4, 4.5, 4.5, "#fff") + lash)
    s = (E(x, y, 15, 20, "#2B1B14") + E(x + 5, y - 7, 6, 6, "#fff") + E(x - 5, y + 9, 2.5, 2.5, "#fff")
         + P(f"M{x-17} {y-12} Q{x} {y-26} {x+17} {y-12}", sw=5))
    if kind == "sad":
        s += P(f"M{x-14} {y-15} Q{x} {y-11} {x+14} {y-8}", stroke=SKIN, sw=8)
        s += P(f"M{x-15} {y-14} Q{x} {y-10} {x+15} {y-6}", sw=4)
    if kind == "angry":
        s += P(f"M{x-17} {y-20} L{x+17} {y-8}" if x < 0 else f"M{x-17} {y-8} L{x+17} {y-20}", stroke=SKIN, sw=12)
        s += P(f"M{x-17} {y-18} L{x+17} {y-6}" if x < 0 else f"M{x-17} {y-6} L{x+17} {y-18}", sw=5)
    return s + lash


def eyes(kind, lashes=False):
    return one_eye(-40, kind, lashes) + one_eye(40, kind, lashes)


MOUTHS = ["rest", "MBP", "A", "E", "O", "U", "FV"]


def mouth_raw(kind):
    y = 54
    teeth_top = lambda w: P(f"M{-w} {y-3} Q0 {y+3} {w} {y-3} L{w-2} {y+4} Q0 {y+9} {-w+2} {y+4} Z", fill="#fff", sw=0, stroke="none")
    m = {
        "rest": lambda: P(f"M-15 {y} Q0 {y+9} 15 {y}", sw=5),
        "MBP": lambda: P(f"M-13 {y+2} Q0 {y-2} 13 {y+2}", sw=6) + P(f"M-6 {y+8} Q0 {y+10} 6 {y+8}", sw=3),
        "A": lambda: (P(f"M-21 {y-4} Q0 {y+38} 21 {y-4} Q0 {y+1} -21 {y-4} Z", fill=MOUTH, sw=4)
                      + E(0, y + 22, 10, 6, TONGUE) + teeth_top(17)),
        "E": lambda: (P(f"M-25 {y-4} Q0 {y+22} 25 {y-4} Q0 {y} -25 {y-4} Z", fill=MOUTH, sw=4)
                      + P(f"M-21 {y-1} Q0 {y+3} 21 {y-1} L19 {y+6} Q0 {y+10} -19 {y+6} Z", fill="#fff", stroke="none", sw=0)),
        "O": lambda: E(0, y + 8, 12, 16, MOUTH, OL, 4) + E(0, y + 16, 7, 5, TONGUE),
        "U": lambda: E(0, y + 4, 8, 9, MOUTH, OL, 4),
        "FV": lambda: P(f"M-14 {y+4} Q0 {y} 14 {y+4}", sw=5) + P(f"M-9 {y-3} L9 {y-3} L8 {y+2} L-8 {y+2} Z", fill="#fff", sw=2.5),
        "smile": lambda: (P(f"M-24 {y-6} Q0 {y+30} 24 {y-6} Z", fill=MOUTH, sw=4) + E(0, y + 14, 10, 5, TONGUE)
                          + P(f"M-20 {y-4} L20 {y-4} L18 {y+2} Q0 {y+5} -18 {y+2} Z", fill="#fff", stroke="none", sw=0)),
        "neutral": lambda: P(f"M-11 {y+3} Q0 {y+5} 11 {y+3}", sw=5),
        "surprised": lambda: E(0, y + 10, 13, 18, MOUTH, OL, 4) + E(0, y + 19, 8, 6, TONGUE),
        "sad": lambda: P(f"M-16 {y+8} Q0 {y-4} 16 {y+8}", sw=5),
        "angry": lambda: (P(f"M-18 {y+8} Q0 {y-6} 18 {y+8} Q0 {y+4} -18 {y+8} Z", fill=MOUTH, sw=4)
                          + P(f"M-14 {y+5} Q0 {y-2} 14 {y+5}", stroke="#fff", sw=3)),
    }
    return m[kind]()


def mouth(kind):
    return f'<g transform="translate(0 54) scale(1.4) translate(0 -54)">{mouth_raw(kind)}</g>'


# ------------------------------------------------------------------ hair

def hair_back(g):
    """Drawn before the face."""
    L = LOOK[g]
    if g == "girl":
        s = ""
        for sx in (-1, 1):
            for i, (dx, dy) in enumerate(((114, 40), (120, 66), (124, 92), (126, 116))):
                s += E(sx * dx, dy, 17, 16, L["hair"], OL, W)
                s += P(f"M{sx*dx-10} {dy-4} q10 8 20 0", stroke=L["hair_l"], sw=3)
            s += P(f"M{sx*120} 130 q{sx*8} 18 {sx*2} 30 q{-sx*10} -6 {-sx*8} -30 Z", fill=L["hair"], sw=W)
        # side hair falling behind cheeks
        s += P("M-108 0 C-116 40 -106 60 -96 62 L-90 10 Z M108 0 C116 40 106 60 96 62 L90 10 Z", fill=L["hair"], sw=W)
        return s
    return ""


def hair_front(g):
    L = LOOK[g]
    if g == "boy":
        s = P("M-110 6 C-122 -70 -84 -132 -8 -138 C70 -142 122 -96 112 -6 C104 -30 96 -42 86 -48 L84 -26 "
              "C74 -48 62 -58 48 -60 L44 -36 C34 -56 18 -64 2 -66 L-8 -40 C-14 -58 -30 -66 -46 -64 L-56 -38 "
              "C-64 -54 -76 -60 -88 -56 C-100 -40 -106 -18 -110 6 Z", fill=L["hair"], sw=W + 1)
        s += P("M-104 -8 L-98 28 L-90 -10 Z M104 -8 L98 28 L90 -10 Z", fill=L["hair"], sw=W)
        s += P("M-46 -126 C6 -150 70 -132 98 -84 C72 -106 30 -114 -8 -108 C-24 -110 -36 -116 -46 -126 Z", fill=L["hair_l"], sw=0, stroke="none", extra='opacity=".55"')
        s += P("M-4 -136 Q4 -164 28 -160 Q14 -150 14 -136 Z", fill=L["hair"], sw=W)
        s += P("M18 -138 Q42 -158 60 -144 Q42 -140 38 -128 Z", fill=L["hair"], sw=W)
        s += P("M-70 -90 Q-40 -112 -6 -112", stroke=L["hair_l"], sw=6)
        s += P("M-30 -118 Q0 -128 30 -122", stroke="#FFFFFF", sw=6, extra='opacity=".25"')
        return s
    # girl: rounded bangs + crown, flower clip, ribbons
    s = P("M-108 8 C-118 -76 -66 -136 0 -136 C66 -136 118 -76 108 8 C102 -22 96 -40 86 -52 "
          "Q70 -44 54 -50 Q38 -42 20 -50 Q2 -42 -16 -50 Q-34 -42 -50 -50 Q-68 -44 -86 -52 C-96 -40 -102 -22 -108 8 Z",
          fill=L["hair"], sw=W + 1)
    s += P("M-60 -104 Q-20 -124 26 -118", stroke=L["hair_l"], sw=6) + P("M36 -112 Q66 -100 80 -80", stroke=L["hair_l"], sw=5)
    s += P("M-28 -122 Q0 -130 28 -126", stroke="#FFFFFF", sw=6, extra='opacity=".25"')
    for sx in (-1, 1):  # ribbon bows at the pigtail ties
        cx, cy = sx * 108, 24
        s += P(f"M{cx} {cy} L{cx-18} {cy-14} L{cx-18} {cy+14} Z M{cx} {cy} L{cx+18} {cy-14} L{cx+18} {cy+14} Z", fill="#D7263D", sw=3.5)
        s += E(cx, cy, 6, 6, "#B01A2E", OL, 3)
    # jasmine-style flower clip
    for i in range(5):
        s += f'<ellipse cx="62" cy="-104" rx="7" ry="11" fill="#FFFFFF" stroke="{OL}" stroke-width="2.5" transform="rotate({i*72} 62 -94)"/>'
    s += E(62, -94, 5, 5, "#F2B705", OL, 2)
    return s


# ------------------------------------------------------------------ heads

def face_base(g, brow, eye_svg, mth_svg, blush=True, tear=False):
    L = LOOK[g]
    s = hair_back(g)
    for sx in (-1, 1):
        s += E(sx * 98, 12, 17, 23, SKIN, OL, W) + P(f"M{sx*98} 2 q{-sx*8} 10 0 20", stroke=SKIN_D, sw=3)
        if g == "girl":
            s += E(sx * 98, 38, 5, 5, "#F2B705", OL, 2)
    s += P("M-102 0 C-102 -72 -60 -106 0 -106 C60 -106 102 -72 102 0 C102 62 62 98 0 98 C-62 98 -102 62 -102 0 Z", fill=SKIN, sw=W + 1)
    s += P("M-80 52 C-56 84 -24 92 0 92 C24 92 56 84 80 52 C66 88 34 100 0 100 C-34 100 -66 88 -80 52 Z", fill=SKIN_D, stroke="none", sw=0, extra='opacity=".45"')
    s += hair_front(g)
    s += brows(brow, L["brow"])
    if g == "girl":
        s += E(0, -16, 4.5, 4.5, "#D7263D")
    s += eye_svg
    s += P("M-4 30 Q1 37 7 31", sw=4)
    if blush:
        s += E(-62, 38, 15, 9, "#F08C8C", extra='opacity=".5"') + E(62, 38, 15, 9, "#F08C8C", extra='opacity=".5"')
    if tear:
        s += P("M58 22 Q66 36 58 42 Q50 36 58 22 Z", fill="#8FD3FF", sw=2.5)
    s += mth_svg
    return s


def head(g="boy", eye="open", brow="normal", mth="rest", blush=True, tear=False):
    return face_base(g, brow, eyes(eye, g == "girl"), mouth(mth), blush, tear)


def head_rig(g):
    """Animated head: eye groups (open/half/closed) and mouth groups (7 visemes), toggled by script."""
    eg = "".join(f'<g class="eye" data-e="{k}"{"" if k=="open" else " visibility=\"hidden\""}>{eyes(k, g=="girl")}</g>'
                 for k in ("open", "half", "closed"))
    mg = "".join(f'<g class="vis" data-m="{k}"{"" if k=="rest" else " visibility=\"hidden\""}>{mouth(k)}</g>' for k in MOUTHS)
    return face_base(g, "normal", eg, mg)


# ------------------------------------------------------------------ bodies

BOY = dict(top="#F2B530", top_d="#C4501F", trim="#8C1D2E", pants="#4E6B3A")
GIRL = dict(frock="#E8457E", frock_d="#C42D63", border="#F2B705", sleeve="#F6A6C4")


def arm_path(pts, sleeve, sleeve_to):
    d = "M" + " L".join(f"{x} {y}" for x, y in pts)
    s = P(d, stroke=OL, sw=32) + P(d, stroke=SKIN, sw=23)
    (x0, y0), (x1, y1) = pts[0], pts[1]
    sx, sy = x0 + (x1 - x0) * sleeve_to, y0 + (y1 - y0) * sleeve_to
    s += P(f"M{x0} {y0} L{sx} {sy}", stroke=OL, sw=44) + P(f"M{x0} {y0} L{sx} {sy}", stroke=sleeve, sw=35)
    return s


def body_static(g):
    """Everything except the right (waving) arm."""
    s = ""
    if g == "boy":
        c = BOY
        for x in (-30, 30):
            s += P(f"M{x} 80 L{x} 160", stroke=OL, sw=40) + P(f"M{x} 80 L{x} 160", stroke=c["pants"], sw=30)
            s += P(f"M{x-28} 192 Q{x-28} 164 {x} 164 Q{x+28} 164 {x+28} 182 L{x+28} 192 Z", fill="#FFFFFF", sw=W)
            s += P(f"M{x-26} 184 L{x+26} 184", stroke="#FF8A1E", sw=5)
        s += P("M-62 56 L62 56 L58 96 L4 96 L0 80 L-4 96 L-58 96 Z", fill=c["pants"], sw=W)
        s += arm_path([(-60, -50), (-80, 10), (-76, 60)], c["top"], 0.75)
        s += E(-76, 70, 15, 15, SKIN, OL, W)
        s += P("M-60 -62 Q0 -80 60 -62 L72 76 Q0 90 -72 76 Z", fill=c["top"], sw=W + 1)
        for x, y in ((-40, -30), (-20, 10), (36, -20), (44, 30), (-44, 46), (20, 56), (40, 2), (-30, 70)):
            s += P(f"M{x} {y-5} L{x+5} {y} L{x} {y+5} L{x-5} {y} Z", fill=c["top_d"], stroke="none", sw=0, extra='opacity=".75"')
        s += P("M-16 -74 Q0 -78 16 -74 L16 -62 Q0 -58 -16 -62 Z", fill=c["trim"], sw=3.5)
        s += P("M0 -60 L0 10", stroke=c["trim"], sw=5)
        for y in (-44, -26, -8):
            s += E(0, y, 4, 4, "#FFE9A8", OL, 1.5)
        s += P("M-70 64 Q0 78 70 64", stroke=c["trim"], sw=6)
    else:
        c = GIRL
        for x in (-26, 26):
            s += P(f"M{x} 100 L{x} 164", stroke=OL, sw=32) + P(f"M{x} 100 L{x} 164", stroke=SKIN, sw=23)
            s += P(f"M{x-24} 192 Q{x-24} 166 {x} 166 Q{x+24} 166 {x+24} 192 Z", fill="#B01A2E", sw=W)
            s += P(f"M{x-14} 176 Q{x} 166 {x+14} 176", stroke="#F2B705", sw=3)
        s += arm_path([(-58, -50), (-78, 10), (-74, 60)], c["sleeve"], 0.55)
        s += E(-74, 70, 14, 14, SKIN, OL, W)
        # frock: bodice + flared skirt + gold border
        s += P("M-58 -62 Q0 -78 58 -62 L62 6 Q0 14 -62 6 Z", fill=c["frock"], sw=W + 1)
        s += P("M-62 4 Q0 14 62 4 L100 118 Q0 140 -100 118 Z", fill=c["frock"], sw=W + 1)
        s += P("M-94 100 Q0 122 94 100 L100 118 Q0 140 -100 118 Z", fill=c["border"], sw=W)
        s += P("M-86 108 Q0 128 86 108", stroke="#B8860B", sw=3, extra='stroke-dasharray="3 9"')
        s += P("M-40 30 L-50 110 M0 18 L0 124 M40 30 L50 110", stroke=c["frock_d"], sw=3, extra='opacity=".7"')
        s += P("M-62 0 Q0 12 62 0", stroke=c["border"], sw=8)
        s += P("M-24 -72 Q0 -54 24 -72", fill=c["border"], sw=3.5)
        for x, y in ((-30, -36), (30, -36), (0, -24), (-60, 60), (60, 60), (-24, 80), (24, 80)):
            s += E(x, y, 4, 4, "#FFE9A8", OL, 1.5)
    s += P("M-14 -100 L-14 -68 Q0 -60 14 -68 L14 -100 Z", fill=SKIN_D, sw=W)
    return s


def arm_right(g, pose="wave"):
    sleeve = BOY["top"] if g == "boy" else GIRL["sleeve"]
    sl = 0.75 if g == "boy" else 0.55
    if pose == "wave":
        if g == "girl":
            s = arm_path([(58, -50), (140, -72), (168, -118)], sleeve, sl * 0.6)
            s += f'<g transform="translate(174 -146) rotate(18) scale(.62)">{hand("open")}</g>'
        else:
            s = arm_path([(60, -50), (124, -84), (138, -132)], sleeve, sl * 0.6)
            s += f'<g transform="translate(142 -160) rotate(12) scale(.62)">{hand("open")}</g>'
    else:
        s = arm_path([(60, -50), (80, 10), (76, 60)], sleeve, sl) + E(76, 70, 15, 15, SKIN, OL, W)
    return s


def full_character(g, wave=True, **face):
    return (E(0, 196, 110, 14, "#000", extra='opacity=".12"') + body_static(g) + arm_right(g, "wave" if wave else "down")
            + f'<g transform="translate(0 -196)">{head(g, **face)}</g>')


def rig_character(g, shoulder_origin=True):
    """Full body for the scene: separate arm and head groups that script animates."""
    return (E(0, 196, 110, 14, "#000", extra='opacity=".12"')
            + f'<g class="kbody">{body_static(g)}</g>'
            + f'<g class="karm" style="transform-box:view-box">{arm_right(g, "wave")}</g>'
            + f'<g class="khead"><g transform="translate(0 -196)">{head_rig(g)}</g></g>')


# ------------------------------------------------------------------ hands

def _parts(kind):
    palm = '<rect x="-30" y="-18" width="60" height="58" rx="22"/>'
    wrist = '<rect x="-17" y="30" width="34" height="34" rx="10"/>'
    f = lambda x, h, rot=0, y=-18: f'<rect x="{x}" y="{y-h}" width="14" height="{h+12}" rx="7" transform="rotate({rot} {x+7} {y})"/>'
    thumb_side = '<rect x="-46" y="-6" width="16" height="40" rx="8" transform="rotate(-38 -30 26)"/>'
    thumb_up = '<rect x="-38" y="-62" width="17" height="50" rx="8.5" transform="rotate(-8 -30 -12)"/>'
    knuckles = "".join(f'<rect x="{x}" y="-30" width="14" height="24" rx="7"/>' for x in (-28, -14, 0, 14))
    if kind == "open":
        return palm + wrist + f(-28, 40, -10) + f(-14, 50, -3) + f(0, 48, 3) + f(14, 38, 10) + thumb_side
    if kind == "point":
        return palm + wrist + knuckles[knuckles.index('<rect x="-14"'):] + f(-28, 54, -4) + thumb_side
    if kind == "thumbs":
        return palm + wrist + knuckles + thumb_up
    if kind == "fist":
        return palm + wrist + knuckles + '<rect x="-36" y="0" width="50" height="16" rx="8"/>'
    if kind == "peace":
        return palm + wrist + f(-28, 50, -12) + f(-14, 52, 4) + '<rect x="0" y="-30" width="14" height="24" rx="7"/><rect x="14" y="-30" width="14" height="24" rx="7"/>' + thumb_side
    return ""


def hand(kind):
    if kind == "namaste":
        one = ('<rect x="-30" y="-10" width="30" height="70" rx="12"/><rect x="-30" y="-58" width="13" height="60" rx="6.5"/>'
               '<rect x="-17" y="-66" width="14" height="66" rx="7"/><rect x="-6" y="-60" width="6" height="60" rx="3"/>')
        both = one + f'<g transform="scale(-1 1)">{one}</g>'
        return (f'<g fill="{OL}" stroke="{OL}" stroke-width="10" stroke-linejoin="round">{both}</g>'
                f'<g fill="{SKIN}">{both}</g>' + P("M0 -64 L0 58", sw=3)
                + P("M-17 -58 L-17 -4 M17 -58 L17 -4", stroke=SKIN_D, sw=2.5)
                + E(-34, 14, 9, 16, SKIN, OL, 4) + E(34, 14, 9, 16, SKIN, OL, 4))
    parts = _parts(kind)
    s = f'<g fill="{OL}" stroke="{OL}" stroke-width="10" stroke-linejoin="round">{parts}</g><g fill="{SKIN}">{parts}</g>'
    if kind in ("fist", "thumbs", "point"):
        xs = (-14, 0, 14) if kind != "point" else (0, 14)
        for x in xs:
            s += P(f"M{x} -26 L{x} -10", sw=3)
    if kind == "fist":
        s += P("M-34 8 Q-10 4 12 8", sw=3)
    if kind in ("open", "peace"):
        s += P("M-14 22 Q0 28 16 20", stroke=SKIN_D, sw=3)
    return s


LIPSYNC = [("rest", "Rest"), ("MBP", "M B P"), ("A", "A"), ("E", "E / I"), ("O", "O"), ("U", "U / W"), ("FV", "F / V")]
BLINK = [("open", "Open"), ("half", "Half"), ("closed", "Closed"), ("half", "Half"), ("open", "Open")]
EXPR = [
    ("Happy", dict(eye="happy", brow="raised", mth="smile")),
    ("Neutral", dict(eye="open", brow="normal", mth="neutral")),
    ("Surprised", dict(eye="wide", brow="raised", mth="surprised")),
    ("Sad", dict(eye="sad", brow="sad", mth="sad", tear=True)),
    ("Angry", dict(eye="angry", brow="angry", mth="angry", blush=False)),
    ("Proud", dict(eye="closed", brow="raised", mth="smile")),
]
HANDS = [("open", "Wave"), ("point", "Point"), ("thumbs", "Well done"), ("peace", "Two"), ("fist", "Fist"), ("namaste", "Namaste")]
