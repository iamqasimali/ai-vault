// app/(tabs)/index.tsx
import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Link } from 'expo-router';
import { Globe, Key, Lock, Shield } from 'lucide-react-native';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#667eea', dark: '#1a1a2e' }}
      headerImage={
        <View style={styles.headerImageContainer}>
          <Lock size={120} color="rgba(255,255,255,0.9)" />
        </View>
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome to AI Vault</ThemedText>
        <HelloWave />
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Your Secure Digital Hub</ThemedText>
        <ThemedText>
          AI Vault is your trusted companion for managing developer resources. Store API keys, 
          save important websites, and keep MFA backup codes safe—all in one encrypted location.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.featuresContainer}>
        <ThemedText type="subtitle" style={{ marginBottom: 16 }}>
          What You Can Store
        </ThemedText>
        
        <ThemedView style={{ ...styles.featureCard, backgroundColor: themeColors.card, borderColor: themeColors.border }}>
          <View style={[styles.iconContainer, { backgroundColor: themeColors.primary + '20' }]}>
            <Globe size={24} color={themeColors.primary} />
          </View>
          <View style={styles.featureContent}>
            <ThemedText type="defaultSemiBold">AI Websites & Tools</ThemedText>
            <ThemedText type="secondary" style={styles.featureDescription}>
              Save URLs, descriptions, and organize by category
            </ThemedText>
          </View>
        </ThemedView>

        <ThemedView style={{ ...styles.featureCard, backgroundColor: themeColors.card, borderColor: themeColors.border }}>
          <View style={[styles.iconContainer, { backgroundColor: themeColors.primary + '20' }]}>
            <Key size={24} color={themeColors.primary} />
          </View>
          <View style={styles.featureContent}>
            <ThemedText type="defaultSemiBold">API Keys & Tokens</ThemedText>
            <ThemedText type="secondary" style={styles.featureDescription}>
              Securely store API credentials with expiry tracking
            </ThemedText>
          </View>
        </ThemedView>

        <ThemedView style={{ ...styles.featureCard, backgroundColor: themeColors.card, borderColor: themeColors.border }}>
          <View style={[styles.iconContainer, { backgroundColor: themeColors.primary + '20' }]}>
            <Shield size={24} color={themeColors.primary} />
          </View>
          <View style={styles.featureContent}>
            <ThemedText type="defaultSemiBold">MFA Backup Codes</ThemedText>
            <ThemedText type="secondary" style={styles.featureDescription}>
              Keep 2FA recovery codes safe and accessible
            </ThemedText>
          </View>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.ctaContainer}>
        <ThemedText type="subtitle" style={{ marginBottom: 12 }}>
          Ready to Get Started?
        </ThemedText>
        <ThemedText style={{ marginBottom: 20 }}>
          Your data is protected with biometric authentication and secure storage. 
          Everything stays on your device.
        </ThemedText>
        <Link href="/vault" asChild>
          <TouchableOpacity style={{ ...styles.button, backgroundColor: themeColors.primary }}>
            <IconSymbol name="lock.shield.fill" size={20} color="white" />
            <ThemedText style={styles.buttonText}>Open My Vault</ThemedText>
          </TouchableOpacity>
        </Link>
      </ThemedView>

      <ThemedView style={styles.securityNote}>
        <IconSymbol name="checkmark.shield.fill" size={20} color={themeColors.primary} />
        <ThemedText type="secondary" style={{ flex: 1, fontSize: 12 }}>
          All data is encrypted and stored locally on your device. We never send your information to external servers.
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImageContainer: {
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 24,
  },
  featuresContainer: {
    gap: 12,
    marginBottom: 24,
  },
  featureCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 16,
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureContent: {
    flex: 1,
    gap: 4,
  },
  featureDescription: {
    fontSize: 13,
  },
  ctaContainer: {
    marginBottom: 24,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
  },
});