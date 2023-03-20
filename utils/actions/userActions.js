import { child, endAt, get, getDatabase, orderByChild, push, query, ref, remove, startAt, equalTo } from "firebase/database"
import { getFirebaseApp } from "../firebaseHelper";

export const getUserData = async (userId) => {
    try {
        const app = getFirebaseApp();
        const dbRef = ref(getDatabase(app));
        const userRef = child(dbRef, `users/${userId}`);

        const snapshot = await get(userRef);
        return snapshot.val();
    } catch (error) {
        console.log(error);
    }
}

export const getUserChats = async (userId) => {
    try {
        const app = getFirebaseApp();
        const dbRef = ref(getDatabase(app));
        const userRef = child(dbRef, `userChats/${userId}`);

        const snapshot = await get(userRef);
        return snapshot.val();
    } catch (error) {
        console.log(error);
    }
}

export const deleteUserChat = async (userId, key) => {
    try {
        const app = getFirebaseApp();
        const dbRef = ref(getDatabase(app));
        const chatRef = child(dbRef, `userChats/${userId}/${key}`);

        await remove(chatRef);
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const addUserChat = async (userId, chatId) => {
    try {
        const app = getFirebaseApp();
        const dbRef = ref(getDatabase(app));
        const chatRef = child(dbRef, `userChats/${userId}`);

        await push(chatRef, chatId);
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const searchUsers = async (queryText) => {
    const searchTerm = queryText;
    // const searchTerm = queryText.toLowerCase();

    try {
        const app = getFirebaseApp();
        const dbRef = ref(getDatabase(app));
        const userRef = child(dbRef, 'users');

        const queryRef = query(userRef, orderByChild('username'), equalTo(searchTerm));
        //const queryRef = query(userRef, orderByChild('username'), startAt(searchTerm), endAt(searchTerm + "\uf8ff"));
        const snapshot = await get(queryRef);

        console.log(snapshot.val(), " snapshot.val()")

        if (snapshot.exists()) {
            return snapshot.val();
        }

        return {};
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const searchUsers2 = async (client, queryText) => {
    const searchTerm = queryText;
    // const searchTerm = queryText.toLowerCase();

    try {

        // an array of a user object that matches that id [{id: "123", name: "John"}}]
        const response = await client.queryUsers(
            { id: { $in: [searchTerm] } },
            { limit: 1 }
        );

        if (response.users.length > 0) {
            return response.users;
        } else{
            return {};
        }


    } catch (error) {
        console.log(error);
        throw error;
    }
}

