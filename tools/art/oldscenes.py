from kit import *
from kit import KID_SKIN

FLOOR_Y = 640


def room(wall="#FFF1DC", floor="#E7C49A", wall2=None, floor_y=FLOOR_Y):
    s = rect(0, 0, W, floor_y, wall)
    if wall2:
        for x in range(0, W, 80):
            s += rect(x, 0, 40, floor_y, wall2, opacity=0.35)
    s += rect(0, floor_y, W, H - floor_y, floor)
    for x in range(-40, W, 160):
        s += path(f"M {x} {floor_y} L {x-60} {H}", stroke="#000", stroke_opacity=0.05, stroke_width=3)
    s += rect(0, floor_y - 14, W, 14, "#C99A6A")
    return s


def table(x, y, w, h=40, color="#B9783F", legs=True, cloth=None):
    s = ""
    if legs:
        s += rect(x + 20, y + h - 4, 22, 220, "#8A5426") + rect(x + w - 42, y + h - 4, 22, 220, "#8A5426")
    s += rect(x, y, w, h, color, rx=10) + rect(x, y + h - 10, w, 10, "#000", opacity=0.1)
    if cloth:
        s += path(f"M {x+40} {y} L {x+w-40} {y} L {x+w-20} {y+70} Q {x+w/2} {y+86} {x+20} {y+70} Z", cloth, opacity=0.95)
        s += path(f"M {x+30} {y+62} Q {x+w/2} {y+78} {x+w-30} {y+62}", stroke="#fff", stroke_width=5,
                  stroke_dasharray="2 14", stroke_linecap="round")
    return s


def bed_back(x, y, w):
    return (rect(x, y - 260, 40, 300, "#8A5426", rx=14) + rect(x + w - 40, y - 200, 40, 240, "#8A5426", rx=14)
            + rect(x + 10, y - 70, w - 20, 80, "#FFFFFF", rx=20)
            + ellipse(x + 110, y - 90, 80, 40, "#FFE6EE"))


def blanket(x, y, w, color="#4FB3E8"):
    s = path(f"M {x+40} {y} Q {x+w/2} {y-20} {x+w-10} {y} L {x+w-10} {y+110} L {x+30} {y+110} Z", color)
    for i in range(4):
        for j in range(2):
            s += star(x + 120 + i * ((w - 180) / 3), y + 30 + j * 46, 12, "#FFF3B0")
    s += rect(x + 10, y + 100, w - 20, 22, "#8A5426", rx=8)
    return s


def call_inner(w, h, who=("ammamma",), arms=None, mouth_="open", eyes_="open"):
    s = call_bg(w, h)
    n = len(who)
    for i, p in enumerate(who):
        sc = 0.95 if n == 1 else 0.72
        cx = w / 2 if n == 1 else w * (0.3 + 0.4 * i)
        head_y = h * (0.44 if n == 1 else 0.5)
        feet = head_y + (392 if p == "ammamma" else 400) * sc
        ar = (arms[i] if arms else ("down", "wave"))
        s += g(CAST[p](arms=ar, mouth_=mouth_ if i == 0 else "smile", eyes_=eyes_), cx, feet, sc)
    return s


def laptop(x, y, w, h, inner):
    s = tablet(0, 0, w, h, inner, color="#3A3A48")
    s += path(f"M {-50} {h+16} L {w+50} {h+16} L {w+90} {h+60} L {-90} {h+60} Z", "#B8BCC8")
    s += rect(w / 2 - 50, h + 40, 100, 12, "#9EA3B2", rx=6)
    return g(s, x, y)


def phone_on_stand(x, y, w, h, inner):
    return g(path(f"M {w/2-40} {h+40} L {w/2+40} {h+40} L {w/2+20} {h+14} L {w/2-20} {h+14} Z", "#555")
             + tablet(0, 0, w, h, inner, color="#22222C"), x, y)


def jug(x, y, s=1.0):
    return g(path("M -30 0 L -36 -90 Q 0 -100 36 -90 L 30 0 Z", "#C0C6D4")
             + path("M 36 -80 Q 64 -60 34 -26", stroke="#A7AEC0", stroke_width=10)
             + path("M -36 -90 L -52 -104 L -20 -96 Z", "#C0C6D4") + rect(-26, -70, 52, 8, "#fff", opacity=0.5), x, y, s)


