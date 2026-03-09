import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius, typography } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';

type Tab = 'terms' | 'privacy';

interface LegalScreenProps {
  onClose?: () => void;
  initialTab?: Tab;
}

export default function LegalScreen({ onClose, initialTab }: LegalScreenProps = {}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ tab?: string }>();
  const [activeTab, setActiveTab] = useState<Tab>(
    initialTab || (params.tab === 'privacy' ? 'privacy' : 'terms')
  );

  const handleBack = onClose || (() => (router.canGoBack() ? router.back() : router.replace('/')));

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={handleBack}
        >
          <Ionicons name={onClose ? 'close' : 'chevron-back'} size={22} color={colors.textPrimary} />
          <Text style={[styles.backText, { color: colors.textPrimary }]}>{onClose ? 'Close' : 'Back'}</Text>
        </Pressable>
      </View>

      {/* Tab toggle */}
      <View style={[styles.tabBar, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
        <Pressable
          style={[styles.tab, activeTab === 'terms' && { backgroundColor: colors.primary }]}
          onPress={() => setActiveTab('terms')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'terms' ? '#fff' : colors.textSecondary },
            ]}
          >
            Terms of Service
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'privacy' && { backgroundColor: colors.primary }]}
          onPress={() => setActiveTab('privacy')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'privacy' ? '#fff' : colors.textSecondary },
            ]}
          >
            Privacy Policy
          </Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'terms' ? (
          <TermsOfService colors={colors} />
        ) : (
          <PrivacyPolicy colors={colors} />
        )}
        <Text style={[styles.lastUpdated, { color: colors.textTertiary }]}>
          Last updated: March 9, 2026
        </Text>
        <View style={{ height: spacing.huge }} />
      </ScrollView>
    </View>
  );
}

function Section({ title, children, colors }: { title: string; children: React.ReactNode; colors: any }) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{title}</Text>
      {children}
    </View>
  );
}

function P({ children, colors }: { children: React.ReactNode; colors: any }) {
  return <Text style={[styles.paragraph, { color: colors.textSecondary }]}>{children}</Text>;
}

function TermsOfService({ colors }: { colors: any }) {
  return (
    <>
      <Text style={[styles.title, { color: colors.textPrimary }]}>Terms of Service</Text>
      <P colors={colors}>
        Welcome to Pact. These Terms of Service ("Terms") govern your use of the Pact mobile
        application and website (the "Service") operated by Pact ("we", "us", or "our"). By
        accessing or using the Service, you agree to be bound by these Terms.
      </P>

      <Section title="1. Eligibility" colors={colors}>
        <P colors={colors}>
          You must be at least 13 years old to use Pact. If you are under 18, you represent that
          your parent or legal guardian has reviewed and agreed to these Terms on your behalf. By
          creating an account, you represent and warrant that you meet these requirements.
        </P>
      </Section>

      <Section title="2. Account Registration" colors={colors}>
        <P colors={colors}>
          To use certain features, you must create an account using Google Sign-In or email and
          password. You are responsible for maintaining the confidentiality of your login credentials
          and for all activities that occur under your account. You agree to provide accurate and
          complete information and to update it as needed.
        </P>
      </Section>

      <Section title="3. How Pact Works" colors={colors}>
        <P colors={colors}>
          Pact is a social habit-tracking platform. You create or join "pacts" — shared commitments
          with friends to perform habits on a regular schedule. You verify your progress by
          submitting photo proof, which other participants can see. Streaks track your group's
          consistency over time.
        </P>
      </Section>

      <Section title="4. User Content" colors={colors}>
        <P colors={colors}>
          You retain ownership of content you submit, including photos and messages ("User Content").
          By submitting User Content, you grant us a non-exclusive, worldwide, royalty-free license
          to use, store, display, and distribute your User Content solely for the purpose of
          operating and improving the Service. You may delete your content at any time.
        </P>
        <P colors={colors}>
          You agree not to submit content that is illegal, harmful, threatening, abusive, harassing,
          defamatory, obscene, or otherwise objectionable. We reserve the right to remove any content
          that violates these Terms.
        </P>
      </Section>

      <Section title="5. Acceptable Use" colors={colors}>
        <P colors={colors}>You agree not to:</P>
        <P colors={colors}>
          {'\u2022'} Use the Service for any unlawful purpose{'\n'}
          {'\u2022'} Impersonate any person or entity{'\n'}
          {'\u2022'} Upload malicious software or harmful content{'\n'}
          {'\u2022'} Attempt to gain unauthorized access to other accounts{'\n'}
          {'\u2022'} Interfere with or disrupt the Service{'\n'}
          {'\u2022'} Use automated means to access the Service without permission{'\n'}
          {'\u2022'} Harass, bully, or intimidate other users
        </P>
      </Section>

      <Section title="6. Intellectual Property" colors={colors}>
        <P colors={colors}>
          The Service and its original content (excluding User Content), features, and functionality
          are owned by Pact and are protected by copyright, trademark, and other intellectual
          property laws. Our name, logo, and all related names, logos, product and service names,
          designs, and slogans are our trademarks.
        </P>
      </Section>

      <Section title="7. Termination" colors={colors}>
        <P colors={colors}>
          We may terminate or suspend your account at any time, without prior notice, for conduct
          that we determine violates these Terms or is harmful to other users, us, or third parties.
          You may delete your account at any time. Upon termination, your right to use the Service
          ceases immediately.
        </P>
      </Section>

      <Section title="8. Disclaimer of Warranties" colors={colors}>
        <P colors={colors}>
          THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER
          EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR
          ERROR-FREE. YOUR USE OF THE SERVICE IS AT YOUR OWN RISK.
        </P>
      </Section>

      <Section title="9. Limitation of Liability" colors={colors}>
        <P colors={colors}>
          TO THE FULLEST EXTENT PERMITTED BY LAW, PACT SHALL NOT BE LIABLE FOR ANY INDIRECT,
          INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR
          REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL,
          OR OTHER INTANGIBLE LOSSES.
        </P>
      </Section>

      <Section title="10. Changes to Terms" colors={colors}>
        <P colors={colors}>
          We reserve the right to modify these Terms at any time. We will notify you of material
          changes by posting the updated Terms in the app. Your continued use of the Service after
          changes become effective constitutes your acceptance of the revised Terms.
        </P>
      </Section>

      <Section title="11. Contact Us" colors={colors}>
        <P colors={colors}>
          If you have questions about these Terms, please contact us at support@pact.app.
        </P>
      </Section>
    </>
  );
}

