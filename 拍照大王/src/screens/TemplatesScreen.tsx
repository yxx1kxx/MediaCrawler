import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { FloatingSelectedButton } from '../components/FloatingSelectedButton';
import { CategoryItem } from '../components/CategoryItem';
import { TemplateCard } from '../components/TemplateCard';
import { TemplatesStackParamList } from '../navigation/RootNavigator';
import { Template, useAppStore } from '../state/store';

type Props = NativeStackScreenProps<TemplatesStackParamList, 'Templates'>;

export function TemplatesScreen({ navigation }: Props) {
  const { categories, templates, selectedTemplateIds, toggleSelectTemplate, openSelectedFrom } = useAppStore();
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const adaptiveTop = Math.max(6, Math.min(16, Math.round(height * 0.012)));

  const filtered = useMemo(
    () => templates.filter((item) => item.category === activeCategory),
    [activeCategory, templates]
  );

  return (
    <SafeAreaView style={[styles.container, { paddingTop: Math.max(insets.top * 0.2, adaptiveTop) }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>易拍</Text>
        <Pressable style={styles.iconBtn}>
          <Text style={styles.iconText}>◎</Text>
        </Pressable>
      </View>

      <View style={styles.main}>
        <View style={styles.leftPane}>
          <FlatList
            data={categories}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <CategoryItem label={item} active={item === activeCategory} onPress={() => setActiveCategory(item)} />
            )}
          />
        </View>

        <View style={styles.rightPane}>
          <FlatList
            data={filtered}
            keyExtractor={(item: Template) => item.id}
            numColumns={2}
            renderItem={({ item }) => (
              <TemplateCard
                item={item}
                selected={selectedTemplateIds.includes(item.id)}
                onPress={() => toggleSelectTemplate(item.id)}
              />
            )}
            contentContainerStyle={styles.gridContent}
          />
        </View>
      </View>

      <FloatingSelectedButton
        count={selectedTemplateIds.length}
        onPress={() => {
          openSelectedFrom({ type: 'templates' });
          navigation.push('Selected', { sourceType: 'templates' });
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7FB'
  },
  header: {
    height: 36,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827'
  },
  iconBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconText: {
    color: '#374151',
    fontWeight: '700'
  },
  main: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 8,
    gap: 10
  },
  leftPane: {
    width: 104
  },
  rightPane: {
    flex: 1
  },
  gridContent: {
    paddingBottom: 140
  }
});