def bowl(x, y, s=1.0, fill="#E8B04A"):
    return g(path("M -46 -24 Q 0 40 46 -24 Z", "#C0C6D4") + ellipse(0, -24, 46, 12, fill)
             + circle(-12, -27, 5, "#F7F2E2") + circle(10, -24, 4, "#3E9A4E") + circle(20, -28, 4, "#fff"), x, y, s)


def ladle(x, y, s=1.0, rot=0):
    return g(line([(0, 0), (0, -90)], "#9EA3B2", 8) + path("M -20 0 Q 0 26 20 0 Z", "#9EA3B2"), x, y, s, rot=rot)


def party_hat(x, y, s=1.0):
    return g(path("M -36 0 L 0 -90 L 36 0 Z", "#FFC93C") + path("M -24 -30 L 24 -30 M -14 -56 L 14 -56", stroke="#E8414B", stroke_width=8)
             + circle(0, -92, 10, "#E8414B"), x, y, s)


def door(x, y, w=220, h=380, color="#8A5426"):
    s = rect(-24, -24, w + 48, h + 24, "#F6E2B8") + rect(0, 0, w, h, color, rx=6)
    s += rect(14, 16, w / 2 - 20, h - 40, "#000", opacity=0.08, rx=4) + rect(w / 2 + 6, 16, w / 2 - 20, h - 40, "#000", opacity=0.08, rx=4)
    s += circle(w / 2 - 14, h / 2, 6, GOLD) + circle(w / 2 + 14, h / 2, 6, GOLD)
    s += rect(-30, h - 4, w + 60, 18, TURMERIC)
    for i in range(5):
        s += circle(-12 + i * ((w + 24) / 4), h + 5, 5, KUMKUM)
    return g(s, x, y)


def house_front(sky="url(#sky_day)", ground="#D9B486", ground_y=650, wall="#F6D6A6", roof="#C8552C"):
    s = rect(0, 0, W, ground_y, sky)
    s += path(f"M 120 {ground_y-430} L 600 {ground_y-560} L 1080 {ground_y-430} Z", roof)
    for i in range(8):
        s += path(f"M {150+i*120} {ground_y-438+ (i*0)} l 0 0", stroke="none")
    s += rect(160, ground_y - 440, 880, 440, wall)
    for xx in range(170, 1040, 46):
        s += path(f"M {xx} {ground_y-440} q 23 -16 46 0", stroke="#A84520", stroke_width=6)
    s += rect(0, ground_y, W, H - ground_y, ground)
    s += rect(160, ground_y - 30, 880, 30, "#E9C08C")
    return s


def windows_house(ground_y=650):
    s = ""
    for wx in (230, 850):
        s += rect(wx, ground_y - 330, 120, 150, "#5B8DB8", rx=6) + rect(wx - 10, ground_y - 340, 140, 12, "#8A5426")
        s += path(f"M {wx+40} {ground_y-330} V {ground_y-180} M {wx+80} {ground_y-330} V {ground_y-180}", stroke="#2B3A55", stroke_width=6)
    return s


def coconut_tree(x, y, s=1.0):
    t = path("M -12 0 Q 10 -200 40 -380 L 56 -378 Q 30 -200 14 0 Z", "#9A6A3A")
    for ang in (-150, -110, -60, -20, 20, 60):
        t += path("M 0 0 Q 70 -30 140 20 Q 70 -10 0 0 Z", "#2F8A4A", transform=f"translate(48,-380) rotate({ang})")
    t += circle(40, -364, 12, "#7A4B2A") + circle(58, -360, 12, "#7A4B2A")
    return g(t, x, y, s)


def hen(x, y, s=1.0):
    return g(ellipse(0, -40, 46, 36, "#fff") + circle(36, -78, 22, "#fff") + path("M 52 -80 l 18 6 l -18 6 z", "#F2A01E")
             + path("M 28 -100 q 6 -14 12 0 q 6 -14 12 0", "#E8414B") + circle(40, -82, 4, INK)
             + path("M -40 -56 Q -70 -80 -52 -36 Z", "#F0E6D8") + line([(-8, -6), (-8, 6)], "#F2A01E", 5)
             + line([(10, -6), (10, 6)], "#F2A01E", 5), x, y, s)


def tree(x, y, s=1.0):
    return g(rect(-16, -160, 32, 160, "#7A4B2A") + circle(0, -210, 90, "#3E9A4E") + circle(-60, -170, 60, "#3E9A4E")
             + circle(60, -170, 60, "#3E9A4E") + circle(-20, -240, 40, "#58B56C", opacity=0.8), x, y, s)


