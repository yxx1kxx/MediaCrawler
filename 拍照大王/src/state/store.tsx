import React, { createContext, useContext, useMemo, useState } from 'react';

export type Template = {
  id: string;
  name: string;
  category: string;
  thumbnail?: string;
};

export type Group = {
  id: string;
  name: string;
  templateIds: string[];
};

export type PhotoRecord = {
  id: string;
  uri: string;
  createdAt: number;
  savedToLibrary: boolean;
};

export type SelectedSource = {
  type: 'templates' | 'group';
  groupId?: string;
};

export type AppState = {
  selectedTemplateIds: string[];
  templates: Template[];
  categories: string[];
  groups: Group[];
  photoRecords: PhotoRecord[];
  shootingGroupId?: string;
  selectedSource?: SelectedSource;
};

type AppActions = {
  toggleSelectTemplate: (id: string) => void;
  clearSelected: () => void;
  openSelectedFrom: (source?: SelectedSource) => void;
  addToGroup: (groupId: string, templateIds: string[]) => void;
  setSelectedTemplates: (ids: string[]) => void;
  addPhotoRecord: (uri: string) => string;
  markPhotoSaved: (id: string) => void;
  startShootingFromGroup: (groupId: string) => void;
  saveSelectedAsGroupAndStart: () => string | undefined;
};

type AppStore = AppState & AppActions;

const categoriesSeed = ['姿势', '主题', '生日拍照模板', '情侣', '外景', '热榜', '顾问推荐'];

const templatesSeed: Template[] = [
  { id: 't1', name: '模板1', category: '姿势' },
  { id: 't2', name: '模板2', category: '姿势' },
  { id: 't3', name: '模板3', category: '主题' },
  { id: 't4', name: '模板4', category: '主题' },
  { id: 't5', name: '模板5', category: '生日拍照模板' },
  { id: 't6', name: '模板6', category: '生日拍照模板' },
  { id: 't7', name: '模板7', category: '情侣' },
  { id: 't8', name: '模板8', category: '情侣' },
  { id: 't9', name: '模板9', category: '外景' },
  { id: 't10', name: '模板10', category: '热榜' },
  { id: 't11', name: '模板11', category: '顾问推荐' },
  { id: 't12', name: '模板12', category: '顾问推荐' }
];

const groupsSeed: Group[] = [
  { id: 'g1', name: '图组1', templateIds: ['t1', 't3', 't5'] },
  { id: 'g2', name: '图组2', templateIds: ['t2', 't7', 't10'] },
  { id: 'g3', name: '图组3', templateIds: ['t4', 't8', 't12'] }
];

const AppStoreContext = createContext<AppStore | null>(null);

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);
  const [groups, setGroups] = useState<Group[]>(groupsSeed);
  const [photoRecords, setPhotoRecords] = useState<PhotoRecord[]>([]);
  const [shootingGroupId, setShootingGroupId] = useState<string | undefined>(undefined);
  const [selectedSource, setSelectedSource] = useState<SelectedSource | undefined>(undefined);

  const store = useMemo<AppStore>(() => {
    const toggleSelectTemplate = (id: string) => {
      setSelectedTemplateIds((prev) => {
        if (prev.includes(id)) {
          return prev.filter((item) => item !== id);
        }
        return [...prev, id];
      });
    };

    const clearSelected = () => setSelectedTemplateIds([]);

    const openSelectedFrom = (source?: SelectedSource) => {
      setSelectedSource(source);
    };

    const addToGroup = (groupId: string, templateIds: string[]) => {
      setGroups((prev) =>
        prev.map((group) => {
          if (group.id !== groupId) {
            return group;
          }
          const merged = Array.from(new Set([...group.templateIds, ...templateIds]));
          return { ...group, templateIds: merged };
        })
      );
    };

    const setSelectedTemplates = (ids: string[]) => {
      setSelectedTemplateIds(ids);
    };

    const addPhotoRecord = (uri: string) => {
      const id = `p-${Date.now()}`;
      setPhotoRecords((prev) => [
        ...prev,
        {
          id,
          uri,
          createdAt: Date.now(),
          savedToLibrary: false
        }
      ]);
      return id;
    };

    const markPhotoSaved = (id: string) => {
      setPhotoRecords((prev) =>
        prev.map((record) => (record.id === id ? { ...record, savedToLibrary: true } : record))
      );
    };

    const startShootingFromGroup = (groupId: string) => {
      setShootingGroupId(groupId);
    };

    const saveSelectedAsGroupAndStart = () => {
      if (!selectedTemplateIds.length) {
        return undefined;
      }
      const nextIndex = groups.length + 1;
      const groupId = `g${Date.now()}`;
      const newGroup: Group = {
        id: groupId,
        name: `图组${nextIndex}`,
        templateIds: selectedTemplateIds
      };
      setGroups((prev) => [...prev, newGroup]);
      setShootingGroupId(groupId);
      return groupId;
    };

    return {
      selectedTemplateIds,
      templates: templatesSeed,
      categories: categoriesSeed,
      groups,
      photoRecords,
      shootingGroupId,
      selectedSource,
      toggleSelectTemplate,
      clearSelected,
      openSelectedFrom,
      addToGroup,
      setSelectedTemplates,
      addPhotoRecord,
      markPhotoSaved,
      startShootingFromGroup,
      saveSelectedAsGroupAndStart
    };
  }, [groups, photoRecords, selectedSource, selectedTemplateIds, shootingGroupId]);

  return <AppStoreContext.Provider value={store}>{children}</AppStoreContext.Provider>;
}

export function useAppStore() {
  const context = useContext(AppStoreContext);
  if (!context) {
    throw new Error('useAppStore must be used inside AppStoreProvider');
  }
  return context;
}
