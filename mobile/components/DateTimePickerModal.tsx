import React, { useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

interface DateTimePickerModalProps {
  /** Whether the modal is visible. */
  visible: boolean;
  /** Label shown in the modal header. */
  title: string;
  /** Currently selected date/time value, or null for no selection. */
  value: Date | null;
  /** Called with the confirmed Date when user taps Done. */
  onConfirm: (date: Date) => void;
  /** Called when user taps Cancel. */
  onCancel: () => void;
}

const ITEM_HEIGHT = 52;
const VISIBLE_ITEMS = 5;
const CAROUSEL_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const PADDING_VERTICAL = ITEM_HEIGHT * 2;

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

/** Returns the number of days in a given month/year. */
function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** Returns the 0-based day of week for the 1st of a month. */
function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

/** Returns the nearest 5-minute-increment minute to a given raw minute. */
function nearestMinute(rawMinute: number): number {
  return MINUTES.reduce((prev, curr) =>
    Math.abs(curr - rawMinute) < Math.abs(prev - rawMinute) ? curr : prev,
  );
}

/**
 * DateTimePickerModal
 *
 * A full-screen bottom-sheet modal with two sections:
 * 1. Calendar — month grid where the user taps a day.
 * 2. Time carousel — two snap-scroll drums for hour (00–23)
 *    and minute (00, 05, …, 55).
 *
 * Matches the dark brand theme (black bg, lime accents).
 */
export default function DateTimePickerModal({
  visible,
  title,
  value,
  onConfirm,
  onCancel,
}: DateTimePickerModalProps) {
  const defaultDate = value ?? new Date();

  const [viewYear, setViewYear] = React.useState(defaultDate.getFullYear());
  const [viewMonth, setViewMonth] = React.useState(defaultDate.getMonth());
  const [selectedDay, setSelectedDay] = React.useState(defaultDate.getDate());
  const [selectedHour, setSelectedHour] = React.useState(defaultDate.getHours());
  const [selectedMinute, setSelectedMinute] = React.useState(nearestMinute(defaultDate.getMinutes()));

  const hourScrollRef = useRef<ScrollView>(null);
  const minuteScrollRef = useRef<ScrollView>(null);

  /** Re-sync all state and scroll positions whenever the modal opens. */
  useEffect(() => {
    if (!visible) return;
    const d = value ?? new Date();
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
    setSelectedDay(d.getDate());
    setSelectedHour(d.getHours());
    const min = nearestMinute(d.getMinutes());
    setSelectedMinute(min);
    // Delay scroll so the layout is ready.
    setTimeout(() => {
      hourScrollRef.current?.scrollTo({ y: d.getHours() * ITEM_HEIGHT, animated: false });
      minuteScrollRef.current?.scrollTo({ y: MINUTES.indexOf(min) * ITEM_HEIGHT, animated: false });
    }, 80);
  }, [visible]);

  const prevMonth = useCallback(() => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }, [viewMonth]);

  const nextMonth = useCallback(() => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }, [viewMonth]);

  /** Snap the hour carousel to the nearest item and update state. */
  const handleHourScrollEnd = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
    setSelectedHour(Math.min(Math.max(idx, 0), 23));
  }, []);

  /** Snap the minute carousel to the nearest item and update state. */
  const handleMinuteScrollEnd = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
    setSelectedMinute(MINUTES[Math.min(Math.max(idx, 0), MINUTES.length - 1)]);
  }, []);

  const handleConfirm = useCallback(() => {
    onConfirm(new Date(viewYear, viewMonth, selectedDay, selectedHour, selectedMinute));
  }, [viewYear, viewMonth, selectedDay, selectedHour, selectedMinute, onConfirm]);

  // Build calendar grid cells (nulls for padding before first day).
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
  const cells = Array.from({ length: totalCells }, (_, i) => {
    const day = i - firstDay + 1;
    return day >= 1 && day <= daysInMonth ? day : null;
  });

  const today = new Date();
  const isToday = (day: number) =>
    day === today.getDate() &&
    viewMonth === today.getMonth() &&
    viewYear === today.getFullYear();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      presentationStyle="overFullScreen">
      <View style={styles.overlay}>
        <View style={styles.sheet}>

          {/* ── Header ── */}
          <View style={styles.sheetHeader}>
            <TouchableOpacity onPress={onCancel} style={styles.headerSideBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.sheetTitle}>{title}</Text>
            <TouchableOpacity onPress={handleConfirm} style={styles.headerSideBtn}>
              <Text style={styles.confirmText}>Done</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.sheetContent}
            showsVerticalScrollIndicator={false}>

            {/* ── Calendar ── */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>DATE</Text>
              <View style={styles.calendar}>

                {/* Month navigation */}
                <View style={styles.monthNav}>
                  <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
                    <Ionicons name="chevron-back" size={18} color={Colors.white} />
                  </TouchableOpacity>
                  <Text style={styles.monthTitle}>
                    {MONTH_NAMES[viewMonth]} {viewYear}
                  </Text>
                  <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
                    <Ionicons name="chevron-forward" size={18} color={Colors.white} />
                  </TouchableOpacity>
                </View>

                {/* Day-of-week headers */}
                <View style={styles.dayHeaders}>
                  {DAYS_OF_WEEK.map(d => (
                    <Text key={d} style={styles.dayHeader}>{d}</Text>
                  ))}
                </View>

                {/* Day grid */}
                <View style={styles.dayGrid}>
                  {cells.map((day, i) => {
                    const selected = day === selectedDay;
                    const tod = day !== null && isToday(day);
                    return (
                      <TouchableOpacity
                        key={i}
                        style={[
                          styles.dayCell,
                          selected && styles.dayCellSelected,
                          !selected && tod && styles.dayCellToday,
                        ]}
                        onPress={() => day && setSelectedDay(day)}
                        disabled={!day}
                        activeOpacity={0.7}>
                        {day !== null && (
                          <Text style={[
                            styles.dayText,
                            selected && styles.dayTextSelected,
                            !selected && tod && styles.dayTextToday,
                          ]}>
                            {day}
                          </Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>

            {/* ── Time Carousel ── */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>TIME</Text>
              <View style={styles.carouselRow}>

                {/* Hour drum */}
                <View style={styles.drumColumn}>
                  <Text style={styles.drumLabel}>Hour</Text>
                  <View style={styles.drumWindow}>
                    {/* Centre selection highlight */}
                    <View pointerEvents="none" style={styles.selectionHighlight} />
                    <ScrollView
                      ref={hourScrollRef}
                      showsVerticalScrollIndicator={false}
                      snapToInterval={ITEM_HEIGHT}
                      decelerationRate="fast"
                      onMomentumScrollEnd={handleHourScrollEnd}
                      onScrollEndDrag={handleHourScrollEnd}
                      contentContainerStyle={{ paddingVertical: PADDING_VERTICAL }}>
                      {HOURS.map(h => (
                        <View key={h} style={styles.drumItem}>
                          <Text style={[
                            styles.drumItemText,
                            h === selectedHour && styles.drumItemTextSelected,
                          ]}>
                            {h.toString().padStart(2, '0')}
                          </Text>
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                </View>

                <Text style={styles.colonSeparator}>:</Text>

                {/* Minute drum */}
                <View style={styles.drumColumn}>
                  <Text style={styles.drumLabel}>Min</Text>
                  <View style={styles.drumWindow}>
                    <View pointerEvents="none" style={styles.selectionHighlight} />
                    <ScrollView
                      ref={minuteScrollRef}
                      showsVerticalScrollIndicator={false}
                      snapToInterval={ITEM_HEIGHT}
                      decelerationRate="fast"
                      onMomentumScrollEnd={handleMinuteScrollEnd}
                      onScrollEndDrag={handleMinuteScrollEnd}
                      contentContainerStyle={{ paddingVertical: PADDING_VERTICAL }}>
                      {MINUTES.map(m => (
                        <View key={m} style={styles.drumItem}>
                          <Text style={[
                            styles.drumItemText,
                            m === selectedMinute && styles.drumItemTextSelected,
                          ]}>
                            {m.toString().padStart(2, '0')}
                          </Text>
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.darkGray,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 32,
  },

  // Header
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.w10,
  },
  headerSideBtn: { minWidth: 60 },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
    textAlign: 'center',
  },
  cancelText: { fontSize: 15, color: Colors.w60, fontWeight: '500' },
  confirmText: { fontSize: 15, color: Colors.lime, fontWeight: '700', textAlign: 'right' },

  sheetContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, gap: 28 },

  // Section header
  section: { gap: 12 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.w40,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },

  // Calendar
  calendar: {
    backgroundColor: Colors.black,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.w10,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.w10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTitle: { fontSize: 16, fontWeight: '700', color: Colors.white },
  dayHeaders: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: Colors.w40,
  },
  dayGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  dayCellSelected: {
    backgroundColor: Colors.lime,
    borderRadius: 10,
  },
  dayCellToday: {
    borderWidth: 1,
    borderColor: Colors.lime30,
    borderRadius: 10,
  },
  dayText: { fontSize: 14, fontWeight: '500', color: Colors.w60 },
  dayTextSelected: { color: Colors.black, fontWeight: '800' },
  dayTextToday: { color: Colors.lime, fontWeight: '700' },

  // Carousel
  carouselRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.black,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.w10,
    padding: 16,
  },
  drumColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  drumLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.w40,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  drumWindow: {
    height: CAROUSEL_HEIGHT,
    width: '100%',
    overflow: 'hidden',
    borderRadius: 14,
    backgroundColor: Colors.w10,
  },
  selectionHighlight: {
    position: 'absolute',
    top: ITEM_HEIGHT * 2,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    backgroundColor: Colors.lime20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.lime30,
    zIndex: 1,
  },
  drumItem: {
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drumItemText: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.w30,
  },
  drumItemTextSelected: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.lime,
  },
  colonSeparator: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.w40,
    paddingBottom: 12,
  },
});
