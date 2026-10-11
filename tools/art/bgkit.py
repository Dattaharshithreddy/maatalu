"""Backgrounds (1200 x 900) and props for Maatalu scenes. Props are drawn around (0, 0) = their base."""
import math
from kit import (path, circle, ellipse, rect, g, line, cloud, sun, moon, star, window, city_view, thoranam,
                 plate_rice, glass, ball, book, school_bag, suitcase, mango, mango_tree, kite, diya, muggu,
                 pongal_pot, cake, balloon, bunting, sparkle, plant, lamp, wall_frame, LEAF, LEAF_L, GOLD, KUMKUM, TURMERIC)
from oldscenes import (room, table, bed_back, blanket, jug, bowl, party_hat, door, house_front, windows_house,
                       coconut_tree, hen, tree, butterfly, airplane, firework, stall)

W, H = 1200, 900
OLC = "#5A3A28"

DEFS = """<defs>
<linearGradient id="sky_day" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7CC6F2"/><stop offset="1" stop-color="#D9F1FF"/></linearGradient>
<linearGradient id="sky_morning" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFD7A8"/><stop offset="1" stop-color="#FFF4DD"/></linearGradient>
<linearGradient id="sky_night" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1B2050"/><stop offset="1" stop-color="#3C3F86"/></linearGradient>
<linearGradient id="sky_dusk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2A2560"/><stop offset="0.6" stop-color="#7B4B8E"/><stop offset="1" stop-color="#F08A5D"/></linearGradient>
<linearGradient id="sky_rain" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7D8CA3"/><stop offset="1" stop-color="#C9D3DF"/></linearGradient>
<linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2FA4D9"/><stop offset="1" stop-color="#7FD3F0"/></linearGradient>
<radialGradient id="glow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#FFE9A0" stop-opacity="0.95"/><stop offset="1" stop-color="#FFE9A0" stop-opacity="0"/></radialGradient>
<radialGradient id="screen_glow" cx="0.5" cy="0.4" r="0.7"><stop offset="0" stop-color="#FFF8E6"/><stop offset="1" stop-color="#F5E3C2"/></radialGradient>
</defs>"""

# Where a video-call screen sits on the 'call' backgrounds (x, y, w, h).
SCREEN = (600, 110, 500, 400)


def sofa(x, y, c="#E8862E"):
    s = rect(-200, -160, 400, 110, c, rx=40) + rect(-230, -110, 80, 120, c, rx=30) + rect(150, -110, 80, 120, c, rx=30)
    s += rect(-170, -70, 340, 70, c, rx=20) + rect(-170, -70, 340, 70, "#000", rx=20, opacity=0.08)
    s += rect(-190, 0, 20, 30, "#7A4422") + rect(170, 0, 20, 30, "#7A4422")
    return g(s, x, y)


def rug(x, y, w=520, c="#C8452C"):
    return g(ellipse(0, 0, w / 2, w / 9, c) + ellipse(0, 0, w / 2 - 22, w / 9 - 10, "none", stroke="#FFE08A", stroke_width=5,
                                                                     stroke_dasharray="10 10"), x, y)


def floor_tiles(y0, c1="#E7C49A", c2="#DDB585"):
    s = rect(0, y0, W, H - y0, c1)
    for i, x in enumerate(range(-200, W + 200, 120)):
        s += path(f"M{x} {y0} L{x - (x - 600) * 0.6} {H}", stroke=c2, stroke_width=4)
    for y in (y0 + 60, y0 + 140, y0 + 240):
        s += path(f"M0 {y} H{W}", stroke=c2, stroke_width=3)
    return s


# ======================================================================= backgrounds

def bg_living():
    s = room("#FFF1DC", "#E7C49A", wall2="#FFE2BE")
    s += window(90, 110, 300, 280, city_view(300, 280), curtains="#4FB3E8")
    s += wall_frame(520, 140, 170, 120, art="family") + wall_frame(760, 120, 140, 160, art="sun")
    s += sofa(820, 640, "#E8862E") + plant(1110, 640, 1.1) + rug(600, 790)
    return s


def bg_living_snow():
    s = room("#FFF1DC", "#E7C49A", wall2="#FFE2BE")
    s += window(90, 110, 300, 280, city_view(300, 280, snow=True), curtains="#4FB3E8")
    s += wall_frame(520, 140, 170, 120, art="family") + lamp(1080, 640) + sofa(800, 640, "#2E8B6E") + rug(600, 790, c="#8E7CF0")
    return s


def bg_call():
    s = room("#FFF1DC", "#E7C49A", wall2="#FFE2BE")
    s += window(70, 110, 260, 250, city_view(260, 250), curtains="#4FB3E8")
    x, y, w, h = SCREEN
    s += rect(560, 600, 590, 34, "#B86A2E", rx=10, stroke="#5A3A28", stroke_width=5)
    s += rect(590, 632, 24, 200, "#94521F") + rect(1096, 632, 24, 200, "#94521F")
    s += path(f"M{x + w / 2 - 60} 600 L{x + w / 2 - 30} {y + h + 30} L{x + w / 2 + 30} {y + h + 30} L{x + w / 2 + 60} 600 Z", "#4A4A5A")
    s += rect(x - 24, y - 24, w + 48, h + 48, "#2B2B3A", rx=34, stroke="#5A3A28", stroke_width=5)
    s += circle(x + w / 2, y - 12, 4, "#666")
    # the grandparents' room in India, behind them on the screen
    s += f'<clipPath id="scr"><rect x="{x}" y="{y}" width="{w}" height="{h}" rx="16"/></clipPath><g clip-path="url(#scr)">'
    s += rect(x, y, w, h, "#F7D3A0") + rect(x, y + h * 0.78, w, h * 0.22, "#E5B97A")
    s += rect(x + w - 110, y + 40, 90, h, "#8A4F22") + rect(x + w - 98, y + 54, 66, h, "#A9622A")
    s += g(rect(0, 0, 70, 86, "#8A4F22", rx=6) + rect(8, 8, 54, 70, "#FFD27A", rx=4) + circle(35, 40, 15, "#E8862E"), x + 26, y + 46)
    s += thoranam(x, y + 6, w, 9, 0.7)
    s += "</g>"
    s += plant(1150, 600, 0.6)
    return s


