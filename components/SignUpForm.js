import React, { useCallback, useEffect, useReducer, useState } from 'react';
import Input from '../components/Input';
import SubmitButton from '../components/SubmitButton';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';

import { validateInput } from '../utils/actions/formActions';
import { reducer } from '../utils/reducers/formReducer';
import { signUp } from '../utils/actions/authActions';
import { ActivityIndicator, Alert, TextInput, StyleSheet, View, Text } from 'react-native';
import colors from '../constants/colors';
import { useDispatch, useSelector } from 'react-redux';

const initialState = {
    inputValues: {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
    },
    inputValidities: {
        firstName: false,
        lastName: false,
        email: false,
        password: false,
    },
    formIsValid: false
}

import { SafeAreaView } from "react-native-safe-area-context";
import { useChatContext } from 'stream-chat-expo';
import { useAuthContext } from "../navigation/AuthContext";
import {
    Pressable,
    ScrollView,
  } from "react-native";
//we need to import this even though we don't use it
import AppNavigator from '../navigation/AppNavigator';

const SignUpForm = (props) => {

    const dispatch = useDispatch();

    const [error, setError] = useState();
    const [isLoading, setIsLoading] = useState(false);
    const [formState, dispatchFormState] = useReducer(reducer);

    const [username, setUsername] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const { setUserId } = useAuthContext();
    
    const { client } = useChatContext();

    const connectUser = async () => {

        //sign in with backend and get user token
        
        await client.connectUser(
          {
            id: username,
            name: name,
            image:
              "https://notjustdev-dummy.s3.us-east-2.amazonaws.com/avatars/elon.png",
          },
          client.devToken(username)
        );

        setUserId(username)
      }

    const signUpUser = () => {
        connectUser();

        //navigate home page
    }

    useEffect(() => {
        if (error) {
            Alert.alert("An error occured", error, [{ text: "Okay" }]);
        }
    }, [error])

    const inputChangedHandler = useCallback((inputId, inputValue) => {
        const result = validateInput(inputId, inputValue);
        dispatchFormState({ inputId, validationResult: result, inputValue })
    }, [dispatchFormState]);

    //first sign in backend and then connect user with stream sdk
    const authHandler = useCallback(async () => {
        try {
            setIsLoading(true);


            const action = signUp(
                username,
                formState.inputValues.firstName,
                formState.inputValues.lastName,
                formState.inputValues.email,
                formState.inputValues.password,
            );
            setError(null);
            await dispatch(action);
        } catch (error) {
            setError(error.message);
            setIsLoading(false);
        }
    }, [dispatch, formState]);

    return (
        <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>We are so excited to see you again</Text>

        <Text style={styles.text}>ACCOUNT INFORMATION</Text>

        <TextInput
          value={username}
          onChangeText={setUsername}
          style={styles.input}
          placeholderTextColor="grey"
          placeholder="Username"
        />
        <TextInput
          value={name}
          onChangeText={setName}
          style={styles.input}
          placeholderTextColor="grey"
          placeholder="Full name"
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          placeholderTextColor="grey"
          placeholder="Password"
        />

        <Text style={styles.forgotPasswordText}>Forgot password?</Text>

        <Pressable style={styles.button} onPress={signUpUser}>
          <Text style={styles.buttonText}>Login</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
            // <>

            //     <Text style={styles.label}>Username</Text>
            //     <View style={styles.inputContainer}>
            //         <AntDesign name="user" size={15} style={styles.icon}  />
            //         <TextInput
            //             style={styles.input}
            //             // placeholder="Enter username"
            //             // placeholderTextColor="grey"
            //             label="Username"
            //             icon="user-o"
            //             iconPack={FontAwesome}
            //             //onInputChanged={inputChangedHandler}
            //             onChangeText={(text) => setUsername(text)}
            //             value={username}
            //             autoCapitalize="none"
            //         />
            //     </View>

            //     <Input
            //         id="firstName"
            //         label="First name"
            //         icon="user-o"
            //         iconPack={FontAwesome}
            //         onInputChanged={inputChangedHandler}
            //         autoCapitalize="none"
            //         errorText={formState.inputValidities["firstName"]} />

            //     <Input
            //         id="lastName"
            //         label="Last name"
            //         icon="user-o"
            //         iconPack={FontAwesome}
            //         onInputChanged={inputChangedHandler}
            //         autoCapitalize="none"
            //         errorText={formState.inputValidities["lastName"]} />

            //     <Input
            //         id="email"
            //         label="Email"
            //         icon="mail"
            //         iconPack={Feather}
            //         onInputChanged={inputChangedHandler}
            //         keyboardType="email-address"
            //         autoCapitalize="none"
            //         errorText={formState.inputValidities["email"]} />

            //     <Input
            //         id="password"
            //         label="Password"
            //         icon="lock"
            //         autoCapitalize="none"
            //         secureTextEntry
            //         iconPack={Feather}
            //         onInputChanged={inputChangedHandler}
            //         errorText={formState.inputValidities["password"]} />
                
            //     {
            //         isLoading ? 
            //         <ActivityIndicator size={'small'} color={colors.primary} style={{ marginTop: 10 }} /> :
            //         <SubmitButton
            //             title="Sign up"
            //             onPress={authHandler}
            //             style={{ marginTop: 20 }}
            //             disabled={!formState.formIsValid}/>
            //     }
            // </>
    )
};

export default SignUpForm;

const styles = StyleSheet.create({
    inputContainer: {
        width: '100%',
        backgroundColor: 'red',
        paddingHorizontal: 10,
        paddingVertical: 15,
        borderRadius: 2,
        backgroundColor: colors.nearlyWhite,
        flexDirection: 'row',
        alignItems: 'center'
    },
    // input: {
    //     color: colors.textColor,
    //     flex: 1,
    //     fontFamily: 'regular',
    //     letterSpacing: 0.3,
    //     paddingTop: 0
    // },
    label: {
        marginVertical: 8,
        fontFamily: 'bold',
        letterSpacing: 0.3,
        color: colors.textColor
    },
    icon: {
        marginRight: 10,
        color: colors.grey
    },
    container: {
        backgroundColor: "#36393E",
        flex: 1,
        padding: 10,
        paddingVertical: 30,
      },
      title: {
        color: "white",
        fontSize: 30,
        fontWeight: "bold",
        alignSelf: "center",
        marginVertical: 10,
      },
      subtitle: {
        color: "lightgrey",
        fontSize: 20,
        alignSelf: "center",
        marginBottom: 30,
      },
      input: {
        backgroundColor: "#202225",
        marginVertical: 5,
        padding: 15,
        color: "white",
        borderRadius: 5,
      },
      button: {
        backgroundColor: "#5964E8",
        alignItems: "center",
        padding: 15,
        borderRadius: 5,
        marginVertical: 10,
      },
      buttonText: {
        color: "white",
        fontWeight: "bold",
      },
      forgotPasswordText: {
        color: "#4CABEB",
        marginVertical: 5,
      },
      text: {
        color: "white",
        fontWeight: "bold",
        marginVertical: 5,
      },

})