def butterfly(x, y, c="#FF8A65"):
    return g(ellipse(-12, -6, 14, 10, c) + ellipse(12, -6, 14, 10, c) + ellipse(-9, 8, 9, 7, c) + ellipse(9, 8, 9, 7, c)
             + rect(-2, -10, 4, 22, INK, rx=2), x, y)


def airplane(x, y, s=1.0):
    return g(path("M -160 0 Q -170 -24 -130 -26 L 140 -26 Q 180 -20 190 0 Q 180 18 140 20 L -130 20 Q -170 20 -160 0 Z", "#fff")
             + path("M -10 -20 L -70 -100 L -40 -100 L 50 -20 Z", "#D9E2EC") + path("M -10 16 L -50 70 L -26 70 L 40 16 Z", "#D9E2EC")
             + path("M -130 -24 L -170 -80 L -144 -80 L -100 -24 Z", "#E8414B")
             + "".join(rect(-90 + i * 30, -12, 16, 14, "#7CC6F2", rx=6) for i in range(8))
             + path("M 160 -16 Q 178 -10 182 0 L 160 0 Z", "#7CC6F2"), x, y, s)


def firework(x, y, r=70, c="#FFC93C"):
    import math
    out = ""
    for i in range(14):
        ang = math.radians(i * (360 / 14))
        out += line([(x + r * 0.3 * math.cos(ang), y + r * 0.3 * math.sin(ang)),
                     (x + r * math.cos(ang), y + r * math.sin(ang))], c, 5)
        out += circle(x + r * 1.12 * math.cos(ang), y + r * 1.12 * math.sin(ang), 5, c)
    return out


def stall(x, y):
    s = rect(-200, -200, 400, 22, "#8A5426")
    for i in range(8):
        s += path(f"M {-220+i*55} -330 L {-165+i*55} -330 L {-160+i*55} -270 Q {-187+i*55} -250 {-215+i*55} -270 Z",
                  "#E8414B" if i % 2 == 0 else "#FFF3DD")
    s += rect(-230, -340, 460, 16, "#C8452C", rx=6)
    s += rect(-190, -324, 12, 324, "#8A5426") + rect(178, -324, 12, 324, "#8A5426")
    s += rect(-200, -178, 400, 130, "#C98B4C", rx=10) + rect(-200, -60, 400, 16, "#8A5426")
    s += circle(-140, 0, 32, "#444") + circle(140, 0, 32, "#444") + circle(-140, 0, 12, "#999") + circle(140, 0, 12, "#999")
    # bananas
    for i in range(5):
        s += path(f"M {-170+i*14} -200 Q {-160+i*14} -250 {-120+i*14} -268 Q {-150+i*14} -240 {-156+i*14} -200 Z", "#FFD84A")
    # coconuts
    for cx in (-40, 0, 40, -20, 20):
        cy = -214 if cx in (-40, 0, 40) else -246
        s += circle(cx, cy, 22, "#7A4B2A") + circle(cx - 6, cy - 6, 4, "#5A3518")
    # mangoes & oranges
    for i, (cx, cy) in enumerate(((90, -214), (130, -214), (170, -216), (110, -244), (150, -244))):
        s += mango(cx - 10, cy - 18, 0.9) if i % 2 == 0 else circle(cx, cy, 20, "#FF9A2E")
    return g(s, x, y)


# ======================================================================= scenes

def s_1_1():
    b = room("#FFF1DC", "#E7C49A", wall2="#FFE2BE")
    b += window(90, 120, 300, 300, city_view(300, 300, snow=True), curtains="#4FB3E8")
    b += plant(1110, 640, 1.0)
    b += rect(560, 600, 520, 40, "#B9783F", rx=10) + rect(590, 636, 22, 140, "#8A5426") + rect(1030, 636, 22, 140, "#8A5426")
    b += phone_on_stand(620, 200, 400, 300, call_inner(400, 300, ("ammamma",), arms=[("down", "wave")], mouth_="open"))
    b += person("kid", 400, 830, 1.2, arms=("down", "wave"), mouth_="grin")
    return b


def s_1_2():
    b = room("#EAF6EF", "#E7C49A")
    for x in range(0, W, 60):
        for y in range(330, 560, 60):
            b += rect(x + 2, y + 2, 56, 56, "#fff", opacity=0.55, rx=6)
    b += window(110, 90, 260, 200, city_view(260, 200), curtains="#FF8A65")
    b += rect(760, 80, 340, 200, "#B9783F", rx=10) + rect(780, 100, 140, 160, "#D9965A", rx=6) + rect(940, 100, 140, 160, "#D9965A", rx=6)
    b += person("kid", 520, 860, 1.15, arms=("down", "point"), mouth_="open")
    b += table(220, 640, 820, 46, cloth="#FFC93C", legs=True)
    b += plate_rice(470, 660, 1.1)
    b += glass(640, 650, 1.0)
    b += phone_on_stand(780, 330, 230, 280, call_inner(230, 280, ("ammamma",), arms=[("down", "front")], mouth_="open"))
    return b


