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

import backgroundImage from "../assets/images/black.jpg";
import colors from "../constants/colors";
import { useSelector } from "react-redux";
import PageContainer from "../components/PageContainer";
import Bubble from "../components/Bubble";
import { createChat, createConvo, sendImage, sendTextMessage } from "../utils/actions/chatActions";
import ReplyTo from "../components/ReplyTo";
import { launchImagePicker, openCamera, uploadImageAsync } from "../utils/imagePickerHelper";
import AwesomeAlert from 'react-native-awesome-alerts';
import { HeaderButtons, Item } from "react-navigation-header-buttons";
import CustomHeaderButton from "../components/CustomHeaderButton";

const ChatScreen = (props) => {
  const [chatUsers, setChatUsers] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [chatId, setChatId] = useState(props.route?.params?.chatId);
  const [convoId, setConvoId] = useState(props.route?.params?.convoId);
  const [errorBannerText, setErrorBannerText] = useState("");
  const [replyingTo, setReplyingTo] = useState();
  const [tempImageUri, setTempImageUri] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  //we use this to create a reference to component
  // and scrolling the chat to the bottom new message
  const flatList = useRef();

  const userData = useSelector(state => state.auth.userData);
  const storedUsers = useSelector(state => state.users.storedUsers);
  const storedChats = useSelector(state => state.chats.chatsData);
  
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
  //console.log("chat messages  ", chatMessages)
  //id    ", chatId)
  const chatData = (chatId && storedChats[chatId]) || props.route?.params?.newChatData || {};
  //console.log("chat dataaa   ", chatData)
  const getChatTitleFromName = () => {
    
    const otherUserId = chatUsers.find(uid => uid !== userData.userId);
    const otherUserData = storedUsers[otherUserId];

    return otherUserData && `${otherUserData.firstName} ${otherUserData.lastName}`;
  }

  useEffect(() => {
    if (!chatData) return;
    
    props.navigation.setOptions({
      headerTitle: chatData.chatName ?? getChatTitleFromName(),
      // headerRight: () => {
      //   return <HeaderButtons HeaderButtonComponent={CustomHeaderButton}>
      //     {
      //       //we will put this again after adding contributors functionality
      //       chatId && 
      //       <Item
      //         title="Chat settings"
      //         iconName="settings-outline"
      //         onPress={() => chatData.isGroupChat ?
      //           // we will send convoId to chatSetting to display the message when we deal with contributors
      //           props.navigation.navigate("ChatSettings", { chatId, convoId }) :
      //           props.navigation.navigate("Contact", { uid: chatUsers.find(uid => uid !== userData.userId) })}
      //       />
      //     }
      //   </HeaderButtons>
      // }
    })
    setChatUsers(chatData.users)
  }, [chatUsers])

  const sendMessage = useCallback(async () => {

    try {
      
      let id = chatId;
      let id2 = convoId;
      if (!id) {
        console.log("about to create a chat")
        // No chat Id. Create the chat
        id = await createChat(userData.userId, props.route.params.newChatData);
        setChatId(id);
        id2 = await createConvo(userData.userId, props.route.params.newChatData, id);
        setConvoId(id2);
      }

      await sendTextMessage(id2, id, userData, messageText, replyingTo && replyingTo.key, chatUsers);
      console.log("about to send a message")

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

  const uploadImage = useCallback(async () => {
    setIsLoading(true);

    try {

      let id = chatId; 
      let id2 = convoId; 
      if (!id) {
        // No chat Id. Create the chat
        id = await createChat(userData.userId, props.route.params.newChatData);
        setChatId(id);
        id2 = await createConvo(userData.userId, props.route.params.newChatData, id);
        setConvoId(id2);
      }

      const uploadUrl = await uploadImageAsync(tempImageUri, true);
      setIsLoading(false);

      await sendImage(id2, id, userData, uploadUrl, replyingTo && replyingTo.key, chatUsers)
      setReplyingTo(null);
      
      setTimeout(() => setTempImageUri(""), 500);
      
    } catch (error) {
      console.log(error);
      
    }
  }, [isLoading, tempImageUri, chatId])

  return (
    <SafeAreaView edges={["right", "left", "bottom"]} style={styles.container}>
      
        <ImageBackground
          source={backgroundImage}
          style={styles.backgroundImage}
        >
          <PageContainer style={{ backgroundColor: 'transparent'}}>

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

                  let messageType;
                  if (message.type && message.type === "info") {
                    messageType = "info";
                  }
                  else if (isOwnMessage) {
                    messageType = "myMessage";
                  }
                  else {
                    messageType = "theirMessage";
                  }

                  const sender = message.sentBy && storedUsers[message.sentBy];
                  const name = sender && `${sender.firstName} ${sender.lastName}`;

                  return <Bubble
                            type={messageType}
                            text={message.text}
                            messageId={message.key}
                            userId={userData.userId}
                            chatId={chatId}
                            convoId={convoId}
                            date={message.sentAt}
                            name={!chatData.isGroupChat || isOwnMessage ? undefined : name}
                            setReply={() => setReplyingTo(message)}
                            replyingTo={message.replyTo && chatMessages.find(i => i.key === message.replyTo)}
                            imageUrl={message.imageUrl}
                          />
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

        </ImageBackground>

        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={styles.mediaButton}
            onPress={pickImage}
          >
            <Feather name="plus" size={24} color={colors.blue} />
          </TouchableOpacity>

          <TextInput
            style={styles.textbox}
            value={messageText}
            onChangeText={(text) => setMessageText(text)}
            onSubmitEditing={sendMessage}
          />

          {messageText === "" && (
            <TouchableOpacity
              style={styles.mediaButton}
              onPress={takePhoto}
            >
              <Feather name="camera" size={24} color={colors.blue} />
            </TouchableOpacity>
          )}

          {messageText !== "" && (
            <TouchableOpacity
              style={{ ...styles.mediaButton, ...styles.sendButton }}
              onPress={sendMessage}
            >
              <Feather name="send" size={20} color={"white"} />
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
              onConfirmPressed={uploadImage}
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
  },
  screen: {
    flex: 1
  },
  backgroundImage: {
    flex: 1,
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
    borderColor: colors.lightGrey,
    marginHorizontal: 15,
    paddingHorizontal: 12,
  },
  mediaButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 35,
  },
  sendButton: {
    backgroundColor: colors.blue,
    borderRadius: 50,
    padding: 8,
  },
  popupTitleStyle: {
    fontFamily: 'medium',
    letterSpacing: 0.3,
    color: colors.textColor
  }
});

export default ChatScreen;