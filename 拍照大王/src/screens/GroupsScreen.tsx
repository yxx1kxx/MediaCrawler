import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { GroupsStackParamList } from '../navigation/RootNavigator';
import { useAppStore } from '../state/store';

type Props = NativeStackScreenProps<GroupsStackParamList, 'Groups'>;

export function GroupsScreen({ navigation }: Props) {
  const { groups, openSelectedFrom, setSelectedTemplates } = useAppStore();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const adaptiveTop = Math.max(6, Math.min(16, Math.round(height * 0.012)));

  return (
    <SafeAreaView style={[styles.container, { paddingTop: Math.max(insets.top * 0.2, adaptiveTop) }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>图组</Text>
      </View>
      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            style={styles.groupCard}
            onPress={() => {
              setSelectedTemplates(item.templateIds);
              openSelectedFrom({ type: 'group', groupId: item.id });
              navigation.push('Selected', { sourceType: 'group', groupId: item.id });
            }}
          >
            <Text style={styles.groupName}>{item.name}</Text>
            <Text style={styles.groupDesc}>模板数 {item.templateIds.length}</Text>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7FB',
    paddingHorizontal: 12
  },
  header: {
    height: 36,
    justifyContent: 'center'
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827'
  },
  groupCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    padding: 14,
    marginBottom: 10
  },
  groupName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827'
  },
  groupDesc: {
    marginTop: 4,
    fontSize: 13,
    color: '#6B7280'
  }
});
