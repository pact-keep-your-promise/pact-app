import React from 'react';
import { View, StyleSheet } from 'react-native';
import { spacing } from '@/constants/theme';
import Chip from '@/components/ui/Chip';

interface FrequencyPickerProps {
  frequency: 'daily' | 'weekly';
  timesPerWeek: number;
  onChangeFrequency: (f: 'daily' | 'weekly') => void;
  onChangeTimesPerWeek: (n: number) => void;
}

export default function FrequencyPicker({
  frequency,
  timesPerWeek,
  onChangeFrequency,
  onChangeTimesPerWeek,
}: FrequencyPickerProps) {
  return (
    <View>
      <View style={styles.freqRow}>
        <Chip
          label="Daily"
          selected={frequency === 'daily'}
          onPress={() => onChangeFrequency('daily')}
        />
        <Chip
          label="Weekly"
          selected={frequency === 'weekly'}
          onPress={() => onChangeFrequency('weekly')}
        />
      </View>

      {frequency === 'weekly' && (
        <View style={styles.timesRow}>
          {[2, 3, 4, 5, 6].map((n) => (
            <Chip
              key={n}
              label={`${n}x`}
              selected={timesPerWeek === n}
              onPress={() => onChangeTimesPerWeek(n)}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  freqRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  timesRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
    flexWrap: 'wrap',
  },
});
