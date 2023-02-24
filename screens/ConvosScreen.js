import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native'
import { HeaderButtons, Item } from "react-navigation-header-buttons";
import { useSelector } from 'react-redux';
import CustomHeaderButton from "../components/CustomHeaderButton";
import PageContainer from '../components/PageContainer';
import PageTitle from '../components/PageTitle';
import { createConvo } from "../utils/actions/chatActions";
import colors from "../constants/colors";
import { Ionicons } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import DataItem from '../components/DataItem';



function formatAmPm(dateString) {
  const date = new Date(dateString);
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  return hours + ':' + minutes + ' ' + ampm;
}


const ConvosScreen = (props) => {
  const [chatUsers, setChatUsers] = useState([]);
  const chatId = props.route?.params?.chatId;
  const [convoId, setConvoId] = useState(props.route?.params?.convoId)
  const storedChats = useSelector(state => state.chats.chatsData);
  const storedUsers = useSelector(state => state.users.storedUsers);
  const chatData = (chatId && storedChats[chatId]) || props.route?.params?.newChatData || {};
  const userData = useSelector(state => state.auth.userData);
  
  //chatConvos = [{key: "-NSFDLKSDKD", sentAt: "2022", ...},{}]
  const chatConvos = useSelector(state => {
    if (!chatId) return [];

    const chatConvosData = state.convos.convosData[chatId];

    if (!chatConvosData) return [];

    const convoList = [];
    //key is convoId
    for (const key in chatConvosData) {
      //convo is convo Data (fields)
      const convo = chatConvosData[key];

      convoList.push({
        //below is the same key: key
        key,
        ...convo
      });

    }

    return convoList;
  });

  const getChatTitleFromName = () => {
    const otherUserId = chatUsers.find(uid => uid !== userData.userId);
    const otherUserData = storedUsers[otherUserId];

    return otherUserData && `${otherUserData.firstName} ${otherUserData.lastName}`;
  }


  useEffect(() => {
    if (!chatData) return;

    const leftTitle = chatData.chatName ?? getChatTitleFromName();
    props.navigation.setOptions({
      headerLeft: () => {
         return <TouchableOpacity onPress={() => props.navigation.goBack()}>
            <PageTitle text={leftTitle} />
          </TouchableOpacity>
      },
      headerRight: () => {
        return <HeaderButtons HeaderButtonComponent={CustomHeaderButton}>
          {
            chatId && 
            <Item
              title="Chat settings"
              iconName="settings-outline"
              color='#979797'
              onPress={() => chatData.isGroupChat ?
                props.navigation.navigate("ChatSettings", { chatId }) :
                props.navigation.navigate("Contact", { uid: chatUsers.find(uid => uid !== userData.userId) })}
            />
          }
        </HeaderButtons>
      }
    })
    setChatUsers(chatData.users)
  }, [chatUsers])


  const sortedConvos = chatConvos.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  return <PageContainer>

            <View style={styles.groupContainer}>
                <Text style={styles.groupText}>Conversations</Text>

                <View style={styles.rightContainer}>

                    <TouchableOpacity  onPress={() => createConvo(userData.userId,chatData,chatId, '#979797')} style={styles.button}>
                        <Text style={styles.buttonText}>New Convo</Text>
                    </TouchableOpacity>

                </View>
            </View>

            <FlatList
              data={sortedConvos}
              renderItem= {({ item }) => (

                // 
                <TouchableOpacity onPress={() => props.navigation.navigate("ChatScreen", { convoId: item.key, chatId: chatId, newChatData: chatData })}>
                  <View style={styles.container}>
                      <View style={styles.imageContainer}>
                          <Entypo name="chat" size={35} color={item.color} />
                      </View>

                      <View style={styles.textContainer}>
                          <View style={styles.titleContainer}>
                              <Text numberOfLines={1} style={styles.title}>
                                  {item.convoName}
                              </Text>
                              <Text style={styles.updatedAt}>
                                  {formatAmPm(item.updatedAt)}
                              </Text>
                          </View>
                  
                          <Text numberOfLines={2} style={styles.subTitle}>
                              {item.latestMessageText}
                          </Text>
                       </View>
                  </View>
              </TouchableOpacity>
              )}
              keyExtractor={(item) => item.key}
            />
  

    
    </PageContainer>
  
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  imageContainer: {
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
    marginLeft: 14,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    letterSpacing: 0.3,
    color: 'white',
  },
  subTitle: {
    fontFamily: 'regular',
    color: colors.grey,
    letterSpacing: 0.3,
    fontSize: 12,
    marginTop:5
  },
  updatedAt: {
    fontSize: 12,
    color: colors.grey,
  },  
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
});

export default ConvosScreen