def bg_kitchen_abroad():
    s = room("#EAF6EF", "#E7C49A")
    for x in range(0, W, 60):
        for y in range(330, 560, 60):
            s += rect(x + 2, y + 2, 56, 56, "#fff", opacity=0.55, rx=6)
    s += window(110, 90, 260, 200, city_view(260, 200), curtains="#FF8A65")
    s += rect(760, 80, 340, 200, "#B9783F", rx=10) + rect(780, 100, 140, 160, "#D9965A", rx=6) + rect(940, 100, 140, 160, "#D9965A", rx=6)
    s += rect(700, 560, 500, 90, "#C98B4C") + rect(700, 560, 500, 16, "#9E6430")
    s += rect(1000, 300, 170, 260, "#E9EEF4", rx=14) + rect(1000, 420, 170, 6, "#C9D3DF") + rect(1150, 330, 8, 60, "#9EA3B2", rx=4)
    return s


def bg_dining():
    s = room("#FDEBD8", "#E7C49A", wall2="#FAD9B6")
    s += wall_frame(130, 110, 200, 150, art="sun") + wall_frame(860, 100, 220, 160, art="family")
    s += lamp(600, 300, 0.0001)
    s += g(path("M0 0 L0 120", stroke="#7A4422", stroke_width=4) + path("M-60 120 L60 120 L40 170 L-40 170 Z", "#F2B705"), 600, 0)
    s += circle(600, 190, 120, "url(#glow)", opacity=0.5)
    return s


def bg_bedroom(night=False):
    if night:
        s = room("#3C3F7A", "#5A4A6A")
        s += window(110, 110, 300, 260, city_view(300, 260, sky="url(#sky_night)", night=True) + moon(230, 70, 34)
                    + star(60, 40, 8) + star(120, 90, 6), curtains="#6A5ACD")
        for sx, sy in ((520, 80), (640, 140), (760, 60), (900, 120), (1080, 70)):
            s += star(sx, sy, 10, "#FFF3B0")
        s += lamp(1110, 640, 0.9) + circle(1110, 420, 160, "url(#glow)", opacity=0.35)
    else:
        s = room("#FFF4DD", "#E7C49A")
        s += window(130, 90, 340, 300, rect(0, 0, 340, 300, "url(#sky_morning)") + sun(170, 140, 54) + cloud(30, 230, 0.6), curtains="#FFC93C")
        s += path("M470 120 L700 640 L300 640 Z", "#FFF3B0", opacity=0.3)
    s += bed_back(640, 660, 520) + blanket(640, 610, 520, "#4FB3E8" if not night else "#FF8A65")
    return s


def bg_park():
    s = rect(0, 0, W, 560, "url(#sky_day)") + cloud(120, 110, 1.0) + cloud(780, 70, 0.8) + sun(1080, 110, 50)
    s += path("M0 520 Q300 420 620 500 Q900 560 1200 470 L1200 900 L0 900 Z", "#7CC96B")
    s += path("M0 600 Q400 540 800 600 Q1000 630 1200 590 L1200 900 L0 900 Z", "#5DB45A")
    s += tree(150, 560, 1.0) + tree(1040, 540, 0.9)
    for fx, fy, c in ((90, 760, "#FFC93C"), (300, 820, "#FF8A65"), (980, 790, "#FFF"), (1130, 840, "#FFC93C"), (640, 860, "#FF8A65")):
        s += circle(fx, fy, 9, c) + circle(fx, fy, 4, "#E8414B")
    s += butterfly(560, 260, "#FF8A65") + butterfly(880, 330, "#8E7CF0")
    return s


def bg_school():
    s = room("#F3ECFF", "#D9B486")
    s += rect(330, 120, 540, 300, "#2F5D4A", rx=10, stroke="#8A5426", stroke_width=16)
    s += path("M380 200 h60 M380 260 h120 M560 200 q20 -30 40 0 q20 30 40 0", stroke="#FFFFFF", stroke_width=6, opacity=0.8, fill="none")
    s += g(path("M0 0 l14 -26 l14 26 Z", "#FFD24A"), 720, 300) + rect(330, 420, 540, 14, "#8A5426")
    for i, (x, y, c) in enumerate(((120, 160, "#FFC93C"), (1060, 150, "#4FB3E8"), (1060, 330, "#FF8A65"))):
        s += g(rect(-60, -50, 120, 100, "#fff") + circle(0, -6, 26, c) + rect(-4, -60, 8, 14, KUMKUM), x, y, rot=(-6 + i * 5))
    s += g(circle(0, 0, 50, "#fff", stroke="#8A5426", stroke_width=10) + line([(0, 0), (0, -30)], "#2B1B14", 6) + line([(0, 0), (22, 10)], "#2B1B14", 6), 160, 380)
    return s


def bg_airport():
    s = rect(0, 0, W, 560, "#E9EEF4") + rect(0, 40, W, 380, "url(#sky_day)")
    for x in range(0, W, 200):
        s += rect(x, 40, 12, 380, "#B6C2D0")
    s += cloud(80, 120, 0.8) + cloud(860, 90, 0.6) + airplane(560, 230, 1.2)
    s += rect(0, 420, W, 30, "#B6C2D0") + rect(0, 560, W, 340, "#D7DEE7")
    for x in range(-100, W, 140):
        s += path(f"M{x} 560 L{x - 120} 900", stroke="#C3CCD8", stroke_width=4)
    s += g(rect(-120, -40, 240, 70, "#2E8B6E", rx=12) + airplane(-50, -6, 0.22)
           + path("M30 -6 h60 m-20 -16 l20 16 l-20 16", stroke="#fff", stroke_width=8, stroke_linecap="round", fill="none"), 600, 500)
    return s


