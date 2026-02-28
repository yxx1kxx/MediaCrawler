import React, { useMemo } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { GroupsStackParamList, TemplatesStackParamList } from '../navigation/RootNavigator';
import { useAppStore } from '../state/store';

type TemplateSelectedProps = NativeStackScreenProps<TemplatesStackParamList, 'Selected'>;
type GroupSelectedProps = NativeStackScreenProps<GroupsStackParamList, 'Selected'>;
type Props = TemplateSelectedProps | GroupSelectedProps;

export function SelectedScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const adaptiveTop = Math.max(6, Math.min(16, Math.round(height * 0.012)));
  const {
    selectedTemplateIds,
    templates,
    groups,
    selectedSource,
    toggleSelectTemplate,
    startShootingFromGroup,
    saveSelectedAsGroupAndStart
  } = useAppStore();

  const selectedTemplates = useMemo(
    () => templates.filter((item) => selectedTemplateIds.includes(item.id)),
    [selectedTemplateIds, templates]
  );

  const sourceType = route.params?.sourceType || selectedSource?.type;
  const sourceGroupId = route.params?.groupId || selectedSource?.groupId;
  const sourceGroup = groups.find((g) => g.id === sourceGroupId);

  const pageTitle = sourceType === 'group' && sourceGroup ? `${sourceGroup.name} - 已选模板` : '已选模板';

  const onSaveGroupAndShoot = () => {
    if (!selectedTemplateIds.length) {
      Alert.alert('还没有选择模板');
      return;
    }

    if (sourceType === 'group' && sourceGroupId) {
      startShootingFromGroup(sourceGroupId);
    } else {
      const createdGroupId = saveSelectedAsGroupAndStart();
      if (!createdGroupId) {
        Alert.alert('保存图组失败，请重试');
        return;
      }
    }

    (navigation as any).navigate('Camera');
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: Math.max(insets.top * 0.2, adaptiveTop) }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{pageTitle}</Text>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.close}>×</Text>
        </Pressable>
      </View>

      {selectedTemplates.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>还没有选择模板</Text>
        </View>
      ) : (
        <FlatList
          data={selectedTemplates}
          keyExtractor={(item) => item.id}
          horizontal
          contentContainerStyle={styles.selectedList}
          renderItem={({ item }) => (
            <Pressable style={styles.templateItem} onPress={() => toggleSelectTemplate(item.id)}>
              <View style={styles.thumb} />
              <Text style={styles.templateName}>{item.name}</Text>
              <Text style={styles.removeText}>点击取消</Text>
            </Pressable>
          )}
          showsHorizontalScrollIndicator={false}
        />
      )}

      <View style={styles.footer}>
        <Pressable style={styles.primaryBtn} onPress={onSaveGroupAndShoot}>
          <Text style={styles.primaryText}>保存图组开始拍摄</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7FB'
  },
  header: {
    height: 34,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row'
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827'
  },
  close: {
    fontSize: 22,
    color: '#111827',
    lineHeight: 22
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280'
  },
  selectedList: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10
  },
  templateItem: {
    width: 140,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    padding: 10
  },
  thumb: {
    height: 100,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB'
  },
  templateName: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '700',
    color: '#111827'
  },
  removeText: {
    marginTop: 4,
    fontSize: 11,
    color: '#6B7280'
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    padding: 14
  },
  primaryBtn: {
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FF4D67',
    alignItems: 'center',
    justifyContent: 'center'
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800'
  }
});
