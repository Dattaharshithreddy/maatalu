"""Maatalu scene art kit: shared palette, cast and props as SVG strings.
Canvas for scenes: 1200 x 900. Characters are drawn with feet at (0,0)."""

W, H = 1200, 900
INK = "#2B1B14"
CHEEK = "#EE8E86"
GOLD = "#E9B23B"
GOLD_D = "#C48A1C"
KUMKUM = "#D7263D"
LEAF = "#1F6B4F"
LEAF_L = "#3E9A6E"
TURMERIC = "#F2B705"


def a(**kw):
    out = []
    for k, v in kw.items():
        if v is None:
            continue
        out.append(f'{k.rstrip("_").replace("_", "-")}="{v}"')
    return " ".join(out)


def path(d, fill="none", **kw):
    return f'<path d="{d}" {a(fill=fill, **kw)}/>'


def circle(cx, cy, r, fill, **kw):
    return f'<circle cx="{cx}" cy="{cy}" r="{r}" {a(fill=fill, **kw)}/>'


def ellipse(cx, cy, rx, ry, fill, **kw):
    return f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" {a(fill=fill, **kw)}/>'


def rect(x, y, w, h, fill, rx=0, **kw):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" {a(fill=fill, **kw)}/>'


def g(content, x=0, y=0, s=1, flip=False, rot=0, **kw):
    sx = -s if flip else s
    t = f"translate({x},{y})"
    if rot:
        t += f" rotate({rot})"
    t += f" scale({sx},{s})"
    return f'<g transform="{t}" {a(**kw)}>{content}</g>'


def line(pts, color, w, **kw):
    d = "M " + " L ".join(f"{x},{y}" for x, y in pts)
    return path(d, stroke=color, stroke_width=w, stroke_linecap="round",
                stroke_linejoin="round", **kw)


def shadow(x, y, rx, ry=None, op=0.18):
    return ellipse(x, y, rx, ry or rx * 0.18, "#000", opacity=op)


# ---------------------------------------------------------------- faces

def eyes(dx, y, size, mode="open", glasses=None):
    s = []
    for sx in (-1, 1):
        x = sx * dx
        if mode == "happy":
            s.append(path(f"M {x-size} {y+2} Q {x} {y-size*1.2} {x+size} {y+2}",
                          stroke=INK, stroke_width=size * 0.5, stroke_linecap="round"))
        elif mode == "closed":
            s.append(path(f"M {x-size} {y} Q {x} {y+size*0.9} {x+size} {y}",
                          stroke=INK, stroke_width=size * 0.45, stroke_linecap="round"))
        else:
            s.append(ellipse(x, y, size * 0.8, size, INK))
            s.append(circle(x + size * 0.3, y - size * 0.4, size * 0.32, "#fff"))
            s.append(circle(x - size * 0.25, y + size * 0.4, size * 0.14, "#fff"))
    if glasses:
        gr = size * 2.0
        for sx in (-1, 1):
            s.append(circle(sx * dx, y, gr, "#fff", fill_opacity=0.18, stroke=glasses,
                            stroke_width=size * 0.35))
        s.append(path(f"M {-dx+gr} {y} Q 0 {y-size*0.8} {dx-gr} {y}", stroke=glasses,
                      stroke_width=size * 0.35))
    return "".join(s)


def mouth(y, w, mode="smile"):
    if mode == "open":
        return (path(f"M {-w} {y} Q 0 {y+w*2.2} {w} {y} Q 0 {y+w*0.35} {-w} {y} Z", "#7A2632")
                + ellipse(0, y + w * 1.15, w * 0.55, w * 0.32, "#EF7B83"))
    if mode == "grin":
        return (path(f"M {-w*1.2} {y-2} Q 0 {y+w*2.0} {w*1.2} {y-2} Z", "#7A2632")
                + path(f"M {-w*1.0} {y} Q 0 {y+w*0.5} {w*1.0} {y} Z", "#fff"))
    if mode == "o":
        return ellipse(0, y + w * 0.6, w * 0.45, w * 0.6, "#7A2632")
    return path(f"M {-w} {y} Q 0 {y+w*1.1} {w} {y}", stroke=INK, stroke_width=w * 0.32,
                stroke_linecap="round")


def face(r, skin, eye_mode="open", mouth_mode="smile", glasses=None, brows=None):
    s = [circle(0, 0, r, skin)]
    s.append(path(f"M {-r*0.92} {r*0.25} A {r} {r} 0 0 0 {r*0.92} {r*0.25} "
                  f"A {r*1.05} {r*0.85} 0 0 1 {-r*0.92} {r*0.25} Z", "#000", opacity=0.06))
    s.append(eyes(r * 0.36, r * 0.05, r * 0.12, eye_mode, glasses))
    if brows:
        for sx in (-1, 1):
            s.append(path(f"M {sx*r*0.22} {-r*0.27} Q {sx*r*0.38} {-r*0.36} {sx*r*0.52} {-r*0.27}",
                          stroke=brows, stroke_width=r * 0.06, stroke_linecap="round"))
    s.append(path(f"M {-r*0.05} {r*0.22} Q 0 {r*0.29} {r*0.05} {r*0.22}", stroke="#000",
                  stroke_opacity=0.25, stroke_width=r * 0.04, stroke_linecap="round"))
    for sx in (-1, 1):
        s.append(ellipse(sx * r * 0.55, r * 0.33, r * 0.15, r * 0.1, CHEEK, opacity=0.55))
    s.append(mouth(r * 0.38, r * 0.17, mouth_mode))
    return "".join(s)


