import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar,Modal, TextInput, Keyboard } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import { HeaderButtons, Item } from "react-navigation-header-buttons";
import { useSelector } from 'react-redux';
import CustomHeaderButton from "../components/CustomHeaderButton";
import PageContainer from '../components/PageContainer';
import PageTitle from '../components/PageTitle';
import { updateConvoName } from "../utils/actions/chatActions";
import colors from "../constants/colors";
import { Ionicons } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import DataItem from '../components/DataItem';
import { AntDesign } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';

import Swipeable from 'react-native-gesture-handler/Swipeable';


const LeftSwipeActions = () => {
  return (
    <View
      style={{ flex: 1, backgroundColor: '#ccffbd', justifyContent: 'center' }}
    >
      <Text
        style={{
          color: '#40394a',
          paddingHorizontal: 10,
          fontWeight: '600',
          paddingHorizontal: 30,
          paddingVertical: 20,
        }}
      >
        Bookmark
      </Text>
    </View>
  );
};


const rightSwipeActions = () => {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#D86F6F',
        justifyContent: 'center',
        alignItems: 'flex-end',
      }}
    >
      <View
      style={{
        paddingHorizontal: 10,
        paddingHorizontal: 30,
        paddingVertical: 20,
      }}>
        <Feather name="x-circle" size={30} color="white" />
      </View>
    </View>
  );
};

const swipeFromLeftOpen = () => {
  alert('Swipe from left');
};
const swipeFromRightOpen = (convoId) => {
  alert('Swipe from right');
};

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
  const storedChats = useSelector(state => state.chats.chatsData);
  const storedUsers = useSelector(state => state.users.storedUsers);
  //to get group chat name and if it is a group chat
  const userData = useSelector(state => state.auth.userData);
  const chatId = props.route?.params?.chatId || userData.myAI;
  const chatData = (chatId && storedChats[chatId]) || props.route?.params?.newChatData || {};
  // console.log(chatId, "chatId", userData.chatId)

  const [showModal, setShowModal] = useState(false);
  const [convoName, setConvoName] = useState('');
  const [convoId, setConvoId] = useState('');
  
  const handleRename = () => {
    updateConvoName(convoId,chatId,convoName);
    setShowModal(false);
    setConvoName('');
    setConvoId('');
  };


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

  // console.log("ee")
  // console.log(chatUsers, "LIST OF CHAT USERS")
  // console.log(chatUsers.find(uid => uid !== userData.userId), "chatUsers")
  
  const getChatTitleFromName = () => {
    const otherUserId = chatUsers.find(uid => uid !== userData.userId);
    const otherUserData = storedUsers[otherUserId];

    return otherUserData && `${otherUserData.firstName} ${otherUserData.lastName}`;
  }


  useEffect(() => {
    if (!chatData) return;

    const leftTitle = chatData.chatName ?? getChatTitleFromName();
    const isAI = chatData.isGroupChat == true || chatData.isGroupChat == false ? true : false;

    props.navigation.setOptions({
      headerStyle: {
        backgroundColor: '#0E1528', 
      },
      headerTitle: () => {
         return <View>
            <PageTitle text={leftTitle} />
          </View>
      },
      headerRight: () => {
        return <HeaderButtons HeaderButtonComponent={CustomHeaderButton}>
          {
            chatId && isAI &&
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
      },
      headerLeft: () => {
        return <TouchableOpacity onPress={() => props.navigation.goBack()}>
            <Ionicons name="chevron-back" size={30} color={colors.lightGrey}/>
         </TouchableOpacity>
     },
    })

    setChatUsers(chatData.users)
  }, [chatUsers])


  const sortedConvos = chatConvos.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  const filteredConvos = sortedConvos.filter(convo => !convo.isMessageConvo || convo.isMessageConvo === false);
  //const leftTitle = chatData.chatName ?? getChatTitleFromName();

  return (

    <>
    <StatusBar />
    {/* <SafeAreaView edges={["right", "left", "bottom"]} style={styles.superContainer}>
  <View style={styles.pageContainer}> */}

      <View style={styles.superContainer}>
            {/* <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#0E1528', paddingHorizontal: 16, height: 56 }}>
              <PageTitle text={leftTitle} />
              {chatId && 
              
                <HeaderButtons HeaderButtonComponent={CustomHeaderButton}>
                  <Item
                    title="Chat settings"
                    iconName="settings-outline"
                    color='#979797'
                    onPress={() => chatData.isGroupChat ?
                      props.navigation.navigate("ChatSettings", { chatId }) :
                      props.navigation.navigate("Contact", { uid: chatUsers.find(uid => uid !== userData.userId) })}
                  />
                </HeaderButtons>
              }

            </View> */}

            <FlatList
              scrollIndicatorInsets={{ top: 0, bottom: 0}}
              showsVerticalScrollIndicator={true}
              indicatorStyle={'white'}
              data={filteredConvos}
              renderItem= {({ item }) => (
               
      

              <Swipeable
                  renderLeftActions={LeftSwipeActions}
                  renderRightActions={rightSwipeActions}
                  //item.key is convoId
                  onSwipeableRightOpen={() => swipeFromRightOpen(item.key)}
                  onSwipeableLeftOpen={() => swipeFromLeftOpen(item.key)}
                >
                  <View
                    style={{
                      paddingHorizontal: 7,
                      paddingVertical: 10,
                      backgroundColor: '#0E1528',
                    }}
                  >
                    <TouchableOpacity
                      onPress={() =>
                        props.navigation.navigate("ChatScreen", {
                          convoId: item.key,
                          chatId: chatId,
                        })
                      }
                      style={styles.container}
                      onLongPress={() => {setShowModal(true),setConvoName(item.convoName),setConvoId(item.key)}}
                    >
                      
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

                            

                    </TouchableOpacity>

                    <Modal
                        visible={showModal}
                        animationType="slide"
                        transparent={true}
                    >
                        <View style={styles.modalContainer}>
                          <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Rename Convo</Text>

                            <TextInput
                              style={styles.modalInput}
                              value={convoName}
                              onChangeText={(text) => setConvoName(text)}
                              placeholder="Enter convo name"
                              //autoFocus={true}
                              onSubmitEditing={handleRename}
                            />

                            <View style={styles.modalButtonsContainer}>
                              <TouchableOpacity
                                style={styles.modalButton}
                                onPress={() => {setShowModal(false), setConvoName(''),setConvoId ('')}}
                              >
                                <Text style={styles.modalButtonText}>Cancel</Text>
                              </TouchableOpacity>

                              {/* <TouchableOpacity
                                style={styles.modalButton}
                                onPress={() => handleRename()}
                              >
                                <Text style={styles.modalButtonText}>Rename</Text>
                              </TouchableOpacity> */}
                            </View>
                          </View>
                        </View>
                    </Modal>

                  </View>
                </Swipeable>

              
              )}
              
              keyExtractor={(item) => item.key}
            />
            
            <View style={styles.bottomContainer}>
                
                <TouchableOpacity onPress={() => props.navigation.navigate("ChatScreen", {chatId: chatId})} style={styles.button}>
                  <AntDesign name="pluscircleo" size={28} color="white" />
                </TouchableOpacity>
            </View>
  

    
  
      </View>
    </>
)}