def s_1_3():
    b = room("#F3ECFF", "#E7C49A")
    for i, (x, y, c) in enumerate(((150, 120, "#FFC93C"), (300, 150, "#4FB3E8"), (190, 280, "#FF8A65"))):
        b += g(rect(-60, -50, 120, 100, "#fff") + circle(0, -6, 26, c) + rect(-4, -60, 8, 14, KUMKUM), x, y, rot=(-6 + i * 5))
    b += g(circle(0, 0, 56, "#fff", stroke="#8A5426", stroke_width=10) + line([(0, 0), (0, -34)], INK, 6)
           + line([(0, 0), (24, 10)], INK, 6), 1060, 130)
    b += table(620, 560, 470, 40)
    b += laptop(700, 300, 320, 220, call_inner(320, 220, ("tatayya",), arms=[("down", "wave")], mouth_="open"))
    b += school_bag(170, 820, 1.1)
    b += person("kid", 420, 830, 1.2, arms=("hip", "point"), mouth_="open")
    return b


def s_1_4():
    b = room("#3C3F7A", "#5A4A6A")
    b += window(110, 110, 300, 260, city_view(300, 260, sky="url(#sky_night)", night=True)
                + moon(230, 70, 34) + star(60, 40, 8) + star(120, 90, 6), curtains="#6A5ACD")
    for sx, sy in ((520, 80), (640, 140), (760, 60), (900, 120), (1080, 70)):
        b += star(sx, sy, 10, "#FFF3B0")
    b += lamp(1110, 640, 0.9)
    b += bed_back(420, 640, 560)
    b += g(kid(arms=("wave", "down"), pajamas=True, sitting=True, mouth_="smile", shirt="#8E7CF0"), 640, 640, 1.1)
    b += blanket(420, 590, 560, "#4FB3E8")
    b += rect(1000, 560, 160, 30, "#8A5426", rx=8) + rect(1010, 590, 140, 140, "#A76A35", rx=8)
    b += phone_on_stand(1020, 360, 130, 170, call_inner(130, 170, ("ammamma", "tatayya"),
                                                        arms=[("down", "wave"), ("wave", "down")], mouth_="smile"))
    b += rect(0, 0, W, H, "#1B2050", opacity=0.18)
    b += circle(1110, 440, 160, "url(#glow)", opacity=0.35)
    return b


def s_2_1():
    b = room("#FFF4DD", "#E7C49A")
    b += window(130, 90, 340, 300, rect(0, 0, 340, 300, "url(#sky_morning)") + sun(170, 140, 54)
                + cloud(30, 230, 0.6) + cloud(220, 70, 0.5), curtains=None)
    b += path("M 90 50 Q 30 260 60 460 L 20 460 L 20 50 Z", "#FFC93C") + path("M 510 50 Q 600 260 580 470 L 630 470 L 630 50 Z", "#FFC93C")
    b += rect(70, 40, 540, 16, "#8A5426", rx=8)
    b += path("M 470 120 L 700 640 L 300 640 Z", "#FFF3B0", opacity=0.35)
    b += person("amma", 600, 840, 1.0, flip=True, arms=("down", "reach"), eyes_="happy", mouth_="open")
    b += bed_back(700, 660, 440)
    b += g(kid(arms=("up", "up"), pajamas=True, sitting=True, eyes_="closed", mouth_="o", shirt="#FF8A65"), 900, 660, 1.0)
    b += blanket(700, 610, 440, "#2E8B6E")
    return b


def s_2_2():
    b = room("#FDEBD8", "#E7C49A", wall2="#FAD9B6")
    b += wall_frame(130, 110, 200, 150, art="sun")
    b += wall_frame(860, 100, 220, 160, art="family")
    b += person("nanna", 830, 900, 1.0, arms=("down", "front"), mouth_="smile")
    b += person("kid", 420, 860, 1.1, arms=("down", "point"), mouth_="open")
    b += table(140, 640, 920, 46, cloth="#4FB3E8")
    b += plate_rice(380, 666, 1.0)
    b += glass(580, 660, 1.0)
    b += bowl(720, 664, 1.0)
    b += jug(872, 646, 1.0)
    return b


