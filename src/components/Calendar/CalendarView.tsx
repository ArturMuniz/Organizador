import { Task } from '@/contexts/TaskContext';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { DayCell } from './Daycell';

type Props = {
  currentMonth: Date;
  tasks: Task[];
  onSelectDate: (date: string) => void;
};

export const CalendarView: React.FC<Props> = ({
  currentMonth,
  tasks,
  onSelectDate,
}) => {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <View style={styles.calendarContainer}>
      <View style={styles.dayGrid}>
        {days.map(day => {
          const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const hasTask = tasks.some(task => task.date === date);

          return (
            <DayCell
              key={day}
              day={day}
              hasTask={hasTask}
              onPress={() => onSelectDate(date)}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  calendarContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#F7F3FF',
    borderRadius: 24,
  },
  dayGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
});