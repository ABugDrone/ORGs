# Expo — Comprehensive Documentation Skill Reference

Source: https://docs.expo.dev
Last Verified: 2026-04-10
SDK Version: 55 (latest)

---

## What is Expo?

Expo is a **React Native framework** for building universal apps that run on Android, iOS, and web from a single JavaScript/TypeScript codebase. It provides:

- File-based routing (Expo Router)
- Standard library of native modules (Expo SDK)
- Build service (EAS Build)
- OTA updates (EAS Update)
- App store submission (EAS Submit)
- Development tooling (Expo Go, Dev Builds)

Expo apps ARE React Native apps — all Expo SDK packages work in any React Native app with the `expo` package installed.

---

## System Requirements

- Node.js LTS
- Windows (PowerShell + WSL 2), macOS, or Linux
- For iOS builds: macOS + Xcode required
- For Android builds: Android Studio (or EAS Build cloud)

---

## Creating a Project

```bash
# Create new project with default template (SDK 55)
npx create-expo-app@latest --template default@sdk-55

# Bare minimum template
npx create-expo-app my-app --template bare-minimum

# Start the dev server
npx expo start

# Open on specific platform
# Press 'a' → Android (needs Android Studio)
# Press 'i' → iOS (needs macOS + Xcode)
# Press 'w' → Web browser
```

---

## Project Structure

```
my-app/
├── app/                    # Expo Router — file-based routes
│   ├── _layout.tsx         # Root layout
│   ├── index.tsx           # Home screen (/)
│   ├── (tabs)/             # Tab group
│   │   ├── _layout.tsx     # Tab bar config
│   │   ├── index.tsx       # First tab
│   │   └── settings.tsx    # Second tab
│   └── [id].tsx            # Dynamic route
├── assets/                 # Images, fonts, etc.
├── components/             # Reusable components
├── app.json                # App config (name, icon, splash, etc.)
├── app.config.ts           # Dynamic config (optional)
├── eas.json                # EAS Build profiles
└── package.json
```

---

## Expo Router — File-Based Navigation

Every file in `app/` automatically becomes a route. No manual route registration needed.

### Route types

```
app/index.tsx           → /
app/about.tsx           → /about
app/[id].tsx            → /123, /abc (dynamic)
app/(tabs)/index.tsx    → / (tab group)
app/(tabs)/profile.tsx  → /profile (tab group)
app/modal.tsx           → /modal
```

### Layout files

```tsx
// app/_layout.tsx — Root layout with Stack navigator
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Home' }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
    </Stack>
  );
}

// app/(tabs)/_layout.tsx — Tab bar layout
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="home" color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: 'Settings' }}
      />
    </Tabs>
  );
}
```

### Navigation

```tsx
import { Link, router } from 'expo-router';

// Declarative navigation
<Link href="/about">Go to About</Link>
<Link href="/user/123">View User</Link>
<Link href={{ pathname: '/user/[id]', params: { id: '123' } }}>User</Link>

// Programmatic navigation
router.push('/about');
router.replace('/login');
router.back();
router.navigate('/profile');

// Access route params
import { useLocalSearchParams } from 'expo-router';
const { id } = useLocalSearchParams<{ id: string }>();
```

---

## Expo SDK — Native Modules

Install any SDK package:

```bash
npx expo install expo-camera expo-contacts expo-sensors expo-image-picker
```

### Common SDK packages

```tsx
// Camera
import { CameraView, useCameraPermissions } from 'expo-camera';

// Image Picker
import * as ImagePicker from 'expo-image-picker';
const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ['images'],
  allowsEditing: true,
  quality: 1,
});

// File System
import * as FileSystem from 'expo-file-system';
await FileSystem.writeAsStringAsync(FileSystem.documentDirectory + 'file.txt', 'content');
const content = await FileSystem.readAsStringAsync(uri);

// Notifications
import * as Notifications from 'expo-notifications';
await Notifications.scheduleNotificationAsync({
  content: { title: 'Reminder', body: 'Back up your files!' },
  trigger: { weekday: 7, hour: 10, minute: 0, repeats: true }, // Sunday 10am
});

// AsyncStorage (persistent key-value)
import AsyncStorage from '@react-native-async-storage/async-storage';
await AsyncStorage.setItem('key', JSON.stringify(value));
const value = JSON.parse(await AsyncStorage.getItem('key') ?? 'null');

// Haptics
import * as Haptics from 'expo-haptics';
await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

// Sharing
import * as Sharing from 'expo-sharing';
await Sharing.shareAsync(fileUri);

// Constants (app config at runtime)
import Constants from 'expo-constants';
const appVersion = Constants.expoConfig?.version;
```

---

## app.json / app.config.ts

Central configuration for the app:

```json
{
  "expo": {
    "name": "ORGs",
    "slug": "orgs-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#0d1117"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.dronebug.orgs"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#0d1117"
      },
      "package": "com.dronebug.orgs"
    },
    "web": {
      "favicon": "./assets/favicon.png",
      "bundler": "metro"
    },
    "plugins": [
      "expo-router",
      ["expo-camera", { "cameraPermission": "Allow ORGs to access your camera." }]
    ],
    "scheme": "orgs",
    "extra": {
      "eas": { "projectId": "your-project-id" }
    }
  }
}
```