def s_2_3():
    b = rect(0, 0, W, 560, "url(#sky_day)")
    b += cloud(120, 110, 1.0) + cloud(780, 70, 0.8) + sun(1080, 110, 50)
    b += path("M 0 520 Q 300 420 620 500 Q 900 560 1200 470 L 1200 900 L 0 900 Z", "#7CC96B")
    b += path("M 0 600 Q 400 540 800 600 Q 1000 630 1200 590 L 1200 900 L 0 900 Z", "#5DB45A")
    b += tree(150, 560, 1.0) + tree(1040, 540, 0.9)
    for fx, fy, c in ((90, 760, "#FFC93C"), (300, 820, "#FF8A65"), (980, 790, "#FFF"), (1130, 840, "#FFC93C"), (640, 860, "#FF8A65")):
        b += circle(fx, fy, 9, c) + circle(fx, fy, 4, "#E8414B")
    b += butterfly(560, 260, "#FF8A65") + butterfly(880, 330, "#8E7CF0")
    b += person("nanna", 330, 830, 1.0, arms=("down", "reach"), mouth_="open")
    b += ball(640, 330, 40)
    b += path("M 470 380 Q 540 300 600 330", stroke="#fff", stroke_width=4, stroke_dasharray="6 10", opacity=0.8)
    b += person("kid", 850, 840, 1.15, arms=("up", "up"), mouth_="grin", shirt="#2E8B6E")
    return b


def s_2_4():
    b = room("#34386F", "#4D426A")
    b += window(100, 100, 260, 230, rect(0, 0, 260, 230, "url(#sky_night)") + moon(150, 100, 46)
                + star(40, 50, 8) + star(220, 180, 7) + star(60, 180, 6), curtains="#8E7CF0")
    for sx, sy in ((480, 70), (620, 130), (760, 50), (980, 110), (1120, 60)):
        b += star(sx, sy, 12, "#FFF3B0")
    b += lamp(1120, 640, 0.9)
    b += circle(1120, 420, 220, "url(#glow)", opacity=0.4)
    b += bed_back(560, 660, 520)
    b += g(kid(arms=("down", "down"), pajamas=True, sitting=True, eyes_="happy", mouth_="smile", shirt="#4FB3E8"), 900, 660, 1.0)
    b += blanket(560, 610, 520, "#FF8A65")
    b += person("amma", 470, 860, 1.0, arms=("hold", "hold"), mouth_="open")
    b += book(470, 590, 0.9)
    return b


def s_3_1():
    b = rect(0, 0, W, 560, "#E9EEF4")
    b += rect(0, 40, W, 380, "url(#sky_day)")
    for x in range(0, W, 200):
        b += rect(x, 40, 12, 380, "#B6C2D0")
    b += cloud(80, 120, 0.8) + cloud(860, 90, 0.6)
    b += airplane(520, 230, 1.2)
    b += rect(0, 420, W, 30, "#B6C2D0")
    b += rect(0, 560, W, 340, "#D7DEE7")
    for x in range(-100, W, 140):
        b += path(f"M {x} 560 L {x-120} 900", stroke="#C3CCD8", stroke_width=4)
    b += g(rect(-120, -40, 240, 70, "#2E8B6E", rx=12) + airplane(-50, -6, 0.22) + path("M 30 -6 h 60 m -20 -16 l 20 16 l -20 16", stroke="#fff", stroke_width=8, stroke_linecap="round"), 600, 500)
    b += suitcase(170, 820, 1.0)
    b += person("kid", 340, 840, 1.15, arms=("down", "up"), mouth_="grin")
    b += person("ammamma", 820, 850, 1.0, arms=("up", "up"), mouth_="open", eyes_="happy")
    b += person("tatayya", 1040, 850, 1.0, arms=("up", "wave"), mouth_="grin")
    return b