def bg_house(kind="day"):
    if kind == "dusk":
        s = house_front("url(#sky_dusk)", ground="#6E5A6E", wall="#E9B98A", roof="#7A3A3A")
    elif kind == "morning":
        s = house_front("url(#sky_morning)", wall="#FBE0B0")
    else:
        s = house_front("url(#sky_day)")
    s += windows_house() + door(490, 270, 220, 380, color="#7A4422" if kind != "dusk" else "#5A2E1A")
    s += thoranam(470, 250, 260, 9, 0.7)
    if kind == "dusk":
        s += rect(0, 0, W, H, "#1B1240", opacity=0.12)
    else:
        s += cloud(60, 90, 0.7) + cloud(1020, 60, 0.6)
    return s


def bg_india_kitchen():
    s = rect(0, 0, W, 640, "#F6E2B8")
    s += rect(60, 120, 520, 18, "#8A5426", rx=6) + rect(60, 260, 520, 18, "#8A5426", rx=6)
    for i, x in enumerate(range(90, 560, 90)):
        s += path(f"M{x} 118 Q{x + 30} 60 {x + 60} 118 Z", "#C0C6D4") if i % 2 else rect(x, 70, 56, 48, "#C0C6D4", rx=10)
        s += rect(x, 206, 50, 54, "#D9832B" if i % 2 else "#C0C6D4", rx=12)
    s += window(760, 110, 280, 240, rect(0, 0, 280, 240, "url(#sky_day)") + coconut_tree(60, 300, 0.6) + coconut_tree(190, 300, 0.5),
                curtains=None, frame="#2E8B6E")
    s += rect(0, 640, W, 260, "#C9A36D")
    for x in range(0, W, 120):
        for y in range(640, 900, 90):
            s += rect(x + 3, y + 3, 114, 84, "#D8B47E", rx=4)
    s += thoranam(0, 0, W, 14, 0.9)
    return s


def tulasi(x, y, s=1.0):
    t = rect(-60, -150, 120, 150, "#E9C08C", stroke="#8A5426", stroke_width=6) + rect(-70, -170, 140, 24, "#D9832B")
    t += path("M-30 -95 L0 -125 L30 -95 Z", "#C8452C") + circle(0, -70, 12, KUMKUM)
    for ang in (-40, -15, 15, 40, 0):
        t += path("M0 -170 Q20 -230 0 -280 Q-20 -230 0 -170 Z", "#3E9A4E", transform=f"rotate({ang} 0 -170)")
    return g(t, x, y, s)


def bg_courtyard():
    s = rect(0, 0, W, 600, "url(#sky_day)") + cloud(560, 80, 0.7) + cloud(980, 140, 0.6)
    s += rect(0, 600, W, 300, "#D9B486")
    s += path("M760 330 L960 230 L1180 330 Z", "#C8552C") + rect(790, 330, 360, 290, "#F6D6A6")
    s += rect(920, 440, 100, 180, "#8A5426") + rect(820, 380, 70, 70, "#5B8DB8") + rect(1060, 380, 70, 70, "#5B8DB8")
    s += rect(0, 560, W, 50, "#C99A6A", opacity=0.6)
    s += mango_tree(220, 640, 1.0) + tulasi(560, 700, 0.7)
    return s


def bg_terrace(dusk=False):
    s = rect(0, 0, W, 640, "url(#sky_dusk)" if dusk else "url(#sky_day)")
    if not dusk:
        s += cloud(100, 100, 0.8) + cloud(820, 160, 0.6)
    # rooftops of the street
    for i, (x, w, h, c) in enumerate(((0, 220, 220, "#F2C98E"), (220, 180, 300, "#E9A877"), (400, 240, 200, "#F6D6A6"),
                                       (640, 200, 280, "#EAB98C"), (840, 360, 220, "#F2C98E"))):
        s += rect(x, 640 - h, w, h, c) + rect(x, 640 - h, w, 14, "#000", opacity=0.08)
        s += rect(x + 30, 640 - h + 50, 40, 50, "#5B8DB8", opacity=0.8)
    s += rect(0, 640, W, 260, "#C9B49A") + rect(0, 640, W, 40, "#B5A089")
    for x in range(0, W, 60):
        s += rect(x, 600, 40, 60, "#D8C6AE", stroke="#B5A089", stroke_width=3)
    s += path("M0 560 Q300 600 600 560 Q900 600 1200 560", stroke="#7A6A5A", stroke_width=2, fill="none")
    return s


