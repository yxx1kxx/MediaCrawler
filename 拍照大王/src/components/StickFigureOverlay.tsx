import React from 'react';
import { StyleSheet, View } from 'react-native';

export function StickFigureOverlay() {
  return (
    <View pointerEvents="none" style={styles.container}>
      <View style={styles.head} />
      <View style={styles.body} />
      <View style={[styles.arm, styles.armLeft]} />
      <View style={[styles.arm, styles.armRight]} />
      <View style={[styles.leg, styles.legLeft]} />
      <View style={[styles.leg, styles.legRight]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center'
  },
  head: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 3,
    borderColor: '#FF6B81',
    backgroundColor: 'rgba(255,107,129,0.15)',
    marginBottom: 10
  },
  body: {
    width: 4,
    height: 140,
    backgroundColor: '#FF6B81'
  },
  arm: {
    position: 'absolute',
    width: 96,
    height: 3,
    backgroundColor: '#FF6B81',
    top: '47%'
  },
  armLeft: {
    transform: [{ translateX: -44 }, { rotate: '-25deg' }]
  },
  armRight: {
    transform: [{ translateX: 44 }, { rotate: '20deg' }]
  },
  leg: {
    position: 'absolute',
    width: 100,
    height: 3,
    backgroundColor: '#FF6B81',
    top: '68%'
  },
  legLeft: {
    transform: [{ translateX: -26 }, { rotate: '38deg' }]
  },
  legRight: {
    transform: [{ translateX: 26 }, { rotate: '-38deg' }]
  }
});
