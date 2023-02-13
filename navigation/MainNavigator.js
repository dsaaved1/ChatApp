import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import React, { useEffect, useRef, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import ChatSettingsScreen from "../screens/ChatSettingsScreen";
import SettingsScreen from "../screens/SettingsScreen";
import ChatListScreen from "../screens/ChatListScreen";
import ChatScreen from "../screens/ChatScreen";
import NewChatScreen from "../screens/NewChatScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useDispatch, useSelector } from "react-redux";
import { getFirebaseApp } from "../utils/firebaseHelper";
import { child, get, getDatabase, off, onValue, ref } from "firebase/database";
import { setChatsData } from "../store/chatSlice";
import { setConvosData } from '../store/convoSlice';
import { setGroupsData } from '../store/groupSlice';
import { ActivityIndicator, KeyboardAvoidingView, Platform, View } from "react-native";
import colors from "../constants/colors";
import commonStyles from "../constants/commonStyles";
import { setStoredUsers } from "../store/userSlice";
import { setChatMessages, setStarredMessages } from "../store/messagesSlice";
import ContactScreen from "../screens/ContactScreen";
import DataListScreen from "../screens/DataListScreen";
import { StackActions, useNavigation } from '@react-navigation/native';
import ConvosScreen from '../screens/ConvosScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator screenOptions={{
      headerTitle: "",
      headerShadowVisible: false  
    }}>
      <Tab.Screen
        name="ChatList"
        component={ChatListScreen}
        options={{
          tabBarLabel: "Chats",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const StackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Group>
        <Stack.Screen
          name="Home"
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ChatScreen"
          component={ChatScreen}
          options={{
            headerTitle: "",
            headerBackTitle: "Back",
          }}
        />
        <Stack.Screen
          name="ChatSettings"
          component={ChatSettingsScreen}
          options={{
            headerTitle: "",
            headerBackTitle: "Back",
            headerShadowVisible: false
          }}
        />
        <Stack.Screen
          name="Contact"
          component={ContactScreen}
          options={{
            headerTitle: "Contact info",
            headerBackTitle: "Back",
          }}
        />
        <Stack.Screen
          name="DataList"
          component={DataListScreen}
          options={{
            headerTitle: "",
            headerBackTitle: "Back",
          }}
        />
      </Stack.Group>

      <Stack.Group screenOptions={{ presentation: 'containedModal' }}>
        <Stack.Screen
          name="NewChat"
          component={NewChatScreen}
        />
      </Stack.Group>
      <Stack.Screen
          name="Convos"
          component={ConvosScreen}
        />
    </Stack.Navigator>
  )
}

