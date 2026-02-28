import React from 'react';
import { NavigationContainer, getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { TemplatesScreen } from '../screens/TemplatesScreen';
import { SelectedScreen } from '../screens/SelectedScreen';
import { CameraScreen } from '../screens/CameraScreen';
import { GroupsScreen } from '../screens/GroupsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

export type HomeStackParamList = {
  Home: undefined;
  Camera: undefined;
};

export type TemplatesStackParamList = {
  Templates: undefined;
  Selected: { sourceType?: 'templates' | 'group'; groupId?: string } | undefined;
  Camera: undefined;
};

export type GroupsStackParamList = {
  Groups: undefined;
  Selected: { sourceType?: 'templates' | 'group'; groupId?: string } | undefined;
  Camera: undefined;
};

export type ProfileStackParamList = {
  Profile: undefined;
};

export type RootTabParamList = {
  HomeTab: undefined;
  TemplatesTab: undefined;
  GroupsTab: undefined;
  ProfileTab: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const TemplatesStack = createNativeStackNavigator<TemplatesStackParamList>();
const GroupsStack = createNativeStackNavigator<GroupsStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen name="Home" component={HomeScreen} options={{ title: '首页' }} />
      <HomeStack.Screen name="Camera" component={CameraScreen} options={{ headerShown: false }} />
    </HomeStack.Navigator>
  );
}

function TemplatesStackNavigator() {
  return (
    <TemplatesStack.Navigator>
      <TemplatesStack.Screen name="Templates" component={TemplatesScreen} options={{ headerShown: false }} />
      <TemplatesStack.Screen name="Selected" component={SelectedScreen} options={{ headerShown: false }} />
      <TemplatesStack.Screen name="Camera" component={CameraScreen} options={{ headerShown: false }} />
    </TemplatesStack.Navigator>
  );
}

function GroupsStackNavigator() {
  return (
    <GroupsStack.Navigator>
      <GroupsStack.Screen name="Groups" component={GroupsScreen} options={{ headerShown: false }} />
      <GroupsStack.Screen name="Selected" component={SelectedScreen} options={{ headerShown: false }} />
      <GroupsStack.Screen name="Camera" component={CameraScreen} options={{ headerShown: false }} />
    </GroupsStack.Navigator>
  );
}

function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen name="Profile" component={ProfileScreen} options={{ title: '我' }} />
    </ProfileStack.Navigator>
  );
}

function cameraAwareTabStyle(route: any) {
  const routeName = getFocusedRouteNameFromRoute(route) ?? '';
  const hideOn = ['Camera'];
  const hidden = hideOn.includes(routeName);
  return {
    display: hidden ? ('none' as const) : ('flex' as const),
    height: 56,
    borderTopColor: '#E5E7EB',
    borderTopWidth: 1,
    paddingBottom: 6,
    paddingTop: 4
  };
}

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            height: 56,
            borderTopColor: '#E5E7EB',
            borderTopWidth: 1,
            paddingBottom: 6,
            paddingTop: 4
          },
          tabBarItemStyle: {
            paddingVertical: 0
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '700',
            marginBottom: 0
          }
        }}
      >
        <Tab.Screen
          name="HomeTab"
          component={HomeStackNavigator}
          options={({ route }) => ({
            title: '颜',
            tabBarStyle: cameraAwareTabStyle(route)
          })}
        />
        <Tab.Screen
          name="TemplatesTab"
          component={TemplatesStackNavigator}
          options={({ route }) => ({
            title: '模板',
            tabBarStyle: cameraAwareTabStyle(route)
          })}
        />
        <Tab.Screen
          name="GroupsTab"
          component={GroupsStackNavigator}
          options={({ route }) => ({
            title: '图组',
            tabBarStyle: cameraAwareTabStyle(route)
          })}
        />
        <Tab.Screen
          name="ProfileTab"
          component={ProfileStackNavigator}
          options={({ route }) => ({
            title: '我',
            tabBarStyle: cameraAwareTabStyle(route)
          })}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
