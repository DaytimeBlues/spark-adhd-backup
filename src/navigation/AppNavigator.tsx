import React, { Suspense, lazy } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Tokens } from '../theme/tokens';

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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Tokens.colors.neutral.darkest }}>
        <ActivityIndicator size="large" color={Tokens.colors.indigo.primary} />
      </View>
    }>
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
    <Stack.Screen name="HomeMain" component={HomeScreen} />
    <Stack.Screen name="CheckIn" component={LazyCheckIn} />
    <Stack.Screen name="CBTGuide" component={LazyCBTGuide} />
  </Stack.Navigator>
);

const TabNavigator = () => (
  <Tab.Navigator
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
            color={focused ? Tokens.colors.indigo.primary : Tokens.colors.text.tertiary}
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
    })}>
    <Tab.Screen name="Home" component={HomeStack} />
    <Tab.Screen name="Focus" component={IgniteScreen} />
    <Tab.Screen name="Tasks" component={LazyBrainDump} />
    <Tab.Screen name="Calendar" component={LazyCalendar} />
  </Tab.Navigator>
);

const AppNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Main" component={TabNavigator} />
    <Stack.Screen name="FogCutter" component={LazyFogCutter} />
    <Stack.Screen name="Pomodoro" component={LazyPomodoro} />
    <Stack.Screen name="Anchor" component={LazyAnchor} />
  </Stack.Navigator>
);

export default AppNavigator;