const MainNavigator = (props) => {

  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [isLoading, setIsLoading] = useState(true);

  //user data of the user logged in
  const userData = useSelector(state => state.auth.userData);
  const storedUsers = useSelector(state => state.users.storedUsers);

  const [expoPushToken, setExpoPushToken] = useState('');
  // console.log(expoPushToken)
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      // Handle received notification
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const { data } = response.notification.request.content;
      const chatId = data["chatId"];

      if (chatId) {
        const pushAction = StackActions.push("ChatScreen", { chatId });
        navigation.dispatch(pushAction);
      }
      else {
        console.log("No chat id sent with notification");
      }
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  //retrieve user groups from database
  useEffect(() => {
    console.log("Subscribing to firebase listeners");

    const app = getFirebaseApp();
    const dbRef = ref(getDatabase(app));
    
    //const userGroupsRef = child(dbRef, `userGroups/${userData.userId}`);
    //const refs = [userGroupsRef];

    //we want to store all the groups the user is part of in our redux state
    // onValue(userGroupsRef, (querySnapshot) => {
    //     const groupIdsData = querySnapshot.val() || {};
    //     const groupIds = Object.values(groupIdsData);
  
    //     const groupsData = {};
    //     let groupsFoundCount = 0;
  
    //     for (let i = 0; i < groupIds.length; i++) {
    //       const groupId = groupIds[i];
    //       const groupRef = child(dbRef, `groups/${groupId}`);
    //       refs.push(groupRef);
  
    //       onValue(groupRef, (groupSnapshot) => {
    //         groupsFoundCount++;
    //         const data = groupSnapshot.val();
    //         //console.log("Sssdsds",data)
    //         if (data) {

    //             //           if (!data.users.includes(userData.userId)) {
    // //             return;
    // //           }
    
  
    //           data.key = groupSnapshot.key;
  
    //         //   data.users.forEach(userId => {
    //         //     if (storedUsers[userId]) return;
  
    //         //     const userRef = child(dbRef, `users/${userId}`);
  
    //         //     get(userRef)
    //         //     .then(userSnapshot => {
    //         //       const userSnapshotData = userSnapshot.val();
    //         //       dispatch(setStoredUsers({ newUsers: { userSnapshotData } }))
    //         //     })
  
    //         //     refs.push(userRef);
    //         //   })
  
    //           groupsData[groupSnapshot.key] = data;
    //         }
  
    //         if (groupsFoundCount >= groupIds.length) {
    //             //console.log(groupsData)
    //           dispatch(setGroupsData({ groupsData }));
    //           //setIsLoading(false);
    //         }
    //       })
  
          
    //     }
  
    //   })

    // console.log("Groups dispatched")

    //we want to store all the chats the user is part of in our redux state
    const userChatsRef = child(dbRef, `userChats/${userData.userId}`);
    const refs = [userChatsRef];
    onValue(userChatsRef, (querySnapshot) => {
      const chatIdsData = querySnapshot.val() || {};
      const chatIds = Object.values(chatIdsData);

      const chatsData = {};
      let chatsFoundCount = 0;

      for (let i = 0; i < chatIds.length; i++) {
        const chatId = chatIds[i];
        const chatRef = child(dbRef, `chats/${chatId}`);
        refs.push(chatRef);

        onValue(chatRef, (chatSnapshot) => {
          chatsFoundCount++;
          
          const data = chatSnapshot.val();
          //console.log("Sssdsds",data)
          if (data) {

            if (!data.users.includes(userData.userId)) {
              return;
            }

            data.key = chatSnapshot.key;

            data.users.forEach(userId => {
              if (storedUsers[userId]) return;

              const userRef = child(dbRef, `users/${userId}`);

              get(userRef)
              .then(userSnapshot => {
                const userSnapshotData = userSnapshot.val();
                dispatch(setStoredUsers({ newUsers: { userSnapshotData } }))
              })

              refs.push(userRef);
            })

            chatsData[chatSnapshot.key] = data;
          }

          if (chatsFoundCount >= chatIds.length) {
            dispatch(setChatsData({ chatsData }));
            setIsLoading(false);
          }
        })

        const convosRef = child(dbRef, `convos/${chatId}`);
        refs.push(convosRef);

        onValue(convosRef, convosSnapshot => {
            const convosData = convosSnapshot.val();
            dispatch(setConvosData({ chatId, convosData }));
            
            if (convosData) {
                Object.keys(convosData).forEach(convoId => {
                    const messagesRef = child(dbRef, `messages/${convoId}`);
                    refs.push(messagesRef);
        
                    onValue(messagesRef, messagesSnapshot => {
                        //messageSnapshot it's like a convoId id and its value below takes all the messages Data from that id
                        const messagesData = messagesSnapshot.val();
                        dispatch(setChatMessages({ convoId, messagesData }));
                    })
                });
              }
            
        })

        // const messagesRef = child(dbRef, `messages/${chatId}`);
        //     refs.push(messagesRef);

        //     //this is not a for loop this will run how many chatIds the user has
        //     onValue(messagesRef, messagesSnapshot => {
        //         //messageSnapshot it's like a chat id and its value below takes all the data of message from that id
        //     const messagesData = messagesSnapshot.val();
        //     dispatch(setChatMessages({ chatId, messagesData }));
        //     })

        

        if (chatsFoundCount == 0) {
          setIsLoading(false);
        }
      }

    })

    console.log("chats and messages dispatched")

    const userStarredMessagesRef = child(dbRef, `userStarredMessages/${userData.userId}`);
    refs.push(userStarredMessagesRef);
    onValue(userStarredMessagesRef, querySnapshot => {
      const starredMessages = querySnapshot.val() ?? {};
      dispatch(setStarredMessages({ starredMessages }));
    })

    return () => {
      console.log("Unsubscribing firebase listeners");
      refs.forEach(ref => off(ref));
    }
  }, []);

  if (isLoading) {
    <View style={commonStyles.center}>
      <ActivityIndicator size={'large'} color={colors.primary} />
    </View>
  }


  return (
    <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={ Platform.OS === "ios" ? "padding" : undefined}>
      <StackNavigator />
    </KeyboardAvoidingView>
  );
};

export default MainNavigator;

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    console.log("her6")
    token = (await Notifications.getExpoPushTokenAsync()).data;
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}