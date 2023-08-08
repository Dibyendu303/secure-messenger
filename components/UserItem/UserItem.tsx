import React from "react";
import { Text, View, Image, Pressable } from "react-native";
import styles from "./styles";
import { useNavigation } from "@react-navigation/native";
import { ChatRoom, ChatRoomUser, User } from "../../src/models";
import { Auth, DataStore } from "aws-amplify";

const ChatRoomItem = ({ user }) => {
  const navigation = useNavigation();

  const findCommonChatRooms = (arr1, arr2) => {
    return arr1.filter((value) => arr2.includes(value));
  };

  const onPress = async () => {
    let dbUser = null;
    try {
      const authUser = await Auth.currentAuthenticatedUser();
      dbUser = await DataStore.query(User, authUser.attributes.sub);
    } catch (e) {
      console.log("Error in getting authenticated user");
      console.log(e);
    }

    // check if there is already a chatroom the redirect there
    const myChatRooms = (
      await DataStore.query(ChatRoomUser, (chatRoomUser) =>
        chatRoomUser.userId.eq(dbUser.id)
      )
    ).map((chatRoomUser) => chatRoomUser.chatRoomId);

    const userChatRooms = (
      await DataStore.query(ChatRoomUser, (chatRoomUser) =>
        chatRoomUser.userId.eq(user.id)
      )
    ).map((chatRoomUser) => chatRoomUser.chatRoomId);

    let newChatRoomId = null;
    const commonChatRooms = findCommonChatRooms(myChatRooms, userChatRooms);
    if (commonChatRooms.length > 0) {
      newChatRoomId = commonChatRooms[0];
    } else {
      let newChatRoom;
      try {
        // create a chat room
        newChatRoom = await DataStore.save(new ChatRoom({ newMessages: 0 }));
        newChatRoomId = newChatRoom.id;
      } catch (e) {
        console.log("Error in creating chatroom.");
        console.log(e);
      }

      try {
        // add authenticated user to the chat room
        await DataStore.save(
          new ChatRoomUser({
            user: dbUser,
            chatRoom: newChatRoom,
          })
        );

        // add clicked user to the chat room
        await DataStore.save(
          new ChatRoomUser({
            user: user,
            chatRoom: newChatRoom,
          })
        );
      } catch (e) {
        console.log("Error in adding users to chatroom");
        console.log(e);
      }
    }
    navigation.navigate("ChatRoom", { id: newChatRoomId });
  };

  return (
    <Pressable onPress={onPress} style={styles.container}>
      <Image source={{ uri: user.imageUri }} style={styles.image} />
      <View style={styles.rightContainer}>
        <View style={styles.row}>
          <Text style={styles.name}>{user.name}</Text>
        </View>
      </View>
    </Pressable>
  );
};

export default ChatRoomItem;