const styles = StyleSheet.create({
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  superContainer: {
    flex: 1,
    backgroundColor: '#0E1528',
    flexDirection: "column",
  },
  container: {
    flex:1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 7,
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
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    letterSpacing: 0.3,
    color: 'white',
  },
  subTitle: {
    fontFamily: 'regular',
    color: colors.grey,
    letterSpacing: 0.3,
    fontSize: 14,
    marginTop:5
  },
  updatedAt: {
    fontSize: 12,
    color: 'gray',
  },  
    bottomContainer: {
      width: '100%',
      position: "absolute",
      bottom: 0,
      backgroundColor: "#1C2333",
      padding: 15,
      justifyContent: "flex-end",
      alignItems: "flex-end",
    },
    button: {
      borderRadius: 20,
      paddingRight: 20,
      paddingVertical: 5,
      marginBottom: 15,
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
      backgroundColor: '#1C2333',
      paddingHorizontal: 20,
      paddingVertical: 30,
      borderRadius: 20,
      elevation: 20,
      width: '80%',
      alignItems: 'center',
    },
    modalTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#fff',
      marginBottom: 20,
    },
    modalInput: {
      backgroundColor: '#fff',
      paddingHorizontal: 10,
      paddingVertical: 10,
      borderRadius: 10,
      marginBottom: 30,
      width: `80%`,
      fontSize: 16,
    },
    modalButtonsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    modalButton: {
      backgroundColor: '#3777f0',
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 10,
      marginHorizontal: 10,
    },
    modalButtonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 14,
    },
});

export default ConvosScreen