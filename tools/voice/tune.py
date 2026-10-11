"""Ages each character's voice: reads tools/voice/raw/*.mp3 (Sarvam's recordings) and writes
assets/voices/*.mp3 with the pitch, formant and speed settings in tools/voice/tune.json.

Run: python3 tools/voice/tune.py   (needs: pip install praat-parselmouth, and ffmpeg on PATH or imageio-ffmpeg)
Only files whose settings changed, or that are new, are processed.
"""
import json, os, shutil, subprocess, sys, tempfile
import parselmouth
from parselmouth.praat import call

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
RAW = os.path.join(HERE, "raw")
OUT = os.path.join(ROOT, "assets", "voices")
STATE = os.path.join(HERE, "tuned.json")


def ffmpeg():
    exe = shutil.which("ffmpeg")
    if exe:
        return exe
    import imageio_ffmpeg
    return imageio_ffmpeg.get_ffmpeg_exe()


FF = ffmpeg()
SETTINGS = {k: v for k, v in json.load(open(os.path.join(HERE, "tune.json"))).items() if not k.startswith("_")}
state = json.load(open(STATE)) if os.path.exists(STATE) else {}
os.makedirs(OUT, exist_ok=True)


def neutral(p):
    return p["formant"] == 1 and p["pitch"] == 0 and p["range"] == 1 and p["duration"] == 1


def tune(src, dst, p):
    if neutral(p):
        shutil.copyfile(src, dst)
        return
    with tempfile.TemporaryDirectory() as d:
        a, b = os.path.join(d, "in.wav"), os.path.join(d, "out.wav")
        subprocess.run([FF, "-v", "error", "-y", "-i", src, "-ac", "1", "-ar", "24000", a], check=True)
        snd = parselmouth.Sound(a)
        floor, ceil = (60, 300) if p["pitch"] and p["pitch"] < 140 else (100, 600)
        out = call(snd, "Change gender", floor, ceil, p["formant"], p["pitch"], p["range"], p["duration"])
        call(out, "Scale peak", 0.95)
        out.save(b, "WAV")
        subprocess.run([FF, "-v", "error", "-y", "-i", b, "-ac", "1", "-codec:a", "libmp3lame", "-b:a", "64k", dst], check=True)


done = 0
files = sorted(f for f in os.listdir(RAW) if f.endswith(".mp3"))
for f in files:
    role = f.split("-")[0]
    p = SETTINGS.get(role, {"formant": 1, "pitch": 0, "range": 1, "duration": 1})
    key = json.dumps(p, sort_keys=True)
    dst = os.path.join(OUT, f)
    if state.get(f) == key and os.path.exists(dst):
        continue
    tune(os.path.join(RAW, f), dst, p)
    state[f] = key
    done += 1
    if done % 25 == 0:
        print(f"  {done} tuned")

keep = set(files)
for f in os.listdir(OUT):
    if f.endswith(".mp3") and f not in keep:
        os.remove(os.path.join(OUT, f))
state = {k: v for k, v in state.items() if k in keep}
json.dump(state, open(STATE, "w"), indent=0, sort_keys=True)
print(f"Tuned {done} files; {len(files)} voices ready in assets/voices")
