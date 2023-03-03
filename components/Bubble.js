import React, { useRef, useState } from 'react';
import { Image, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import colors from '../constants/colors';
import { Menu, MenuTrigger, MenuOptions, MenuOption } from 'react-native-popup-menu';
import uuid from 'react-native-uuid';
import * as Clipboard from 'expo-clipboard';
import userImage from '../assets/images/userImage.jpeg';
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

  function getRandomColor() {
    const colors = ['#6653FF', '#53FF66', '#FF6653', '#BC53FF', '#19C37D', '#FFFF66', 'teal', '#FF6EFF', '#FF9933', '#50BFE6', "#00468C"];
    return colors[Math.floor(Math.random() * colors.length)];
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

let colorMap = {};

const Bubble = props => {
    const { text, type, messageId, chatId, convoId, userId, date, setReply, replyingTo, name, senderID, imageUrl } = props;
   
    let colorBorder;

    if (userId == senderID){
        colorBorder = "#FF5366"
    } else if (colorMap[senderID]){
        colorBorder = colorMap[senderID]
    } else {
        const color = getRandomColor()
        colorMap[senderID] = color
    }

  
    

    const starredMessages = useSelector(state => state.messages.starredMessages[convoId] ?? {});
    const storedUsers = useSelector(state => state.users.storedUsers);

    const bubbleStyle = {
        ...styles.container,      
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 3,
     };

    const textStyle = { ...styles.text };
    const wrapperStyle = { ...styles.wrapperStyle }

    const menuRef = useRef(null);
    const id = useRef(uuid.v4());

    let Container = View;
    let isUserMessage = false;
    const dateString = date && formatAmPm(date);


    switch (type) {
        case "system":
            textStyle.color = '#65644A';
            bubbleStyle.backgroundColor = colors.beige;
            bubbleStyle.alignItems = 'center';
            bubbleStyle.marginTop = 10;
            textStyle.fontFamily = 'regular';
            textStyle.fontSize = 16;
            break;
        case "error":
            bubbleStyle.backgroundColor = colors.red;
            textStyle.color = 'white';
            bubbleStyle.marginTop = 10;
            textStyle.fontFamily = 'regular';
            textStyle.fontSize = 16;
            break;
        case "myMessage":
            wrapperStyle.justifyContent = 'flex-end';
            bubbleStyle.backgroundColor = '#1C2331';
            bubbleStyle.maxWidth = '65%';
            textStyle.fontFamily = 'regular';
            Container = TouchableWithoutFeedback;
            isUserMessage = true;
            textStyle.fontSize = 14;
            textStyle.color = 'white';
            bubbleStyle.borderColor = colorBorder;
            break;
        case "theirMessage":
            wrapperStyle.justifyContent = 'flex-start';
            bubbleStyle.maxWidth = '65%';
            bubbleStyle.backgroundColor = '#1C2331';
            textStyle.color = 'white';
            textStyle.fontFamily = 'regular';
            Container = TouchableWithoutFeedback;
            isUserMessage = true;
            bubbleStyle.borderRadius = 16;
            bubbleStyle.borderColor = colorBorder;
            textStyle.fontSize = 14;
            break;
        case "reply":
            bubbleStyle.backgroundColor = '#1C2337';
            bubbleStyle.fontSize = 16;
            textStyle.color = 'white';
            break;
        case "info":
            bubbleStyle.backgroundColor = 'white';
            bubbleStyle.alignItems = 'center';
            textStyle.fontSize = 16;
            textStyle.color = colors.textColor;
            break;
        default:
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
    const replyingToUser = replyingTo && storedUsers[replyingTo.sentBy];

    return (
        <View style={wrapperStyle}>
            <Container onLongPress={() => menuRef.current.props.ctx.menuActions.openMenu(id.current)} style={{ width: '100%' }}>
               
                    
                <View style={bubbleStyle}>

                        

                        {
                            name && type !== "info" &&
                            <Text style={{...styles.name, color: colorBorder}}>{name}</Text>
                        }

                        {
                            replyingToUser &&
                            <Bubble
                                type='reply'
                                text={replyingTo.text}
                                name={`${replyingToUser.firstName} ${replyingToUser.lastName}`}
                            />
                        }

                        {
                            imageUrl &&
                            <Image source={{ uri: imageUrl }} style={styles.image} />
                        }

                        {
                            !imageUrl &&
                            <View>
                                <Text style={textStyle}>
                                    {text}
                                </Text>
                                <View>

                                </View>
                            </View>
                        }

                        

                        
                    {
                        dateString && type !== "info" && <View style={styles.timeContainer}>
                            { isStarred && <FontAwesome name='star' size={14} color={'#8E8E93'} style={{ marginRight: 5 }} /> }
                            <Text style={styles.time}>{dateString}</Text>
                        </View>
                    }

                    <Menu name={id.current} ref={menuRef}>
                        <MenuTrigger />

                        <MenuOptions>
                            <MenuItem text='Copy to clipboard' icon={'copy'} onSelect={() => copyToClipboard(text)} />
                            <MenuItem text={`${isStarred ? 'Unstar' : 'Star'} message`} icon={isStarred ? 'star-o' : 'star'} iconPack={FontAwesome} onSelect={() => starMessage(messageId, convoId, userId, chatId)} />
                            <MenuItem text='Reply' icon='arrow-left-circle' onSelect={setReply} />
                            
                        </MenuOptions>
                    </Menu>


                </View>
                
            </Container>
        </View>
    )
}

const styles = StyleSheet.create({
    wrapperStyle: {
        flexDirection: 'row',
        justifyContent: 'center'
    },
    container: {
        borderRadius: 6,
        padding: 5,
        marginBottom: 10,
        borderWidth: 2,
    },
    text: {
        letterSpacing: 0.3,
        paddingLeft:5,
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
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingLeft:"20%"
    },
    time: {
        fontFamily: 'regular',
        letterSpacing: 0.3,
        color: colors.grey,
        fontSize: 10
    },
    name: {
        fontFamily: 'bold',
        letterSpacing: 0.3,
        fontSize: 12,
        padding:5
    },
    image: {
        width: 200,
        height: 200,
        marginBottom: 5
    }
})

export default Bubble;