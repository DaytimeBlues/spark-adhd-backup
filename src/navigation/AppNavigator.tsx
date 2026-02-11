import React, { Suspense, lazy } from 'react';
import { View, ActivityIndicator, Platform } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Tokens } from '../theme/tokens';
import { WebNavBar } from './WebNavBar';
import { ROUTES } from './routes';

// Critical screens - loaded normally
import HomeScreen from '../screens/HomeScreen';
import IgniteScreen from '../screens/IgniteScreen';

// Lazy loaded non-critical screens
const FogCutterScreen = lazy(() => import('../screens/FogCutterScreen'));
const PomodoroScreen = lazy(() => import('../screens/PomodoroScreen'));
const BrainDumpScreen = lazy(() => import('../screens/BrainDumpScreen'));
const CalendarScreen = lazy(() => import('../screens/CalendarScreen'));
const AnchorScreen = lazy(() => import('../screens/AnchorScreen'));
const CheckInScreen = lazy(() => import('../screens/CheckInScreen'));
const CBTGuideScreen = lazy(() => import('../screens/CBTGuideScreen'));

// Lazy loading wrapper
const withSuspense = (Component: React.ComponentType<any>) => (props: any) => (
  <Suspense
    fallback={
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: Tokens.colors.neutral.darkest,
        }}
      >
        <ActivityIndicator size="large" color={Tokens.colors.indigo.primary} />
      </View>
    }
  >
    <Component {...props} />
  </Suspense>
);

const LazyFogCutter = withSuspense(FogCutterScreen);
const LazyPomodoro = withSuspense(PomodoroScreen);
const LazyBrainDump = withSuspense(BrainDumpScreen);
const LazyCalendar = withSuspense(CalendarScreen);
const LazyAnchor = withSuspense(AnchorScreen);
const LazyCheckIn = withSuspense(CheckInScreen);
const LazyCBTGuide = withSuspense(CBTGuideScreen);

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name={ROUTES.HOME_MAIN} component={HomeScreen} />
    <Stack.Screen name={ROUTES.CHECK_IN} component={LazyCheckIn} />
    <Stack.Screen name={ROUTES.CBT_GUIDE} component={LazyCBTGuide} />
  </Stack.Navigator>
);

const TabNavigator = () => (
  <Tab.Navigator
    tabBar={
      Platform.OS === 'web' ? (props) => <WebNavBar {...props} /> : undefined
    }
    sceneContainerStyle={
      Platform.OS === 'web'
        ? {
            paddingTop: 64,
            backgroundColor: Tokens.colors.neutral.darkest,
            height: '100%', // Ensure full height
          }
        : undefined
    }
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused }) => {
        const icons: Record<string, string> = {
          Home: 'home',
          Focus: 'fire',
          Tasks: 'text-box-outline',
          Calendar: 'calendar',
        };
        return (
          <Icon
            name={icons[route.name]}
            size={24}
            color={
              focused
                ? Tokens.colors.indigo.primary
                : Tokens.colors.text.tertiary
            }
          />
        );
      },
      tabBarActiveTintColor: Tokens.colors.indigo.primary,
      tabBarInactiveTintColor: Tokens.colors.text.tertiary,
      headerShown: false,
      tabBarStyle: {
        backgroundColor: Tokens.colors.neutral.darker,
        borderTopWidth: 0,
        height: 60,
        paddingBottom: 8,
        elevation: 0,
        shadowOpacity: 0,
      },
      tabBarLabelStyle: {
        fontFamily: 'Inter',
        fontSize: 12,
        fontWeight: '600',
      },
    })}
  >
    <Tab.Screen name={ROUTES.HOME} component={HomeStack} />
    <Tab.Screen name={ROUTES.FOCUS} component={IgniteScreen} />
    <Tab.Screen name={ROUTES.TASKS} component={LazyBrainDump} />
    <Tab.Screen name={ROUTES.CALENDAR} component={LazyCalendar} />
  </Tab.Navigator>
);

const AppNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name={ROUTES.MAIN} component={TabNavigator} />
    <Stack.Screen name={ROUTES.FOG_CUTTER} component={LazyFogCutter} />
    <Stack.Screen name={ROUTES.POMODORO} component={LazyPomodoro} />
    <Stack.Screen name={ROUTES.ANCHOR} component={LazyAnchor} />
  </Stack.Navigator>
);

export default AppNavigator;
