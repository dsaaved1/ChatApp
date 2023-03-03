import { StyleSheet, Text, View } from "react-native"
import colors from "../constants/colors"

export default PageTitle = props => {
    //this is the title like settings and chats
    return <View style={styles.container}>
        <Text style={styles.text}>{props.text}</Text>
    </View>
}

//we have to add the glow title styles later
const styles = StyleSheet.create({
    container: {
        marginBottom: 10
    },
    text: {
        fontSize: 28,
        color: 'white',
        fontFamily: 'bold',
        letterSpacing: 0.3
    }
})