
import { child, get, getDatabase, push, ref, remove, set, update } from "firebase/database";
import { getFirebaseApp } from "../firebaseHelper";
import { getUserPushTokens } from "./authActions";
import { addUserChat, deleteUserChat, getUserChats } from "./userActions";



export const createChat = async (loggedInUserId, chatData) => {

    const newChatData = {
        ...chatData,
        createdBy: loggedInUserId,
        updatedBy: loggedInUserId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    const app = getFirebaseApp();
    const dbRef = ref(getDatabase(app));
    const newChat = await push(child(dbRef, 'chats'), newChatData);

    const chatUsers = newChatData.users;
    for (let i = 0; i < chatUsers.length; i++) {
        const userId = chatUsers[i];
        await push(child(dbRef, `userChats/${userId}`), newChat.key);
        //await push(child(dbRef, `userGroups/${userId}`), newGroup.key);
    }
    console.log("should not log 5")

    return newChat.key;
}

export const createConvo = async (loggedInUserId, chatData, chatId, color) => {

   
    const app = getFirebaseApp();
    
    const dbRef = ref(getDatabase(app));
    
    const convosRef = child(dbRef, `convos/${chatId}`);
   
    
    const convoData = {
        convoName:  "Convo",
        chat: chatData.isGroupChat ? chatData.chatName : 'Chat',
        chatId: chatId,
        createdBy: loggedInUserId,
        updatedBy: loggedInUserId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        color: color,
    };
   
    const convoKey = await push(convosRef, convoData);
    
 
    return convoKey.key;
}

export const sendTextMessage = async (convoId, chatId, senderData, messageText, replyTo, chatUsers) => {
    await sendMessage(convoId, chatId, senderData.userId, messageText, null, replyTo, null);

    const otherUsers = chatUsers.filter(uid => uid !== senderData.userId);
    await sendPushNotificationForUsers(otherUsers, `${senderData.firstName} ${senderData.lastName}`, messageText, chatId, convoId);
}

export const sendMainMessage = async (convoId, chatId, senderData, messageText, replyTo, chatUsers) => {
    console.log("here before asking")
    await sendMessage(convoId, chatId, senderData.userId, messageText, null, replyTo, "main");

    const otherUsers = chatUsers.filter(uid => uid !== senderData.userId);
    await sendPushNotificationForUsers(otherUsers, `${senderData.firstName} ${senderData.lastName}`, messageText, chatId, convoId);
}

export const sendInfoMessage = async (chatId, senderId, messageText) => {
    await sendMessage(chatId, senderId, messageText, null, null, "info");
}

export const sendImage = async (convoId, chatId, senderData, imageUrl, replyTo, chatUsers) => {
    await sendMessage(convoId, chatId, senderData.userId, 'Image', imageUrl, replyTo, null);

    const otherUsers = chatUsers.filter(uid => uid !== senderData.userId);
    await sendPushNotificationForUsers(otherUsers, `${senderData.firstName} ${senderData.lastName}`, `${senderData.firstName} sent an image`, chatId, convoId);
}


export const updateChatData = async (chatId, userId, chatData) => {
    const app = getFirebaseApp();
    const dbRef = ref(getDatabase(app));
    const chatRef = child(dbRef, `chats/${chatId}`);

    if (chatData.users){
        await update(chatRef, {
            ...chatData,
            numberUsers: chatData.users.length,
            updatedAt: new Date().toISOString(),
            updatedBy: userId
        })
    } else {
        await update(chatRef, {
            ...chatData,
            updatedAt: new Date().toISOString(),
            updatedBy: userId
        })
    }

}



export const updateConvoName = async (convoId, chatId, newConvoName) => {
    const app = getFirebaseApp();
    const dbRef = ref(getDatabase(app));

    const convoRef = child(dbRef, `convos/${chatId}/${convoId}`);
    await update(convoRef, {
        convoName: newConvoName,
        updatedAt: new Date().toISOString(),
    });

    // Retrieve the data at convoRef
    const convoSnapshot = await get(convoRef);

    const chatRef = child(dbRef, `chats/${chatId}`);
    await update(chatRef, {
        updatedAt: new Date().toISOString(),
        latestConvo: convoSnapshot.val().convoName,
    });
}

const sendMessage = async (convoId, chatId, senderId, messageText, imageUrl, replyTo, type) => {
    const app = getFirebaseApp();
    const dbRef = ref(getDatabase(app));
    const messagesRef = child(dbRef, `messages/${convoId}`);

    const messageData = {
        sentBy: senderId,
        sentAt: new Date().toISOString(),
        text: messageText
    };

    if (replyTo) {
        messageData.replyTo = replyTo;
    }

    if (imageUrl) {
        messageData.imageUrl = imageUrl;
    }

    if (type) {
        messageData.type = type;
    }

    await push(messagesRef, messageData);

    
    const convoRef = child(dbRef, `convos/${chatId}/${convoId}`);
    await update(convoRef, {
        updatedBy: senderId,
        updatedAt: new Date().toISOString(),
        latestMessageText: messageText
    });

    // Retrieve the data at convoRef
    const convoSnapshot = await get(convoRef);

    const chatRef = child(dbRef, `chats/${chatId}`);
    await update(chatRef, {
        updatedBy: senderId,
        updatedAt: new Date().toISOString(),
        latestConvo: convoSnapshot.val().convoName,
        latestMessageText: messageText
    });
}

export const starMessage = async (messageId, convoId, userId, chatId) => {
    try {
        const app = getFirebaseApp();
        const dbRef = ref(getDatabase(app));
        const childRef = child(dbRef, `userStarredMessages/${userId}/${convoId}/${messageId}`);

        const snapshot = await get(childRef);

        if (snapshot.exists()) {
            // Starred item exists - Un-star
            await remove(childRef);
        }
        else {
            // Starred item does not exist - star
            const starredMessageData = {
                messageId,
                convoId,
                chatId,
                starredAt: new Date().toISOString()
            }

            await set(childRef, starredMessageData);
        }
    } catch (error) {
        console.log(error);        
    }
}

export const removeUserFromChat = async (userLoggedInData, userToRemoveData, chatData) => {
    const userToRemoveId = userToRemoveData.userId;
    const newUsers = chatData.users.filter(uid => uid !== userToRemoveId);
    await updateChatData(chatData.key, userLoggedInData.userId, { users: newUsers });

    const userChats = await getUserChats(userToRemoveId);

    for (const key in userChats) {
        const currentChatId = userChats[key];

        if (currentChatId === chatData.key) {
            await deleteUserChat(userToRemoveId, key);
            break;
        }
    }
}

export const addUsersToChat = async (userLoggedInData, usersToAddData, chatData) => {
    const existingUsers = Object.values(chatData.users);
    const newUsers = [];

    let userAddedName = "";

    usersToAddData.forEach(async userToAdd => {
        const userToAddId = userToAdd.userId;

        if (existingUsers.includes(userToAddId)) return;

        newUsers.push(userToAddId);

        await addUserChat(userToAddId, chatData.key);

        userAddedName = `${userToAdd.firstName} ${userToAdd.lastName}`;
    });

    if (newUsers.length === 0) {
        return;
    }


    await updateChatData(chatData.key, userLoggedInData.userId, { users: existingUsers.concat(newUsers) })


}

const sendPushNotificationForUsers = (chatUsers, title, body, chatId, convoId) => {
    chatUsers.forEach(async uid => {
        console.log("test");
        const tokens = await getUserPushTokens(uid);

        for(const key in tokens) {
            const token = tokens[key];

            await fetch("https://exp.host/--/api/v2/push/send", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    to: token,
                    title,
                    body,
                    data: { chatId, convoId }
                })
            })
        }
    })
}