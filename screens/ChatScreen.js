import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  ImageBackground,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import logo from '../assets/images/logo.png';

import colors from "../constants/colors";

import PageContainer from "../components/PageContainer";
import Bubble from "../components/Bubble";
import ReplyTo from "../components/ReplyTo";
import MainMessage from "../components/MainMessage";

import { useSelector } from "react-redux";
import { createChat, createConvo, sendImage, sendTextMessage,sendMainMessage, updateConvoName} from "../utils/actions/chatActions";
import { launchImagePicker, openCamera, uploadImageAsync } from "../utils/imagePickerHelper";
import AwesomeAlert from 'react-native-awesome-alerts';



const ChatScreen = (props) => {
  const [chatUsers, setChatUsers] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [chatId, setChatId] = useState(props.route?.params?.chatId);
  const [convoId, setConvoId] = useState(props.route?.params?.convoId);
  const [errorBannerText, setErrorBannerText] = useState("");
  const [replyingTo, setReplyingTo] = useState();
  const [activeMain, setActiveMain] = useState(false);
  const [tempImageUri, setTempImageUri] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [editing, setEditing] = useState(false)


  //we use this to create a reference to component
  // and scrolling the chat to the bottom new message
  const flatList = useRef();

  const userData = useSelector(state => state.auth.userData);
  const storedUsers = useSelector(state => state.users.storedUsers);
  const storedChats = useSelector(state => state.chats.chatsData);
  //chatData is null when we don't a chatID because we haven't started a conversation yet
  const chatData = (chatId && storedChats[chatId]) || props.route?.params?.newChatData || {};
  const convoRef = (chatId && useSelector(state => state.convos.convosData[chatId])) || {};
  const convoData = convoRef[convoId]
  const [title, setTitle] = useState(convoData ? convoData.convoName : "Convo");

  const chatMessages = useSelector(state => {
    if (!convoId) return [];
    const chatMessagesData = state.messages.messagesData[convoId];

    if (!chatMessagesData) return [];

    const messageList = [];
    for (const key in chatMessagesData) {
      const message = chatMessagesData[key];

      messageList.push({
        key,
        ...message
      });
    }

    return messageList;
  });
  


  const getChatTitleFromName = () => {
    
    const otherUserId = chatUsers.find(uid => uid !== userData.userId);
    const otherUserData = storedUsers[otherUserId];

    return otherUserData && `${otherUserData.firstName} ${otherUserData.lastName}`;
  }


  useEffect(() => {
    if (!chatData) return;

    const subTitle = chatData.chatName ?? getChatTitleFromName();
    const modifiable = chatId? true : false
  
    props.navigation.setOptions({
      headerTitle: () => (
        <View style={{ alignItems: 'center', margin: 5 }}>
          {editing?
           <TextInput style={{ color: 'white', fontSize: 20, fontWeight: 'medium' }}
           autoFocus={true}
           onChangeText={text => setTitle(text)}
           value={title}></TextInput>
          :
          <Text style={{ color: 'white', fontSize: 20, fontWeight: 'medium' }}>
            {title}
          </Text>
          }
          <Text style={{ color: '#979797', fontSize: 12, fontWeight: 'regular' }}>
            {subTitle}
          </Text>
        </View>
      ),
      headerStyle: {
        backgroundColor: '#0E1528', 
      },
      headerRight: modifiable ? 
    () => {
      if (editing) {
        return (
          <TouchableOpacity onPress={() => {
            updateConvoName(convoId,chatId,title);
            setEditing(false);
          }}>
            <AntDesign name="checkcircleo" size={24} color='#979797'/>
          </TouchableOpacity>
        );
      } else {
        return (
          <TouchableOpacity onPress={() => setEditing(true)}>
            <Feather name="edit-3" size={24} color='#979797' />
          </TouchableOpacity>
        );
        }
    } : null

    })
    setChatUsers(chatData.users)
    //editing is passed because I wanted to be the page reload after editing is change inside useEffect
  }, [chatUsers,editing, title])



  const sendMessage = useCallback(async () => {

    try {
      let id = chatId;
      let id2 = convoId;
      if (!id) {
        console.log("about to create a chat")
        // No chat Id. Create the chat
        id = await createChat(userData.userId, chatData);
      
        setChatId(id);
        console.log("id: ", id)
        id2 = await createConvo(userData.userId, chatData, id);
    
        setConvoId(id2);
      }

 
      if (activeMain){
        console.log("about to send main questions")
        await sendMainMessage(id2, id, userData, messageText, replyingTo && replyingTo.key, chatUsers);
        setMessageText("");
      } else {
        console.log("about to send normal questions")
        await sendTextMessage(id2, id, userData, messageText, replyingTo && replyingTo.key, chatUsers);
      } 
       

      setMessageText("");
      setReplyingTo(null);
    } catch (error) {
      console.log(error);
      setErrorBannerText("Message failed to send");
      setTimeout(() => setErrorBannerText(""), 5000);
    }
  }, [messageText, chatId]);



  const pickImage = useCallback(async () => {
    try {
      const tempUri = await launchImagePicker();
      if (!tempUri) return;

      setTempImageUri(tempUri);
    } catch (error) {
      console.log(error);
    }
  }, [tempImageUri]);



  const takePhoto = useCallback(async () => {
    try {
      const tempUri = await openCamera();
      if (!tempUri) return;

      setTempImageUri(tempUri);
    } catch (error) {
      console.log(error);
    }
  }, [tempImageUri]);



  // const uploadImage = useCallback(async () => {
  //   setIsLoading(true);

  //   try {

  //     let id = chatId; 
  //     let id2 = convoId; 
  //     if (!id) {
  //       // No chat Id. Create the chat
  //       id = await createChat(userData.userId, props.route.params.newChatData);
  //       setChatId(id);
  //       id2 = await createConvo(userData.userId, props.route.params.newChatData, id);
  //       setConvoId(id2);
  //     }

  //     const uploadUrl = await uploadImageAsync(tempImageUri, true);
  //     setIsLoading(false);

  //     await sendImage(id2, id, userData, uploadUrl, replyingTo && replyingTo.key, chatUsers)
  //     setReplyingTo(null);
      
  //     setTimeout(() => setTempImageUri(""), 500);
      
  //   } catch (error) {
  //     console.log(error);
      
  //   }
  // }, [isLoading, tempImageUri, chatId])


  return (
    <SafeAreaView edges={["right", "left", "bottom"]} style={styles.container}>
      
       
          <PageContainer >

            {
              !chatId && <Bubble text="Send a message to activate your new chat!" type="system" />
            }

            {
              errorBannerText !== "" && <Bubble text={errorBannerText} type="error" />
            }

            {
              chatId && 
              <FlatList
                ref={(ref) => flatList.current = ref}
                ////puts chat to the bottom after new message sent
                onContentSizeChange={() => flatList.current.scrollToEnd({ animated: false })}
                //puts chat to the bottom when loaded
                onLayout={() => flatList.current.scrollToEnd({ animated: false })}
                data={chatMessages}
                renderItem={(itemData) => {
                  const message = itemData.item;

                  const isOwnMessage = message.sentBy === userData.userId;
                  const sender = message.sentBy && storedUsers[message.sentBy];
                  const name = sender && `${sender.firstName} ${sender.lastName}`;

                  let messageType;
                  let image;
                  let bigName;
              
                  if (message.type && message.type === "info") {
                    messageType = "info";
                  }else if (message.type && message.type === "main"){
                    messageType = "main";
                    image = isOwnMessage ? userData.profilePicture : sender.profilePicture
                    bigName = isOwnMessage ? userData.firstName : name
                  }else if (isOwnMessage) {
                    messageType = "myMessage";
                  }
                  else {
                    messageType = "theirMessage";
                  }
                   
                 
                  if (messageType ==  "main"){
                    return <MainMessage
                            type={messageType}
                            text={message.text}
                            messageId={message.key}
                            userId={userData.userId}
                            chatId={chatId}
                            convoId={convoId}
                            date={message.sentAt}
                            name={bigName}
                            uri={image}
                            setReply={() => setReplyingTo(message)}
                            replyingTo={message.replyTo && chatMessages.find(i => i.key === message.replyTo)}
                          />
                  } else {
                    return <Bubble
                            type={messageType}
                            text={message.text}
                            messageId={message.key}
                            userId={userData.userId}
                            chatId={chatId}
                            convoId={convoId}
                            date={message.sentAt}
                            name={!chatData.isGroupChat || isOwnMessage ? undefined : name}
                            senderID={ message.sentBy ?  message.sentBy: userData.userId}
                            setReply={() => setReplyingTo(message)}
                            replyingTo={message.replyTo && chatMessages.find(i => i.key === message.replyTo)}
                            imageUrl={message.imageUrl}
                          />
                  
                  }
                }}
              />
            }


          </PageContainer>

          {
            replyingTo &&
            <ReplyTo
              text={replyingTo.text}
              user={storedUsers[replyingTo.sentBy]}
              onCancel={() => setReplyingTo(null)}
            />
          }

       

        <View style={styles.inputContainer}>

{/*                   
        {!(activeMain && messageText !== "") && (
          <TouchableOpacity
            style={styles.mediaButton}
            onPress={pickImage}
          >
            <Feather name="plus" size={28} color={'#979797'} />
          </TouchableOpacity>
        )}

          {!(activeMain && messageText !== "") && (
              <TouchableOpacity
                style={styles.mediaButton}
                onPress={takePhoto}
              >
                <Feather name="camera" size={25} color={'#979797'} />
              </TouchableOpacity>
          )}
             */}


          <TextInput
            style={styles.textbox}
            value={messageText}
            onChangeText={(text) => setMessageText(text)}
            onSubmitEditing={sendMessage}
          />

          

          {messageText === "" && (

              <TouchableOpacity
                style={styles.mediaButton}
                onPress={() => setActiveMain(!activeMain)}
              > 
                  {activeMain?
                    <Ionicons name="chatbubble-ellipses-outline" size={30} color={'black'} />
                  :
                  <Ionicons name="chatbubble-ellipses-outline" size={30} color={'#979797'} />
                  }
              </TouchableOpacity>
            
          )}

            


          {messageText === "" &&  (
              <TouchableOpacity
                style={styles.mediaButton}
                onPress={() => setActiveMain(!activeMain)}
              >
                  {activeMain?
                  <MaterialCommunityIcons name="account-question" size={30} color={'#979797'} />
                  :
                  <MaterialCommunityIcons name="account-question" size={30} color={'black'} />
                  }
              </TouchableOpacity>
            )}

          

          {messageText !== "" && !activeMain &&(
            <TouchableOpacity
              style={{ ...styles.mediaButton, ...styles.sendButton }}
              onPress={sendMessage}
            >
              <Feather name="send" size={20} color={"white"} />
              
            </TouchableOpacity>
          )}

          {messageText !== "" && activeMain &&(
            <TouchableOpacity 
              style={styles.mainButton}
              onPress={sendMessage}>
              <Image style={styles.image} source={logo} />
            </TouchableOpacity>
          )}

            <AwesomeAlert
              show={tempImageUri !== ""}
              title='Send image?'
              closeOnTouchOutside={true}
              closeOnHardwareBackPress={false}
              showCancelButton={true}
              showConfirmButton={true}
              cancelText='Cancel'
              confirmText="Send image"
              confirmButtonColor={colors.primary}
              cancelButtonColor={colors.red}
              titleStyle={styles.popupTitleStyle}
              onCancelPressed={() => setTempImageUri("")}
              //onConfirmPressed={uploadImage}
              onDismiss={() => setTempImageUri("")}
              customView={(
                <View>
                  {
                    isLoading &&
                    <ActivityIndicator size='small' color={colors.primary} />
                  }
                  {
                    !isLoading && tempImageUri !== "" &&
                    <Image source={{ uri: tempImageUri }} style={{ width: 200, height: 200 }} />
                  }
                </View>
              )}
            />


        </View>

        
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    backgroundColor:'#27272C',
  },
  screen: {
    flex: 1
  },
  backgroundImage: {
    flex: 1,
    color: 'black'
  },
  inputContainer: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 10,
    height: 50,
    
  },
  textbox: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 50,
    marginHorizontal: 15,
    paddingHorizontal: 12,
    backgroundColor:'#8E8E93'
  },
  mediaButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 45,
  },
  mainButton: {
    backgroundColor: colors.blue,
    borderRadius: 50,
    width: 35,
  },
  sendButton: {
    backgroundColor: colors.blue,
    borderRadius: 50,

  },
  popupTitleStyle: {
    fontFamily: 'medium',
    letterSpacing: 0.3,
    color: colors.textColor
  },
  image: {
    width: 20,
    height: 15,
    borderRadius: 50,
  }
});

export default ChatScreen;