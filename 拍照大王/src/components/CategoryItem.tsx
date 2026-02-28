import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

type Props = {
  label: string;
  active?: boolean;
  onPress: () => void;
};

export function CategoryItem({ label, active, onPress }: Props) {
  return (
    <Pressable onPress={onPress} style={[styles.item, active && styles.activeItem]}>
      <Text style={[styles.label, active && styles.activeLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    marginBottom: 8
  },
  activeItem: {
    backgroundColor: '#FFEFF2',
    borderColor: '#FFD5DC'
  },
  label: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '600'
  },
  activeLabel: {
    color: '#D7263D'
  }
});
