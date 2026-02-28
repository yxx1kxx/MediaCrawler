import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

export function ProfileScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.userCard}>
        <View style={styles.avatar} />
        <View>
          <Text style={styles.name}>用户名</Text>
          <Text style={styles.userId}>ID: 10001</Text>
        </View>
      </View>

      <View style={styles.listCard}>
        <Pressable style={styles.row} onPress={() => Alert.alert('同步拍照记录 占位')}>
          <Text style={styles.rowLabel}>同步拍照记录</Text>
          <Text style={styles.rowArrow}>›</Text>
        </Pressable>
        <Pressable style={styles.row} onPress={() => Alert.alert('主题 占位')}>
          <Text style={styles.rowLabel}>主题</Text>
          <Text style={styles.rowArrow}>›</Text>
        </Pressable>
      </View>

      <Pressable style={styles.vipBtn} onPress={() => Alert.alert('开通VIP 占位')}>
        <Text style={styles.vipText}>开通VIP</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7FB',
    padding: 16,
    gap: 14
  },
  userCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E5E7EB'
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827'
  },
  userId: {
    marginTop: 4,
    fontSize: 13,
    color: '#6B7280'
  },
  listCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF'
  },
  row: {
    height: 52,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  rowLabel: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '600'
  },
  rowArrow: {
    fontSize: 24,
    color: '#9CA3AF'
  },
  vipBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FF4D67',
    alignItems: 'center',
    justifyContent: 'center'
  },
  vipText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800'
  }
});