function PrivacyPolicy({ colors }: { colors: any }) {
  return (
    <>
      <Text style={[styles.title, { color: colors.textPrimary }]}>Privacy Policy</Text>
      <P colors={colors}>
        Your privacy matters to us. This Privacy Policy explains how Pact ("we", "us", or "our")
        collects, uses, shares, and protects your personal information when you use our mobile
        application and website (the "Service").
      </P>

      <Section title="1. Information We Collect" colors={colors}>
        <P colors={colors}>
          <Text style={{ fontWeight: '600' }}>Account Information:</Text> When you register, we
          collect your name, email address, username, and profile photo. If you sign in with Google,
          we receive your name, email, and profile picture from Google.
        </P>
        <P colors={colors}>
          <Text style={{ fontWeight: '600' }}>Photos & Submissions:</Text> When you verify a habit,
          you upload a photo. These photos are stored on our servers and are visible to other
          participants in your pact.
        </P>
        <P colors={colors}>
          <Text style={{ fontWeight: '600' }}>Messages:</Text> If group chat is enabled, messages
          you send within pacts are stored and visible to pact participants.
        </P>
        <P colors={colors}>
          <Text style={{ fontWeight: '600' }}>Usage Data:</Text> We collect information about how
          you use the Service, including pact participation, streaks, submission timestamps, and
          timezone information to correctly compute streaks and deadlines.
        </P>
        <P colors={colors}>
          <Text style={{ fontWeight: '600' }}>Device Information:</Text> We may collect device type,
          operating system, browser type, and push notification tokens to deliver notifications.
        </P>
      </Section>

      <Section title="2. How We Use Your Information" colors={colors}>
        <P colors={colors}>We use the information we collect to:</P>
        <P colors={colors}>
          {'\u2022'} Provide, operate, and maintain the Service{'\n'}
          {'\u2022'} Create and manage your account{'\n'}
          {'\u2022'} Track habit streaks and progress{'\n'}
          {'\u2022'} Show your submissions to pact participants{'\n'}
          {'\u2022'} Send notifications (deadline reminders, nudges, friend requests, streak freezes){'\n'}
          {'\u2022'} Enable social features (friend connections, reactions, messages){'\n'}
          {'\u2022'} Improve the Service and develop new features{'\n'}
          {'\u2022'} Respond to your requests and support inquiries
        </P>
      </Section>

      <Section title="3. How We Share Your Information" colors={colors}>
        <P colors={colors}>
          <Text style={{ fontWeight: '600' }}>With Other Users:</Text> Your name, username, profile
          photo, and submission photos are visible to participants in your pacts. Your name and
          username are searchable by other users for friend requests.
        </P>
        <P colors={colors}>
          <Text style={{ fontWeight: '600' }}>We do not sell your personal information.</Text> We do
          not share your data with third-party advertisers. We may share information with service
          providers who help us operate the Service (e.g., hosting, push notifications), and they are
          bound by confidentiality obligations.
        </P>
        <P colors={colors}>
          We may disclose information if required by law, legal process, or government request, or to
          protect the rights, safety, or property of Pact, our users, or the public.
        </P>
      </Section>

      <Section title="4. Data Storage & Security" colors={colors}>
        <P colors={colors}>
          Your data is stored on secure servers. We implement reasonable technical and organizational
          measures to protect your personal information against unauthorized access, alteration, or
          destruction. However, no method of electronic storage is 100% secure, and we cannot
          guarantee absolute security.
        </P>
      </Section>

      <Section title="5. Data Retention" colors={colors}>
        <P colors={colors}>
          We retain your personal information for as long as your account is active or as needed to
          provide the Service. If you delete your account, we will delete your personal data within
          30 days, except where we are required to retain it by law. Anonymized or aggregated data
          may be retained indefinitely for analytics purposes.
        </P>
      </Section>

      <Section title="6. Your Rights" colors={colors}>
        <P colors={colors}>Depending on your location, you may have the right to:</P>
        <P colors={colors}>
          {'\u2022'} Access and receive a copy of your personal data{'\n'}
          {'\u2022'} Correct inaccurate personal data{'\n'}
          {'\u2022'} Request deletion of your personal data{'\n'}
          {'\u2022'} Object to or restrict processing of your data{'\n'}
          {'\u2022'} Data portability (receive your data in a structured format){'\n'}
          {'\u2022'} Withdraw consent at any time
        </P>
        <P colors={colors}>
          To exercise any of these rights, please contact us at support@pact.app.
        </P>
      </Section>

      <Section title="7. Children's Privacy" colors={colors}>
        <P colors={colors}>
          The Service is not intended for children under 13. We do not knowingly collect personal
          information from children under 13. If we learn that we have collected data from a child
          under 13, we will take steps to delete it promptly. If you believe a child under 13 has
          provided us with personal information, please contact us at support@pact.app.
        </P>
      </Section>

      <Section title="8. Push Notifications" colors={colors}>
        <P colors={colors}>
          With your permission, we send push notifications for deadline reminders, nudges from
          friends, streak freeze alerts, reactions, and messages. You can disable push notifications
          at any time through your device or browser settings, or within the app.
        </P>
      </Section>

      <Section title="9. Third-Party Services" colors={colors}>
        <P colors={colors}>
          If you sign in with Google, Google's privacy policy governs how they handle your data. We
          only receive the information described in Section 1 and do not have access to your Google
          account beyond what is needed for authentication.
        </P>
      </Section>

      <Section title="10. Changes to This Policy" colors={colors}>
        <P colors={colors}>
          We may update this Privacy Policy from time to time. We will notify you of material changes
          by posting the updated policy in the app. Your continued use of the Service after changes
          become effective constitutes your acceptance of the revised policy.
        </P>
      </Section>

      <Section title="11. Contact Us" colors={colors}>
        <P colors={colors}>
          If you have questions or concerns about this Privacy Policy, please contact us at
          support@pact.app.
        </P>
      </Section>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.xl,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
  },
  backText: {
    ...typography.body,
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: spacing.xl,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    padding: spacing.xs,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  tabText: {
    ...typography.captionBold,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
  },
  title: {
    ...typography.h2,
    marginBottom: spacing.lg,
  },
  section: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    ...typography.bodyBold,
    marginBottom: spacing.sm,
  },
  paragraph: {
    ...typography.body,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  lastUpdated: {
    ...typography.caption,
    textAlign: 'center',
    marginTop: spacing.xxl,
    fontStyle: 'italic',
  },
});
