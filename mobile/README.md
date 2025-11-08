# RapidPhotoUpload Mobile Application

Mobile application for RapidPhotoUpload built with Expo, React Native, and TypeScript.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Expo Go app installed on your iOS/Android device OR iOS Simulator/Android Emulator set up
- Backend API running at `http://10.10.0.45:8080`

## Setup

1. Install dependencies:
```bash
npm install
```

2. Ensure your device/simulator is on the same network as your development machine (for local network API access)

## Running the App

### Using Expo Go (Recommended for Development)

1. Start the Expo development server:
```bash
npm start
# or
npx expo start
```

2. Scan the QR code:
   - **iOS**: Open Camera app and scan QR code, or use Expo Go app
   - **Android**: Open Expo Go app and scan QR code

3. The app will load in Expo Go on your device

### Using iOS Simulator (macOS only)

```bash
npm run ios
```

### Using Android Emulator

```bash
npm run android
```

## Project Structure

```
mobile/
├── app/                    # Expo Router (future phase)
├── src/
│   ├── components/         # Reusable React components
│   ├── lib/                # Utilities and configurations
│   │   ├── api/            # API client (future phase)
│   │   ├── config/         # Environment configuration
│   │   ├── hooks/          # Custom React hooks
│   │   ├── queries/         # TanStack Query hooks (future phase)
│   │   ├── stores/          # Zustand stores (future phase)
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Utility functions
│   ├── screens/            # Screen components (future phase)
│   ├── navigation/         # Navigation configuration (future phase)
│   └── services/           # Service layer (storage, permissions)
├── assets/                 # Static assets (images, fonts, icons)
├── App.tsx                 # Main application entry point
├── app.json                # Expo configuration
├── package.json            # Dependencies and scripts
└── tsconfig.json           # TypeScript configuration
```

## Configuration

### API Endpoint

The API base URL is configured in `src/lib/config/environment.ts`:

```typescript
export const API_BASE_URL = 'http://10.10.0.45:8080';
```

**Note**: Ensure your device/simulator can reach this IP address on your local network. If your backend is running on a different IP or port, update this configuration.

## Development

### Hot Reload

The app supports hot reload. Changes to your code will automatically refresh in Expo Go.

### TypeScript

The project uses TypeScript with strict mode enabled. Path aliases are configured:
- `@/*` maps to `src/*`

Example:
```typescript
import { API_BASE_URL } from '@/lib/config/environment';
```

## Current Status

This is the initial hello world setup. The following features will be added in subsequent phases:

- ✅ Project initialization and basic structure
- ✅ TypeScript configuration with path aliases
- ✅ Environment configuration
- ⏳ Expo Router for file-based navigation
- ⏳ State management (Zustand + TanStack Query)
- ⏳ API client with JWT authentication
- ⏳ Authentication screens
- ⏳ Photo upload functionality
- ⏳ Photo gallery and management

## Troubleshooting

### Cannot connect to API

- Ensure backend is running at `http://10.10.0.45:8080`
- Verify device/simulator is on the same network
- Check firewall settings if using physical device
- For iOS Simulator, `localhost` or `127.0.0.1` may work instead of local IP

### Expo Go not connecting

- Ensure device and computer are on the same Wi-Fi network
- Try restarting Expo development server
- Clear Expo Go cache and restart app

### TypeScript errors

- Run `npm install` to ensure all dependencies are installed
- Check `tsconfig.json` configuration
- Ensure file paths match the configured path aliases

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)

## License

Private project - RapidPhotoUpload

