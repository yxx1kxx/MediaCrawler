import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Template } from '../state/store';

type Props = {
  item: Template;
  selected: boolean;
  onPress: () => void;
};

export function TemplateCard({ item, selected, onPress }: Props) {
  return (
    <Pressable style={[styles.card, selected && styles.cardSelected]} onPress={onPress}>
      <View style={styles.thumb}>
        <Text style={styles.thumbText}>Template</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.checkbox}>{selected ? '◉' : '○'}</Text>
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 6,
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF'
  },
  cardSelected: {
    borderColor: '#FF9BA8',
    backgroundColor: '#FFF6F7'
  },
  thumb: {
    height: 94,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center'
  },
  thumbText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '600'
  },
  row: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  checkbox: {
    fontSize: 17,
    color: '#EF476F'
  },
  name: {
    flex: 1,
    fontSize: 13,
    color: '#111827',
    fontWeight: '600'
  }
});
