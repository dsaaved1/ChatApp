import {
    createDrawerNavigator,
    DrawerContentScrollView,
  } from "@react-navigation/drawer";
  import { Text, StyleSheet, View, Pressable, TouchableOpacity } from "react-native";
  import { SafeAreaView } from "react-native-safe-area-context";
  import { ChannelList } from "stream-chat-expo";
  import { useAuthContext } from "./AuthContext";
  
  import React, { useState } from "react";
 
  
  import NewChannelScreen from "../screens/NewChannelScreen";
  import UserListScreen from "../screens/UserListScreen";
  import ChannelScreen from "../screens/ChannelScreen";

  //import ChannelMembersScreen from "../screens/ChannelMembersScreen";
  import { FontAwesome5 } from "@expo/vector-icons";
  import ChannelStack from "./ChannelStack";
  import { Feather } from '@expo/vector-icons';
  
  const Drawer = createDrawerNavigator();
  
  const DrawerNavigator = () => {
    return (
      <Drawer.Navigator drawerContent={CustomDrawerContent}>
        <Drawer.Screen
          name="ChannelScreen"
          component={ChannelStack}
          options={{
            headerShown: false,
          }}
        />

        <Drawer.Screen
        name="UserList"
        component={UserListScreen}
        options={{ title: "Users" }}
        />


        <Drawer.Screen
        name="NewChannel"
        component={NewChannelScreen}
        options={{ title: "New Channel" }}
        />        
  
       
      </Drawer.Navigator>
    );
  };
  
  const CustomDrawerContent = (props) => {
    const [tab, setTab] = useState("private");
    const { navigation } = props;
  
    const onChannelSelect = (channel) => {
      // navigate to a screen for this channel
      navigation.navigate("ChannelScreen", {
        screen: "Chat",
        params: { channel },
      });
    };
  
    const { userId } = useAuthContext();
  
    const privateFilters = { type: "messaging", members: { $in: [userId] } };
    const publicFilters = {
      type: { $ne: "messaging" },
      members: { $in: [userId] },
    };
  
  
    return (
      <SafeAreaView {...props} style={{ flex: 1, backgroundColor: '#0E1528'}}>
        <TouchableOpacity style={styles.buttonTitle} onPress={() => props.navigation.navigate("Convos")}>
                <Text style={styles.title}>My AI</Text>
            </TouchableOpacity>
  
        <View style={styles.tabs}>
          <Text
            onPress={() => setTab("public")}
            style={[
              styles.groupTitle,
              { color: tab === "public" ? "white" : "gray" },
            ]}
          >
            Groups
          </Text>
          <Text
            onPress={() => setTab("private")}
            style={[
              styles.groupTitle,
              { color: tab === "private" ? "white" : "gray" },
            ]}
          >
            Chats
          </Text>
        </View>
  
        {tab === "public" ? (
          <>
            <Pressable onPress={() => {
              navigation.navigate("NewChannel");
            }} style={styles.buttonContainer}>
                    <Feather name="plus" size={24} color='white' />
            </Pressable>
            <ChannelList onSelect={onChannelSelect} filters={publicFilters} />
          </>
        ) : (
          <>
            <Pressable onPress={() => {
              navigation.navigate("UserList");
            }}  style={styles.buttonContainer}>
                    <Feather name="plus" size={24} color='white' />
                </Pressable>
            <ChannelList onSelect={onChannelSelect} filters={privateFilters} />
          </>
        )}
  
     
      </SafeAreaView>
    );
  };
  
  const styles = StyleSheet.create({
    buttonTitle: {
        borderBottomWidth: 1,
        borderBottomColor: '#333',
        width: '60%',
        alignSelf: 'center',
      },
      title: {
        color: "#fff",
        fontWeight: "bold",
        alignSelf: "center",
        fontSize: 30,
        margin: 15,
      },
    groupTitle: {
      margin: 10,
      fontSize: 16,
      fontWeight: "bold",
    },
    tabs: {
      flexDirection: "row",
      justifyContent: "space-evenly",
      paddingVertical: 10,
    },
    icon: {
      marginRight: 10,
    },
    buttonContainer: {
        backgroundColor: "#3777f0",
        margin: 10,
        padding: 5,
        alignItems: "center",
        borderRadius: 5,
        marginHorizontal: 30,
        width: '80%',
      },
  });
  
  export default DrawerNavigator;