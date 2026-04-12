# Data Safety Documentation - NumberMerge

**Last Updated:** April 12, 2026

This document provides detailed information about data collection, storage, and security practices for NumberMerge, as required by Google Play Console's Data Safety section.

---

## Data Collection

### Personal Information
- **Data Type**: Username
- **Purpose**: Leaderboard identification and display
- **Collection Method**: User-provided during registration
- **Optional**: Yes - users can play without registering
- **Sharing**: Publicly displayed on leaderboard

### App Activity
- **Data Types**: 
  - Game scores
  - Best tile values achieved
  - Number of games played
  - Current game state (grid, score, next tile)
- **Purpose**: 
  - Leaderboard functionality (scores, best tiles, games played)
  - Game progress persistence (current game state)
- **Collection Method**: Automatically collected during gameplay
- **Storage**: 
  - Leaderboard data: Cloud (Supabase)
  - Game state: Local device storage

### Device Identifiers
- **Data Type**: None collected
- **Note**: We do not collect device identifiers, advertising IDs, or tracking identifiers

---

## Data Storage Locations

### Local Storage (Device)
- **Storage Technology**: React Native AsyncStorage
- **Data Stored**:
  - Current game state (grid, score, next tile)
  - User preferences (sound, music, vibration settings)
  - Username (if registered)
  - Avatar selection
  - Statistics (total games played, personal best)
- **Encryption**: Uses device's local storage encryption (platform-dependent)
- **Retention**: Until user deletes app or clears app data
- **User Control**: Can be cleared through app settings

### Cloud Storage (Supabase)
- **Storage Technology**: Supabase (PostgreSQL database)
- **Data Stored**:
  - Username
  - High score
  - Best tile achieved
  - Total games played
  - Timestamp of last update
- **Encryption**:
  - In transit: TLS 1.2/1.3 (HTTPS)
  - At rest: Supabase's database encryption
- **Data Center**: Supabase's cloud infrastructure (region-specific based on project configuration)
- **Retention**: Indefinite until user requests deletion
- **Security**: Row Level Security (RLS) policies enabled

---

## Data Sharing Practices

### Shared with Other Users
- **Data**: Username, scores, best tiles, games played
- **Purpose**: Public leaderboard display
- **Scope**: All app users can view leaderboard
- **Control**: Users can choose not to register (no sharing)

### Shared with Third Parties
- **Supabase**: Cloud database provider for leaderboard storage
  - Data shared: Username, scores, game statistics
  - Purpose: Data storage and retrieval
  - Legal basis: Data processing agreement with Supabase
  
- **Google Play**: App distribution platform
  - Data shared: None directly (Google may collect their own metrics)
  - Purpose: App distribution and updates

### Data NOT Shared
- We do not share data with:
  - Advertisers
  - Data brokers
  - Marketing companies
  - Social media platforms
  - Any other third parties not listed above

---

## Security Practices

### Data Protection
1. **Input Validation**: All user inputs are sanitized and validated before processing
   - Username validation: Length limits, character restrictions, reserved name blocking
   - Score validation: Range checking to prevent abuse
   - Tile value validation: Prevents unreasonably large values

2. **API Security**:
   - Rate limiting on all API calls:
     - Score submission: 5 requests per minute per user
     - Leaderboard fetch: 10 requests per minute globally
     - Username checks: 3 requests per minute per user
     - Profile fetches: 10 requests per minute per user
   - Environment variables for sensitive configuration (API keys)
   - No hardcoded credentials in source code

3. **Authentication**:
   - Supabase Row Level Security (RLS) policies
   - Anonymous key-based authentication (no user passwords required)
   - No sensitive authentication data stored on device

4. **Network Security**:
   - All API calls use HTTPS/TLS encryption
   - Certificate pinning (if implemented in future)
   - Secure default configurations

### Code Security
1. **Dependency Management**:
   - Regular security audits of npm dependencies
   - Use of locked package versions (package-lock.json)
   - Review of security advisories

2. **Secrets Management**:
   - API keys stored in environment variables
   - .env files included in .gitignore
   - .env.example contains placeholder values only

3. **Input Sanitization**:
   - Centralized validation utilities
   - XSS prevention (HTML tag removal)
   - SQL injection prevention (parameterized queries via Supabase)

---

## User Rights and Data Deletion

### Data Access
- Users can view their leaderboard profile in-app
- Local data can be viewed through app settings

### Data Deletion
1. **Local Data**:
   - Can be deleted through app settings ("Reset Game Data")
   - Automatically deleted when app is uninstalled
   - Users can clear app data through device settings

2. **Cloud Data (Leaderboard)**:
   - Users can request deletion by contacting support
   - Deletion process:
     - User provides username for verification
     - Data is removed from Supabase database
     - Confirmation sent to user
   - Timeline: Within 7 business days of request

### Data Modification
- Username can be changed through app settings
- Game statistics are updated automatically with new scores

---

## Compliance

### GDPR (General Data Protection Regulation)
- **Legal Basis**: Consent (user agrees when registering username)
- **Data Subject Rights**: Access, rectification, erasure, portability
- **Data Transfer**: International transfers to Supabase (with appropriate safeguards)
- **Data Protection Officer**: Not required (small-scale data processing)

### COPPA (Children's Online Privacy Protection Act)
- **Age Appropriate**: Suitable for all ages
- **No Collection from Children Under 13**: Without parental consent
- **No Directed Content**: Not specifically targeted at children

### CCPA (California Consumer Privacy Act)
- **Data Categories**: Username, game scores, game statistics
- **Business Purpose**: Providing leaderboard functionality
- **Opt-Out**: Users can choose not to register (no data collection)
- **Non-Disclosure**: We do not sell personal information

---

## Data Retention

### Local Data
- **Retention Period**: Until app deletion or user clears data
- **Automatic Deletion**: When app is uninstalled
- **User Control**: Can delete at any time through settings

### Cloud Data
- **Retention Period**: Indefinite (until user requests deletion)
- **Automatic Deletion**: None (manual deletion request required)
- **User Control**: Can request deletion at any time

---

## Incident Response

### Data Breach Notification
- In the event of a data breach:
  1. Immediate investigation and containment
  2. Assessment of affected data and users
  3. Notification to affected users within 72 hours (if required by law)
  4. Notification to relevant authorities (if required by law)
  5. Public disclosure (if significant impact)

### Security Incident Reporting
- Users can report security concerns through:
  - In-app support
  - Email support
  - GitHub security issues (if applicable)

---

## Third-Party Services

### Supabase
- **Purpose**: Cloud database for leaderboard
- **Data Shared**: Username, scores, game statistics
- **Privacy Policy**: https://supabase.com/privacy
- **Data Processing Agreement**: Available upon request
- **Data Location**: Configured in Supabase project settings

### Google Play Services
- **Purpose**: App distribution and updates
- **Data Shared**: None directly (Google's own data collection separate)
- **Privacy Policy**: https://policies.google.com/privacy

---

## Contact Information

For data-related inquiries, deletion requests, or security concerns:

- **In-App**: Settings → Support
- **Email**: [Support email to be added before publication]
- **GitHub**: [Repository URL to be added before publication]

---

**Document Version**: 1.0  
**Last Updated**: April 12, 2026  
**Next Review**: July 12, 2026