# ---------------------------------------------------------------- arms

ARM_POSES = {
    # (elbow, hand) offsets from shoulder, for the RIGHT arm (x mirrored for left)
    "down": ((14, 45), (18, 92)),
    "wave": ((58, -22), (74, -86)),
    "up": ((30, -50), (50, -105)),
    "hold": ((10, 50), (-34, 66)),
    "front": ((22, 48), (-6, 84)),
    "point": ((48, 10), (100, -8)),
    "hip": ((40, 40), (12, 78)),
    "reach": ((44, -10), (96, -40)),
}


def arm(shoulder, pose, side, skin, sleeve, w, sleeve_len=0.45, bangles=None, scale=1.0):
    sx, sy = shoulder
    (ex, ey), (hx, hy) = ARM_POSES[pose] if isinstance(pose, str) else pose
    m = 1 if side == "r" else -1
    e = (sx + m * ex * scale, sy + ey * scale)
    h = (sx + m * hx * scale, sy + hy * scale)
    out = [line([(sx, sy), e, h], skin, w)]
    if sleeve:
        mx = sx + (e[0] - sx) * sleeve_len * 2
        my = sy + (e[1] - sy) * sleeve_len * 2
        out.append(line([(sx, sy), (mx, my)], sleeve, w * 1.25))
    if bangles:
        bx = e[0] + (h[0] - e[0]) * 0.72
        by = e[1] + (h[1] - e[1]) * 0.72
        out.append(circle(bx, by, w * 0.55, "none", stroke=bangles, stroke_width=4))
    out.append(circle(h[0], h[1], w * 0.62, skin))
    return "".join(out)


# ---------------------------------------------------------------- cast

KID_SKIN = "#C98A5B"


def kid(arms=("down", "down"), eyes_="open", mouth_="smile", shirt=KUMKUM, pants="#2E4A7D",
        pajamas=False, hold=None, sitting=False):
    """Chinnu, about 6. Feet at (0,0), height ~330."""
    skin = KID_SKIN
    hair = "#2A1A14"
    hy = -250
    s = []
    # hair back (bob)
    s.append(path(f"M -92 {hy+10} Q -100 {hy-92} 0 {hy-96} Q 100 {hy-92} 92 {hy+10} "
                  f"Q 94 {hy+52} 70 {hy+56} L -70 {hy+56} Q -94 {hy+52} -92 {hy+10} Z", hair))
    if not sitting:
        legc = pants if pajamas else skin
        s.append(rect(-40, -80, 26, 74, legc, rx=12))
        s.append(rect(14, -80, 26, 74, legc, rx=12))
        s.append(ellipse(-30, -8, 26, 13, "#3B2A22" if not pajamas else skin))
        s.append(ellipse(30, -8, 26, 13, "#3B2A22" if not pajamas else skin))
        s.append(path("M -56 -98 L 56 -98 L 58 -58 Q 30 -50 2 -58 Q -26 -50 -58 -58 Z", pants))
    s.append(rect(-15, -180, 30, 20, skin))
    body = "M -54 -168 Q 0 -182 54 -168 L 62 -90 Q 0 -78 -62 -90 Z"
    s.append(path(body, shirt))
    if pajamas:
        for yy in (-150, -125, -100):
            s.append(circle(-20, yy, 6, "#fff", opacity=0.7))
            s.append(circle(22, yy + 10, 6, "#fff", opacity=0.7))
    else:
        s.append(path("M -22 -170 Q 0 -150 22 -170", stroke="#fff", stroke_width=5, opacity=0.8))
        s.append(star(0, -128, 17, "#FFD24A"))
    s.append(path(body.replace("Z", "") + " Z", "#000", opacity=0.0))
    if hold == "back" or not sitting:
        pass
    left, right = arms
    hold_svg = ""
    s.append(arm((-50, -160), left, "l", skin, shirt, 22))
    if hold:
        hold_svg = hold
    s.append(arm((50, -160), right, "r", skin, shirt, 22))
    s.append(g(face(78, skin, eyes_, mouth_, brows=None), 0, hy))
    # fringe
    s.append(path(f"M -82 {hy-6} Q -80 {hy-90} 0 {hy-92} Q 80 {hy-90} 82 {hy-6} "
                  f"Q 66 {hy-46} 34 {hy-42} Q 14 {hy-62} -8 {hy-44} Q -42 {hy-56} -82 {hy-6} Z", hair))
    s.append(path(f"M -40 {hy-74} Q -10 {hy-88} 24 {hy-80}", stroke="#fff", stroke_width=6,
                  opacity=0.18, stroke_linecap="round"))
    s.append(hold_svg)
    return "".join(s)


def _adult_head(r, skin, eyes_, mouth_, glasses, brows):
    return face(r, skin, eyes_, mouth_, glasses=glasses, brows=brows)


