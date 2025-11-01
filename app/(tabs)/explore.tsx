// app/(tabs)/explore.tsx
import { StyleSheet, TouchableOpacity, View, Linking } from 'react-native';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Collapsible } from '@/components/ui/collapsible';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ExternalLink, Sparkles, Brain, Image as ImageIcon, MessageSquare, Code } from 'lucide-react-native';

const aiTools = [
  { 
    name: 'OpenAI', 
    description: 'Industry-leading AI models including GPT-4, DALL-E, and Whisper for text, image, and speech processing.',
    url: 'https://openai.com',
    category: 'LLM & Image',
    icon: Brain
  },
  { 
    name: 'Anthropic Claude', 
    description: 'Advanced AI assistant focused on safety and helpfulness. Great for complex reasoning and long-form content.',
    url: 'https://www.anthropic.com',
    category: 'LLM',
    icon: MessageSquare
  },
  { 
    name: 'Hugging Face', 
    description: 'The largest hub for open-source AI models, datasets, and ML tools. Free models and community-driven.',
    url: 'https://huggingface.co',
    category: 'ML Platform',
    icon: Code
  },
  { 
    name: 'Midjourney', 
    description: 'Top-tier AI art generator creating stunning, artistic images from text descriptions.',
    url: 'https://www.midjourney.com',
    category: 'Image Generation',
    icon: ImageIcon
  },
  { 
    name: 'Perplexity AI', 
    description: 'AI-powered search engine that provides accurate, sourced answers with real-time web access.',
    url: 'https://www.perplexity.ai',
    category: 'Search',
    icon: Sparkles
  },
  {
    name: 'Replicate',
    description: 'Run and deploy open-source AI models with simple API. Great for image, video, and audio models.',
    url: 'https://replicate.com',
    category: 'ML Platform',
    icon: Code
  },
  {
    name: 'Stability AI',
    description: 'Creators of Stable Diffusion. Open-source image generation and other generative AI tools.',
    url: 'https://stability.ai',
    category: 'Image Generation',
    icon: ImageIcon
  },
  {
    name: 'Google AI Studio',
    description: 'Access to Gemini models and other Google AI tools for development and experimentation.',
    url: 'https://ai.google.dev',
    category: 'LLM',
    icon: Brain
  },
];

const AITool = ({ name, description, url, category, icon: Icon }: { 
  name: string; 
  description: string; 
  url: string; 
  category: string;
  icon: any;
}) => {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  return (
    <Collapsible title={name}>
      <View style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={[styles.categoryBadge, { backgroundColor: themeColors.primary + '20' }]}>
            <Icon size={14} color={themeColors.primary} />
            <ThemedText style={[styles.categoryText, { color: themeColors.primary }]}>
              {category}
            </ThemedText>
          </View>
        </View>
        <ThemedText>{description}</ThemedText>
        <TouchableOpacity 
          onPress={() => Linking.openURL(url)}
          style={[styles.visitButton, { backgroundColor: themeColors.primary }]}>
          <ExternalLink size={16} color="white" />
          <ThemedText style={styles.visitButtonText}>Visit Website</ThemedText>
        </TouchableOpacity>
      </View>
    </Collapsible>
  );
};

export default function ExploreScreen() {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#667eea', dark: '#1a1a2e' }}
      headerImage={
        <View style={styles.headerContainer}>
          <Sparkles size={100} color="rgba(255,255,255,0.9)" />
        </View>
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" style={{ fontFamily: Fonts.rounded }}>
          Explore AI Resources
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.introContainer}>
        <ThemedText style={{ marginBottom: 12 }}>
          Discover the most popular AI platforms and tools. Each service offers unique capabilities 
          for developers, creators, and businesses.
        </ThemedText>
        <ThemedView style={[styles.tipBox, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <IconSymbol name="lightbulb.fill" size={20} color={themeColors.primary} />
          <ThemedText type="secondary" style={{ flex: 1, fontSize: 13 }}>
            Tip: You can save API keys and credentials for these services in your Vault tab!
          </ThemedText>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.toolsContainer}>
        <ThemedText type="subtitle" style={{ marginBottom: 16 }}>
          Popular AI Platforms ({aiTools.length})
        </ThemedText>
        {aiTools.map(tool => <AITool key={tool.name} {...tool} />)}
      </ThemedView>

      <ThemedView style={styles.bottomNote}>
        <ThemedText type="secondary" style={{ fontSize: 12, textAlign: 'center' }}>
          This is a curated list of AI tools. New platforms are added regularly.
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  introContainer: {
    marginBottom: 24,
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  toolsContainer: {
    gap: 4,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  visitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
  },
  visitButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  bottomNote: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 128, 128, 0.2)',
  },
});
