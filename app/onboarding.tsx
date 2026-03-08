import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing, borderRadius, typography } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingProps {
  onComplete: () => void;
}

interface Page {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle: string;
  highlights: { icon: keyof typeof Ionicons.glyphMap; text: string }[];
}

const PAGES: Page[] = [
  {
    icon: 'people',
    iconColor: '#4ECDC4',
    iconBg: 'rgba(78, 205, 196, 0.12)',
    title: 'Better together',
    subtitle: 'Habits are hard alone. Make a pact with friends and hold each other accountable — every single day.',
    highlights: [
      { icon: 'person-add', text: 'Invite friends to join your habits' },
      { icon: 'camera', text: 'Verify with a daily photo' },
      { icon: 'notifications', text: 'Nudge friends who fall behind' },
    ],
  },
  {
    icon: 'flame',
    iconColor: '#FF9500',
    iconBg: 'rgba(255, 149, 0, 0.12)',
    title: 'Streaks that matter',
    subtitle: "Your streak only counts when everyone completes the day. One team, one streak — that's the pact.",
    highlights: [
      { icon: 'trending-up', text: 'Build streaks as a group' },
      { icon: 'trophy', text: 'Hit milestones at 7, 30, 100 days' },
      { icon: 'heart', text: "Don't let your friends down" },
    ],
  },
  {
    icon: 'rocket',
    iconColor: '#FF6B6B',
    iconBg: 'rgba(255, 107, 107, 0.12)',
    title: 'Start small, stay consistent',
    subtitle: "Pick one habit. Find one friend. That's all it takes. The best time to start is right now.",
    highlights: [
      { icon: 'fitness', text: 'Morning run, meditation, reading...' },
      { icon: 'calendar', text: 'Daily or weekly — your pace' },
      { icon: 'sparkles', text: 'Watch small wins become big changes' },
    ],
  },
];

function AnimatedIcon({ icon, color, bg, scrollX, index }: {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bg: string;
  scrollX: Animated.Value;
  index: number;
}) {
  const scale = scrollX.interpolate({
    inputRange: [(index - 1) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 1) * SCREEN_WIDTH],
    outputRange: [0.5, 1, 0.5],
    extrapolate: 'clamp',
  });
  const opacity = scrollX.interpolate({
    inputRange: [(index - 1) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 1) * SCREEN_WIDTH],
    outputRange: [0, 1, 0],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View style={[styles.iconCircle, { backgroundColor: bg, transform: [{ scale }], opacity }]}>
      <Ionicons name={icon} size={48} color={color} />
    </Animated.View>
  );
}

function HighlightRow({ icon, text, iconColor, textColor }: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  iconColor: string;
  textColor: string;
}) {
  return (
    <View style={styles.highlightRow}>
      <View style={[styles.highlightIcon, { backgroundColor: iconColor + '18' }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <Text style={[styles.highlightText, { color: textColor }]}>{text}</Text>
    </View>
  );
}

export default function OnboardingScreen({ onComplete }: OnboardingProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: false,
      listener: (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const page = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
        if (page !== currentPage) {
          setCurrentPage(page);
        }
      },
    }
  );

  const goToNext = () => {
    if (currentPage < PAGES.length - 1) {
      scrollRef.current?.scrollTo({ x: (currentPage + 1) * SCREEN_WIDTH, animated: true });
    } else {
      onComplete();
    }
  };

  const isLastPage = currentPage === PAGES.length - 1;

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Skip button */}
      {!isLastPage && (
        <Pressable style={styles.skipButton} onPress={onComplete}>
          <Text style={[styles.skipText, { color: colors.textTertiary }]}>Skip</Text>
        </Pressable>
      )}

      {/* Animated icon area */}
      <View style={styles.iconArea}>
        {PAGES.map((page, i) => (
          <AnimatedIcon
            key={i}
            icon={page.icon}
            color={page.iconColor}
            bg={page.iconBg}
            scrollX={scrollX}
            index={i}
          />
        ))}
      </View>

      {/* Scrollable pages */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        bounces={false}
        style={styles.scrollView}
      >
        {PAGES.map((page, i) => (
          <View key={i} style={[styles.page, { width: SCREEN_WIDTH }]}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>{page.title}</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{page.subtitle}</Text>

            <View style={styles.highlights}>
              {page.highlights.map((h, j) => (
                <HighlightRow
                  key={j}
                  icon={h.icon}
                  text={h.text}
                  iconColor={page.iconColor}
                  textColor={colors.textSecondary}
                />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Dots + CTA */}
      <View style={styles.footer}>
        <View style={styles.dots}>
          {PAGES.map((_, i) => {
            const dotWidth = scrollX.interpolate({
              inputRange: [(i - 1) * SCREEN_WIDTH, i * SCREEN_WIDTH, (i + 1) * SCREEN_WIDTH],
              outputRange: [8, 24, 8],
              extrapolate: 'clamp',
            });
            const dotOpacity = scrollX.interpolate({
              inputRange: [(i - 1) * SCREEN_WIDTH, i * SCREEN_WIDTH, (i + 1) * SCREEN_WIDTH],
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View
                key={i}
                style={[styles.dot, { width: dotWidth, opacity: dotOpacity, backgroundColor: colors.primary }]}
              />
            );
          })}
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.ctaButton,
            { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
          ]}
          onPress={goToNext}
        >
          <Text style={[styles.ctaText, { color: colors.onPrimary }]}>
            {isLastPage ? "Let's go" : 'Next'}
          </Text>
          <Ionicons
            name={isLastPage ? 'arrow-forward' : 'chevron-forward'}
            size={20}
            color={colors.onPrimary}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    top: 56,
    right: spacing.xl,
    zIndex: 10,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  skipText: {
    ...typography.bodyBold,
  },
  iconArea: {
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xxl,
  },
  iconCircle: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  page: {
    paddingHorizontal: spacing.xxxl + spacing.sm,
    paddingTop: spacing.md,
  },
  title: {
    ...typography.h1,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    ...typography.body,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xxl,
  },
  highlights: {
    gap: spacing.md,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  highlightIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightText: {
    ...typography.body,
    flex: 1,
  },
  footer: {
    paddingHorizontal: spacing.xxxl,
    paddingBottom: spacing.lg,
    gap: spacing.lg,
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxxl,
    borderRadius: borderRadius.full,
    width: '100%',
  },
  ctaText: {
    ...typography.h3,
  },
});
