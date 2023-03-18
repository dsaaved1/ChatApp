import React from "react";
import { NavigationContainer } from '@react-navigation/native';

import MainNavigator from "./MainNavigator";
import AuthScreen from "../screens/AuthScreen";
import SignUpForm from "../components/SignUpForm";
import SettingsScreen from "../screens/SettingsScreen";
import File from "../screens/File";
import { useSelector } from "react-redux";
import StartUpScreen from "../screens/StartUpScreen";

import { OverlayProvider, Chat, ChannelList, Channel, MessageList, MessageInput } from 'stream-chat-expo';
import { useAuthContext } from "./AuthContext";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createDrawerNavigator } from '@react-navigation/drawer';
import DrawerNavigator from "./DrawerNavigator";
import {
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { ActivityIndicator, ColorSchemeName } from "react-native";
import NotFoundScreen from "../screens/NotFoundScreen";



const AppNavigator = (props, { colorScheme }) => {
  // const isAuth = useSelector(state => state.auth.token !== null && state.auth.token !== "");
  // const didTryAutoLogin = useSelector(state => state.auth.didTryAutoLogin);

  return (
    <NavigationContainer theme={colorScheme !== "dark" ? DarkTheme : DefaultTheme}>
      <RootNavigator />
      {/* {isAuth && <MainNavigator />}
      {!isAuth && didTryAutoLogin && <AuthScreen />}
      {!isAuth && !didTryAutoLogin && <StartUpScreen />} */}
    </NavigationContainer>
  );
};

const Stack = createNativeStackNavigator();

function RootNavigator() {
  const { userId } = useAuthContext();

  if (!userId) {
    return <ActivityIndicator />;
  }

  return (
    <Stack.Navigator>
      
        {!userId ? (
          <Stack.Screen
          name="Home"
          component={SignUpForm}
          options={{ headerShown: false }}
        />
        ) : (
          <>
          <Stack.Screen
          name="Root"
          component={DrawerNavigator}
          options={{ headerShown: false }}
        />
        </>
        )}
    </Stack.Navigator>
  )
}

export default AppNavigator;