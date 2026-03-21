import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { spacing, typography } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';

interface CalendarGridProps {
  completedDates: string[];
  freezeDates?: string[];
  color: string;
}

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function CalendarGrid({ completedDates, freezeDates = [], color }: CalendarGridProps) {
  const { colors } = useTheme();
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayDate = today.getDate();

  const monthName = today.toLocaleString('default', { month: 'long', year: 'numeric' });

  const completedSet = new Set(completedDates);
  const freezeSet = new Set(freezeDates);
  const FREEZE_COLOR = '#5BC0EB';

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
      <Text style={[styles.monthTitle, { color: colors.textSecondary }]}>{monthName}</Text>

      <View style={styles.headerRow}>
        {DAYS.map((d, i) => (
          <View key={i} style={styles.cell}>
            <Text style={[styles.dayLabel, { color: colors.textTertiary }]}>{d}</Text>
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
            const isFreezeDay = freezeSet.has(dateStr);
            const isToday = day === todayDate;

            return (
              <View key={ci} style={styles.cell}>
                <View
                  style={[
                    styles.dot,
                    isCompleted && !isFreezeDay && { backgroundColor: color },
                    isFreezeDay && { backgroundColor: FREEZE_COLOR },
                    !isCompleted && !isFreezeDay && { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border },
                    isToday && { borderWidth: 2, borderColor: colors.primary },
                  ]}
                >
                  <Text
                    style={[
                      styles.dateText,
                      (isCompleted || isFreezeDay) && { color: colors.textInverse },
                      !isCompleted && !isFreezeDay && { color: colors.textTertiary },
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
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateText: {
    ...typography.tiny,
  },
});