def ammamma(arms=("down", "down"), eyes_="open", mouth_="smile", hold=""):
    skin = "#B9794C"
    saree = "#A3264A"
    saree_d = "#7E1A38"
    hy = -392
    s = []
    s.append(circle(46, hy - 46, 26, "#A9A9B3"))  # bun
    s.append(circle(0, hy - 6, 66, "#B8B8C2"))
    s.append(ellipse(-26, -8, 22, 10, "#8A5A3A"))
    s.append(ellipse(26, -8, 22, 10, "#8A5A3A"))
    s.append(rect(-14, -336, 28, 22, skin))
    s.append(path("M -56 -322 Q 0 -338 56 -322 L 86 -14 Q 0 0 -86 -14 Z", saree))
    s.append(path("M -80 -60 Q 0 -48 80 -60 L 86 -14 Q 0 0 -86 -14 Z", GOLD))
    s.append(path("M -79 -50 Q 0 -38 79 -50", stroke=saree_d, stroke_width=3, stroke_dasharray="6 8"))
    s.append(path("M -50 -250 Q 0 -238 52 -250 L 52 -230 Q 0 -218 -50 -230 Z", skin, opacity=0.9))
    s.append(path("M -56 -322 L -22 -330 L 74 -186 L 64 -150 Z", saree_d))
    s.append(path("M -22 -330 L 74 -186", stroke=GOLD, stroke_width=7))
    s.append(path("M -56 -322 L 64 -150", stroke=GOLD, stroke_width=4, opacity=0.8))
    s.append(arm((-48, -310), arms[0], "l", skin, saree, 20, sleeve_len=0.3, bangles=GOLD))
    s.append(arm((48, -310), arms[1], "r", skin, saree, 20, sleeve_len=0.3, bangles=GOLD))
    s.append(g(_adult_head(62, skin, eyes_, mouth_, "#6B4630", "#9A9AA3"), 0, hy))
    s.append(path(f"M -64 {hy-2} Q -66 {hy-70} 0 {hy-68} Q 66 {hy-70} 64 {hy-2} "
                  f"Q 50 {hy-40} 4 {hy-44} Q -50 {hy-40} -64 {hy-2} Z", "#C9C9D2"))
    s.append(path(f"M 2 {hy-66} L 2 {hy-44}", stroke=KUMKUM, stroke_width=3))
    s.append(circle(0, hy - 30, 5.5, KUMKUM))
    s.append(circle(-62, hy + 16, 6, GOLD))
    s.append(circle(62, hy + 16, 6, GOLD))
    s.append(hold)
    return "".join(s)


def tatayya(arms=("down", "down"), eyes_="open", mouth_="smile", hold=""):
    skin = "#A86B42"
    hy = -400
    s = []
    s.append(ellipse(-24, -8, 22, 10, "#6B4630"))
    s.append(ellipse(24, -8, 22, 10, "#6B4630"))
    s.append(path("M -60 -200 L 60 -200 L 72 -16 Q 0 -6 -72 -16 Z", "#FBF8F0"))
    s.append(path("M -66 -40 Q 0 -30 66 -40", stroke=GOLD, stroke_width=6))
    s.append(path("M 0 -200 L 6 -20", stroke="#000", stroke_opacity=0.08, stroke_width=3))
    s.append(rect(-14, -346, 28, 22, skin))
    s.append(path("M -62 -330 Q 0 -346 62 -330 L 68 -186 Q 0 -174 -68 -186 Z", "#F1EEE4"))
    s.append(path("M 0 -330 L 0 -260", stroke="#D8D2C2", stroke_width=3))
    for yy in (-312, -292, -272):
        s.append(circle(0, yy, 3.5, "#C9BFA8"))
    # kanduva (shoulder towel)
    s.append(path("M -66 -330 Q -40 -342 -20 -334 L -46 -210 Q -60 -206 -74 -214 Z", "#E8862E"))
    s.append(path("M -60 -300 L -30 -300 M -64 -270 L -38 -270 M -68 -240 L -44 -240",
                  stroke="#FFF2C8", stroke_width=4))
    s.append(arm((-54, -318), arms[0], "l", skin, "#F1EEE4", 20, sleeve_len=0.3))
    s.append(arm((54, -318), arms[1], "r", skin, "#F1EEE4", 20, sleeve_len=0.3))
    s.append(g(_adult_head(62, skin, eyes_, mouth_, "#3A2A20", "#E6E6EA"), 0, hy))
    for sx in (-1, 1):
        s.append(path(f"M {sx*60} {hy+8} Q {sx*70} {hy-30} {sx*48} {hy-46} Q {sx*62} {hy-14} {sx*52} {hy+10} Z",
                      "#E3E3E8"))
    s.append(path(f"M -30 {hy+22} Q -16 {hy+12} 0 {hy+20} Q 16 {hy+12} 30 {hy+22} "
                  f"Q 18 {hy+32} 0 {hy+26} Q -18 {hy+32} -30 {hy+22} Z", "#F2F2F5"))
    s.append(path(f"M -20 {hy-58} Q 0 {hy-64} 20 {hy-58}", stroke="#fff", stroke_width=6,
                  opacity=0.25, stroke_linecap="round"))
    s.append(hold)
    return "".join(s)


