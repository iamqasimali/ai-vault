import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import * as Clipboard from 'expo-clipboard';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import * as Sharing from 'expo-sharing';
import * as WebBrowser from 'expo-web-browser';
import {
    Copy,
    Edit,
    Eye,
    EyeOff,
    Fingerprint,
    Globe,
    Key,
    Plus,
    Search,
    Settings,
    Shield,
    Trash2,
    X,
} from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    AppState,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    TextInput,
    TouchableOpacity,
    View,
    
} from 'react-native';

const AIVault = () => {
  const colorScheme = useColorScheme();
  const [activeTab, setActiveTab] = useState('websites');
  const [searchQuery, setSearchQuery] = useState('');

  // Data states
  const [websites, setWebsites] = useState([]);
  const [apiKeys, setApiKeys] = useState([]);
  const [mfaTokens, setMfaTokens] = useState([]);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showPassword, setShowPassword] = useState({});

  // Form states
  const [formData, setFormData] = useState({});

  // Security state
  const [isUnlocked, setIsUnlocked] = useState(false);

  // Add these state variables at the top with other states
  const [autoLockEnabled, setAutoLockEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const websitesData = await SecureStore.getItemAsync('websites');
      const apiKeysData = await SecureStore.getItemAsync('apiKeys');
      const mfaData = await SecureStore.getItemAsync('mfaTokens');

      if (websitesData) setWebsites(JSON.parse(websitesData));
      if (apiKeysData) setApiKeys(JSON.parse(apiKeysData));
      if (mfaData) setMfaTokens(JSON.parse(mfaData));
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data from secure store.');
    }
  }, []);

  const saveData = useCallback(async () => {
    try {
      await SecureStore.setItemAsync('websites', JSON.stringify(websites));
      await SecureStore.setItemAsync('apiKeys', JSON.stringify(apiKeys));
      await SecureStore.setItemAsync('mfaTokens', JSON.stringify(mfaTokens));
    } catch (error) {
      console.error('Error saving data:', error);
      Alert.alert('Error', 'Failed to save data securely.');
    }
  }, [websites, apiKeys, mfaTokens]);

  // Load data on mount
  useEffect(() => {
    if (isUnlocked) {
      loadData();
    }
  }, [isUnlocked, loadData]);

  // Save data whenever it changes
  useEffect(() => {
    if (!isUnlocked) return;
    saveData();
  }, [isUnlocked, saveData]);

  // Re-lock the vault when the app goes to the background
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (autoLockEnabled && nextAppState.match(/inactive|background/)) {
        setIsUnlocked(false);
        setSearchQuery(''); // Clear search on re-lock
      }
    });

    return () => {
      subscription.remove();
    };
  }, [autoLockEnabled]);

  // Trigger authentication when the screen is focused and not unlocked
  useEffect(() => {
    if (!isUnlocked && biometricEnabled) {
      handleBiometricAuth();
    }
  }, [isUnlocked, biometricEnabled]);

  const handleBiometricAuth = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    // For development on simulators or devices without biometrics, we can bypass.
    // In a production app, you might want a PIN fallback.
    if (!biometricEnabled || !hasHardware || !isEnrolled) {
      setIsUnlocked(true); // Bypass for simplicity
      return;
    }

    const { success } = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to access AI Vault',
      cancelLabel: 'Cancel',
      disableDeviceFallback: true, // To not allow device passcode fallback
    });

    if (success) {
      setIsUnlocked(true);
    }
  };

  const handleAdd = () => {
    if (!formData.name) {
      Alert.alert('Validation Error', 'Please enter a name');
      return;
    }

    const timestamp = new Date().toISOString();
    const newItem = {
      id: Date.now().toString(),
      ...formData,
      created_at: timestamp,
      updated_at: timestamp,
    };

    if (activeTab === 'websites') {
      setWebsites([...websites, newItem]);
    } else if (activeTab === 'apiKeys') {
      setApiKeys([...apiKeys, newItem]);
    } else if (activeTab === 'mfa') {
      setMfaTokens([...mfaTokens, newItem]);
    }

    setShowAddModal(false);
    setFormData({});
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData(item);
    setShowAddModal(true);
  };

  const handleUpdate = () => {
    if (!formData.name) {
      Alert.alert('Validation Error', 'Please enter a name');
      return;
    }

    const updatedItem = {
      ...formData,
      updated_at: new Date().toISOString(),
    };

    if (activeTab === 'websites') {
      setWebsites(websites.map((w) => (w.id === editingItem.id ? updatedItem : w)));
    } else if (activeTab === 'apiKeys') {
      setApiKeys(apiKeys.map((k) => (k.id === editingItem.id ? updatedItem : k)));
    } else if (activeTab === 'mfa') {
      setMfaTokens(mfaTokens.map((m) => (m.id === editingItem.id ? updatedItem : m)));
    }

    setShowAddModal(false);
    setFormData({});
    setEditingItem(null);
  };

  const handleDelete = (id) => {
    Alert.alert('Confirm Deletion', 'Are you sure you want to delete this item?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          if (activeTab === 'websites') {
            setWebsites(websites.filter((w) => w.id !== id));
          } else if (activeTab === 'apiKeys') {
            setApiKeys(apiKeys.filter((k) => k.id !== id));
          } else if (activeTab === 'mfa') {
            setMfaTokens(mfaTokens.filter((m) => m.id !== id));
          }
        },
      },
    ]);
  };

  // Add these functions for export/import
  const exportData = async () => {
    try {
      const data = {
        websites,
        apiKeys,
        mfaTokens,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };
  
      const jsonString = JSON.stringify(data, null, 2);
      const fileUri = FileSystem.documentDirectory + `ai-vault-backup-${Date.now()}.json`;
      
      await FileSystem.writeAsStringAsync(fileUri, jsonString);
      
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri);
        Alert.alert('Success', 'Data exported successfully!');
      } else {
        Alert.alert('Error', 'Sharing is not available on this device');
      }
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Error', 'Failed to export data');
    }
  };
  
  const importData = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true
      });
  
      if (result.type === 'cancel') return;
  
      const content = await FileSystem.readAsStringAsync(result.uri);
      const data = JSON.parse(content);
  
      Alert.alert(
        'Import Data',
        'This will replace all current data. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Import',
            style: 'destructive',
            onPress: () => {
              if (data.websites) setWebsites(data.websites);
              if (data.apiKeys) setApiKeys(data.apiKeys);
              if (data.mfaTokens) setMfaTokens(data.mfaTokens);
              Alert.alert('Success', 'Data imported successfully!');
            }
          }
        ]
      );
    } catch (error) {
      console.error('Import error:', error);
      Alert.alert('Error', 'Failed to import data. Please check the file format.');
    }
  };
  
  const clearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all stored data. This action cannot be undone!',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            setWebsites([]);
            setApiKeys([]);
            setMfaTokens([]);
            await SecureStore.deleteItemAsync('websites');
            await SecureStore.deleteItemAsync('apiKeys');
            await SecureStore.deleteItemAsync('mfaTokens');
            Alert.alert('Success', 'All data has been cleared');
          }
        }
      ]
    );
  };
  
  const getDataStats = () => {
    return {
      websites: websites.length,
      apiKeys: apiKeys.length,
      mfaTokens: mfaTokens.length,
      total: websites.length + apiKeys.length + mfaTokens.length
    };
  };

  const copyToClipboard = async (text) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Success', 'Copied to clipboard!');
  };

  const getFilteredData = () => {
    let data = [];
    if (activeTab === 'websites') data = websites;
    else if (activeTab === 'apiKeys') data = apiKeys;
    else if (activeTab === 'mfa') data = mfaTokens;

    if (!searchQuery) return data;

    return data.filter(
      (item) =>
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.platform?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const themeColors = Colors[colorScheme];

  const styles = StyleSheet.create({
    card: {
      backgroundColor: themeColors.card,
      padding: 16,
      marginBottom: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: themeColors.border,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    cardBody: { flex: 1 },
    cardUrl: { color: Colors[colorScheme ?? 'light'].primary, fontSize: 14, marginBottom: 8 },
    categoryBadge: {
      backgroundColor: Colors[colorScheme ?? 'light'].primary + '20',
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
      alignSelf: 'flex-start',
      marginTop: 4,
    },
    categoryText: { color: Colors[colorScheme ?? 'light'].primary, fontSize: 12, fontWeight: '500' },
    cardActions: { flexDirection: 'row', gap: 8 },
    actionButton: { padding: 8 },
    secretRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    secretText: {
      fontSize: 14,
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
      flex: 1,
    },
    eyeButton: { padding: 4, marginRight: 8 },
    copyButton: { padding: 4 },
    expiryText: { color: Colors[colorScheme ?? 'light'].danger, fontSize: 12 },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 24,
      maxHeight: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    textInput: {
      backgroundColor: themeColors.card,
      color: themeColors.text,
      padding: 14,
      borderRadius: 8,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: themeColors.border,
    },
    multilineInput: {
      textAlignVertical: 'top',
      height: 80,
    },
    submitButton: {
      backgroundColor: Colors[colorScheme ?? 'light'].primary,
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 8,
    },
    // Add other styles here to avoid inline styling
  });

  const renderWebsiteCard = (item) => (
    <ThemedView key={item.id} style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardBody}>
          <ThemedText type="subtitle">{item.name}</ThemedText>
          {item.url && (
            <ThemedText style={styles.cardUrl} onPress={() => WebBrowser.openBrowserAsync(item.url)}>
              {item.url}
            </ThemedText>
          )}
          {item.description && <ThemedText type="secondary">{item.description}</ThemedText>}
          {item.category && (
            <ThemedView style={styles.categoryBadge}>
              <ThemedText style={styles.categoryText}>{item.category}</ThemedText>
            </ThemedView>
          )}
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity onPress={() => handleEdit(item)} style={styles.actionButton}>
            <Edit size={18} color={themeColors.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionButton}>
            <Trash2 size={18} color={Colors[colorScheme ?? 'light'].danger} />
          </TouchableOpacity>
        </View>
      </View>
    </ThemedView>
  );

  const renderAPIKeyCard = (item) => (
    <ThemedView key={item.id} style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardBody}>
          <ThemedText type="subtitle">{item.name}</ThemedText>
          {item.platform && <ThemedText type="secondary">Platform: {item.platform}</ThemedText>}
          {item.apiKey && (
            <View style={styles.secretRow}>
              <ThemedText style={styles.secretText}>
                {showPassword[item.id] ? item.apiKey : '••••••••••••••••'}
              </ThemedText>
              <TouchableOpacity
                onPress={() => setShowPassword({ ...showPassword, [item.id]: !showPassword[item.id] })}
                style={styles.eyeButton}>
                {showPassword[item.id] ? (
                  <EyeOff size={16} color={themeColors.icon} />
                ) : (
                  <Eye size={16} color={themeColors.icon} />
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => copyToClipboard(item.apiKey)} style={styles.copyButton}>
                <Copy size={16} color={Colors[colorScheme ?? 'light'].primary} />
              </TouchableOpacity>
            </View>
          )}
          {item.notes && <ThemedText type="secondary">{item.notes}</ThemedText>}
          {item.expiryDate && <ThemedText style={styles.expiryText}>Expires: {item.expiryDate}</ThemedText>}
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity onPress={() => handleEdit(item)} style={styles.actionButton}>
            <Edit size={18} color={themeColors.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionButton}>
            <Trash2 size={18} color={Colors[colorScheme ?? 'light'].danger} />
          </TouchableOpacity>
        </View>
      </View>
    </ThemedView>
  );

  const renderMFACard = (item) => (
    <ThemedView key={item.id} style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardBody}>
          <ThemedText type="subtitle">{item.name}</ThemedText>
          {item.secret && (
            <View style={{ marginBottom: 8 }}>
              <ThemedText type="secondary" style={{ fontSize: 12, marginBottom: 4 }}>
                Secret/Backup Codes:
              </ThemedText>
              <View style={styles.secretRow}>
                <ThemedText style={styles.secretText}>
                  {showPassword[item.id] ? item.secret : '••••••••••••••••'}
                </ThemedText>
                <TouchableOpacity
                  onPress={() =>
                    setShowPassword({ ...showPassword, [item.id]: !showPassword[item.id] })
                  }
                  style={styles.eyeButton}>
                  {showPassword[item.id] ? (
                    <EyeOff size={16} color={themeColors.icon} />
                  ) : (
                    <Eye size={16} color={themeColors.icon} />
                  )}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => copyToClipboard(item.secret)} style={styles.copyButton}>
                  <Copy size={16} color={Colors[colorScheme ?? 'light'].primary} />
                </TouchableOpacity>
              </View>
            </View>
          )}
          {item.notes && <ThemedText type="secondary">{item.notes}</ThemedText>}
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity onPress={() => handleEdit(item)} style={styles.actionButton}>
            <Edit size={18} color={themeColors.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionButton}>
            <Trash2 size={18} color={Colors[colorScheme ?? 'light'].danger} />
          </TouchableOpacity>
        </View>
      </View>
    </ThemedView>
  );

  const renderAddModal = () => (
    <Modal visible={showAddModal} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <ThemedView style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <ThemedText type="title">
              {editingItem ? 'Edit' : 'Add'}{' '}
              {activeTab === 'websites'
                ? 'Website'
                : activeTab === 'apiKeys'
                ? 'API Key'
                : 'MFA Token'}
            </ThemedText>
            <TouchableOpacity
              onPress={() => {
                setShowAddModal(false);
                setFormData({});
                setEditingItem(null);
              }}>
              <X size={24} color={themeColors.icon} />
            </TouchableOpacity>
          </View>

          <ScrollView>
            {activeTab === 'websites' && (
              <>
                <TextInput
                  placeholder="Name *"
                  placeholderTextColor={themeColors.icon}
                  value={formData.name || ''}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  style={styles.textInput}
                />
                <TextInput
                  placeholder="URL"
                  placeholderTextColor={themeColors.icon}
                  value={formData.url || ''}
                  onChangeText={(text) => setFormData({ ...formData, url: text })}
                  style={styles.textInput}
                  keyboardType="url"
                  autoCapitalize="none"
                />
                <TextInput
                  placeholder="Description"
                  placeholderTextColor={themeColors.icon}
                  value={formData.description || ''}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  multiline
                  style={[styles.textInput, styles.multilineInput]}
                />
                <TextInput
                  placeholder="Category (e.g., AI Tools, ML Platforms)"
                  placeholderTextColor={themeColors.icon}
                  value={formData.category || ''}
                  onChangeText={(text) => setFormData({ ...formData, category: text })}
                  style={styles.textInput}
                />
              </>
            )}

            {activeTab === 'apiKeys' && (
              <>
                <TextInput
                  placeholder="Name *"
                  placeholderTextColor={themeColors.icon}
                  value={formData.name || ''}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  style={styles.textInput}
                />
                <TextInput
                  placeholder="Platform (e.g., OpenAI, Anthropic)"
                  placeholderTextColor={themeColors.icon}
                  value={formData.platform || ''}
                  onChangeText={(text) => setFormData({ ...formData, platform: text })}
                  style={styles.textInput}
                />
                <TextInput
                  placeholder="API Key"
                  placeholderTextColor={themeColors.icon}
                  value={formData.apiKey || ''}
                  onChangeText={(text) => setFormData({ ...formData, apiKey: text })}
                  secureTextEntry
                  style={styles.textInput}
                />
                <TextInput
                  placeholder="Notes"
                  placeholderTextColor={themeColors.icon}
                  value={formData.notes || ''}
                  onChangeText={(text) => setFormData({ ...formData, notes: text })}
                  multiline
                  style={[styles.textInput, styles.multilineInput]}
                />
                <TextInput
                  placeholder="Expiry Date (YYYY-MM-DD)"
                  placeholderTextColor={themeColors.icon}
                  value={formData.expiryDate || ''}
                  onChangeText={(text) => setFormData({ ...formData, expiryDate: text })}
                  style={styles.textInput}
                />
              </>
            )}

            {activeTab === 'mfa' && (
              <>
                <TextInput
                  placeholder="Service Name *"
                  placeholderTextColor={themeColors.icon}
                  value={formData.name || ''}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  style={styles.textInput}
                />
                <TextInput
                  placeholder="Secret/Backup Codes"
                  placeholderTextColor={themeColors.icon}
                  value={formData.secret || ''}
                  onChangeText={(text) => setFormData({ ...formData, secret: text })}
                  multiline
                  secureTextEntry
                  style={[styles.textInput, { height: 120, textAlignVertical: 'top' }]}
                />
                <TextInput
                  placeholder="Notes"
                  placeholderTextColor={themeColors.icon}
                  value={formData.notes || ''}
                  onChangeText={(text) => setFormData({ ...formData, notes: text })}
                  multiline
                  style={[styles.textInput, styles.multilineInput]}
                />
              </>
            )}

            <TouchableOpacity
              onPress={editingItem ? handleUpdate : handleAdd}
              style={styles.submitButton}>
              <ThemedText style={{ color: '#ffffff', fontWeight: '600' }}>{editingItem ? 'Update' : 'Add'}</ThemedText>
            </TouchableOpacity>
          </ScrollView>
        </ThemedView>
      </View>
    </Modal>
  );

  // Replace the settings content in renderContent() with this:
  const renderSettings = () => {
    const stats = getDataStats();
    
    return (
      <ScrollView style={{ padding: 20 }}>
        {/* Statistics Section */}
        <ThemedView style={{ marginBottom: 24 }}>
          <ThemedText type="subtitle" style={{ marginBottom: 12 }}>
            Storage Statistics
          </ThemedText>
          <ThemedView
            style={{
              backgroundColor: themeColors.card,
              padding: 16,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: themeColors.border,
            }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <ThemedText type="secondary">Total Items:</ThemedText>
              <ThemedText type="defaultSemiBold" style={{ color: themeColors.primary }}>
                {stats.total}
              </ThemedText>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <ThemedText type="secondary">Websites:</ThemedText>
              <ThemedText>{stats.websites}</ThemedText>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <ThemedText type="secondary">API Keys:</ThemedText>
              <ThemedText>{stats.apiKeys}</ThemedText>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <ThemedText type="secondary">MFA Tokens:</ThemedText>
              <ThemedText>{stats.mfaTokens}</ThemedText>
            </View>
          </ThemedView>
        </ThemedView>
  
        {/* Security Section */}
        <ThemedView style={{ marginBottom: 24 }}>
          <ThemedText type="subtitle" style={{ marginBottom: 12 }}>
            Security
          </ThemedText>
          
          <ThemedView
            style={{
              backgroundColor: themeColors.card,
              padding: 20,
              borderRadius: 12,
              marginBottom: 12,
              borderWidth: 1,
              borderColor: themeColors.border,
            }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <ThemedText type="defaultSemiBold">Biometric Lock</ThemedText>
                <ThemedText type="secondary" style={{ fontSize: 12, marginTop: 4 }}>
                  Require authentication to access vault
                </ThemedText>
              </View>
              <Switch
                value={biometricEnabled}
                onValueChange={setBiometricEnabled}
                trackColor={{ false: '#767577', true: themeColors.primary }}
                thumbColor="#ffffff"
              />
            </View>
          </ThemedView>
  
          <ThemedView
            style={{
              backgroundColor: themeColors.card,
              padding: 20,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: themeColors.border,
            }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <ThemedText type="defaultSemiBold">Auto-Lock</ThemedText>
                <ThemedText type="secondary" style={{ fontSize: 12, marginTop: 4 }}>
                  Lock vault when app goes to background
                </ThemedText>
              </View>
              <Switch
                value={autoLockEnabled}
                onValueChange={setAutoLockEnabled}
                trackColor={{ false: '#767577', true: themeColors.primary }}
                thumbColor="#ffffff"
              />
            </View>
          </ThemedView>
        </ThemedView>
  
        {/* Appearance Section */}
        <ThemedView style={{ marginBottom: 24 }}>
          <ThemedText type="subtitle" style={{ marginBottom: 12 }}>
            Appearance
          </ThemedText>
          <ThemedView
            style={{
              backgroundColor: themeColors.card,
              padding: 20,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: themeColors.border,
            }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <ThemedText type="defaultSemiBold">Dark Mode</ThemedText>
                <ThemedText type="secondary" style={{ fontSize: 12, marginTop: 4 }}>
                  Synced with system settings
                </ThemedText>
              </View>
              <Switch
                value={colorScheme === 'dark'}
                onValueChange={() => {}}
                trackColor={{ false: '#767577', true: themeColors.primary }}
                thumbColor="#ffffff"
                disabled
              />
            </View>
          </ThemedView>
        </ThemedView>
  
        {/* Data Management Section */}
        <ThemedView style={{ marginBottom: 24 }}>
          <ThemedText type="subtitle" style={{ marginBottom: 12 }}>
            Data Management
          </ThemedText>
  
          <TouchableOpacity
            onPress={exportData}
            style={{
              backgroundColor: themeColors.primary,
              padding: 16,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
              gap: 10
            }}>
            <IconSymbol name="square.and.arrow.up" size={20} color="#ffffff" />
            <ThemedText style={{ color: '#ffffff', fontWeight: '600', fontSize: 16 }}>
              Export Data (JSON)
            </ThemedText>
          </TouchableOpacity>
  
          <TouchableOpacity
            onPress={importData}
            style={{
              backgroundColor: themeColors.card,
              padding: 16,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: themeColors.border,
              marginBottom: 12,
              gap: 10
            }}>
            <IconSymbol name="square.and.arrow.down" size={20} color={themeColors.text} />
            <ThemedText style={{ fontWeight: '600', fontSize: 16 }}>
              Import Data (JSON)
            </ThemedText>
          </TouchableOpacity>
  
          <TouchableOpacity
            onPress={clearAllData}
            style={{
              backgroundColor: Colors[colorScheme ?? 'light'].danger + '20',
              padding: 16,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: Colors[colorScheme ?? 'light'].danger,
              gap: 10
            }}>
            <IconSymbol name="trash" size={20} color={Colors[colorScheme ?? 'light'].danger} />
            <ThemedText style={{ 
              color: Colors[colorScheme ?? 'light'].danger, 
              fontWeight: '600', 
              fontSize: 16 
            }}>
              Clear All Data
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
  
        {/* About Section */}
        <ThemedView style={{ marginBottom: 40 }}>
          <ThemedText type="subtitle" style={{ marginBottom: 12 }}>
            About
          </ThemedText>
          <ThemedView
            style={{
              backgroundColor: themeColors.card,
              padding: 20,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: themeColors.border,
              alignItems: 'center'
            }}>
            <View style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: themeColors.primary + '20',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16
            }}>
              <Shield size={32} color={themeColors.primary} />
            </View>
            <ThemedText type="defaultSemiBold" style={{ fontSize: 18, marginBottom: 4 }}>
              AI Vault
            </ThemedText>
            <ThemedText type="secondary" style={{ fontSize: 14, marginBottom: 16 }}>
              Version 1.0.0
            </ThemedText>
            <ThemedText type="secondary" style={{ fontSize: 13, textAlign: 'center', lineHeight: 20 }}>
              Secure storage for your developer resources. All data is encrypted and stored locally on your device.
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ScrollView>
    );
  };

  const renderContent = () => {
    if (activeTab === 'settings') {
      return renderSettings();
    }

    const filteredData = getFilteredData();

    return (
      <ThemedView style={{ flex: 1 }}>
        <ThemedView style={{ padding: 16, paddingBottom: 8 }}>
          <ThemedView
            style={{
              flexDirection: 'row',
              alignItems: 'center', 
              backgroundColor: themeColors.card,
              borderRadius: 12,
              paddingHorizontal: 16,
              borderWidth: 1,
              borderColor: themeColors.border,
            }}>
            <Search size={20} color={themeColors.icon} />
            <TextInput
              placeholder="Search..."
              placeholderTextColor={themeColors.icon}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{
                flex: 1,
                padding: 14,
                color: themeColors.text,
                fontSize: 16,
              }}
            />
          </ThemedView>
        </ThemedView>

        <ThemedView style={{ flex: 1, paddingHorizontal: 16 }}>
          {filteredData.length === 0 ? (
            <ThemedView style={{ alignItems: 'center', marginTop: 60 }}>
              <ThemedText type="secondary" style={{ fontSize: 16 }}>
                No items yet. Tap + to add one!
              </ThemedText>
            </ThemedView>
          ) : (
            filteredData.map((item) => {
              if (activeTab === 'websites') return renderWebsiteCard(item);
              if (activeTab === 'apiKeys') return renderAPIKeyCard(item);
              if (activeTab === 'mfa') return renderMFACard(item);
              return null;
            })
          )}
        </ThemedView>
      </ThemedView>
    );
  };

  const TabButton = ({ name, icon: Icon, currentTab, onPress }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
        backgroundColor: currentTab === name ? Colors[colorScheme ?? 'light'].primary + '20' : 'transparent',
      }}>
      <Icon size={24} color={currentTab === name ? Colors[colorScheme ?? 'light'].primary : themeColors.icon} />
      <ThemedText
        style={{
          color: currentTab === name ? Colors[colorScheme ?? 'light'].primary : themeColors.icon,
          fontSize: 12,
          marginTop: 4,
          fontWeight: currentTab === name ? '600' : '400',
        }}>
        {name.charAt(0).toUpperCase() + name.slice(1)}
      </ThemedText>
    </TouchableOpacity>
  );

  if (!isUnlocked) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}/>
        <ThemedText type="title" style={{ marginBottom: 16 }}>
          AI Vault Locked
        </ThemedText>
        <ThemedText type="secondary" style={{ marginBottom: 40, textAlign: 'center', paddingHorizontal: 40 }}>
          Please authenticate to continue
        </ThemedText>
        <TouchableOpacity
          onPress={handleBiometricAuth}
          style={{
            backgroundColor: Colors[colorScheme ?? 'light'].primary,
            paddingVertical: 16,
            paddingHorizontal: 40,
            borderRadius: 12,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <Fingerprint size={24} color="#ffffff" />
          <ThemedText type="defaultSemiBold" style={{ color: '#ffffff', fontSize: 18 }}>
            Unlock Now
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <ThemedView
        style={{
          padding: 20,
          borderBottomWidth: 1,
          borderBottomColor: themeColors.border,
        }}>
        <ThemedText type="title" style={{ fontSize: 28 }}>AI Vault</ThemedText>
        <ThemedText type="secondary" style={{ marginTop: 4 }}>
          Secure storage for your dev resources
        </ThemedText>
      </ThemedView>

      {/* Content */}
      {renderContent()}

      {/* Bottom Navigation */}
      <ThemedView
        style={{
          flexDirection: 'row',
          borderTopWidth: 1,
          borderTopColor: themeColors.border,
          paddingBottom: Platform.OS === 'ios' ? 20 : 0,
        }}>
        <TabButton name="websites" icon={Globe} currentTab={activeTab} onPress={() => setActiveTab('websites')} />
        <TabButton name="apiKeys" icon={Key} currentTab={activeTab} onPress={() => setActiveTab('apiKeys')} />
        <TabButton name="mfa" icon={Shield} currentTab={activeTab} onPress={() => setActiveTab('mfa')} />
        <TabButton name="settings" icon={Settings} currentTab={activeTab} onPress={() => setActiveTab('settings')} />
      </ThemedView>

      {/* Floating Add Button */}
      {activeTab !== 'settings' && (
        <TouchableOpacity
          onPress={() => setShowAddModal(true)}
          style={{
            position: 'absolute',
            bottom: Platform.OS === 'ios' ? 100 : 80,
            right: 20,
            backgroundColor: Colors[colorScheme ?? 'light'].primary,
            width: 60,
            height: 60,
            borderRadius: 30,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}>
          <Plus size={28} color="#ffffff" />
        </TouchableOpacity>
      )}

      {/* Add/Edit Modal */}
      {renderAddModal()}
    </SafeAreaView>
  );
};

export default AIVault;