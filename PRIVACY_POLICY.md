# Privacy Policy - NumberMerge

**Last Updated:** April 12, 2026

## 1. Introduction

Welcome to NumberMerge. This Privacy Policy explains how we collect, use, store, and protect your personal information when you use our mobile application. By using NumberMerge, you agree to the terms of this Privacy Policy.

## 2. Information We Collect

### 2.1 Information You Provide
- **Username**: When you register for the leaderboard, you provide a username that will be displayed publicly
- **Game Data**: Your scores, best tiles achieved, and number of games played are collected for leaderboard purposes

### 2.2 Automatically Collected Information
- **Local Game State**: Your current game progress (grid state, score, next tile) is stored locally on your device
- **App Usage Data**: Basic usage metrics may be collected for app improvement purposes

### 2.3 Information We Do NOT Collect
- We do not collect your real name, email address, phone number, or physical location
- We do not collect personally identifiable information beyond your chosen username
- We do not collect payment or financial information
- We do not collect contacts or social media information

## 3. How We Use Your Information

### 3.1 Primary Uses
- **Leaderboard Display**: Your username, scores, and game statistics are displayed on the global leaderboard
- **Game Progress**: Local storage of your game state allows you to resume games after closing the app
- **Score Tracking**: We track your best scores and achievements for personal progress tracking

### 3.2 Secondary Uses
- **App Improvement**: Anonymous usage data may be used to improve app performance and user experience
- **Security**: Rate limiting and input validation are implemented to prevent abuse

## 4. Data Storage and Security

### 4.1 Local Storage
- Game progress and settings are stored locally on your device using AsyncStorage
- This data remains on your device and is not transmitted to our servers
- You can clear this data through the app's settings

### 4.2 Cloud Storage
- Leaderboard data (username, scores, statistics) is stored on Supabase, a secure cloud database
- All data is encrypted in transit using HTTPS/TLS
- Your username is the only personally identifiable information stored in the cloud
- Row Level Security (RLS) policies are implemented to protect data integrity

### 4.3 Security Measures
- Input validation and sanitization on all user inputs
- Rate limiting to prevent API abuse
- Environment variables for sensitive configuration (API keys)
- Regular security audits of dependencies
- No hardcoded credentials in the application code

## 5. Data Sharing and Disclosure

### 5.1 Public Information
- Your username, scores, best tiles, and games played are publicly visible on the leaderboard
- This is the only information shared with other users

### 5.2 Third-Party Services
- **Supabase**: Used for leaderboard data storage. Supabase's privacy policy applies to data stored on their platform.
- **Google Play**: For app distribution and updates. Google's privacy policy applies.

### 5.3 We Do NOT Sell Your Data
- We never sell, rent, or trade your personal information
- We do not share your data with advertisers or third-party marketers

## 6. Data Retention

### 6.1 Local Data
- Game progress and settings are retained until you delete the app or clear app data
- You can manually reset game data through the app settings

### 6.2 Leaderboard Data
- Leaderboard entries are retained indefinitely unless you request deletion
- You may request deletion of your leaderboard data at any time (see Section 7)

## 7. Your Rights and Choices

### 7.1 Data Access
- You can view your leaderboard profile and statistics within the app
- Local game data can be accessed through the app settings

### 7.2 Data Deletion
- You can delete your local game data through the app settings
- To delete your leaderboard data, please contact us at the support email provided in the app
- Upon deletion request, your username and associated scores will be removed from the leaderboard

### 7.3 Data Modification
- You can change your username through the app settings
- Game progress can be reset at any time

### 7.4 Opt-Out
- You can choose not to register a username and still play the game offline
- Leaderboard participation is optional

## 8. Children's Privacy

- NumberMerge is suitable for users of all ages
- We do not knowingly collect personal information from children under 13
- If we become aware that we have collected such information, we will take steps to delete it

## 9. Changes to This Privacy Policy

- We may update this Privacy Policy from time to time
- Significant changes will be notified through app updates or in-app notifications
- Your continued use of the app after changes constitutes acceptance of the updated policy

## 10. Contact Information

If you have questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact us through:

- **In-App Support**: Use the support option in the app settings
- **Email**: zainisdrained@gmail.com
- **GitHub Issues**: https://github.com/P3nguin152/numbermerge

## 11. Legal Basis for Processing

- For leaderboard functionality: Your consent (given when registering a username)
- For local game storage: Legitimate interest (providing core app functionality)
- For security measures: Legitimate interest (protecting the app and users)

## 12. International Data Transfers

- Your leaderboard data may be stored on servers located outside your country
- Supabase may process data in accordance with their data processing agreements
- Appropriate safeguards are in place to protect your data during international transfers

---

**Effective Date**: April 12, 2026