def s_3_2():
    b = rect(0, 0, W, 640, "#F6E2B8")
    b += rect(0, 0, W, 640, "#FFF", opacity=0.0)
    b += rect(60, 120, 520, 18, "#8A5426", rx=6) + rect(60, 260, 520, 18, "#8A5426", rx=6)
    for i, x in enumerate(range(90, 560, 90)):
        b += path(f"M {x} 118 Q {x+30} 60 {x+60} 118 Z", "#C0C6D4") if i % 2 else rect(x, 70, 56, 48, "#C0C6D4", rx=10)
        b += rect(x, 206, 50, 54, "#D9832B" if i % 2 else "#C0C6D4", rx=12)
    b += window(760, 110, 280, 240, rect(0, 0, 280, 240, "url(#sky_day)") + coconut_tree(60, 300, 0.6)
                + coconut_tree(190, 300, 0.5), curtains=None, frame="#2E8B6E")
    b += rect(0, 640, W, 260, "#C9A36D")
    for x in range(0, W, 120):
        for y in range(640, 900, 90):
            b += rect(x + 3, y + 3, 114, 84, "#D8B47E", rx=4)
    b += thoranam(0, 0, W, 14, 0.9)
    b += person("ammamma", 720, 860, 1.05, arms=("down", "hold"), mouth_="open")
    b += bowl(735, 616, 1.0)
    b += shadow(400, 760, 140)
    b += ellipse(400, 712, 120, 40, "#2E4A7D")
    b += ellipse(300, 726, 30, 16, KID_SKIN) + ellipse(500, 726, 30, 16, KID_SKIN)
    b += g(kid(arms=("down", "wave"), sitting=True, mouth_="grin"), 400, 790, 1.1)
    b += plate_rice(400, 800, 1.3, leaf=True)
    return b


def s_3_3():
    b = rect(0, 0, W, 620, "url(#sky_day)")
    b += cloud(560, 80, 0.7) + cloud(980, 140, 0.6)
    b += rect(0, 620, W, 280, "#D9B486")
    b += path("M 760 330 L 960 230 L 1180 330 Z", "#C8552C") + rect(790, 330, 360, 290, "#F6D6A6")
    b += rect(920, 440, 100, 180, "#8A5426") + rect(820, 380, 70, 70, "#5B8DB8") + rect(1060, 380, 70, 70, "#5B8DB8")
    b += rect(0, 560, W, 60, "#C99A6A", opacity=0.6)
    b += mango_tree(300, 640, 1.15)
    b += hen(1080, 820, 0.8)
    b += person("tatayya", 520, 860, 1.0, arms=("down", "reach"), mouth_="grin")
    b += mango(612, 446, 1.3)
    b += person("kid", 760, 860, 1.15, arms=("up", "up"), mouth_="open")
    return b


def s_3_4():
    b = rect(0, 0, W, 600, "url(#sky_day)")
    b += path("M 0 600 L 0 300 L 140 300 L 140 220 L 300 220 L 300 340 L 420 340 L 420 260 L 600 260 L 600 600 Z", "#F2C98E")
    b += path("M 600 600 L 600 280 L 760 280 L 760 200 L 920 200 L 920 320 L 1200 320 L 1200 600 Z", "#E9A877")
    for x in range(30, 1180, 110):
        b += rect(x, 380, 40, 60, "#5B8DB8", opacity=0.8)
    b += rect(0, 600, W, 300, "#BFA27A")
    b += stall(380, 800)
    b += person("kid", 760, 850, 1.15, arms=("down", "point"), mouth_="open")
    b += person("ammamma", 980, 860, 1.0, arms=("hold", "down"), mouth_="smile")
    b += g(path("M -30 0 L 30 0 L 40 -70 L -40 -70 Z", "#2E8B6E") + path("M -24 -70 Q 0 -110 24 -70", stroke="#2E8B6E", stroke_width=6), 1000, 630)
    return b


def s_4_1():
    b = house_front("url(#sky_day)")
    b += windows_house()
    b += door(490, 270, 220, 380)
    b += thoranam(470, 250, 260, 9, 0.7)
    b += kite(260, 120, 0.9, -15) + kite(1000, 160, 0.7, 15, "#2E8B6E", "#FFC93C") + kite(720, 70, 0.6, 5, "#8E7CF0", "#FF8A65")
    b += muggu(600, 790, 1.2)
    for gx in (470, 730):
        b += ellipse(gx, 770, 22, 16, "#7A6A3A") + circle(gx, 756, 10, "#FFB21E")
    b += pongal_pot(380, 770, 0.6)
    b += person("tatayya", 170, 880, 1.0, arms=("down", "wave"), mouth_="smile")
    b += person("kid", 900, 870, 1.1, arms=("down", "reach"), mouth_="grin")
    b += path("M 1060 652 Q 1080 400 1000 170", stroke="#fff", stroke_width=3, opacity=0.9)
    return b


