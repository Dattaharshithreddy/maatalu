"""Builds the Maatalu logo and every app icon from one design. Needs rsvg-convert and the
Baloo Tammudu 2 ExtraBold font installed (it ships in node_modules/@expo-google-fonts)."""
import subprocess, os
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(HERE, '..', '..', 'assets')
LEAF, LEAF2, CREAM, TURMERIC, INK = '#1F6B4F', '#2E8A64', '#FFF8E7', '#F2B705', '#164E3A'

def bubble(fill, letter_fill, moon=True, letter=True):
    return f'<g transform="translate(40 0)">' + _bubble(fill, letter_fill, moon, letter) + '</g>'

def _bubble(fill, letter_fill, moon=True, letter=True):
    """Speech bubble with the letters మా, and a crescent moon with a star resting on its corner. 1024 box."""
    # Chandamama: a full, sleepy moon peeking out from behind the bubble's corner
    moon_svg = f'''
      <g transform="translate(700 268)">
        <circle r="128" fill="{TURMERIC}"/>
        <path d="M-58 -34 Q-36 -12 -14 -34" stroke="{INK}" stroke-width="16" fill="none" stroke-linecap="round"/>
        <path d="M30 -34 Q52 -12 74 -34" stroke="{INK}" stroke-width="16" fill="none" stroke-linecap="round"/>
      </g>''' if moon else ''
    text = f'''<text x="470" y="640" text-anchor="middle" font-family="Baloo Tammudu 2" font-weight="800"
          font-size="330" fill="{letter_fill}">మా</text>''' if letter else ''
    return f'''{moon_svg}
      <path d="M250 300 h420 a120 120 0 0 1 120 120 v200 a120 120 0 0 1 -120 120 h-230 l-120 104 v-104 h-70
               a120 120 0 0 1 -120 -120 v-200 a120 120 0 0 1 120 -120 z" fill="{fill}"/>
      {text}'''

def dots(color, opacity):
    out = []
    for i in range(7):
        for j in range(7):
            out.append(f'<circle cx="{80 + i*144}" cy="{80 + j*144}" r="9" fill="{color}" opacity="{opacity}"/>')
    return ''.join(out)

def svg(body, size=1024, bg=None):
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 1024 1024">{bg or ""}{body}</svg>'

BG = f'''<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="{LEAF2}"/><stop offset="1" stop-color="{LEAF}"/></linearGradient></defs>
  <rect width="1024" height="1024" fill="url(#g)"/>{dots('#FFFFFF', 0.10)}'''

def render(name, content, px):
    p = os.path.join(HERE, name + '.svg')
    open(p, 'w').write(content)
    out = os.path.join(ASSETS, name + '.png') if not name.startswith('logo') else os.path.join(HERE, name + '.png')
    subprocess.run(['rsvg-convert', '-w', str(px), '-h', str(px), p, '-o', out], check=True)
    return out

# Full icon (iOS, web, store listing)
render('icon', svg(bubble(CREAM, LEAF), bg=BG), 1024)
# Android adaptive: background and a foreground scaled into the safe zone (inner 66%)
render('android-icon-background', svg('', bg=BG), 512)
fg = f'<g transform="translate(512 512) scale(0.66) translate(-512 -540)">{bubble(CREAM, LEAF)}</g>'
render('android-icon-foreground', svg(fg), 512)
mono = f'<g transform="translate(512 512) scale(0.66) translate(-512 -540)">{bubble("#FFFFFF", "#000000")}</g>'
p = render('android-icon-monochrome', svg(mono), 432)
im = Image.open(p).convert('RGBA'); px = im.load()
for y in range(im.height):  # letters become holes: monochrome icons use alpha only
    for x in range(im.width):
        r, g, b, a = px[x, y]
        if a and r < 128: px[x, y] = (255, 255, 255, 0)
        elif a: px[x, y] = (255, 255, 255, a)
im.save(p)
# Splash: the bubble alone on the green splash background
render('splash-icon', svg(f'<g transform="translate(512 512) scale(0.9) translate(-512 -540)">{bubble(CREAM, LEAF)}</g>'), 1024)
render('favicon', svg(bubble(CREAM, LEAF), bg=BG), 48)
# Wordmark for the website and store listing
word = f'''<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="500" viewBox="0 0 1024 500">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="{LEAF2}"/><stop offset="1" stop-color="{LEAF}"/></linearGradient></defs>
  <rect width="1024" height="500" fill="url(#g)"/>
  <g transform="translate(70 70) scale(0.36)">{bubble(CREAM, LEAF)}</g>
  <text x="470" y="250" font-family="Baloo Tammudu 2" font-weight="800" font-size="118" fill="{CREAM}">మాటలు</text>
  <text x="474" y="330" font-family="Nunito" font-weight="800" font-size="44" fill="{TURMERIC}">Telugu for little ones</text>
  <text x="474" y="390" font-family="Nunito" font-weight="800" font-size="30" fill="#D6EBE1">Words · Family stories · Bedtime</text>
</svg>'''
open(os.path.join(HERE, 'feature-graphic.svg'), 'w').write(word)
subprocess.run(['rsvg-convert', os.path.join(HERE, 'feature-graphic.svg'), '-o', os.path.join(HERE, 'feature-graphic.png')], check=True)
print('ok')
