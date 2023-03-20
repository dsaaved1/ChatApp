import React, { useRef } from 'react';
import { Image, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import colors from '../constants/colors';
import userImage from '../assets/images/userImage.jpeg';
import { Menu, MenuTrigger, MenuOptions, MenuOption } from 'react-native-popup-menu';
import uuid from 'react-native-uuid';
import * as Clipboard from 'expo-clipboard';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { starMessage } from '../utils/actions/chatActions';
import { useSelector } from 'react-redux';

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

const MenuItem = props => {

    const Icon = props.iconPack ?? Feather;

    return <MenuOption onSelect={props.onSelect}>
        <View style={styles.menuItemContainer}>
            <Text style={styles.menuText}>{props.text}</Text>
            <Icon name={props.icon} size={18} />
        </View>
    </MenuOption>
}

const MainMessage = props => {
    const { text, type, messageId, date, setReply, replyingTo, name, uri, chatId, convoId, userId} = props;
   
    const image = uri ?  { uri: uri } : userImage;

    const starredMessages = useSelector(state => state.messages.starredMessages[convoId] ?? {});
    const storedUsers = useSelector(state => state.users.storedUsers);

    const menuRef = useRef(null);
    const id = useRef(uuid.v4());

    const textStyle = { ...styles.text };
    let isUserMessage = false;
    const dateString = date && formatAmPm(date);

    switch (type) {
        case "main":
            //wrapperStyle.justifyContent = 'flex-start';
            isUserMessage = true;
            textStyle.fontSize = 13;
            break;
    }

    const copyToClipboard = async text => {
        try {
            await Clipboard.setStringAsync(text);
        } catch (error) {
            console.log(error);
        }
    }

    const isStarred = isUserMessage && starredMessages[messageId] !== undefined;
    //const replyingToUser = replyingTo && storedUsers[replyingTo.sentBy];

    return (
        <View style={styles.wrapperStyle}>
            <TouchableWithoutFeedback onLongPress={() => menuRef.current.props.ctx.menuActions.openMenu(id.current)} style={{ width: '100%' }}>
           
                <View style={styles.container}>
                    <View style={styles.profileContainer}>
                        <Image source={image} style={styles.profilePicture} />
                    </View>

{/* 
                    {
                        replyingToUser &&
                        <Bubble
                            type='reply'
                            text={replyingTo.text}
                            name={`${replyingToUser.firstName} ${replyingToUser.lastName}`}
                        />
                    } */}
                    
                    <View  style={styles.messageContainer}>
                        <View style={styles.nameContainer}>
                            <Text style={styles.name}>{name}</Text>
                        
                            {
                                dateString && type !== "info" && 
                                <View style={styles.timeContainer}>
                                    { isStarred && <FontAwesome name='star' size={14} color={'#8E8E93'} style={{ marginRight: 5 }} /> }
                                    <Text style={styles.time}>{dateString}</Text>
                                </View>
                            }
                        </View>
                    

                        <View style={styles.textContainer}>
                            <Text style={textStyle}>
                                {text}
                            </Text>
                    
                        </View>

                    </View>
                

                <Menu name={id.current} ref={menuRef}>
                    <MenuTrigger />

                    <MenuOptions>
                        <MenuItem text='Copy to clipboard' icon={'copy'} onSelect={() => copyToClipboard(text)} />
                        <MenuItem text={`${isStarred ? 'Unstar' : 'Star'} message`} icon={isStarred ? 'star-o' : 'star'} iconPack={FontAwesome} onSelect={() => starMessage(messageId, convoId, userId, chatId)} />
                        <MenuItem text='Reply' icon='arrow-left-circle' onSelect={setReply} />
                        
                    </MenuOptions>
                </Menu>


                </View>
            </TouchableWithoutFeedback>
        </View>
    )
}

const styles = StyleSheet.create({
    wrapperStyle: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: "100%"
    },
    container: {
        paddingVertical: 5,
        marginBottom: 15,
        flexDirection: 'row',
        alignItems: 'flex-start',
        flex: 1,
    },
    profileContainer: {
        marginRight: 15,
      },
      profilePicture: {
        width: 33,
        height: 33,
        borderRadius: 10,
      },
      messageContainer: {
        flex: 1,
      },
      textContainer:{
        marginTop: 5
      },
    text: {
        letterSpacing: 0.3,
        fontFamily :'bold',
        color:'white'
    },
    menuItemContainer: {
        flexDirection: 'row',
        padding: 5
    },
    menuText: {
        flex: 1,
        fontFamily: 'regular',
        letterSpacing: 0.3,
        fontSize: 18
    },
    timeContainer: {
        paddingRight:20,
        flexDirection: 'row',
        justifyContent: 'flex-end'
    },
    time: {
        fontFamily: 'regular',
        letterSpacing: 0.3,
        color: colors.grey,
        fontSize: 12,
    },
    nameContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
      },
    name: {
        fontFamily :'blackLato',
        letterSpacing: 0.3,
        color: 'white',
        fontSize: 18
    }
})

export default MainMessage;