def amma(arms=("down", "down"), eyes_="open", mouth_="smile", hold=""):
    skin = "#C68655"
    hair = "#20140F"
    hy = -400
    s = []
    s.append(path(f"M -66 {hy} Q -72 {hy-76} 0 {hy-76} Q 72 {hy-76} 66 {hy} L 60 {hy+40} L -60 {hy+40} Z", hair))
    s.append(path(f"M 56 {hy+20} Q 80 {hy+90} 70 {hy+170}", stroke=hair, stroke_width=22,
                  stroke_linecap="round"))
    for i in range(5):
        yy = hy + 40 + i * 26
        s.append(ellipse(64 + i * 2, yy, 13, 9, "#3A2618"))
    s.append(circle(72, hy + 176, 8, KUMKUM))
    s.append(rect(-34, -150, 26, 140, "#F6E7C8", rx=12))
    s.append(rect(8, -150, 26, 140, "#F6E7C8", rx=12))
    s.append(ellipse(-24, -8, 20, 9, "#7A3B2A"))
    s.append(ellipse(24, -8, 20, 9, "#7A3B2A"))
    s.append(rect(-14, -346, 28, 22, skin))
    s.append(path("M -56 -330 Q 0 -346 56 -330 L 72 -130 Q 0 -116 -72 -130 Z", "#2E8B6E"))
    s.append(path("M -66 -150 Q 0 -138 66 -150", stroke=GOLD, stroke_width=5))
    s.append(path("M -20 -330 Q 0 -310 20 -330", stroke=GOLD, stroke_width=4))
    for xx, yy in ((-30, -280), (24, -250), (-16, -200), (30, -190)):
        s.append(circle(xx, yy, 5, "#FFD98A", opacity=0.9))
    s.append(path("M -58 -328 Q -80 -250 -40 -150 L -20 -150 Q -56 -250 -36 -332 Z", TURMERIC))
    s.append(arm((-48, -316), arms[0], "l", skin, "#2E8B6E", 19, sleeve_len=0.6, bangles=GOLD))
    s.append(arm((48, -316), arms[1], "r", skin, "#2E8B6E", 19, sleeve_len=0.6, bangles=GOLD))
    s.append(g(_adult_head(60, skin, eyes_, mouth_, None, hair), 0, hy))
    s.append(path(f"M -62 {hy+4} Q -66 {hy-68} 0 {hy-66} Q 66 {hy-68} 62 {hy+4} "
                  f"Q 52 {hy-38} 6 {hy-46} Q -40 {hy-40} -62 {hy+4} Z", hair))
    s.append(circle(0, hy - 26, 5, KUMKUM))
    s.append(circle(-60, hy + 16, 6, GOLD))
    s.append(circle(60, hy + 16, 6, GOLD))
    s.append(hold)
    return "".join(s)


def nanna(arms=("down", "down"), eyes_="open", mouth_="smile", hold=""):
    skin = "#B07548"
    hair = "#1D130E"
    hy = -410
    s = []
    s.append(rect(-40, -200, 34, 186, "#2C3E66", rx=10))
    s.append(rect(6, -200, 34, 186, "#2C3E66", rx=10))
    s.append(ellipse(-26, -10, 26, 12, "#E9E4DA"))
    s.append(ellipse(26, -10, 26, 12, "#E9E4DA"))
    s.append(rect(-15, -356, 30, 22, skin))
    s.append(path("M -64 -340 Q 0 -356 64 -340 L 66 -190 Q 0 -178 -66 -190 Z", "#3C6FD1"))
    s.append(path("M -24 -340 Q 0 -318 24 -340", stroke="#2B54A8", stroke_width=6))
    s.append(path("M -40 -260 h 80", stroke="#fff", stroke_width=6, opacity=0.3))
    s.append(arm((-56, -326), arms[0], "l", skin, "#3C6FD1", 22, sleeve_len=0.35))
    s.append(arm((56, -326), arms[1], "r", skin, "#3C6FD1", 22, sleeve_len=0.35))
    s.append(g(_adult_head(64, skin, eyes_, mouth_, None, hair), 0, hy))
    s.append(path(f"M -62 {hy+8} Q -58 {hy+66} 0 {hy+68} Q 58 {hy+66} 62 {hy+8} "
                  f"Q 50 {hy+40} 30 {hy+42} Q 0 {hy+30} -30 {hy+42} Q -50 {hy+40} -62 {hy+8} Z",
                  hair, opacity=0.85))
    s.append(ellipse(0, hy + 30, 20, 12, skin))
    s.append(g(mouth(64 * 0.38, 64 * 0.17, mouth_), 0, hy))
    s.append(path(f"M -66 {hy-4} Q -70 {hy-80} 0 {hy-80} Q 72 {hy-80} 66 {hy-4} "
                  f"Q 60 {hy-40} 40 {hy-50} Q 0 {hy-38} -36 {hy-52} Q -58 {hy-40} -66 {hy-4} Z", hair))
    s.append(hold)
    return "".join(s)


CAST = {"kid": kid, "ammamma": ammamma, "tatayya": tatayya, "amma": amma, "nanna": nanna}


