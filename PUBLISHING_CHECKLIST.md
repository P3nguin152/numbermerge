# Play Store Publishing Checklist

## Completed Setup ✅
- [x] Updated app.json with Play Store requirements (versionCode, adaptiveIcon, permissions)
- [x] Created eas.json for EAS build configuration
- [x] Configured Android package name (com.numbermerge.game)
- [x] Added privacy policy URL placeholder in app.json

## Required Actions Before Building

### 1. Privacy Policy
- [ ] Create a privacy policy for your app
- [ ] Host it on your website or a free service like GitHub Pages
- [ ] Update the privacy URL in app.json: `"privacy": "https://your-actual-privacy-policy-url.com"`

### 2. Expo Account & Project Setup
- [ ] Create an Expo account at https://expo.dev
- [ ] Run `npx eas build:configure` to link your project to Expo
- [ ] Update the projectId in app.json with your actual project ID

### 3. Google Play Console Setup
- [ ] Create a Google Play Console account ($25 one-time fee)
- [ ] Create a new app in the Play Console
- [ ] Complete the app listing (description, screenshots, etc.)
- [ ] Set up content rating questionnaire
- [ ] Set up app content (privacy policy, data safety)

### 4. Google Service Account (for automated submissions)
- [ ] Create a Google Service Account in Google Cloud Console
- [ ] Grant the service account access to your Play Console app
- [ ] Download the JSON key and save as `google-service-account.json`
- [ ] Update the serviceAccountKeyPath in eas.json if needed

### 5. App Assets
- [ ] Verify app icon.png is 1024x1024px
- [ ] Verify adaptive-icon.png meets Google's requirements
- [ ] Create app screenshots for different device sizes
- [ ] Prepare feature graphic (1024x500px) for Play Store listing

## Build Process

### Development Build (for testing)
```bash
npx eas build --profile development --platform android
```

### Preview Build (APK for internal testing)
```bash
npx eas build --profile preview --platform android
```

### Production Build (AAB for Play Store submission)
```bash
npx eas build --profile production --platform android
```

### Submit to Play Store
```bash
npx eas submit --platform android --profile production
```

## Play Store Requirements
- [ ] App must be tested on at least one device
- [ ] Content rating completed
- [ ] Privacy policy URL provided
- [ ] Data safety section completed
- [ ] Target API level 33+ (Android 13+)
- [ ] 64-bit native code support

## Post-Submission
- [ ] Monitor app status in Play Console
- [ ] Respond to user reviews
- [ ] Track crashes and ANRs (Android Not Responding)
- [ ] Update app regularly

## Notes
- The app.json currently has placeholder values that need to be updated:
  - `projectId` in extra.eas
  - `privacy` URL
  - `googleServicesFile` (remove if not using Firebase)
- Remove `googleServicesFile` from app.json if you're not using Firebase/Google services
- Adjust permissions in app.json based on what your app actually needs
