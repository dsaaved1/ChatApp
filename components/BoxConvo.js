import React from 'react';
import { StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import colors from '../constants/colors';

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


const BoxConvo = props => {

    const { title, subTitle, date, chatName, color} = props;

    const dateString = date && formatAmPm(date);



    return (
        <TouchableWithoutFeedback style={styles.mainContainer} onPress={props.onPress}>
          <View style={[styles.container, { borderColor: color }]}>
            <View style={styles.header}>
              <Text style={styles.chatName}>{chatName}</Text>
              <Text style={styles.date}>{dateString}</Text>
            </View>
            <View style={styles.content}>
              <Text numberOfLines={2} style={styles.title}>{title}</Text>
              <Text numberOfLines={3} style={styles.subtitle}>{subTitle}</Text>
            </View>
          </View>
        </TouchableWithoutFeedback>
      );
    };
    
    const styles = StyleSheet.create({
        mainContainer:{
        },
      container: {
        borderWidth: 3,
        borderRadius: 20,
        padding: 10,
        margin: 15,
        backgroundColor: 'white',
        height: 113,
        width: 170
      },
      header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        
      },
      chatName: {
        fontWeight: 'bold',
        fontSize: 10,
        textAlign: 'left',
        color: 'black'
      },
      date: {
        fontSize: 10,
        textAlign: 'right',
        color: 'black'
      },
      content: {
        marginTop: 10,
        justifyContent: 'center',
        alignItems: 'center',
      },
      title: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        color: 'black'
      },
      subtitle: {
        fontSize: 12,
        textAlign: 'center',
        color: 'black'
      },
    });
    

export default BoxConvo;