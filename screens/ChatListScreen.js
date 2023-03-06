import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Button, FlatList, TouchableOpacity } from 'react-native';
import { HeaderButtons, Item } from 'react-navigation-header-buttons';
import { useSelector } from 'react-redux';
import CustomHeaderButton from '../components/CustomHeaderButton';
import DataItem from '../components/DataItem';
import BoxConvo from '../components/BoxConvo';
import PageContainer from '../components/PageContainer';
import PageTitle from '../components/PageTitle';
import colors from '../constants/colors';

const ChatListScreen = props => {

    const selectedUser = props.route?.params?.selectedUserId;
    const selectedUserList = props.route?.params?.selectedUsers;
    const chatName = props.route?.params?.chatName;

    const userData = useSelector(state => state.auth.userData);
    const storedUsers = useSelector(state => state.users.storedUsers);
    const userChats = useSelector(state => {
        const chatsData = state.chats.chatsData;
        return Object.values(chatsData).sort((a, b) => {
            return new Date(b.updatedAt) - new Date(a.updatedAt);
        });
    });
    
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

        if (selectedUser) {
            chatData = userChats.find(cd => !cd.isGroupChat && cd.users.includes(selectedUser))
        }

        if (chatData) {
            navigationProps = { chatId: chatData.key }
        }
        else {
            const chatUsers = selectedUserList || [selectedUser];
            if (!chatUsers.includes(userData.userId)){
                chatUsers.push(userData.userId);
            }

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
        
        

        props.navigation.navigate("ChatScreen", navigationProps)

       
    }, [props.route?.params])


    
    return <PageContainer>


            <View>

                <View style={styles.groupContainer}>
                    <Text style={styles.groupText}>Groups</Text>

                    <View style={styles.rightContainer}>

                        <TouchableOpacity onPress={() => props.navigation.navigate("NewChat", { isGroupChat: true })} style={styles.button}>
                            <Text style={styles.buttonText}>New Group</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => props.navigation.navigate("NewChat")} style={styles.button}>
                            <Text style={styles.buttonText}>New Chat</Text>
                        </TouchableOpacity>

                    </View>
                </View>

                <FlatList
                    data={userChats}
                    renderItem={(itemData) => {
                        const chatData = itemData.item;
                        const chatId = chatData.key;
                        const isGroupChat = chatData.isGroupChat;

                        let title = "";
                        let subTitle = `${chatData.latestConvo}: ${chatData.latestMessageText}` || "New chat";
                        let image = "";

                        if (isGroupChat) {
                            
                            title = chatData.chatName;  
                            image = chatData.chatImage;
                            
                        } else {
                            if (chatData.users == userData.userId){
                                
                                title = chatData.chatName;
                                image = chatData.chatImage;
                            } else {
                                const otherUserId = chatData.users.find(uid => uid !== userData.userId);
                                const otherUser = storedUsers[otherUserId];

                                if (!otherUser) return;

                                title = `${otherUser.firstName} ${otherUser.lastName}`;
                                image = otherUser.profilePicture;
                            }
                            
                        }

                        return <DataItem
                                    title={title}
                                    subTitle={subTitle}
                                    image={image}
                                    onPress={() => props.navigation.navigate("Convos", { chatId })}
                                />
                    }}
                />
            </View>
        </PageContainer>
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