def s_4_2():
    b = house_front("url(#sky_morning)", wall="#FBE0B0")
    b += windows_house()
    b += door(490, 270, 220, 380, color="#7A4422")
    b += thoranam(450, 250, 300, 11, 0.8)
    b += muggu(600, 790, 1.1)
    b += plant(380, 650, 0.8) + plant(820, 650, 0.8)
    b += person("ammamma", 360, 870, 1.05, arms=("down", "hold"), mouth_="open", eyes_="happy")
    b += bowl(372, 600, 1.0, fill="#C9853B")
    b += person("kid", 780, 870, 1.15, arms=("hold", "hold"), mouth_="grin", shirt=TURMERIC)
    for x, y in ((120, 120), (1080, 160)):
        b += g("".join(circle(0, 0, 7, "#fff", transform=f"rotate({i*72}) translate(0,-10)") for i in range(5)) + circle(0, 0, 6, "#FFC93C"), x, y)
    return b


def s_4_3():
    b = house_front("url(#sky_dusk)", ground="#6E5A6E", wall="#E9B98A", roof="#7A3A3A")
    b += windows_house()
    b += door(490, 270, 220, 380, color="#5A2E1A")
    b += thoranam(470, 250, 260, 9, 0.7)
    b += firework(220, 130, 70, "#FFC93C") + firework(980, 110, 60, "#FF8A65") + firework(650, 70, 40, "#8EE3FF")
    b += rect(160, 620, 880, 30, "#C99A6A")
    for dx in range(200, 1020, 80):
        b += diya(dx, 625, 0.7)
    b += muggu(600, 790, 1.1, c1="#FFF3B0", c2="#FF8A65", c3="#FFC93C")
    b += person("nanna", 860, 880, 1.0, arms=("down", "down"), mouth_="grin")
    b += person("kid", 690, 870, 1.1, arms=("down", "reach"), mouth_="grin")
    b += line([(760, 718), (800, 660)], "#999", 4) + sparkle(806, 650, 44)
    b += person("amma", 320, 880, 1.0, arms=("down", "front"), eyes_="happy")
    b += diya(362, 668, 0.8)
    b += rect(0, 0, W, H, "#1B1240", opacity=0.12)
    return b


def s_4_4():
    b = room("#FFF0F4", "#E7C49A", wall2="#FFE0E9")
    b += bunting(0, 40, W, 14, 50)
    b += balloon(120, 200, "#E8414B") + balloon(200, 160, "#FFC93C") + balloon(1080, 190, "#4FB3E8") + balloon(1000, 230, "#8E7CF0")
    b += person("amma", 200, 860, 1.0, arms=("down", "up"), eyes_="happy", mouth_="open")
    b += person("nanna", 1070, 870, 1.0, arms=("up", "down"), mouth_="grin")
    b += person("kid", 620, 840, 1.1, arms=("up", "up"), mouth_="grin")
    b += party_hat(620, 840 - 330 * 1.1 + 4, 0.9)
    b += table(260, 700, 740, 40, cloth="#FFF")
    b += cake(400, 716, 0.85)
    b += phone_on_stand(790, 520, 160, 150, call_inner(160, 150, ("ammamma", "tatayya"),
                                                       arms=[("up", "up"), ("up", "up")], mouth_="open", eyes_="happy"))
    return b