def gopuram(x, y, s=1.0):
    t = ""
    for i in range(6):
        w = 300 - i * 42
        t += rect(-w / 2, -60 - i * 56, w, 58, ["#F2B94A", "#E8862E", "#F2B94A", "#E8862E", "#F2B94A", "#E8862E"][i], stroke="#8A4F22", stroke_width=4)
        for k in range(int(w // 34)):
            t += rect(-w / 2 + 8 + k * 34, -50 - i * 56, 18, 30, "#8A4F22", rx=6, opacity=0.5)
    t += path("M-48 -396 Q0 -470 48 -396 Z", "#F2B94A", stroke="#8A4F22", stroke_width=4)
    t += circle(0, -470, 10, GOLD)
    t += rect(-80, -70, 160, 70, "#5A2E1A") + path("M-80 -70 Q0 -130 80 -70 Z", "#5A2E1A")
    return g(t, x, y, s)


def bg_temple():
    s = rect(0, 0, W, 640, "url(#sky_day)") + cloud(80, 90, 0.7) + cloud(980, 60, 0.6)
    s += gopuram(600, 640, 1.2)
    s += rect(0, 620, W, 280, "#E3C79B")
    for x in range(0, W, 100):
        s += rect(x, 620, 96, 26, "#D3B285")
    s += rect(80, 420, 30, 220, "#C9A36D") + rect(1090, 420, 30, 220, "#C9A36D")
    s += bunting(0, 420, 1200, 16, 30)
    s += coconut_tree(60, 640, 0.8) + coconut_tree(1140, 640, 0.75)
    return s


def bg_puja():
    s = room("#FFE6C2", "#E7C49A")
    s += rect(330, 100, 540, 420, "#8A4F22", rx=18) + rect(350, 120, 500, 380, "#F7D08A", rx=12)
    s += path("M350 120 Q600 40 850 120", fill="#8A4F22")
    s += thoranam(350, 130, 500, 11, 0.8)
    for x in (430, 600, 770):
        s += g(rect(-40, -120, 80, 120, "#E8862E", rx=30) + circle(0, -150, 34, "#F2B94A") + circle(0, -150, 18, "#FFF3B0"), x, 430)
    s += rect(350, 430, 500, 70, "#B86A2E")
    for x in (400, 520, 680, 800):
        s += diya(x, 470, 0.8)
    s += circle(600, 320, 300, "url(#glow)", opacity=0.35)
    return s


def bg_market():
    s = rect(0, 0, W, 600, "url(#sky_day)")
    s += path("M0 600 L0 300 L140 300 L140 220 L300 220 L300 340 L420 340 L420 260 L600 260 L600 600 Z", "#F2C98E")
    s += path("M600 600 L600 280 L760 280 L760 200 L920 200 L920 320 L1200 320 L1200 600 Z", "#E9A877")
    for x in range(30, 1180, 110):
        s += rect(x, 380, 40, 60, "#5B8DB8", opacity=0.8)
    s += rect(0, 600, W, 300, "#BFA27A") + bunting(0, 120, 1200, 18, 40)
    return s


def cow(x, y, s=1.0):
    c = ellipse(0, -110, 130, 70, "#FFFFFF", stroke="#5A3A28", stroke_width=5)
    c += ellipse(-40, -130, 40, 26, "#C9B49A") + ellipse(50, -90, 30, 20, "#C9B49A")
    for lx in (-80, -40, 50, 90):
        c += rect(lx - 10, -60, 20, 60, "#FFFFFF", stroke="#5A3A28", stroke_width=4)
    c += ellipse(150, -150, 44, 36, "#FFFFFF", stroke="#5A3A28", stroke_width=5) + ellipse(176, -136, 22, 16, "#F7B7B0")
    c += path("M130 -182 Q120 -214 110 -220 M170 -184 Q178 -216 190 -222", stroke="#C9A36D", stroke_width=10, stroke_linecap="round")
    c += circle(150, -156, 5, "#2B1B14") + path("M-130 -120 Q-160 -90 -150 -60", stroke="#5A3A28", stroke_width=6, fill="none")
    c += circle(150, -112, 8, GOLD)
    return g(c, x, y, s)


def bg_farm():
    s = rect(0, 0, W, 520, "url(#sky_day)") + sun(1060, 110, 54) + cloud(140, 100, 0.8)
    s += path("M0 500 Q300 430 600 480 Q900 530 1200 450 L1200 900 L0 900 Z", "#8CCB5E")
    for i in range(8):
        s += path(f"M0 {560 + i * 45} Q600 {520 + i * 45} 1200 {560 + i * 45}", stroke="#6FB24A", stroke_width=10, fill="none")
    s += coconut_tree(100, 560, 0.9) + coconut_tree(1120, 540, 0.8)
    s += g(path("M-100 0 L-60 -90 L60 -90 L100 0 Z", "#C8552C") + rect(-90, 0, 180, 80, "#F6D6A6"), 900, 480)
    return s


def bg_river():
    s = rect(0, 0, W, 460, "url(#sky_morning)") + sun(900, 200, 60)
    s += path("M0 380 Q200 340 400 380 Q700 420 1200 360 L1200 460 L0 460 Z", "#5DA35A")
    s += rect(0, 460, W, 240, "url(#sea)")
    for y in (520, 580, 640):
        s += path(f"M0 {y} Q150 {y - 14} 300 {y} T600 {y} T900 {y} T1200 {y}", stroke="#FFFFFF", stroke_width=4, opacity=0.6, fill="none")
    s += g(path("M-120 0 Q0 50 120 0 L100 -20 L-100 -20 Z", "#8A4F22") + path("M0 -20 L0 -150 L70 -40 Z", "#FFF3DD"), 820, 560)
    for i in range(5):
        s += rect(80 + i * 60, 700 + i * 0, 240 + 0, 40, "#C9A36D") if False else ""
    s += rect(0, 700, W, 200, "#D9B486")
    for i in range(5):
        s += rect(0, 700 + i * 40, W, 6, "#C49A68")
    return s


def bg_train():
    s = rect(0, 0, W, H, "#5B8DB8")
    s += rect(0, 0, W, 120, "#3E6D96")
    for x in (80, 460, 840):
        s += rect(x, 150, 300, 220, "#2E4A6B", rx=26) + g(rect(0, 0, 280, 200, "url(#sky_day)") + path("M0 150 Q70 110 140 150 T280 140 L280 200 L0 200 Z", "#7CC96B")
                                                            + coconut_tree(200, 190, 0.35), x + 10, 160)
        for k in range(4):
            s += rect(x + 10, 170 + k * 48, 280, 4, "#2E4A6B")
    s += rect(0, 470, W, 160, "#2E6B4F") + rect(0, 470, W, 30, "#25563F")
    for x in range(40, W, 300):
        s += rect(x, 500, 240, 120, "#3E8A64", rx=16)
    s += rect(0, 630, W, 270, "#8C8C99")
    return s


def bg_beach():
    s = rect(0, 0, W, 420, "url(#sky_day)") + sun(1000, 120, 56) + cloud(120, 100, 0.7)
    s += rect(0, 400, W, 200, "url(#sea)")
    s += path("M0 560 Q150 540 300 560 T600 560 T900 560 T1200 560 L1200 900 L0 900 Z", "#F4DDA6")
    s += path("M0 560 Q150 540 300 560 T600 560 T900 560 T1200 560", stroke="#FFFFFF", stroke_width=10, fill="none")
    s += coconut_tree(1100, 620, 0.9)
    s += g(path("M-50 0 L-40 -50 L40 -50 L50 0 Z", "#E9C27A") + rect(-30, -80, 60, 30, "#E9C27A") + path("M0 -80 L0 -120 L30 -110 L0 -100", "#E8414B"), 160, 760)
    return s


def bg_party():
    s = room("#FFF0F4", "#E7C49A", wall2="#FFE0E9")
    s += bunting(0, 40, W, 14, 50)
    s += balloon(110, 210, "#E8414B") + balloon(190, 170, "#FFC93C") + balloon(1090, 200, "#4FB3E8") + balloon(1010, 240, "#8E7CF0")
    return s


def bg_mandapam():
    s = rect(0, 0, W, H, "#7A1F3D")
    s += rect(0, 640, W, 260, "#C8452C")
    for x in (150, 1050):
        s += rect(x - 26, 120, 52, 520, "#F2B94A", stroke="#8A4F22", stroke_width=5)
        for y in range(160, 620, 80):
            s += rect(x - 30, y, 60, 14, "#E8862E")
    s += path("M124 120 Q600 -20 1076 120 L1076 160 Q600 30 124 160 Z", "#F2B94A", stroke="#8A4F22", stroke_width=5)
    for i in range(14):
        x = 170 + i * 66
        s += line([(x, 140), (x, 260 + (i % 3) * 30)], "#FFFFFF", 4)
        for k in range(4):
            s += circle(x, 160 + k * 30, 8, "#FFFFFF" if k % 2 else "#F28A1E")
    s += thoranam(124, 150, 952, 18, 0.9)
    s += circle(600, 420, 380, "url(#glow)", opacity=0.25)
    return s


def bg_night_sky():
    s = rect(0, 0, W, H, "url(#sky_night)")
    import random
    r = random.Random(3)
    for _ in range(40):
        s += star(r.uniform(0, W), r.uniform(0, 500), r.uniform(4, 10), "#FFF3B0")
    s += moon(980, 140, 60)
    s += rect(0, 640, W, 260, "#4A4568")
    for x in range(0, W, 60):
        s += rect(x, 600, 40, 60, "#5C5680", stroke="#3E3A5C", stroke_width=3)
    return s


def bg_rain():
    s = rect(0, 0, W, 640, "url(#sky_rain)")
    for i, (x, w, h, c) in enumerate(((0, 260, 340, "#C9B49A"), (260, 220, 260, "#B8A28A"), (480, 260, 380, "#C9B49A"),
                                       (740, 220, 300, "#B8A28A"), (960, 240, 360, "#C9B49A"))):
        s += rect(x, 640 - h, w, h, c) + rect(x + 40, 640 - h + 60, 50, 60, "#5B8DB8", opacity=0.7)
    s += rect(0, 640, W, 260, "#8A9AA8")
    for i in range(6):
        s += ellipse(150 + i * 190, 760 + (i % 2) * 60, 90, 16, "#A8C4DA", opacity=0.8)
    import random
    r = random.Random(5)
    for _ in range(90):
        x, y = r.uniform(0, W), r.uniform(0, 860)
        s += line([(x, y), (x - 8, y + 30)], "#FFFFFF", 3, opacity=0.6)
    return s


def bg_garden():
    s = rect(0, 0, W, 600, "url(#sky_day)") + cloud(200, 90, 0.8)
    s += rect(0, 600, W, 300, "#7CC96B")
    s += rect(0, 420, W, 200, "#E9C08C") + rect(0, 420, W, 16, "#D3A36C")
    for x in range(40, W, 120):
        s += circle(x, 430, 44, "#3E9A4E") + circle(x + 30, 410, 30, "#58B56C")
        for k in range(5):
            s += circle(x - 20 + k * 12, 410 + (k % 2) * 16, 5, "#FFFFFF")
    s += g(rect(-4, -380, 8, 380, "#8A5426") + rect(-140, -390, 280, 14, "#8A5426"), 900, 620)
    s += g(line([(-80, -376), (-80, -110)], "#8A5426", 4) + line([(80, -376), (80, -110)], "#8A5426", 4)
           + rect(-100, -120, 200, 24, "#C8452C", rx=8), 900, 620)
    return s


BACKGROUNDS = {
    "living": bg_living, "living_snow": bg_living_snow, "call": bg_call, "kitchen": bg_kitchen_abroad,
    "dining": bg_dining, "bedroom": lambda: bg_bedroom(False), "bedroom_night": lambda: bg_bedroom(True),
    "park": bg_park, "school": bg_school, "airport": bg_airport, "house": lambda: bg_house("day"),
    "house_morning": lambda: bg_house("morning"), "house_dusk": lambda: bg_house("dusk"),
    "india_kitchen": bg_india_kitchen, "courtyard": bg_courtyard, "terrace": lambda: bg_terrace(False),
    "terrace_dusk": lambda: bg_terrace(True), "temple": bg_temple, "puja": bg_puja, "market": bg_market,
    "farm": bg_farm, "river": bg_river, "train": bg_train, "beach": bg_beach, "party": bg_party,
    "mandapam": bg_mandapam, "night_sky": bg_night_sky, "rain": bg_rain, "garden": bg_garden,
}


# ======================================================================= props (base at 0,0)

def p_ganesha():
    s = ellipse(0, -10, 110, 22, "#8A4F22")
    s += path("M-90 -20 L90 -20 L70 -60 L-70 -60 Z", "#C8452C", stroke="#8A4F22", stroke_width=4)
    s += ellipse(0, -120, 70, 66, "#F2B94A", stroke="#8A4F22", stroke_width=5)
    s += ellipse(0, -220, 52, 50, "#F2B94A", stroke="#8A4F22", stroke_width=5)
    s += ellipse(-58, -226, 30, 38, "#F2B94A", stroke="#8A4F22", stroke_width=4) + ellipse(58, -226, 30, 38, "#F2B94A", stroke="#8A4F22", stroke_width=4)
    s += path("M0 -210 Q-6 -150 30 -140 Q40 -146 34 -156 Q16 -160 14 -206 Z", "#F2B94A", stroke="#8A4F22", stroke_width=4)
    s += circle(-18, -228, 6, "#2B1B14") + circle(18, -228, 6, "#2B1B14")
    s += path("M-30 -270 L0 -310 L30 -270 Z", "#E8414B", stroke="#8A4F22", stroke_width=4) + circle(0, -312, 8, GOLD)
    s += path("M-20 -256 h40", stroke=KUMKUM, stroke_width=5)
    s += circle(-40, -120, 14, "#FFFFFF", stroke="#8A4F22", stroke_width=3)
    for k in range(10):
        a = math.radians(200 + k * 14)
        s += circle(80 * math.cos(a), -150 + 70 * math.sin(a), 8, "#FF8A1E" if k % 2 else "#FFD24A")
    return s


def p_bathukamma():
    s = ellipse(0, 0, 90, 16, "#C0C6D4")
    cols = ["#E8414B", "#FFC93C", "#8E7CF0", "#FF8A1E", "#E8457E", "#FFD24A", "#2E8B6E"]
    for i in range(7):
        w = 80 - i * 10
        y = -20 - i * 34
        s += path(f"M{-w} {y} Q0 {y + 14} {w} {y} L{w - 8} {y - 34} Q0 {y - 22} {-w + 8} {y - 34} Z", cols[i], stroke="#8A4F22", stroke_width=3)
        for k in range(int(w // 14)):
            s += circle(-w + 14 + k * 28, y - 16, 5, "#FFFFFF", opacity=0.8)
    s += circle(0, -270, 16, "#FFC93C", stroke="#8A4F22", stroke_width=3)
    return s


def p_kolu():
    s = ""
    for i in range(4):
        w = 420 - i * 80
        s += rect(-w / 2, -40 - i * 50, w, 50, "#C8452C" if i % 2 else "#E8862E", stroke="#8A4F22", stroke_width=3)
        for k in range(int(w // 60)):
            x = -w / 2 + 30 + k * 60
            c = ["#FFC93C", "#4FB3E8", "#E8457E", "#2E8B6E"][k % 4]
            s += circle(x, -60 - i * 50, 10, "#D49A6A") + rect(x - 10, -52 - i * 50, 20, 22, c, rx=6)
    return s


def p_laddus():
    s = ellipse(0, 0, 80, 18, "#C0C6D4", stroke="#8A8F9E", stroke_width=3)
    for x, y in ((-40, -16), (0, -16), (40, -16), (-20, -44), (20, -44), (0, -70)):
        s += circle(x, y, 20, "#F2A532", stroke="#C47A1A", stroke_width=3) + circle(x - 6, y - 6, 3, "#FFF3B0")
    return s


def p_sweets_box():
    return (rect(-80, -60, 160, 60, "#E8457E", rx=8, stroke="#8A1F3D", stroke_width=4)
            + rect(-80, -60, 160, 16, "#F2B705") + path("M0 -60 V0", stroke="#F2B705", stroke_width=6))


def p_gift():
    return (rect(-50, -90, 100, 90, "#4FB3E8", rx=8, stroke="#2E7DB5", stroke_width=4) + rect(-8, -90, 16, 90, "#E8414B")
            + path("M0 -90 Q-40 -130 -30 -96 Z M0 -90 Q40 -130 30 -96 Z", "#E8414B"))


def p_cake():
    return cake(0, 0, 0.8)


def p_table_cloth():
    return table(-330, -40, 660, 40, cloth="#FFF")


def p_table():
    return table(-330, -40, 660, 40)


def p_low_table():
    return rect(-220, -60, 440, 30, "#B86A2E", rx=8, stroke="#8A4F22", stroke_width=4) + rect(-200, -32, 20, 32, "#8A4F22") + rect(180, -32, 20, 32, "#8A4F22")


def p_leaf_meal():
    return plate_rice(0, 0, 1.2, leaf=True)


def p_plate():
    return plate_rice(0, 0, 1.0)


def p_umbrella():
    return (line([(0, 0), (0, -200)], "#5A3A28", 8) + path("M0 0 q-20 10 -24 -10", stroke="#5A3A28", stroke_width=8, fill="none")
            + path("M-130 -170 Q0 -300 130 -170 Q100 -186 66 -170 Q34 -186 0 -170 Q-34 -186 -66 -170 Q-100 -186 -130 -170 Z", "#E8414B", stroke="#8A1F2B", stroke_width=4))


def p_paper_boat():
    return (path("M-60 -20 L60 -20 L40 0 L-40 0 Z", "#FFFFFF", stroke="#9EA3B2", stroke_width=3)
            + path("M-30 -20 L0 -70 L30 -20 Z", "#FFFFFF", stroke="#9EA3B2", stroke_width=3))


def p_swing():
    return (line([(-90, 0), (-90, -380)], "#8A5426", 5) + line([(90, 0), (90, -380)], "#8A5426", 5)
            + rect(-110, -10, 220, 26, "#C8452C", rx=8))


def p_top():
    return (path("M-36 -60 Q0 -90 36 -60 L0 0 Z", "#E8414B", stroke="#8A1F2B", stroke_width=4)
            + path("M-30 -64 Q0 -50 30 -64", stroke="#FFD24A", stroke_width=6, fill="none") + rect(-4, -96, 8, 30, "#8A5426"))


def p_carrom():
    s = rect(-170, -100, 340, 100, "#E9C27A", stroke="#8A4F22", stroke_width=14)
    for x, y in ((-150, -86), (150, -86), (-150, -14), (150, -14)):
        s += circle(x, y, 10, "#2B1B14")
    for x, y, c in ((0, -50, "#E8414B"), (-20, -60, "#FFFFFF"), (20, -60, "#2B1B14"), (-20, -40, "#2B1B14"), (20, -40, "#FFFFFF")):
        s += ellipse(x, y, 10, 6, c, stroke="#5A3A28", stroke_width=2)
    return s


def p_bicycle():
    s = circle(-70, -50, 46, "none", stroke="#2B1B14", stroke_width=8) + circle(70, -50, 46, "none", stroke="#2B1B14", stroke_width=8)
    s += path("M-70 -50 L-10 -50 L30 -110 L-30 -110 Z M30 -110 L70 -50 M-30 -110 L-36 -128 M30 -110 L36 -134", stroke="#E8414B", stroke_width=8, fill="none")
    s += rect(-50, -134, 30, 10, "#2B1B14", rx=5)
    return s


def p_kalasham():
    return (path("M-50 0 Q-70 -60 -36 -90 L36 -90 Q70 -60 50 0 Z", "#C98B2C", stroke="#8A4F22", stroke_width=4)
            + rect(-40, -100, 80, 14, "#B37A20") + path("M-40 -100 Q-60 -150 -30 -160 M40 -100 Q60 -150 30 -160 M0 -100 L0 -170", stroke="#2E8B4F", stroke_width=10, stroke_linecap="round", fill="none")
            + circle(0, -150, 30, "#7A4B2A", stroke="#5A3018", stroke_width=4) + path("M-50 -50 Q0 -30 50 -50", stroke=KUMKUM, stroke_width=6, fill="none"))


def p_garland():
    s = ""
    for k in range(16):
        a = math.radians(180 + k * 12)
        x, y = 80 * math.cos(a), 30 + 90 * math.sin(-a)
        s += circle(x, -y - 20, 12, "#FF8A1E" if k % 2 else "#FFD24A", stroke="#C46A10", stroke_width=2)
    return s


def p_auto():
    s = path("M-130 -40 L-130 -150 Q-120 -190 -60 -196 L80 -196 Q120 -190 130 -150 L140 -40 Z", "#FFD24A", stroke="#5A3A28", stroke_width=5)
    s += path("M-130 -196 Q0 -230 130 -196 L130 -180 L-130 -180 Z", "#2B1B14")
    s += rect(-110, -170, 100, 70, "#BFE4FA", rx=10) + rect(20, -170, 90, 70, "#BFE4FA", rx=10)
    s += rect(-140, -60, 290, 30, "#2E8B4F") + circle(-90, -20, 26, "#2B1B14") + circle(100, -20, 26, "#2B1B14")
    s += circle(-90, -20, 10, "#9EA3B2") + circle(100, -20, 10, "#9EA3B2")
    return s


def p_bullock_cart():
    s = rect(-130, -120, 220, 60, "#B86A2E", stroke="#5A3A28", stroke_width=4) + path("M-130 -120 Q-20 -200 90 -120 Z", "#E9C27A", stroke="#5A3A28", stroke_width=4)
    s += circle(-20, -40, 50, "none", stroke="#5A3A28", stroke_width=10)
    for k in range(6):
        a = math.radians(k * 30)
        s += line([(-20 - 46 * math.cos(a), -40 - 46 * math.sin(a)), (-20 + 46 * math.cos(a), -40 + 46 * math.sin(a))], "#5A3A28", 4)
    s += line([(90, -90), (230, -90)], "#5A3A28", 8)
    return s


def p_flowers():
    s = ""
    for k, (x, c) in enumerate(((-60, "#E8414B"), (-20, "#FFC93C"), (20, "#E8457E"), (60, "#FF8A1E"))):
        s += line([(x, 0), (x + 4, -60 - k % 2 * 20)], "#3E9A4E", 5)
        for i in range(5):
            s += ellipse(x + 4, -70 - k % 2 * 20, 7, 12, c, transform=f"rotate({i * 72} {x + 4} {-60 - k % 2 * 20})")
        s += circle(x + 4, -60 - k % 2 * 20, 6, "#FFF3B0")
    return s


def p_books():
    return book(0, 0, 0.9) + g(rect(-60, -14, 120, 14, "#E8414B") + rect(-56, -28, 112, 14, "#2E8B6E"), 150, 0)


def p_tablet_held():
    return rect(-60, -80, 120, 80, "#2B2B3A", rx=12) + rect(-52, -72, 104, 64, "#BFE4FA", rx=6)


def p_rangoli_colors():
    s = ""
    for i, c in enumerate(("#E8414B", "#FFC93C", "#2E8B6E", "#8E7CF0", "#FF8A1E")):
        x = -120 + i * 60
        s += ellipse(x, 0, 26, 10, "#C0C6D4") + ellipse(x, -6, 20, 8, c)
    return s


def p_holi_colors():
    s = ""
    import random
    r = random.Random(9)
    for _ in range(26):
        c = r.choice(["#E8414B", "#FFC93C", "#2E8B6E", "#8E7CF0", "#E8457E", "#4FB3E8"])
        s += circle(r.uniform(-200, 200), r.uniform(-260, -20), r.uniform(10, 26), c, opacity=0.7)
    return s


def p_sandcastle():
    return (rect(-70, -60, 140, 60, "#E9C27A", stroke="#C49A48", stroke_width=4) + rect(-40, -110, 80, 50, "#E9C27A", stroke="#C49A48", stroke_width=4)
            + path("M0 -110 L0 -150 L30 -140 L0 -130", "#E8414B"))


def p_firecracker():
    return sparkle(0, -120, 50) + line([(0, -70), (0, 0)], "#999", 4)


def p_rakhi():
    return circle(0, 0, 26, "#FFC93C", stroke="#E8414B", stroke_width=6) + line([(-90, 0), (-26, 0)], "#E8414B", 5) + line([(26, 0), (90, 0)], "#E8414B", 5)


def p_moon_sky():
    return moon(0, 0, 50)


def p_stars():
    return "".join(star(x, y, r, "#FFF3B0") for x, y, r in ((-200, -40, 10), (-60, -100, 7), (80, -20, 9), (200, -90, 8), (0, 10, 6)))


def p_sun():
    return sun(0, 0, 54)


def p_clouds():
    return cloud(-200, 0, 0.8) + cloud(150, -40, 0.6)


def p_rain_drops():
    import random
    r = random.Random(11)
    return "".join(line([(x, y), (x - 6, y + 24)], "#FFFFFF", 3, opacity=0.7) for x, y in ((r.uniform(-300, 300), r.uniform(-400, 0)) for _ in range(40)))


def p_cradle():
    return (path("M-120 -160 Q0 -40 120 -160", stroke="#8A5426", stroke_width=10, fill="none")
            + path("M-110 -150 Q0 -30 110 -150 L100 -170 Q0 -70 -100 -170 Z", "#F6A6C4", stroke="#8A4F6A", stroke_width=4)
            + line([(-120, -160), (0, -360)], "#8A5426", 4) + line([(120, -160), (0, -360)], "#8A5426", 4))


def p_slate():
    return (rect(-80, -110, 160, 110, "#2F3E3A", rx=8, stroke="#8A5426", stroke_width=10)
            + path("M-40 -60 q16 -30 32 0 M10 -70 q10 20 30 0", stroke="#FFFFFF", stroke_width=5, fill="none"))


def p_rice_plate_turmeric():
    return ellipse(0, 0, 110, 26, "#C0C6D4", stroke="#8A8F9E", stroke_width=3) + ellipse(0, -6, 90, 18, "#FFF6DE") + path("M-30 -8 q10 -10 20 0 q10 10 20 0", stroke="#E8862E", stroke_width=4, fill="none")


def p_drum():
    return (rect(-60, -100, 120, 100, "#C8452C", rx=10, stroke="#5A3A28", stroke_width=4) + ellipse(0, -100, 60, 16, "#F7E3C2", stroke="#5A3A28", stroke_width=4)
            + path("M-60 -80 L60 -20 M-60 -20 L60 -80", stroke="#F2B705", stroke_width=4))


def p_bus_stop():
    return rect(-6, -220, 12, 220, "#5A3A28") + circle(0, -230, 30, "#2E8B4F", stroke="#5A3A28", stroke_width=4) + rect(-18, -244, 36, 24, "#FFFFFF", rx=4)


def p_mango_tree():
    return mango_tree(0, 0, 0.9)


def p_coconut_tree():
    return coconut_tree(0, 0, 1.0)


def p_tree():
    return tree(0, 0, 1.0)


def p_hen():
    return hen(0, 0, 0.8)


def p_cow():
    return cow(0, 0, 0.8)


def p_muggu():
    return muggu(0, 0, 1.1)


def p_muggu_big():
    return muggu(0, 0, 1.6)


def p_kite():
    return kite(0, 0, 0.8, -12)


def p_kite2():
    return kite(0, 0, 0.6, 14, "#2E8B6E", "#FFC93C")


def p_kite3():
    return kite(0, 0, 0.55, 4, "#8E7CF0", "#FF8A65")


def p_diya():
    return diya(0, 0, 0.9)


def p_diya_row():
    return "".join(diya(x, 0, 0.7) for x in range(-300, 301, 100))


def p_firework():
    return firework(0, 0, 70, "#FFC93C") + firework(220, 40, 50, "#FF8A65") + firework(-200, 60, 40, "#8EE3FF")


def p_pongal_pot():
    return pongal_pot(0, 0, 0.7)


def p_balloons():
    return balloon(-60, -200, "#E8414B") + balloon(0, -240, "#FFC93C") + balloon(60, -200, "#4FB3E8")


def p_bunting():
    return bunting(-600, 0, 600, 14, 40)


def p_thoranam():
    return thoranam(-200, 0, 400, 10, 0.8)


def p_ball():
    return ball(0, -34, 34)


def p_school_bag():
    return school_bag(0, 0, 0.9)


def p_suitcase():
    return suitcase(0, 0, 0.9)


def p_mango():
    return mango(0, -20, 1.4)


def p_mango_basket():
    s = path("M-80 -60 L80 -60 L60 0 L-60 0 Z", "#C98B4C", stroke="#8A5426", stroke_width=4)
    for x, y in ((-50, -78), (-14, -84), (22, -80), (54, -74), (-30, -104), (10, -106), (36, -100)):
        s += mango(x - 10, y - 10, 0.9)
    return s


def p_glass():
    return glass(0, 0, 1.0)


def p_bowl():
    return bowl(0, 0, 1.0)


def p_payasam():
    return bowl(0, 0, 1.0, fill="#F7E1B5")


def p_pachadi():
    return bowl(0, 0, 1.0, fill="#C9853B")


def p_jug():
    return jug(0, 0, 0.9)


def p_party_hat():
    return party_hat(0, 0, 0.8)


def p_plant():
    return plant(0, 0, 0.9)


def p_lamp():
    return lamp(0, 0, 0.9)


def p_stall():
    return stall(0, 0)


def p_butterflies():
    return butterfly(0, 0, "#FF8A65") + butterfly(120, -60, "#8E7CF0") + butterfly(-110, -40, "#FFC93C")


def p_airplane():
    return airplane(0, 0, 0.6)


def p_book():
    return book(0, 0, 1.0)


def p_tulasi():
    return tulasi(0, 0, 0.6)


def p_boat():
    return path("M-120 0 Q0 50 120 0 L100 -20 L-100 -20 Z", "#8A4F22") + path("M0 -20 L0 -150 L70 -40 Z", "#FFF3DD")


def p_bed_blanket_front():
    return blanket(-260, 0, 520, "#4FB3E8")


PROPS = {k[2:]: v for k, v in globals().items() if k.startswith("p_") and callable(v)}