def person(who, x, y, s=1.0, flip=False, **kw):
    return shadow(x, y, 80 * s) + g(CAST[who](**kw), x, y, s, flip)


# ---------------------------------------------------------------- props

def defs():
    return """<defs>
<linearGradient id="sky_day" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7CC6F2"/><stop offset="1" stop-color="#D9F1FF"/></linearGradient>
<linearGradient id="sky_morning" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFD7A8"/><stop offset="1" stop-color="#FFF4DD"/></linearGradient>
<linearGradient id="sky_night" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1B2050"/><stop offset="1" stop-color="#3C3F86"/></linearGradient>
<linearGradient id="sky_dusk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2A2560"/><stop offset="0.6" stop-color="#7B4B8E"/><stop offset="1" stop-color="#F08A5D"/></linearGradient>
<radialGradient id="glow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#FFE9A0" stop-opacity="0.95"/><stop offset="1" stop-color="#FFE9A0" stop-opacity="0"/></radialGradient>
<radialGradient id="screen_glow" cx="0.5" cy="0.4" r="0.7"><stop offset="0" stop-color="#FFF8E6"/><stop offset="1" stop-color="#F5E3C2"/></radialGradient>
</defs>"""


def cloud(x, y, s=1, op=0.95):
    c = (circle(0, 0, 40, "#fff") + circle(42, -14, 50, "#fff") + circle(90, 0, 38, "#fff")
         + rect(-20, 0, 130, 34, "#fff", rx=17))
    return g(c, x, y, s, opacity=op)


def sun(x, y, r=60):
    rays = "".join(
        path(f"M 0 {-r-14} L 0 {-r-34}", stroke="#FFC93C", stroke_width=10, stroke_linecap="round",
             transform=f"rotate({i*30})") for i in range(12))
    return g(circle(0, 0, r + 40, "url(#glow)") + rays + circle(0, 0, r, "#FFC93C")
             + circle(-r * 0.3, -r * 0.3, r * 0.35, "#FFE27A"), x, y)


def moon(x, y, r=50):
    return g(circle(0, 0, r * 2.4, "url(#glow)", opacity=0.5) + circle(0, 0, r, "#FFF1B8")
             + circle(r * 0.45, -r * 0.25, r * 0.85, "#000", opacity=0)  # placeholder
             + circle(-r * 0.3, r * 0.2, r * 0.15, "#EADB9A") + circle(r * 0.2, -r * 0.35, r * 0.1, "#EADB9A"), x, y)


def star(x, y, r=10, fill="#FFF3B0"):
    pts = []
    import math
    for i in range(10):
        rr = r if i % 2 == 0 else r * 0.45
        ang = math.pi / 5 * i - math.pi / 2
        pts.append(f"{x + rr*math.cos(ang):.1f},{y + rr*math.sin(ang):.1f}")
    return f'<polygon points="{" ".join(pts)}" fill="{fill}"/>'


def window(x, y, w, h, scene, frame="#FFFFFF", curtains="#F2B705"):
    """scene: inner svg drawn in a w x h box at origin."""
    cid = f"win{x}{y}{w}"
    inner = (f'<clipPath id="{cid}"><rect x="0" y="0" width="{w}" height="{h}" rx="8"/></clipPath>'
             f'<g clip-path="url(#{cid})">{scene}</g>')
    fr = (rect(-12, -12, w + 24, h + 24, frame, rx=14) + inner
          + path(f"M {w/2} 0 V {h} M 0 {h/2} H {w}", stroke=frame, stroke_width=10)
          + rect(-24, h + 8, w + 48, 16, frame, rx=6))
    if curtains:
        fr += path(f"M -30 -30 Q {w*0.22} -20 {w*0.18} {h*0.5} Q {w*0.08} {h*0.9} -24 {h+10} Z", curtains)
        fr += path(f"M {w+30} -30 Q {w*0.78} -20 {w*0.82} {h*0.5} Q {w*0.92} {h*0.9} {w+24} {h+10} Z", curtains)
        fr += rect(-40, -40, w + 80, 14, "#8A5A3A", rx=7)
    return g(fr, x, y)


def city_view(w, h, sky="url(#sky_day)", snow=False, night=False):
    s = rect(0, 0, w, h, sky)
    cols = ["#9DB7D5", "#B6CBE3", "#8FA9C9", "#A8BFDB"] if not night else ["#2B2F63", "#343A75", "#262A58", "#30356C"]
    xs = [(0, 0.55), (0.18, 0.4), (0.33, 0.62), (0.52, 0.45), (0.7, 0.58), (0.86, 0.38)]
    for i, (fx, fh) in enumerate(xs):
        bx, bw, bh = fx * w, w * 0.17, h * fh
        s += rect(bx, h - bh, bw, bh, cols[i % 4])
        for wy in range(int(h - bh + 14), int(h - 10), 26):
            for wx in range(int(bx + 10), int(bx + bw - 14), 22):
                s += rect(wx, wy, 10, 14, "#FFE38A" if night else "#fff", opacity=0.8 if night else 0.5)
    if snow:
        s += rect(0, h - 14, w, 14, "#fff")
        import random
        rnd = random.Random(7)
        for _ in range(26):
            s += circle(rnd.uniform(0, w), rnd.uniform(0, h - 20), rnd.uniform(2, 4), "#fff", opacity=0.9)
    return s


