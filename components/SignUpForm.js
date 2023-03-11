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

const SignUpForm = props => {

    const dispatch = useDispatch();

    const [error, setError] = useState();
    const [isLoading, setIsLoading] = useState(false);
    const [formState, dispatchFormState] = useReducer(reducer, initialState);
    const [username, setUsername] = useState("");

    const inputChangedHandler = useCallback((inputId, inputValue) => {
        const result = validateInput(inputId, inputValue);
        dispatchFormState({ inputId, validationResult: result, inputValue })
    }, [dispatchFormState]);

    useEffect(() => {
        if (error) {
            Alert.alert("An error occured", error, [{ text: "Okay" }]);
        }
    }, [error])

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
            <>

                <Text style={styles.label}>Username</Text>
                <View style={styles.inputContainer}>
                    <AntDesign name="user" size={15} style={styles.icon}  />
                    <TextInput
                        style={styles.input}
                        // placeholder="Enter username"
                        // placeholderTextColor="grey"
                        label="Username"
                        icon="user-o"
                        iconPack={FontAwesome}
                        //onInputChanged={inputChangedHandler}
                        onChangeText={(text) => setUsername(text)}
                        value={username}
                        autoCapitalize="none"
                    />
                </View>

                <Input
                    id="firstName"
                    label="First name"
                    icon="user-o"
                    iconPack={FontAwesome}
                    onInputChanged={inputChangedHandler}
                    autoCapitalize="none"
                    errorText={formState.inputValidities["firstName"]} />

                <Input
                    id="lastName"
                    label="Last name"
                    icon="user-o"
                    iconPack={FontAwesome}
                    onInputChanged={inputChangedHandler}
                    autoCapitalize="none"
                    errorText={formState.inputValidities["lastName"]} />

                <Input
                    id="email"
                    label="Email"
                    icon="mail"
                    iconPack={Feather}
                    onInputChanged={inputChangedHandler}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    errorText={formState.inputValidities["email"]} />

                <Input
                    id="password"
                    label="Password"
                    icon="lock"
                    autoCapitalize="none"
                    secureTextEntry
                    iconPack={Feather}
                    onInputChanged={inputChangedHandler}
                    errorText={formState.inputValidities["password"]} />
                
                {
                    isLoading ? 
                    <ActivityIndicator size={'small'} color={colors.primary} style={{ marginTop: 10 }} /> :
                    <SubmitButton
                        title="Sign up"
                        onPress={authHandler}
                        style={{ marginTop: 20 }}
                        disabled={!formState.formIsValid}/>
                }
            </>
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
    input: {
        color: colors.textColor,
        flex: 1,
        fontFamily: 'regular',
        letterSpacing: 0.3,
        paddingTop: 0
    },
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

})