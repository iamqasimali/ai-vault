# AI Vault 🔐
---
A secure, cross-platform mobile application built with **Expo** to manage your developer resources like API keys, important websites, MFA backup codes, and more — all stored **locally and encrypted** on your device.

> 🛡️ **100% on-device. Zero cloud. Maximum privacy.**

---

## ✨ Features

- **Categorized Storage**: Organize sensitive data into three secure categories:
  - Websites
  - API Keys
  - MFA Backup Codes
- **Biometric Authentication**: Unlock your vault using Face ID, Touch ID, or Fingerprint (`expo-local-authentication`).
- **On-Device Encryption**: All data is encrypted at rest using `expo-secure-store`. Nothing leaves your device.
- **Full CRUD Operations**: Add, view, edit, and delete entries with a clean, intuitive UI.
- **Quick Search**: Instantly find any item across all categories.
- **Import / Export**: Back up or migrate your entire vault as a password-protected JSON file.
- **Secure Wipe**: Permanently erase all data with one tap.
- **Dynamic Theming**: Automatic light/dark mode that follows your system preference.
- **AI Tools Explorer**: Discover popular AI platforms and services in the “Explore” tab.
- **Universal App**: Runs seamlessly on **iOS**, **Android**, and **Web** using a single codebase.

---

## 🛠️ Tech Stack

| Layer              | Technology                                                                 |
|--------------------|----------------------------------------------------------------------------|
| Framework          | [Expo](https://expo.dev) (React Native + Web)                              |
| Language           | TypeScript                                                                 |
| Routing            | [Expo Router](https://docs.expo.dev/router/introduction/) (file-based)     |
| Secure Storage     | [`expo-secure-store`](https://docs.expo.dev/versions/latest/sdk/securestore/) |
| Biometric Auth     | [`expo-local-authentication`](https://docs.expo.dev/versions/latest/sdk/local-authentication/) |
| Icons              | [Lucide React Native](https://lucide.dev) + [Expo Symbols](https://docs.expo.dev/versions/latest/sdk/symbols/) |
| Styling            | Tailwind-like utility classes via `nativewind` (or inline styles)           |
| Platform Support   | iOS, Android, Web (universal)                                              |

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18.x
- npm or yarn
- (Optional) Android Studio / Xcode for native simulators
- (Optional) Physical iOS/Android device for testing

### Installation

1. **Clone or navigate to your project directory**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

4. **Open the app** using one of the following:
   - Press `a` → Open in **Android emulator**
   - Press `i` → Open in **iOS simulator** (macOS only)
   - Scan QR code with **Expo Go** app on your phone
   - Press `d` → Open in **development build** (for advanced native features)

> 💡 This project uses **file-based routing**. Edit files inside the `app/` directory to build your UI.

---

## 🧪 Development Workflow

### Reset to a Blank Project (Optional)

To start fresh while preserving the example:

```bash
npm run reset-project
```

This moves the starter code to `app-example/` and creates an empty `app/` directory.

---

## 🔒 Security Notes

- **No data is ever sent to the cloud** — everything stays on-device.
- `expo-secure-store` uses platform-specific encryption:
  - **iOS**: Keychain Services
  - **Android**: Encrypted SharedPreferences (with Android KeyStore)
- Biometric auth is used only as a convenience layer — the underlying data remains encrypted regardless.
- Exported JSON backups are **not encrypted by default**. It is recommended to protect them with a password or store them in a secure location.

---

## 📚 Learn More

- [Expo Documentation](https://docs.expo.dev/)
- [Expo Router Guide](https://docs.expo.dev/router/introduction/)
- [Learn Expo Tutorial](https://docs.expo.dev/tutorial/introduction/) – Build a universal app from scratch
- [Expo SDK APIs](https://docs.expo.dev/versions/latest/)

---

## 💬 Join the Community

- 🐙 [Expo on GitHub](https://github.com/expo/expo)
- 💬 [Expo Discord](https://chat.expo.dev)
- ▶️ [Expo YouTube](https://www.youtube.com/@expo)

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---

> Built with ❤️ using **Expo** — because privacy shouldn’t be optional.
```