def tablet(x, y, w, h, inner, rot=0, color="#2D2D3A"):
    cid = f"tab{x}{y}"
    body = (rect(-16, -16, w + 32, h + 32, color, rx=26)
            + f'<clipPath id="{cid}"><rect x="0" y="0" width="{w}" height="{h}" rx="12"/></clipPath>'
            + f'<g clip-path="url(#{cid})">{rect(0, 0, w, h, "url(#screen_glow)")}{inner}'
            + rect(w - 20 - w * 0.22, h - 20 - h * 0.26, w * 0.22, h * 0.26, "#9CC7E6", rx=8)
            + g(face(h * 0.06, KID_SKIN, "open", "smile"), w - 20 - w * 0.11, h - 20 - h * 0.12)
            + "</g>"
            + circle(w / 2, -8, 3, "#555"))
    return g(body, x, y, rot=rot)


def call_bg(w, h):
    """Indian home wall behind grandparents on video call."""
    s = rect(0, 0, w, h, "#F7D9A8")
    s += rect(0, h * 0.72, w, h * 0.28, "#E5B97A")
    s += g(rect(0, 0, 70, 90, "#8A5A3A", rx=6) + rect(8, 8, 54, 74, "#F4C77A", rx=4)
           + circle(35, 40, 16, "#E8862E"), w * 0.08, h * 0.12)
    s += thoranam(0, 4, w, 8, s=0.6)
    return s


def thoranam(x, y, w, n=9, s=1.0):
    out = path(f"M 0 0 Q {w/2} {26*s} {w} 0", stroke="#8A5A3A", stroke_width=4 * s)
    for i in range(n):
        t = (i + 0.5) / n
        lx = t * w
        ly = 4 * t * (1 - t) * 26 * s * 0.5 * 2
        out += g(path("M 0 0 Q 14 22 0 52 Q -14 22 0 0 Z", LEAF_L) + path("M 0 4 L 0 46", stroke=LEAF, stroke_width=2),
                 lx, ly, s)
        if i % 2 == 0:
            out += circle(lx, ly + 6 * s, 7 * s, "#F28A1E")
    return g(out, x, y)


def plate_rice(x, y, s=1.0, leaf=False):
    if leaf:
        base = path("M -110 0 Q -60 -40 110 -10 Q 60 30 -110 0 Z", "#3E9A4E") + path("M -100 0 L 100 -8", stroke="#2C7A3A", stroke_width=3)
    else:
        base = ellipse(0, 0, 90, 26, "#E6EEF2") + ellipse(0, -4, 72, 18, "#fff")
    food = (ellipse(-10, -16, 40, 18, "#FFFDF5") + circle(-24, -22, 6, "#F7F2E2") + circle(4, -24, 6, "#F7F2E2")
            + ellipse(40, -10, 20, 10, "#E9A83B") + ellipse(-56, -6, 14, 8, "#C8452C"))
    return g(base + food, x, y, s)


def glass(x, y, s=1.0):
    return g(path("M -18 -60 L 18 -60 L 14 0 L -14 0 Z", "#CFEFFF", opacity=0.9)
             + path("M -16 -36 L 16 -36 L 14 0 L -14 0 Z", "#7CC6F2", opacity=0.8)
             + path("M -10 -54 L -8 -6", stroke="#fff", stroke_width=4, opacity=0.8), x, y, s)


def ball(x, y, r=34):
    return g(circle(0, 0, r, "#FF6B5B") + path(f"M {-r} 0 Q 0 {-r*0.6} {r} 0", stroke="#FFD24A", stroke_width=r * 0.3)
             + path(f"M {-r*0.7} {r*0.7} Q 0 {r*0.1} {r*0.7} {r*0.7}", stroke="#4FB3E8", stroke_width=r * 0.22)
             + circle(-r * 0.35, -r * 0.4, r * 0.18, "#fff", opacity=0.6), x, y)


def book(x, y, s=1.0, rot=0):
    return g(path("M 0 0 L -70 -14 L -70 -96 L 0 -82 Z", "#4FB3E8") + path("M 0 0 L 70 -14 L 70 -96 L 0 -82 Z", "#3E9ED6")
             + path("M -6 -2 L -62 -14 L -62 -90 L -6 -78 Z", "#fff") + path("M 6 -2 L 62 -14 L 62 -90 L 6 -78 Z", "#FFF8E6")
             + star(-34, -54, 12, "#F2B705") + circle(34, -52, 12, "#FF8A65"), x, y, s, rot=rot)


def school_bag(x, y, s=1.0):
    return g(path("M -40 -96 Q -40 -120 0 -120 Q 40 -120 40 -96", stroke="#2E4A7D", stroke_width=8)
             + rect(-48, -100, 96, 100, "#FFB020", rx=20) + rect(-34, -50, 68, 40, "#FF8A00", rx=10)
             + circle(0, -76, 7, "#fff"), x, y, s)


