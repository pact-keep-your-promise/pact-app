import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@/constants/theme';

interface CalendarGridProps {
  completedDates: string[];
  color: string;
}

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function CalendarGrid({ completedDates, color }: CalendarGridProps) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayDate = today.getDate();

  const monthName = today.toLocaleString('default', { month: 'long', year: 'numeric' });

  const completedSet = new Set(completedDates);

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const rows: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }

  function formatDate(day: number): string {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  }

  return (
    <View>
      <Text style={styles.monthTitle}>{monthName}</Text>

      <View style={styles.headerRow}>
        {DAYS.map((d, i) => (
          <View key={i} style={styles.cell}>
            <Text style={styles.dayLabel}>{d}</Text>
          </View>
        ))}
      </View>

      {rows.map((row, ri) => (
        <View key={ri} style={styles.row}>
          {row.map((day, ci) => {
            if (day === null) {
              return <View key={ci} style={styles.cell} />;
            }

            const dateStr = formatDate(day);
            const isCompleted = completedSet.has(dateStr);
            const isToday = day === todayDate;

            return (
              <View key={ci} style={styles.cell}>
                <View
                  style={[
                    styles.dot,
                    isCompleted && { backgroundColor: color },
                    !isCompleted && styles.dotEmpty,
                    isToday && { borderWidth: 2, borderColor: colors.primary },
                  ]}
                >
                  <Text
                    style={[
                      styles.dateText,
                      isCompleted && { color: colors.textInverse },
                      !isCompleted && { color: colors.textTertiary },
                    ]}
                  >
                    {day}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const DOT_SIZE = 32;

const styles = StyleSheet.create({
  monthTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: DOT_SIZE + 4,
  },
  dayLabel: {
    ...typography.tiny,
    color: colors.textTertiary,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotEmpty: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
