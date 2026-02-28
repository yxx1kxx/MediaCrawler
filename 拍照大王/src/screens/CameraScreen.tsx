import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { GroupsStackParamList, HomeStackParamList, TemplatesStackParamList } from '../navigation/RootNavigator';
import { StickFigureOverlay } from '../components/StickFigureOverlay';
import { useAppStore } from '../state/store';

type HomeCameraProps = NativeStackScreenProps<HomeStackParamList, 'Camera'>;
type TemplateCameraProps = NativeStackScreenProps<TemplatesStackParamList, 'Camera'>;
type GroupCameraProps = NativeStackScreenProps<GroupsStackParamList, 'Camera'>;
type Props = HomeCameraProps | TemplateCameraProps | GroupCameraProps;

const ZOOM_PRESETS = [
  { label: '.5', value: 0 },
  { label: '1x', value: 0.12 },
  { label: '2', value: 0.28 },
  { label: '3', value: 0.42 }
] as const;

export function CameraScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();
  const cameraRef = useRef<CameraView | null>(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [albumPermission, requestAlbumPermission] = MediaLibrary.usePermissions();

  const [facing, setFacing] = useState<'front' | 'back'>('back');
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const [cameraMode, setCameraMode] = useState<'picture' | 'video'>('picture');
  const [liveEnabled, setLiveEnabled] = useState(false);
  const [zoom, setZoom] = useState(0.12);
  const [menuVisible, setMenuVisible] = useState(false);
  const [groupPanelVisible, setGroupPanelVisible] = useState(false);
  const askedAlbumPermissionRef = useRef(false);

  const [taking, setTaking] = useState(false);
  const [recording, setRecording] = useState(false);
  const [latestLibraryUri, setLatestLibraryUri] = useState<string | undefined>(undefined);

  const { addPhotoRecord, markPhotoSaved, groups, templates, shootingGroupId, startShootingFromGroup } =
    useAppStore();
  const [activeActionId, setActiveActionId] = useState<string | undefined>(undefined);

  const shootingGroup = groups.find((g) => g.id === shootingGroupId);
  const shootingTemplates = useMemo(() => {
    if (!shootingGroup) {
      return [];
    }
    return templates.filter((item) => shootingGroup.templateIds.includes(item.id));
  }, [shootingGroup, templates]);

  const activeActionName = useMemo(() => {
    if (activeActionId) {
      const found = shootingTemplates.find((t) => t.id === activeActionId);
      if (found) {
        return found.name;
      }
    }
    return shootingTemplates[0]?.name ?? '动作1';
  }, [activeActionId, shootingTemplates]);

  useEffect(() => {
    if (!shootingTemplates.length) {
      setActiveActionId(undefined);
      return;
    }
    setActiveActionId(shootingTemplates[0].id);
  }, [shootingGroupId, shootingTemplates]);

  const topReserved = insets.top + 54;
  const bottomReserved = insets.bottom + 180;
  const iphonePhotoPreviewHeight = Math.round(screenWidth * (4 / 3));
  const availablePreviewHeight = Math.max(280, screenHeight - topReserved - bottomReserved);
  const previewHeight = Math.min(iphonePhotoPreviewHeight, availablePreviewHeight);

  const refreshLatestLibraryThumb = useCallback(async () => {
    try {
      if (!albumPermission?.granted) {
        setLatestLibraryUri(undefined);
        return;
      }
      const assets = await MediaLibrary.getAssetsAsync({
        first: 1,
        sortBy: [MediaLibrary.SortBy.creationTime],
        mediaType: [MediaLibrary.MediaType.photo]
      });
      const latestAsset = assets.assets[0];
      if (!latestAsset) {
        setLatestLibraryUri(undefined);
        return;
      }
      const info = await MediaLibrary.getAssetInfoAsync(latestAsset.id);
      setLatestLibraryUri(info.localUri ?? undefined);
    } catch {
      // ignore
    }
  }, [albumPermission?.granted]);

  useEffect(() => {
    if (askedAlbumPermissionRef.current) {
      return;
    }
    if (albumPermission?.granted) {
      askedAlbumPermissionRef.current = true;
      return;
    }
    if (albumPermission?.canAskAgain) {
      askedAlbumPermissionRef.current = true;
      void requestAlbumPermission();
    }
  }, [albumPermission?.granted, albumPermission?.canAskAgain, requestAlbumPermission]);

  useFocusEffect(
    useCallback(() => {
      refreshLatestLibraryThumb();
    }, [refreshLatestLibraryThumb])
  );

  const ensureAlbumPermission = async () => {
    const granted = albumPermission?.granted ? true : (await requestAlbumPermission()).granted;
    if (!granted) {
      Alert.alert('需要相册权限', '请允许保存到相册。');
      return false;
    }
    return true;
  };

  const saveUriToLibrary = async (uri: string) => {
    const recordId = addPhotoRecord(uri);
    await MediaLibrary.saveToLibraryAsync(uri);
    markPhotoSaved(recordId);
  };

  const takePhoto = async () => {
    if (taking || !cameraRef.current) {
      return;
    }

    const ok = await ensureAlbumPermission();
    if (!ok) {
      return;
    }

    try {
      setTaking(true);

      if (liveEnabled) {
        const videoPromise = cameraRef.current.recordAsync({ maxDuration: 2 });
        setTimeout(() => cameraRef.current?.stopRecording(), 1300);
        const liveVideo = await videoPromise;

        const picture = await cameraRef.current.takePictureAsync({
          quality: 1,
          skipProcessing: false
        });

        if (liveVideo?.uri) {
          await saveUriToLibrary(liveVideo.uri);
        }
        await saveUriToLibrary(picture.uri);

        await refreshLatestLibraryThumb();
        return;
      }

      const result = await cameraRef.current.takePictureAsync({
        quality: 1,
        skipProcessing: false
      });

      await saveUriToLibrary(result.uri);
      await refreshLatestLibraryThumb();
    } catch {
      Alert.alert('拍照失败，请重试');
    } finally {
      setTaking(false);
    }
  };

  const toggleRecordVideo = async () => {
    if (!cameraRef.current) {
      return;
    }

    if (recording) {
      cameraRef.current.stopRecording();
      return;
    }

    const ok = await ensureAlbumPermission();
    if (!ok) {
      return;
    }

    try {
      setRecording(true);
      const result = await cameraRef.current.recordAsync({
        maxDuration: 60
      });

      if (!result?.uri) {
        throw new Error('no video uri');
      }

      await saveUriToLibrary(result.uri);
      await refreshLatestLibraryThumb();
    } catch {
      Alert.alert('视频录制失败，请重试');
    } finally {
      setRecording(false);
    }
  };

  const closePanels = () => {
    setMenuVisible(false);
    setGroupPanelVisible(false);
  };

  const openSystemAlbum = async () => {
    try {
      if (Platform.OS === 'ios') {
        const photosUrl = 'photos-redirect://';
        const canOpenPhotos = await Linking.canOpenURL(photosUrl);
        if (canOpenPhotos) {
          await Linking.openURL(photosUrl);
          return;
        }
      }

      const androidGalleryUrl = 'content://media/external/images/media';
      const canOpenAndroidGallery = await Linking.canOpenURL(androidGalleryUrl);
      if (canOpenAndroidGallery) {
        await Linking.openURL(androidGalleryUrl);
        return;
      }

      Alert.alert('无法打开系统相册', '请直接打开系统“照片/相册”应用查看。');
    } catch {
      Alert.alert('无法打开系统相册', '请直接打开系统“照片/相册”应用查看。');
    }
  };

  if (!cameraPermission?.granted) {
    return (
      <SafeAreaView style={styles.permissionWrap}>
        <Text style={styles.permissionTitle}>需要开启相机权限</Text>
        <Pressable style={styles.permissionBtn} onPress={requestCameraPermission}>
          <Text style={styles.permissionBtnText}>授权相机</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.previewFrame,
          {
            height: previewHeight,
            marginTop: topReserved,
            marginBottom: bottomReserved
          }
        ]}
      >
        <CameraView
          ref={cameraRef}
          style={styles.cameraView}
          facing={facing}
          flash={flash}
          mode={cameraMode}
          zoom={zoom}
        />
        <StickFigureOverlay />
      </View>

      <SafeAreaView style={styles.overlay}>
        <View style={[styles.topBar, { marginTop: Math.max(2, insets.top * 0.08) }]}>
          <Pressable onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <Text style={styles.iconText}>⌄</Text>
          </Pressable>

          <View style={styles.midBtns}>
            <Pressable
              style={[styles.miniBtn, liveEnabled && styles.miniBtnActive]}
              onPress={() => setLiveEnabled((v) => !v)}
            >
              <Text style={[styles.miniText, liveEnabled && styles.miniTextActive]}>◉ LIVE</Text>
            </Pressable>
            <Pressable style={styles.miniBtn} onPress={() => setFlash((v) => (v === 'off' ? 'on' : 'off'))}>
              <Text style={styles.miniText}>{flash === 'on' ? '⚡︎' : '⚡︎̸'}</Text>
            </Pressable>
          </View>

          <Pressable
            style={styles.iconBtn}
            onPress={() => {
              setGroupPanelVisible(false);
              setMenuVisible((v) => !v);
            }}
          >
            <Text style={styles.iconText}>⋯</Text>
          </Pressable>
        </View>

        {menuVisible ? (
          <View style={styles.topDrawer}>
            <Text style={styles.menuTitle}>视频比例</Text>
            <View style={styles.menuRow}>
              <Pressable
                style={[styles.menuChip, styles.menuChipActive]}
                onPress={() => {
                  closePanels();
                }}
              >
                <Text style={[styles.menuChipText, styles.menuChipTextActive]}>3:4</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        {groupPanelVisible ? (
          <View style={styles.topDrawer}>
            <Text style={styles.groupPanelTitle}>切换图组</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.groupPanelList}>
              {groups.map((group) => {
                const active = group.id === shootingGroupId;
                return (
                  <Pressable
                    key={group.id}
                    style={[styles.groupPanelChip, active && styles.groupPanelChipActive]}
                    onPress={() => {
                      startShootingFromGroup(group.id);
                      closePanels();
                    }}
                  >
                    <Text style={[styles.groupPanelChipText, active && styles.groupPanelChipTextActive]}>
                      {group.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        ) : null}

        {(menuVisible || groupPanelVisible) ? (
          <Pressable style={styles.dismissLayer} onPress={closePanels} />
        ) : null}

        <View style={styles.bottomPanel}>
          <View style={styles.metaRow}>
            <Text style={styles.bottomText}>
              {shootingGroup?.name ?? '图组'} / {activeActionName}
            </Text>
            <Pressable
              style={styles.groupBtn}
              onPress={() => {
                setMenuVisible(false);
                setGroupPanelVisible((v) => !v);
              }}
            >
              <Text style={styles.groupBtnText}>图组</Text>
            </Pressable>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.actionList}>
            {shootingTemplates.map((item) => {
              const active = (activeActionId ?? shootingTemplates[0]?.id) === item.id;
              return (
                <Pressable
                  key={item.id}
                  style={[styles.actionChip, active && styles.actionChipActive]}
                  onPress={() => setActiveActionId(item.id)}
                >
                  <Text style={[styles.actionChipText, active && styles.actionChipTextActive]}>{item.name}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.zoomRow}>
            {ZOOM_PRESETS.map((preset) => {
              const active = Math.abs(zoom - preset.value) < 0.01;
              return (
                <Pressable
                  key={preset.label}
                  style={[styles.zoomChip, active && styles.zoomChipActive]}
                  onPress={() => setZoom(preset.value)}
                >
                  <Text style={[styles.zoomChipText, active && styles.zoomChipTextActive]}>{preset.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.controlsRow}>
            <Pressable style={styles.previewThumb} onPress={openSystemAlbum}>
              {latestLibraryUri ? (
                <Image source={{ uri: latestLibraryUri }} style={styles.previewImage} />
              ) : (
                <Text style={styles.previewThumbText}>相册</Text>
              )}
            </Pressable>

            {cameraMode === 'picture' ? (
              <Pressable style={[styles.shootBtn, taking && styles.disabled]} onPress={takePhoto}>
                <View style={styles.shootInner} />
              </Pressable>
            ) : (
              <Pressable style={[styles.shootBtn, recording && styles.recordingRing]} onPress={toggleRecordVideo}>
                <View style={[styles.videoInner, recording && styles.videoInnerRecording]} />
              </Pressable>
            )}

            <Pressable style={styles.sideBtn} onPress={() => setFacing((v) => (v === 'front' ? 'back' : 'front'))}>
              <Text style={styles.sideBtnText}>翻转</Text>
            </Pressable>
          </View>

          <View style={styles.modeRow}>
            <Pressable onPress={() => setCameraMode('video')}>
              <Text style={[styles.modeText, cameraMode === 'video' && styles.modeActive]}>视频</Text>
            </Pressable>
            <Pressable onPress={() => setCameraMode('picture')}>
              <Text style={[styles.modeText, cameraMode === 'picture' && styles.modeActive]}>照片</Text>
            </Pressable>
            <Text style={styles.modeText}>人像</Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  permissionWrap: {
    flex: 1,
    backgroundColor: '#090B10',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14
  },
  permissionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800'
  },
  permissionBtn: {
    height: 42,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: '#FF4D67',
    alignItems: 'center',
    justifyContent: 'center'
  },
  permissionBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14
  },
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'flex-start'
  },
  previewFrame: {
    width: '100%',
    alignSelf: 'center',
    overflow: 'hidden',
    backgroundColor: '#000000'
  },
  cameraView: {
    ...StyleSheet.absoluteFillObject
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between'
  },
  topBar: {
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  iconBtn: {
    minWidth: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.38)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8
  },
  iconText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800'
  },
  midBtns: {
    flexDirection: 'row',
    gap: 8
  },
  miniBtn: {
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.45)',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 10,
    justifyContent: 'center'
  },
  miniBtnActive: {
    borderColor: '#FFDA7A',
    backgroundColor: 'rgba(255,218,122,0.18)'
  },
  miniText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700'
  },
  miniTextActive: {
    color: '#FFDA7A'
  },
  topDrawer: {
    marginTop: 6,
    marginHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    backgroundColor: 'rgba(0,0,0,0.62)',
    padding: 10,
    zIndex: 30
  },
  menuTitle: {
    color: '#E5E7EB',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8
  },
  menuRow: {
    flexDirection: 'row',
    gap: 8
  },
  menuChip: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  menuChipActive: {
    borderColor: '#FFDA7A',
    backgroundColor: 'rgba(255,218,122,0.15)'
  },
  menuChipText: {
    color: '#E5E7EB',
    fontSize: 12,
    fontWeight: '700'
  },
  menuChipTextActive: {
    color: '#FFDA7A'
  },
  groupPanel: {
    marginTop: 6,
    marginHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    backgroundColor: 'rgba(0,0,0,0.62)',
    padding: 10
  },
  groupPanelTitle: {
    color: '#E5E7EB',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8
  },
  groupPanelList: {
    gap: 8
  },
  groupPanelChip: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  groupPanelChipActive: {
    borderColor: '#8DD8FF',
    backgroundColor: 'rgba(141,216,255,0.18)'
  },
  groupPanelChipText: {
    color: '#E5E7EB',
    fontSize: 12,
    fontWeight: '700'
  },
  groupPanelChipTextActive: {
    color: '#8DD8FF'
  },
  dismissLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.18)',
    zIndex: 20
  },
  bottomPanel: {
    paddingBottom: 4,
    backgroundColor: 'rgba(0,0,0,0.52)'
  },
  metaRow: {
    minHeight: 28,
    paddingHorizontal: 14,
    paddingTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  actionList: {
    minHeight: 34,
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 8,
    paddingTop: 4
  },
  zoomRow: {
    height: 34,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12
  },
  zoomChip: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center'
  },
  zoomChipActive: {
    backgroundColor: 'rgba(44,44,46,0.88)'
  },
  zoomChipText: {
    color: '#F3F4F6',
    fontSize: 14,
    fontWeight: '700'
  },
  zoomChipTextActive: {
    color: '#FFDA52'
  },
  actionChip: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(0,0,0,0.26)'
  },
  actionChipActive: {
    borderColor: '#FF9DB1',
    backgroundColor: 'rgba(255,77,103,0.3)'
  },
  actionChipText: {
    color: '#E5E7EB',
    fontSize: 12,
    fontWeight: '600'
  },
  actionChipTextActive: {
    color: '#FFFFFF'
  },
  controlsRow: {
    height: 90,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  previewThumb: {
    width: 46,
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    overflow: 'hidden'
  },
  previewThumbText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700'
  },
  previewImage: {
    width: '100%',
    height: '100%'
  },
  sideBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)'
  },
  sideBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700'
  },
  shootBtn: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  shootInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF'
  },
  videoInner: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FF3B30'
  },
  videoInnerRecording: {
    width: 24,
    height: 24,
    borderRadius: 6
  },
  recordingRing: {
    borderColor: '#FF453A'
  },
  disabled: {
    opacity: 0.6
  },
  modeRow: {
    height: 28,
    paddingHorizontal: 16,
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 22
  },
  modeText: {
    color: '#D1D5DB',
    fontSize: 12,
    fontWeight: '600'
  },
  modeActive: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800'
  },
  bottomText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600'
  },
  groupBtn: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.65)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(0,0,0,0.3)'
  },
  groupBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700'
  }
});