def suitcase(x, y, s=1.0):
    return g(rect(-20, -150, 40, 30, "none", rx=8, stroke="#555", stroke_width=8)
             + rect(-50, -124, 100, 124, "#4FB3E8", rx=16)
             + path("M -24 -120 V -4 M 24 -120 V -4", stroke="#2E8DC6", stroke_width=6)
             + circle(-34, 6, 8, "#333") + circle(34, 6, 8, "#333")
             + rect(-34, -90, 26, 26, "#FFD24A", rx=6), x, y, s)


def mango(x, y, s=1.0, rot=0):
    return g(path("M 0 0 Q 26 -6 26 22 Q 20 46 -6 40 Q -24 30 -18 10 Q -14 0 0 0 Z", "#FFB21E")
             + path("M 0 0 Q 26 -6 26 22 Q 22 36 10 40 Q 20 20 0 0 Z", "#F08A1E")
             + path("M 0 0 Q 10 -14 26 -16 Q 14 -2 0 0 Z", LEAF_L)
             + ellipse(-6, 12, 5, 9, "#fff", opacity=0.4), x, y, s, rot=rot)


def mango_tree(x, y, s=1.0):
    t = path("M -30 0 Q -20 -160 -40 -260 L 30 -260 Q 18 -160 34 0 Z", "#7A4B2A")
    t += path("M -10 -200 Q -80 -250 -130 -260", stroke="#7A4B2A", stroke_width=20, stroke_linecap="round")
    for cx, cy, r in ((-150, -330, 110), (0, -400, 150), (150, -330, 110), (-80, -260, 90), (90, -260, 90), (0, -300, 120)):
        t += circle(cx, cy, r, "#2F8A4A")
    for cx, cy, r in ((-120, -360, 60), (40, -440, 70), (140, -350, 50)):
        t += circle(cx, cy, r, "#46A85E", opacity=0.8)
    for mx, my in ((-110, -250), (-40, -230), (70, -240), (130, -280), (-160, -300), (20, -320)):
        t += line([(mx, my - 22), (mx, my)], "#2C6B3A", 3) + mango(mx, my, 0.9)
    return g(t, x, y, s)


def kite(x, y, s=1.0, rot=-10, c1="#E8414B", c2="#FFC93C"):
    return g(path("M 0 -60 L 44 0 L 0 70 L -44 0 Z", c1) + path("M 0 -60 L 44 0 L 0 0 Z", c2)
             + path("M 0 70 L -44 0 L 0 0 Z", c2) + path("M 0 -60 V 70 M -44 0 H 44", stroke="#7A2632", stroke_width=3)
             + path("M 0 70 Q -14 96 4 114 Q 20 134 0 156", stroke="#7A2632", stroke_width=3)
             + path("M -6 96 l 12 -6 l -4 12 Z M 2 128 l 12 -6 l -4 12 Z", "#4FB3E8"), x, y, s, rot=rot)


def diya(x, y, s=1.0, lit=True):
    out = path("M -34 -8 Q 0 26 34 -8 Q 20 -16 0 -14 Q -20 -16 -34 -8 Z", "#C8642C")
    out += path("M -30 -8 Q 0 -2 30 -8", stroke="#F5A35B", stroke_width=4)
    out += path("M 24 -14 Q 30 -20 38 -18", stroke="#8A3A16", stroke_width=6, stroke_linecap="round")
    if lit:
        out += circle(0, -34, 40, "url(#glow)", opacity=0.9)
        out += path("M 0 -60 Q 12 -34 0 -16 Q -12 -34 0 -60 Z", "#FFB21E")
        out += path("M 0 -46 Q 6 -32 0 -20 Q -6 -32 0 -46 Z", "#FFF3B0")
    return g(out, x, y, s)


def muggu(x, y, s=1.0, c1="#fff", c2="#E8414B", c3="#FFC93C"):
    import math
    out = ""
    for i in range(8):
        ang = i * 45
        out += path("M 0 0 Q 30 -30 0 -90 Q -30 -30 0 0 Z", c2, transform=f"rotate({ang})")
    for i in range(8):
        ang = i * 45 + 22.5
        out += path("M 0 0 Q 18 -24 0 -60 Q -18 -24 0 0 Z", c3, transform=f"rotate({ang})")
    out += circle(0, 0, 26, "#2E8B6E") + circle(0, 0, 12, c1)
    for i in range(16):
        ang = math.radians(i * 22.5)
        out += circle(110 * math.cos(ang), 110 * math.sin(ang), 5, c1)
    out += circle(0, 0, 118, "none", stroke=c1, stroke_width=3, stroke_dasharray="4 10")
    return g(out, x, y, s, transform_extra=None) if False else f'<g transform="translate({x},{y}) scale({s},{s*0.45})">{out}</g>'


def pongal_pot(x, y, s=1.0):
    out = path("M -60 -20 Q -80 -110 -40 -130 L 40 -130 Q 80 -110 60 -20 Q 0 10 -60 -20 Z", "#D9832B")
    out += rect(-46, -146, 92, 20, "#B8661C", rx=8)
    out += path("M -56 -70 Q 0 -50 56 -70", stroke="#FFF3B0", stroke_width=6, stroke_dasharray="2 12", stroke_linecap="round")
    out += path("M -44 -146 Q -50 -180 -20 -170 Q -10 -200 14 -176 Q 40 -196 46 -150 Z", "#FFFDF5")
    out += path("M -54 -100 Q -70 -80 -58 -60 M 54 -100 Q 70 -80 58 -60", stroke="#3E9A4E", stroke_width=10, stroke_linecap="round")
    out += path("M 0 -90 l 6 12 l 12 0 l -10 8 l 4 12 l -12 -8 l -12 8 l 4 -12 l -10 -8 l 12 0 Z", "#E8414B")
    return g(out, x, y, s)


