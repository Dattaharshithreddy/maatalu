"""Narrates the bedtime stories in Harshith's own voice on a Hugging Face GPU job, with the same IndicF5
renderer his Swaram studio uses (github.com/Dattaharshithreddy/Swaram, cloud/render.py).

Runs inside the job with his private bucket mounted at /b:
  - reference clip: /b/audio/l11.wav (a line from one of his reels) and its words in REF_TEXT
  - line cache:     /b/maatalu/bedtime/lines/<hash>.wav  (re-runs only record new or changed lines)
  - output:         /b/maatalu/bedtime/<story>.mp3 and <story>.json (line start times)

Each story gets a slower, calmer pace and a very quiet ambient pad under the voice that fades out at the end.
"""

import hashlib
import json
import os
import subprocess
import sys

import numpy as np
import soundfile as sf

SR = 24000
SPEED = 0.9           # slower than normal speech, for bedtime
SWARAM = os.environ.get("SWARAM", "/work/Swaram")
GAP = 0.6             # silence between lines (seconds), plus each line's own pause
REF = os.environ.get("REF_WAV", "/b/audio/l11.wav")
REF_TEXT = os.environ.get(
    "REF_TEXT",
    "చుట్టూ ఉన్న కాటేజీలకీ… ఏడు కొండల పేర్లే. సప్తగిరి… అంటే ఏడు కొండలు. శేషాద్రి నగర్. గరుడాద్రి నగర్. అంజనాద్రి నగర్.",
)
OUT = "/b/maatalu/bedtime"
CACHE = f"{OUT}/lines"


def trim(a: np.ndarray, thr: float = 0.012) -> np.ndarray:
    idx = np.where(np.abs(a) > thr)[0]
    if len(idx) == 0:
        return a
    s = max(0, idx[0] - int(0.04 * SR))
    e = min(len(a), idx[-1] + int(0.12 * SR))
    return a[s:e]


def level(a: np.ndarray, target_rms: float = 0.08) -> np.ndarray:
    rms = float(np.sqrt(np.mean(a**2))) or 1.0
    a = a * (target_rms / rms)
    peak = float(np.max(np.abs(a))) or 1.0
    return a * min(1.0, 0.95 / peak)


def render_missing(stories: list, only: list[str]) -> None:
    """Records every line that is not in the cache yet, in one run of Swaram's renderer."""
    parts, keys = [], []
    for st in stories:
        if only and st["id"] not in only:
            continue
        for line in st["lines"]:
            k = key_of(line["te"])
            if not os.path.exists(f"{CACHE}/{k}.wav") and k not in keys:
                keys.append(k)
                parts.append({"i": len(parts), "voice": "datta", "text": line["te"], "speed": SPEED})
    print(f"{len(parts)} new lines to record", flush=True)
    if not parts:
        return
    os.makedirs("/work/job", exist_ok=True)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", REF, "-ac", "1", "-ar", str(SR), "/work/job/ref.wav"], check=True)
    job = {"steps": 32, "cfg": 2.0, "voices": {"datta": {"wav": "ref.wav", "text": REF_TEXT}}, "parts": parts}
    json.dump(job, open("/work/job/job.json", "w"), ensure_ascii=False)
    subprocess.run([sys.executable, "render.py", "--job", "/work/job/job.json", "--out", "/work/out"], cwd=f"{SWARAM}/cloud", check=True)
    for part, k in zip(parts, keys):
        a, _ = sf.read(f"/work/out/parts/part-{part['i']:05d}.wav", dtype="float32")
        sf.write(f"{CACHE}/{k}.wav", level(trim(a)), SR)


def key_of(text: str) -> str:
    return hashlib.sha1(f"{REF}|{REF_TEXT}|{SPEED}|{text}".encode()).hexdigest()[:16]


def pad(n: int) -> np.ndarray:
    """A soft, slowly breathing A-major drone, very quiet."""
    t = np.arange(n) / SR
    out = np.zeros(n, dtype=np.float32)
    for f, amp, rate in [(110.0, 1.0, 0.05), (164.81, 0.7, 0.037), (220.0, 0.5, 0.061), (277.18, 0.35, 0.043), (329.63, 0.25, 0.029)]:
        lfo = 0.55 + 0.45 * np.sin(2 * np.pi * rate * t + f)
        out += amp * lfo * np.sin(2 * np.pi * f * t)
    out *= 0.012 / (np.sqrt(np.mean(out**2)) or 1)
    fi, fo = int(4 * SR), int(10 * SR)
    out[:fi] *= np.linspace(0, 1, fi)
    out[-fo:] *= np.linspace(1, 0, fo)
    return out


def main(stories_path: str, only: list[str]) -> None:
    stories = json.load(open(stories_path, encoding="utf-8"))
    os.makedirs(CACHE, exist_ok=True)
    render_missing(stories, only)

    for st in stories:
        if only and st["id"] not in only:
            continue
        parts, starts, pos = [np.zeros(int(1.5 * SR), dtype=np.float32)], [], int(1.5 * SR)
        for i, line in enumerate(st["lines"]):
            a, _ = sf.read(f"{CACHE}/{key_of(line['te'])}.wav", dtype="float32")
            print(f"{st['id']} {i + 1}/{len(st['lines'])} {len(a) / SR:.1f}s", flush=True)
            starts.append(round(pos / SR, 2))
            gap = np.zeros(int((GAP + float(line.get("p", 0))) * SR), dtype=np.float32)
            parts += [a, gap]
            pos += len(a) + len(gap)
        parts.append(np.zeros(int(6 * SR), dtype=np.float32))
        voice = np.concatenate(parts)
        mix = voice + pad(len(voice))
        mix = np.clip(mix, -0.98, 0.98)
        sf.write("/tmp/story.wav", mix, SR)
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", "/tmp/story.wav", "-ac", "1", "-ar", str(SR),
                        "-c:a", "libmp3lame", "-b:a", "64k", f"{OUT}/{st['id']}.mp3"], check=True)
        json.dump({"duration": round(len(mix) / SR, 2), "starts": starts}, open(f"{OUT}/{st['id']}.json", "w"))
        print(f"DONE {st['id']} {len(mix) / SR / 60:.1f} min", flush=True)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2:])
