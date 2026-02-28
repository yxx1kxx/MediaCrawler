import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<HomeStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>首页</Text>
      <Pressable style={styles.card} onPress={() => navigation.navigate('Camera')}>
        <Text style={styles.cardTitle}>易拍</Text>
        <Text style={styles.cardSub}>点击进入相机占位页</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7FB',
    padding: 16
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12
  },
  card: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  cardTitle: {
    fontSize: 48,
    fontWeight: '900',
    color: '#111827'
  },
  cardSub: {
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280'
  }
});