### Dynamic config (app.config.ts)

```typescript
import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: process.env.APP_ENV === 'production' ? 'ORGs' : 'ORGs (Dev)',
  version: process.env.APP_VERSION || '1.0.0',
  extra: {
    apiUrl: process.env.API_URL,
    environment: process.env.APP_ENV,
  },
});
```

---

## Development Workflow

### Expo Go vs Development Builds

| Feature | Expo Go | Development Build |
|---------|---------|-------------------|
| Setup | Scan QR code | Build native app |
| Custom native modules | ❌ | ✅ |
| Custom app icon/splash | ❌ | ✅ |
| Push notifications | ❌ | ✅ |
| Universal/App links | ❌ | ✅ |
| Production parity | ❌ | ✅ |
| Best for | Learning/prototyping | Production apps |

### Development Build

```bash
# Install dev client
npx expo install expo-dev-client

# Build dev client (EAS)
eas build --profile development --platform android
eas build --profile development --platform ios

# Or build locally
npx expo run:android
npx expo run:ios
```

### Prebuild (Continuous Native Generation)

```bash
# Generate native android/ and ios/ directories
npx expo prebuild

# Clean regenerate
npx expo prebuild --clean

# Run after prebuild
npx expo run:android
npx expo run:ios
```

---

## EAS Build — Cloud Builds

EAS Build builds your app binaries in the cloud — no local Xcode or Android Studio needed for production builds.

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure project
eas build:configure

# Build for both platforms
eas build --platform all

# Build for specific platform
eas build --platform android
eas build --platform ios

# Build and auto-submit to stores
eas build --platform all --auto-submit
```

### eas.json profiles

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": { "buildType": "apk" }
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {
      "android": { "serviceAccountKeyPath": "./google-service-account.json" },
      "ios": { "appleId": "you@example.com" }
    }
  }
}
```

---

## EAS Update — OTA Updates

Push JavaScript/asset updates without going through the app store.

```bash
# Install
npx expo install expo-updates
eas update:configure

# Publish update to production
eas update --channel production --message "Fix file upload bug"

# Publish to preview channel
eas update --channel preview --message "Test new feature"
```

### In-app update check

```tsx
import * as Updates from 'expo-updates';

async function checkForUpdate() {
  const update = await Updates.checkForUpdateAsync();
  if (update.isAvailable) {
    await Updates.fetchUpdateAsync();
    await Updates.reloadAsync(); // restart app with new update
  }
}

// React hook
const { isUpdateAvailable, isUpdatePending } = Updates.useUpdates();
```

---

## Distribution

```bash
# Submit to Google Play Store
eas submit --platform android

# Submit to Apple App Store
eas submit --platform ios

# Build + submit in one command
eas build --platform all --auto-submit
```

---

## Config Plugins

Config plugins modify native code during `prebuild`. Used to configure native libraries.

```typescript
// app.config.ts
export default {
  plugins: [
    // Simple plugin
    'expo-router',

    // Plugin with options
    ['expo-camera', {
      cameraPermission: 'Allow ORGs to access your camera.',
      microphonePermission: 'Allow ORGs to access your microphone.',
    }],

    // Custom plugin
    ['./plugins/withCustomAndroidManifest', { someOption: true }],
  ],
};
```

---

## Key CLI Commands

```bash
npx expo start                    # Start dev server
npx expo start --clear            # Clear cache and start
npx expo install <package>        # Install SDK package (version-safe)
npx expo prebuild                 # Generate native directories
npx expo prebuild --clean         # Clean + regenerate native dirs
npx expo run:android              # Build + run on Android
npx expo run:ios                  # Build + run on iOS
npx expo export                   # Export for web hosting
npx expo config                   # Show resolved app config
npx expo doctor                   # Check for issues

eas build --platform all          # Cloud build both platforms
eas build --platform android      # Cloud build Android
eas build --platform ios          # Cloud build iOS
eas update --channel production   # Push OTA update
eas submit --platform android     # Submit to Play Store
eas submit --platform ios         # Submit to App Store
eas build:configure               # Set up EAS Build
eas update:configure              # Set up EAS Update
```

---

## Expo vs React Native CLI

| Feature | Expo (Managed) | React Native CLI |
|---------|---------------|-----------------|
| Setup | `npx create-expo-app` | `npx @react-native-community/cli init` |
| Native modules | Expo SDK + Config Plugins | Manual linking |
| OTA updates | EAS Update built-in | Manual setup |
| Cloud builds | EAS Build | Manual CI |
| File-based routing | Expo Router | Manual setup |
| Ejecting | `npx expo prebuild` | N/A |
| Best for | Most apps | Full native control |

---

## Relevance to ORGs Project

Expo is the recommended path if ORGs ever needs a **mobile companion app** (Android/iOS). Key benefits:
- Same React/TypeScript codebase as the desktop app
- Expo Router mirrors React Router patterns already used
- EAS Build handles Android APK + iOS IPA without local Xcode/Android Studio
- EAS Update allows pushing fixes without app store review
- `expo-file-system` for mobile file management
- `expo-notifications` for weekend backup reminders on mobile

---

*Content sourced from [docs.expo.dev](https://docs.expo.dev) — paraphrased for compliance with licensing restrictions.*
