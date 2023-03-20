import React, { useEffect, useState, useCallback} from "react";
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

import { AntDesign } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LogBox } from 'react-native';
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

function getRandomColor() {
  const colors = ['#6653FF', '#53FF66', '#FF6653', '#BC53FF', '#19C37D', '#FFFF66', 'teal', '#FF6EFF', '#FF9933', '#50BFE6', "#00468C"];
  return colors[Math.floor(Math.random() * colors.length)];
}

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
  // const [chatUsers, setChatUsers] = useState([]);
  const chatId = props.route?.params?.chatId;
  const chatData = props.route?.params?.chatData
  const client = props.route?.params?.client

  const [subChannels, setSubChannels] = useState([])
  
  console.log(subChannels.length, "subchannels length")


  const fetchSubChannels = async (chatId) => {
      // Get the list of subchannels within the group channel
        const userId = client.user.id;
        
        const filter = { type: 'messaging', members: { $in: [userId] }, chatId: chatId, typeChat: { $eq: 'convo'}};
        const sort = [{ last_message_at: -1 }];

        const subchannels = await client.queryChannels(filter, sort, {
            watch: true, // this is the default
            state: true,
        });
        setSubChannels(subchannels)
  }


  useFocusEffect(
    useCallback(() => {
      console.log("useEffect in ConvosScreen")
        fetchSubChannels(chatId);
    }, [chatId])
);


  return <PageContainer>

            <View style={styles.groupContainer}>
                <Text style={styles.groupText}>Conversations</Text>

                <View style={styles.rightContainer}>

                    <TouchableOpacity style={styles.button}>
                        <Text style={styles.buttonText}>New Convo</Text>
                    </TouchableOpacity>

                </View>
               
            </View>

          

            <FlatList
              data={subChannels}
              renderItem= {(itemData) => {
                const convoData = itemData.item;
                const convoId = convoData.data.id;

                return (<TouchableOpacity onPress={() => props.navigation.navigate("ChatScreen", { convoId: convoId, chatId: chatId, client: client, 
                  updateSubChannels: (updatedSubchannel) => {
                    setSubChannels((prevSubChannels) => {
                    const index = prevSubChannels.findIndex((subchannel) => subchannel.cid === updatedSubchannel.cid);
                    if (index !== -1) {
                      return [
                        ...prevSubChannels.slice(0, index),
                        updatedSubchannel,
                        ...prevSubChannels.slice(index + 1),
                      ];
                    } else {
                      return prevSubChannels;
                    }
                  });
                },})}>
                  <View style={styles.container}>
                      <View style={styles.imageContainer}>
                          <Entypo name="chat" size={35} color={convoData.data.color} />
                      </View>

                      <View style={styles.textContainer}>
                          <View style={styles.titleContainer}>
                              <Text numberOfLines={1} style={styles.title}>
                                  {convoData.data.convoName}
                              </Text>
                              <Text style={styles.updatedAt}>
                                  {formatAmPm(convoData.data.updatedAt)}
                              </Text>
                          </View>
                  
                          <Text numberOfLines={2} style={styles.subTitle}>
                              {convoData.data.latestMessageText}
                          </Text>
                       </View>
                  </View>
              </TouchableOpacity>);
              }}
            />
  
            <View style={styles.bottomContainer}>
                <TouchableOpacity onPress={() => props.navigation.navigate("ChatScreen", {chatId: chatId, client: client, updateSubChannels: (updatedSubchannel) => {
                  setSubChannels((prevSubChannels) => {
                    const index = prevSubChannels.findIndex((subchannel) => subchannel.cid === updatedSubchannel.cid);
                    if (index !== -1) {
                      return [
                        ...prevSubChannels.slice(0, index),
                        updatedSubchannel,
                        ...prevSubChannels.slice(index + 1),
                      ];
                    } else {
                      return prevSubChannels;
                    }
                  });
                }})} style={styles.bottomButton}>
                  <AntDesign name="pluscircleo" size={28} color="white" />
                </TouchableOpacity>
            </View>
  
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
    bottomContainer: {
      width: '100%',
      position: "absolute",
      bottom: 0,
      backgroundColor: "#1C2333",
      padding: 15,
      justifyContent: "flex-end",
      alignItems: "flex-end",
    },
    bottomButton: {
      borderRadius: 20,
      paddingRight: 20,
      paddingVertical: 5,
      marginBottom: 15,
    },
});

export default ConvosScreen