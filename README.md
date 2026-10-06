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
- 21 units, 198 items: everyday words, the Telugu alphabet (vowels and first consonants) and full sentences for phone calls and home, taught in bite-sized lessons of 6
- Stars, daily streak, minutes tracking, quick review of known words
- Family tab: real voice-note recording and playback (child, grandma, grandpa), long-press to delete
- Grandma's voice pack: record each word; lessons then play her voice instead of the phone's voice
- Parents tab behind a grown-ups question: progress, weekly chart, words known, settings, erase all
- Free plan (3 units) and a Plus paywall (test mode, no payment taken)
- Light and dark mode; progress and recordings saved on the phone

## Not built yet (next phase)
- Real payments: connect RevenueCat + Google Play Billing
- Sending voice notes to family in India on another phone: needs a backend (e.g. Supabase auth + storage)
- Daily reminder notifications
- Telugu content review by a native teacher before launch
