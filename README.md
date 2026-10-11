# Maatalu — Telugu for kids (Expo / React Native)

## Get the APK (about 15 minutes, free)
1. Install Node.js 20+ from nodejs.org.
2. In this folder: `npm install`
3. `npm install -g eas-cli`
4. `eas login` (create a free account at expo.dev if needed)
5. `eas build:configure` (accept the defaults; it links the project to your account)
6. `eas build -p android --profile preview`
7. When it finishes, open the link it prints on your phone and install the APK.

## Try it instantly without building
`npx expo start`, then scan the QR code with the Expo Go app on your Android phone.

## Play Store release
`eas build -p android --profile production` creates an .aab file to upload in Google Play Console.

## What works
- Stories tab: 108 animated scenes in 12 chapters (calls with Ammamma, daily life, food, a trip to India, Sankranti, Ugadi and Sri Rama Navami, Vinayaka Chavithi, Dasara and Bathukamma, Deepavali, birthdays and family celebrations, seasons, games and stories). First two chapters free.
- A family of six characters (boy, girl, Ammamma, Tatayya, Amma, Nanna) that breathe, sway, blink, wave, cheer, point, clap, do namaste and lip-sync while they speak. Tap a character to make them jump.
- Watch mode plays the whole conversation; Your turn mode stops at the child's lines so they hold the mic, say it, and hear their own voice come out of their character
- The parent picks boy or girl at setup (changeable in Parents > Settings); that child stars in every scene and grandparents call them నాన్నా or తల్లీ accordingly
- Onboarding: child's name, age, grandparents' names
- 119 units, about 1,250 items: ~940 everyday words, the Telugu alphabet and ~285 full sentences, taught in bite-sized lessons of 6
- Stars, daily streak, minutes tracking, quick review of known words
- Ammamma (robot female voice) and Tatayya (robot male voice) say the words one by one; they take turns, or one teaches alone (Parents > Settings)
- Real voices replace the robot per word: hold-to-record, or import voice-note files (matched to words in order, with preview and reorder)
- Two tabs. Learn is for the child. For parents (behind a grown-ups question) holds setup, real voices and progress. Grandparents never need the app: WhatsApp carries their voice notes in
- After each lesson the child records a short message and sends it to the grandparent through the phone's share sheet (WhatsApp)
- Parents tab: progress, weekly chart, words known, settings, erase all
- Free plan (3 units) and a Plus paywall (test mode, no payment taken)
- Light and dark mode; progress and recordings saved on the phone

## Not built yet (next phase)
- Real family voices for story lines (story lines use the robot voice today)
- Automatically splitting ONE long recording into words: needs Telugu speech recognition with word timestamps (cloud AI + a small server)
- Voice cloning from sample recordings: needs a paid cloning service and the grandparent's consent
- Real payments: connect RevenueCat + Google Play Billing
- Sending voice notes to family in India on another phone: needs a backend (e.g. Supabase auth + storage)
- Daily reminder notifications
- Telugu content review by a native teacher before launch

## Story art
Characters, backgrounds and props are generated SVG. Edit the Python in `tools/art/` and run `python3 tools/art/export_ts.py` to rebuild `src/stories/art.ts`. Scene scripts live in `src/stories/scenes.ts`.
