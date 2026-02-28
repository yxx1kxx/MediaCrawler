import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  count: number;
  onPress: () => void;
};

export function FloatingSelectedButton({ count, onPress }: Props) {
  return (
    <Pressable style={styles.fab} onPress={onPress}>
      <Text style={styles.text}>已选</Text>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{count}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 84,
    height: 46,
    minWidth: 86,
    borderRadius: 23,
    backgroundColor: '#FF4D67',
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#B42332',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 }
  },
  text: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center'
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800'
  }
});
