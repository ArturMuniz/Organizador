import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  day: number;
  hasTask: boolean;
  onPress: () => void;
};

export const DayCell: React.FC<Props> = ({ day, hasTask, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.cell} activeOpacity={0.8}>
      <View style={styles.dayWrapper}>
        <Text style={styles.dayText}>{day}</Text>
        {hasTask && <View style={styles.taskDot} />}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cell: {
    width: '14.285%',
    padding: 8,
  },
  dayWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(141, 96, 198, 0.12)',
    paddingVertical: 10,
    minHeight: 56,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3D2C8D',
  },
  taskDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6F5AE0',
    marginTop: 6,
  },
});
