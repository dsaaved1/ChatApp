import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Button, FlatList, TouchableOpacity } from 'react-native';
import { HeaderButtons, Item } from 'react-navigation-header-buttons';
import { useSelector } from 'react-redux';
import CustomHeaderButton from '../components/CustomHeaderButton';
import DataItem from '../components/DataItem';
import BoxConvo from '../components/BoxConvo';
import PageContainer from '../components/PageContainer';
import PageTitle from '../components/PageTitle';
import colors from '../constants/colors';
import { useChatContext } from "stream-chat-expo";

import { StreamChat } from "stream-chat";
import { useFocusEffect } from '@react-navigation/native';

const API_KEY = "a89tc8x6a9zy";
const client = StreamChat.getInstance(API_KEY);

const connectUser = async () => {
  return await client.connectUser(
    {
      id: "Rosa",
    },
    client.devToken("Rosa")
  );
}

const ChatListScreen = props => {

    const selectedUser = props.route?.params?.selectedUserId;
    const selectedUserList = props.route?.params?.selectedUsers;
    const chatName = props.route?.params?.chatName;
    const [channels, setChannels] = useState([])

    console.log(channels.length, "channels length")


    const userData2 = client && client.user
 
    const fetchChannels = async () => {
        const userId = client.user.id;
        const filter = { type: 'messaging', members: { $in: [userId] }, typeChat: { $eq: 'chat'}};
        const sort = [{ updatedAt: -1 }];

        const channels = await client.queryChannels(filter, sort, {
            watch: true, // this is the default
            state: true,
        });

        setChannels(channels);
    };

    useFocusEffect(
        
        useCallback(() => {
            console.log("useEffect in ChatListScreen")
            // Fetch channels initially and when the screen is focused
            fetchChannels();
        }, [])
    );
    

    useEffect(() => {
        props.navigation.setOptions({
                    headerStyle: {
                        backgroundColor: '#0E1528', 
                      },
                    headerLeft: () => {
                        return <PageTitle text="  Home" />
                    }
        })

        
      }, []);
    

    useEffect(() => {

        //if there is no user select neither selected user list move on
        if (!selectedUser && !selectedUserList) {
            return;
        }

        let chatData;
        let navigationProps;

        // if (selectedUser) {
        //     chatData = userChats.find(cd => !cd.isGroupChat && cd.users.includes(selectedUser))
        // }

        if (chatData) {
            navigationProps = { chatId: chatData.key }
        }
        else {

            const chatUsers = selectedUserList || [selectedUser];
            if (!chatUsers.includes(userData2.id)){
                chatUsers.push(userData2.id);
            }

            console.log(chatUsers, "chatUsers")

            navigationProps = {
                newChatData: {
                    users: chatUsers,
                    isGroupChat: selectedUserList !== undefined,
                    
                }
            }

            if (chatName) {
                navigationProps.newChatData.chatName = chatName
            }
        }

        navigationProps.client = client;


        props.navigation.navigate("ChatScreen", navigationProps)

       
    }, [props.route?.params])


    
    return (<PageContainer>

                <TouchableOpacity onPress={connectUser} style={{ marginTop: 20, fontSize: 20, color: "green"}}>
                    <Text style={{ marginTop: 20, fontSize: 20, color: "green"}}>connectUser</Text>
                </TouchableOpacity>

                <View style={styles.groupContainer}>
                    <Text style={styles.groupText}>Groups</Text>

                    <View style={styles.rightContainer}>

                        <TouchableOpacity onPress={() => props.navigation.navigate("NewChat", { isGroupChat: true, client: client })} style={styles.button}>
                            <Text style={styles.buttonText}>New Group</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => props.navigation.navigate("NewChat", {client: client})} style={styles.button}>
                            <Text style={styles.buttonText}>New Chat</Text>
                        </TouchableOpacity>

                    </View>
                </View>
                
                <FlatList
                    data={channels}
                    renderItem={(itemData) => {
                        const chatData = itemData.item;
                        //console.log(chatData.id, "chatid inside flatlist")
                        const chatId = chatData.data.id;

                    
                        // Render the DataItem component with relevant channel data
                        const title = chatData.data.chatName || "Unnamed chat";
                        const latestMessage = chatData.state.messages[chatData.state.messages.length - 1];
                        const subTitle = latestMessage
                            ? `${latestMessage.user.id === userData2.id ? 'You' : latestMessage.user.name}: ${latestMessage.text}`
                            : 'No messages yet';
                    
                        
            
                        return (
                            <DataItem
                                title={title}
                                subTitle={subTitle}
                                onPress={() => props.navigation.navigate("Convos", { chatId: chatId, client: client })}
                            />
                        );
                    }}
                />
            
        </PageContainer>)
};

const styles = StyleSheet.create({
    groupContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
      },
      groupText: {
        fontSize: 19,
        fontFamily: 'bold',
        color: 'white',
      },
      rightContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end'
      },
      button: {
        paddingVertical: 5,
        paddingHorizontal: 10,
      },
      buttonText: {
        fontSize: 12,
        fontFamily: 'medium',
        color: 'white',
        backgroundColor: 'transparent',
        mixBlendMode: 'overlay',
        opacity: 0.5,
      },
})

export default ChatListScreen;