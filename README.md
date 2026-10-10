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
- Automatically splitting ONE long recording into words: needs Telugu speech recognition with word timestamps (cloud AI + a small server)
- Voice cloning from sample recordings: needs a paid cloning service and the grandparent's consent
- Real payments: connect RevenueCat + Google Play Billing
- Sending voice notes to family in India on another phone: needs a backend (e.g. Supabase auth + storage)
- Daily reminder notifications
- Telugu content review by a native teacher before launch
