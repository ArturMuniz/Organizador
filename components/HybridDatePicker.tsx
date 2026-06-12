import { Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useRef, useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface HybridDatePickerProps {
  value: Date | null;
  onChange: (date: Date) => void;
  minimumDate?: Date;
  maximumDate?: Date;
  mode?: 'date' | 'time' | 'datetime';
  placeholder?: string;
  style?: any;
}

export const HybridDatePicker: React.FC<HybridDatePickerProps> = ({
  value,
  onChange,
  minimumDate,
  maximumDate,
  mode = 'date',
  placeholder = 'Selecione a data',
  style,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleNativeChange = (event: any, date?: Date) => {
    if (Platform.OS !== 'web') {
      setShowPicker(false);
    }
    if (date) {
      onChange(date);
    }
  };

  const handleWebChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const dateString = event.target.value;
    if (dateString) {
      const [year, month, day] = dateString.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      onChange(date);
    }
  };

  const formattedDate = value
    ? value.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : placeholder;

  const isoDate = value ? value.toISOString().split('T')[0] : '';

  // Para web, retorna um input de data HTML nativo e visível
  if (Platform.OS === 'web') {
    return (
      <View
        style={[styles.webContainer, style]}
        // @ts-ignore - React Native Web não tipifica bem divs customizadas
        onMouseDown={(e: any) => e.target === inputRef.current && inputRef.current?.click()}
      >
        <Feather name="calendar" size={20} color="#6D42A4" style={styles.icon} />
        <input
          ref={inputRef}
          type="date"
          value={isoDate}
          onChange={handleWebChange}
          style={{
            ...styles.nativeWebInput,
            color: '#6D42A4',
          } as any}
          min={minimumDate ? minimumDate.toISOString().split('T')[0] : undefined}
          max={maximumDate ? maximumDate.toISOString().split('T')[0] : undefined}
          placeholder={placeholder}
        />
      </View>
    );
  }

  // Para mobile, usa DateTimePicker nativo
  return (
    <View>
      <TouchableOpacity
        style={[styles.mobileButton, style]}
        onPress={() => setShowPicker(true)}
        activeOpacity={0.7}
      >
        <Feather name="calendar" size={20} color="#6D42A4" style={styles.icon} />
        <Text style={styles.mobileButtonText}>{formattedDate}</Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={value || new Date()}
          mode={mode}
          display="default"
          onChange={handleNativeChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  webContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  icon: {
    marginRight: 12,
    zIndex: 1,
  },
  nativeWebInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    padding: 0,
    border: 'none',
    background: 'transparent',
    outline: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    width: '100%',
  } as any,
  mobileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  mobileButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#6D42A4',
    fontWeight: '600',
    marginLeft: 8,
  },
});
