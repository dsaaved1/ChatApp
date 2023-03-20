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
import { createChat2, createConvo2, sendImage, sendTextMessage,sendMainMessage, updateConvoName, sendMessage2} from "../utils/actions/chatActions";
import { launchImagePicker, openCamera, uploadImageAsync } from "../utils/imagePickerHelper";
import AwesomeAlert from 'react-native-awesome-alerts';

import { LogBox } from 'react-native';
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

const ChatScreen = (props) => {
  const [chatUsers, setChatUsers] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [errorBannerText, setErrorBannerText] = useState("");
  const [replyingTo, setReplyingTo] = useState();
  const [activeMain, setActiveMain] = useState(false);
  const [tempImageUri, setTempImageUri] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [chatId, setChatId] = useState(props.route?.params?.chatId);
  const [convoId, setConvoId] = useState(props.route?.params?.convoId);
  const [chatData, setChatData] = useState(props.route?.params?.newChatData || {});
  const [channel, setChannelData] = useState();
  const [subchannel, setSubchannelData] = useState();
  const client = props.route?.params?.client
  const userData = client && client.user

  //we use this to create a reference to component
  // and scrolling the chat to the bottom new message
  const flatList = useRef();

 
  const [chatMessages2, setChatMessages2] = useState([]);
  console.log(chatMessages2.length, " chatMessages2.length")

  const updateChannels = (updatedChannel) => {
    // Update the 'channels' state in the ChatListScreen component
  };
  
  const updateSubChannels = (updatedSubchannel) => {
    props.route.params.updateSubChannels(updatedSubchannel);
  };

  const initializeChannels = async () => {

      if (chatId) {
        // Get the channel using its ID
        const channel = client.channel('messaging', chatId);
        // Watch the channel to get its state
        await channel.watch();
        setChannelData(channel.data);
        console.log(chatId, " chatId In initializeChannels")

        // Get the channel members
        const channelMembers = channel.state.members;

        // Extract user IDs from the channel members object
        const userIds = Object.keys(channelMembers);

        //if you have chat id you can get the users from the chat
        setChatData({users: userIds})
      }

      if(convoId) {
        // Get the subchannel using its ID
        const subchannel = client.channel('messaging', convoId);
        // Watch the subchannel to get its state
        await subchannel.watch();
        setSubchannelData(subchannel.data);
        console.log(convoId, " convoId In initializeChannels")

        subchannel.on('message.new', event => {
          //console.log('Received a new message in subchannel', event.message.text);
          setChatMessages2(prevMessages => [...prevMessages, event.message]);
        });
      }

      
  };

  useEffect(() => {
    console.log("useEffect in CHATSCREEN")
    fetchSubchannelAndMessages(convoId)
    initializeChannels();
    console.log("here in useEffect of ChatScreen")
    // client.on(event => {
    //   //console.log('Received an event on client inside ChatScreen - ', event)
    // })
  },[chatId, convoId])

  const fetchSubchannelAndMessages = async (channelId) => {
    // Get the subchannel using its ID
    const subchannel = client.channel('messaging', channelId);
  
    // Watch the subchannel to get its state
    await subchannel.watch();
  
    // Access the messages from the subchannel's state
    const messages = subchannel.state.messages;
    setChatMessages2(messages)
  };


  useEffect(() => {
    if (!chatData) return;

    //const subTitle = chatData.chatName ?? getChatTitleFromName();
    const modifiable = chatId? true : false
  
    props.navigation.setOptions({
      headerStyle: {
        backgroundColor: '#0E1528', 
      },

    })
    setChatUsers(chatData.users)
    //editing is passed because I wanted to be the page reload after editing is change inside useEffect
  }, [chatUsers])



  const sendMessage = useCallback(async () => {

  
    try {
      let id = chatId;
      let id2 = convoId;
      if (!id) {
        console.log("about to create a chat")
        // No chat Id. Create the chat
        id = await createChat2(client, chatData);
        setChatId(id);
      }

      if (!id2) {
        console.log("about to create a convo")
        // No convo Id. Create the convo
        id2 = await createConvo2(client, chatData, id);
        setConvoId(id2);
      }

 
      
      if (activeMain){
        console.log("about to send main questions")
        await sendMessage2(client, id2, id, userData.id, messageText, null, null, "main");
        setMessageText("");
      } else {
        //await sendTextMessage(id2, id, userData, messageText, replyingTo && replyingTo.key, chatUsers);
        await sendMessage2(client, id2, id, userData.id, messageText, null, null, null, updateChannels,
          updateSubChannels);

      } 
       

      setMessageText("");
      setReplyingTo(null);
    } catch (error) {
      console.log(error);
      setErrorBannerText("Message failed to send");
      setTimeout(() => setErrorBannerText(""), 5000);
    }
  }, [messageText, chatId]);



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
                data={chatMessages2}
                renderItem={(itemData) => {
                  const message = itemData.item;
                  const messageSentBy = message.user.id
                  const messageId = message.id

                  const isOwnMessage = messageSentBy === userData.id;
                  let sender = messageSentBy
                  let name
                  //const sender = message.sentBy && storedUsers[message.sentBy];
                  //const name = sender && `${sender.firstName} ${sender.lastName}`;

                  let messageType;
                  let image;
                  let bigName;
              
                  if (message.typeDisplay && message.typeDisplay === "info") {
                    messageType = "info";
                  }else if (message.typeDisplay && message.typeDisplay === "main"){
                    messageType = "main";
                    image = isOwnMessage ? userData.profilePicture : sender.profilePicture
                    bigName = isOwnMessage ? userData.firstName : name
                  }else if (isOwnMessage) {
                    messageType = "myMessage";
                  }
                  else {
                    messageType = "theirMessage";
                  }
                   
                 
                  if (message.typeDisplay ==  "main"){
                    return <MainMessage
                            type={messageType}
                            text={message.text}
                            messageId={messageId}
                            userId={userData.id}
                            chatId={chatId}
                            convoId={convoId}
                            date={message.sentAt}
                            name={bigName}
                            uri={image}
                            setReply={() => setReplyingTo(message)}
                            //replyingTo={message.replyTo && chatMessages.find(i => i.key === message.replyTo)}
                          />
                  } else {
                    return <Bubble
                            type={messageType}
                            text={message.text}
                            messageId={message.id}
                            userId={userData.id}
                            chatId={chatId}
                            convoId={convoId}
                            date={message.sentAt}
                            name={!chatData.isGroupChat || isOwnMessage ? undefined : name}
                            senderID={ message.sentBy ?  message.sentBy: userData.userId}
                            setReply={() => setReplyingTo(message)}
                            //replyingTo={message.replyTo && chatMessages.find(i => i.key === message.replyTo)}
                            imageUrl={message.imageUrl}
                          />
                  
                  }
                }}
                keyExtractor={(item) => item.id}
              />
            }


          </PageContainer>

       

        <View style={styles.inputContainer}>

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