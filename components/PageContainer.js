import { StyleSheet, View } from "react-native"

const PageContainer = props => {
    return <View style={{ ...styles.container, ...props.style }}>
        {props.children}
    </View>
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        flex: 1,
        backgroundColor: '#0E1528'
    }
})

export default PageContainer;