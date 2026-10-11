# Story voices

1. `generate.mts` records each line with Sarvam AI (Bulbul v3) into `raw/`, using the speaker and pace in `config.mjs`.
2. `tune.py` ages each character's voice into `assets/voices/` using `tune.json` (pitch, formant, range, speed).
3. The **Generate story voices** GitHub workflow runs both, commits, and builds a new APK.

Bulbul v3 has no pitch control, so speakers were chosen by their measured pitch (median F0 of the samples in `samples/`),
then shaped by `tune.py`: kids up to a child's range (~280–305 Hz) with smaller-sounding formants, grandparents lower and slower.

| Speaker | Median pitch | | Speaker | Median pitch |
|---|---|---|---|---|
| aditya | 92 Hz | | dev | 160 Hz |
| kabir | 93 Hz | | neha (Ammamma) | 167 Hz |
| ratan (Tatayya) | 97 Hz | | rohan | 173 Hz |
| varun | 100 Hz | | simran | 186 Hz |
| soham | 102 Hz | | priya | 190 Hz |
| mani | 102 Hz | | roopa (Amma) | 192 Hz |
| anand (Nanna) | 104 Hz | | rupali | 196 Hz |
| sunny | 109 Hz | | shruti | 198 Hz |
| mohit | 111 Hz | | pooja | 201 Hz |
| gokul | 113 Hz | | kavya | 203 Hz |
| shubh | 115 Hz | | suhani | 209 Hz |
| rahul | 115 Hz | | shreya | 211 Hz |
| amit | 116 Hz | | ishita (boy) | 212 Hz |
| rehan | 117 Hz | | tanya | 219 Hz |
| vijay | 122 Hz | | ritu (girl) | 224 Hz |
| tarun | 126 Hz | | kavitha | 265 Hz |
| aayan | 131 Hz | | | |
| ashutosh | 136 Hz | | | |
| sumit | 138 Hz | | | |
| manan | 143 Hz | | | |
| advait | 157 Hz | | | |