def cake(x, y, s=1.0):
    out = ellipse(0, 0, 120, 22, "#fff") + rect(-90, -100, 180, 100, "#FFC4D6", rx=14)
    out += path("M -90 -70 Q -70 -50 -50 -70 Q -30 -50 -10 -70 Q 10 -50 30 -70 Q 50 -50 70 -70 Q 80 -60 90 -70 L 90 -100 L -90 -100 Z", "#fff")
    out += rect(-60, -150, 120, 54, "#B8E0FF", rx=12)
    out += path("M -60 -130 Q -40 -116 -20 -130 Q 0 -116 20 -130 Q 40 -116 60 -130 L 60 -150 L -60 -150 Z", "#fff")
    for i, cx in enumerate((-36, -12, 12, 36)):
        out += rect(cx - 5, -196, 10, 46, ["#E8414B", "#FFC93C", "#4FB3E8", "#2E8B6E"][i], rx=4)
        out += path(f"M {cx} -222 Q {cx+8} -206 {cx} -196 Q {cx-8} -206 {cx} -222 Z", "#FFB21E")
    for cx, cy, c in ((-60, -40, "#E8414B"), (-20, -30, "#2E8B6E"), (30, -44, "#FFC93C"), (64, -28, "#4FB3E8")):
        out += circle(cx, cy, 6, c)
    return g(out, x, y, s)


def balloon(x, y, c, s=1.0):
    return g(path("M 0 70 Q -10 110 6 160", stroke="#888", stroke_width=2)
             + ellipse(0, 0, 44, 54, c) + path("M -6 52 L 6 52 L 0 64 Z", c)
             + ellipse(-14, -18, 8, 16, "#fff", opacity=0.45), x, y, s)


def bunting(x1, y1, x2, n=10, sag=40):
    out = path(f"M {x1} {y1} Q {(x1+x2)/2} {y1+sag*2} {x2} {y1}", stroke="#8A5A3A", stroke_width=3)
    cols = ["#E8414B", "#FFC93C", "#4FB3E8", "#2E8B6E", "#FF8A65"]
    for i in range(n):
        t = (i + 0.5) / n
        px = x1 + (x2 - x1) * t
        py = y1 + 4 * t * (1 - t) * sag
        out += path(f"M {px-18} {py} L {px+18} {py} L {px} {py+36} Z", cols[i % 5])
    return out


def sparkle(x, y, r=40):
    out = ""
    import math
    for i in range(12):
        ang = math.radians(i * 30)
        out += line([(x + 8 * math.cos(ang), y + 8 * math.sin(ang)), (x + r * math.cos(ang), y + r * math.sin(ang))],
                    "#FFE27A" if i % 2 else "#FFFFFF", 4)
    return circle(x, y, r * 1.2, "url(#glow)") + out + circle(x, y, 8, "#fff")


def plant(x, y, s=1.0):
    out = path("M -34 0 L -40 -60 L 40 -60 L 34 0 Z", "#D9832B") + rect(-44, -70, 88, 14, "#B8661C", rx=6)
    for ang in (-50, -20, 10, 40, -80, 70):
        out += path("M 0 -70 Q 24 -130 0 -190 Q -24 -130 0 -70 Z", "#3E9A4E", transform=f"rotate({ang} 0 -70)")
    return g(out, x, y, s)


def lamp(x, y, s=1.0):
    return g(rect(-4, -200, 8, 200, "#8A5A3A") + ellipse(0, 0, 40, 10, "#8A5A3A")
             + path("M -50 -200 L 50 -200 L 32 -270 L -32 -270 Z", "#FFE5A8") + circle(0, -200, 70, "url(#glow)", opacity=0.6), x, y, s)


def wall_frame(x, y, w, h, inner_color="#BEE3F8", art="sun"):
    inner = rect(0, 0, w, h, inner_color, rx=4)
    if art == "sun":
        inner += circle(w * 0.3, h * 0.35, h * 0.16, "#FFC93C") + path(f"M 0 {h} L {w*0.4} {h*0.5} L {w*0.7} {h*0.8} L {w} {h*0.45} L {w} {h} Z", "#3E9A6E")
    elif art == "family":
        for i, c in enumerate(("#A3264A", "#F1EEE4", KUMKUM)):
            inner += circle(w * (0.25 + i * 0.25), h * 0.5, h * 0.18, "#B9794C") + rect(w * (0.25 + i * 0.25) - h * 0.17, h * 0.66, h * 0.34, h * 0.4, c, rx=6)
    return g(rect(-10, -10, w + 20, h + 20, "#8A5A3A", rx=8) + inner, x, y)


def svg_doc(body, bg="#FFF"):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">'
            f'{defs()}{rect(0, 0, W, H, bg)}{body}</svg>')