SCENES = [
    # chapter, id, title_en, title_te, telugu line(s), transliteration, english, fn
    (1, "1-1", "Ammamma calls", "అమ్మమ్మ ఫోన్", [("అమ్మమ్మ", "ఎలా ఉన్నావు, చిన్నూ?", "ela unnaavu, chinnoo?", "How are you, Chinnu?"), ("చిన్నూ", "బాగున్నాను, అమ్మమ్మా!", "baagunnaanu, ammammaa!", "I'm fine, Ammamma!")], s_1_1),
    (1, "1-2", "Did you eat?", "అన్నం తిన్నావా?", [("అమ్మమ్మ", "అన్నం తిన్నావా?", "annam tinnaavaa?", "Did you eat?"), ("చిన్నూ", "తింటున్నాను, చూడు!", "tintunnaanu, choodu!", "I'm eating, look!")], s_1_2),
    (1, "1-3", "How was school?", "బడి ఎలా ఉంది?", [("తాతయ్య", "బడి ఎలా ఉంది?", "badi elaa undi?", "How was school?"), ("చిన్నూ", "చాలా బాగుంది!", "chaalaa baagundi!", "It was very good!")], s_1_3),
    (1, "1-4", "Good night", "ఇంక పడుకో", [("అమ్మమ్మ", "ఇంక పడుకో, నాన్నా.", "inka paduko, naannaa.", "Go to sleep now, dear."), ("చిన్నూ", "సరే! బై బై!", "sare! bai bai!", "Okay! Bye bye!")], s_1_4),
    (2, "2-1", "Wake up!", "లే, తెల్లారింది!", [("అమ్మ", "లే, తెల్లారింది!", "le, tellaarindi!", "Get up, it's morning!"), ("చిన్నూ", "ఇంకా నిద్ర వస్తోంది...", "inkaa nidra vastondi...", "I'm still sleepy...")], s_2_1),
    (2, "2-2", "Lunch time", "భోజనం", [("చిన్నూ", "నాకు నీళ్ళు కావాలి.", "naaku neellu kaavaali.", "I want water."), ("నాన్న", "ఇదిగో, తీసుకో.", "idigo, teesuko.", "Here, take it.")], s_2_2),
    (2, "2-3", "Playtime", "ఆట సమయం", [("నాన్న", "బంతి పట్టుకో!", "banti pattuko!", "Catch the ball!"), ("చిన్నూ", "పట్టుకున్నా!", "pattukunnaa!", "I caught it!")], s_2_3),
    (2, "2-4", "Bedtime story", "కథ చెప్పు", [("చిన్నూ", "అమ్మా, కథ చెప్పు!", "ammaa, katha cheppu!", "Amma, tell me a story!"), ("అమ్మ", "సరే, విను.", "sare, vinu.", "Okay, listen.")], s_2_4),
    (3, "3-1", "We're here!", "వచ్చేశాం!", [("చిన్నూ", "తాతయ్యా! అమ్మమ్మా!", "taatayyaa! ammammaa!", "Tatayya! Ammamma!"), ("తాతయ్య", "రా, నాన్నా, రా!", "raa, naannaa, raa!", "Come, dear, come!")], s_3_1),
    (3, "3-2", "Ammamma's kitchen", "అమ్మమ్మ వంట", [("అమ్మమ్మ", "ఇంకొంచెం తిను.", "inkonchem tinu.", "Eat a little more."), ("చిన్నూ", "చాలా రుచిగా ఉంది!", "chaalaa ruchigaa undi!", "It's very tasty!")], s_3_2),
    (3, "3-3", "The mango tree", "మామిడి చెట్టు", [("చిన్నూ", "నాకు మామిడి పండు కావాలి!", "naaku maamidi pandu kaavaali!", "I want a mango!"), ("తాతయ్య", "ఇదిగో, తీసుకో.", "idigo, teesuko.", "Here, take it.")], s_3_3),
    (3, "3-4", "At the market", "సంతలో", [("చిన్నూ", "అది ఏమిటి?", "adi aemiti?", "What is that?"), ("అమ్మమ్మ", "అది కొబ్బరికాయ.", "adi kobbarikaaya.", "That is a coconut.")], s_3_4),
    (4, "4-1", "Sankranti", "సంక్రాంతి", [("చిన్నూ", "గాలిపటం ఎగురుతోంది!", "gaalipatam egurutondi!", "The kite is flying!"), ("తాతయ్య", "ఇంకా పైకి!", "inkaa paiki!", "Higher!")], s_4_1),
    (4, "4-2", "Ugadi", "ఉగాది", [("అమ్మమ్మ", "ఉగాది పచ్చడి తిను.", "ugaadi pachchadi tinu.", "Eat the Ugadi pachadi."), ("చిన్నూ", "తీపి, పులుపు, చేదు!", "teepi, pulupu, chedu!", "Sweet, sour, bitter!")], s_4_2),
    (4, "4-3", "Deepavali", "దీపావళి", [("అమ్మ", "దీపాలు వెలిగిద్దాం!", "deepaalu veligiddaam!", "Let's light the lamps!"), ("చిన్నూ", "ఎంత అందంగా ఉంది!", "enta andangaa undi!", "How beautiful it is!")], s_4_3),
    (4, "4-4", "My birthday", "నా పుట్టినరోజు", [("అందరూ", "పుట్టినరోజు శుభాకాంక్షలు!", "puttinaroju shubhaakaankshalu!", "Happy birthday!"), ("చిన్నూ", "థాంక్యూ! నాకు చాలా సంతోషంగా ఉంది!", "thaankyoo! naaku chaalaa santoshangaa undi!", "Thank you! I'm so happy!")], s_4_4),
]

CHAPTERS = {1: ("Calling Ammamma", "అమ్మమ్మకి ఫోన్"), 2: ("My day", "నా రోజు"),
            3: ("Trip to India", "ఊరికి ప్రయాణం"), 4: ("Festivals", "పండుగలు")}
