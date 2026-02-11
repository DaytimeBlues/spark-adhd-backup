import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  Platform,
} from 'react-native';
import { Tokens } from '../theme/tokens';

const CalendarScreen = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const prevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1),
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1),
    );
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const daysArray = Array(daysInMonth)
    .fill(0)
    .map((_, i) => i + 1);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.webContainer}>
        <View style={styles.content}>
          <Text style={styles.title}>Calendar</Text>

          <View style={styles.calendarCard}>
            <View style={styles.header}>
              <Pressable
                onPress={prevMonth}
                style={({
                  pressed,
                  hovered,
                }: {
                  pressed: boolean;
                  hovered?: boolean;
                }) => [
                  styles.navButton,
                  hovered && styles.navButtonHovered,
                  pressed && styles.navButtonPressed,
                ]}
              >
                <Text style={styles.navButtonText}>‹</Text>
              </Pressable>
              <Text style={styles.monthText}>
                {months[currentDate.getMonth()]} {currentDate.getFullYear()}
              </Text>
              <Pressable
                onPress={nextMonth}
                style={({
                  pressed,
                  hovered,
                }: {
                  pressed: boolean;
                  hovered?: boolean;
                }) => [
                  styles.navButton,
                  hovered && styles.navButtonHovered,
                  pressed && styles.navButtonPressed,
                ]}
              >
                <Text style={styles.navButtonText}>›</Text>
              </Pressable>
            </View>

            <View style={styles.weekdays}>
              {days.map((day) => (
                <Text key={day} style={styles.weekdayText}>
                  {day}
                </Text>
              ))}
            </View>

            <View style={styles.daysGrid}>
              {Array(firstDay)
                .fill(0)
                .map((_, i) => (
                  <View key={`empty-${i}`} style={styles.dayCell} />
                ))}
              {daysArray.map((day) => {
                const isToday =
                  day === new Date().getDate() &&
                  currentDate.getMonth() === new Date().getMonth() &&
                  currentDate.getFullYear() === new Date().getFullYear();
                return (
                  <Pressable
                    key={day}
                    style={({
                      pressed,
                      hovered,
                    }: {
                      pressed: boolean;
                      hovered?: boolean;
                    }) => [
                      styles.dayCell,
                      isToday && styles.todayCell,
                      hovered && !isToday && styles.dayCellHovered,
                      pressed && !isToday && styles.dayCellPressed,
                    ]}
                  >
                    <Text style={[styles.dayText, isToday && styles.todayText]}>
                      {day}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.todayDot]} />
              <Text style={styles.legendText}>Today</Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Tokens.colors.neutral.darkest,
  },
  webContainer: {
    flex: 1,
    width: '100%',
    maxWidth: Tokens.layout.maxWidth.content,
    alignSelf: 'center',
  },
  content: {
    flex: 1,
    padding: Tokens.spacing[6],
  },
  title: {
    fontFamily: 'Inter',
    fontSize: 32,
    fontWeight: '800',
    color: Tokens.colors.text.primary,
    marginBottom: Tokens.spacing[6],
    letterSpacing: -1,
  },
  calendarCard: {
    backgroundColor: Tokens.colors.neutral.darker,
    borderRadius: Tokens.radii.xl,
    padding: Tokens.spacing[6],
    borderWidth: 1,
    borderColor: Tokens.colors.neutral.borderSubtle,
    ...Tokens.elevation.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Tokens.spacing[8],
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: Tokens.radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Tokens.colors.neutral.dark,
    borderWidth: 1,
    borderColor: Tokens.colors.neutral.borderSubtle,
    ...Platform.select({
      web: {
        transition: Tokens.motion.transitions.base,
        cursor: 'pointer',
      },
    }),
  },
  navButtonHovered: {
    backgroundColor: Tokens.colors.neutral.darker,
    borderColor: Tokens.colors.text.tertiary,
    transform: [{ scale: 1.05 }],
  },
  navButtonPressed: {
    transform: [{ scale: Tokens.motion.scales.press }],
    backgroundColor: Tokens.colors.neutral.darkest,
  },
  navButtonText: {
    color: Tokens.colors.text.primary,
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '300',
    marginTop: -2,
  },
  monthText: {
    fontFamily: 'Inter',
    color: Tokens.colors.text.primary,
    fontSize: Tokens.type.xl,
    fontWeight: '600',
  },
  weekdays: {
    flexDirection: 'row',
    marginBottom: Tokens.spacing[4],
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    color: Tokens.colors.text.tertiary,
    fontSize: Tokens.type.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Tokens.radii.full,
    borderWidth: 1,
    borderColor: 'transparent',
    ...Platform.select({
      web: {
        transition: Tokens.motion.transitions.fast,
      },
    }),
  },
  dayCellHovered: {
    backgroundColor: Tokens.colors.neutral.dark,
    borderColor: Tokens.colors.neutral.borderSubtle,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  dayCellPressed: {
    backgroundColor: Tokens.colors.neutral.darkest,
    transform: [{ scale: Tokens.motion.scales.press }],
  },
  dayText: {
    fontFamily: 'Inter',
    color: Tokens.colors.text.secondary,
    fontSize: Tokens.type.base,
    fontWeight: '500',
  },
  todayCell: {
    backgroundColor: Tokens.colors.brand[600],
    ...Tokens.elevation.sm,
    ...Platform.select({
      web: {
        boxShadow: `0 0 12px ${Tokens.colors.brand[900]}`,
      },
    }),
  },
  todayText: {
    color: Tokens.colors.neutral[0],
    fontWeight: '700',
  },
  legend: {
    flexDirection: 'row',
    marginTop: Tokens.spacing[6],
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: Tokens.radii.full,
    marginRight: Tokens.spacing[2],
  },
  todayDot: {
    backgroundColor: Tokens.colors.brand[600],
  },
  legendText: {
    fontFamily: 'Inter',
    color: Tokens.colors.text.tertiary,
    fontSize: Tokens.type.xs,
    fontWeight: '500',
  },
});

export default CalendarScreen;
