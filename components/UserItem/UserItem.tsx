import React from "react";
import { Text, View, Image, Pressable } from "react-native";
import styles from "./styles";
import { useNavigation } from "@react-navigation/native";
import { ChatRoom, ChatRoomUser, User } from "../../src/models";
import { Auth, DataStore } from "aws-amplify";

const ChatRoomItem = ({ user }) => {
  const navigation = useNavigation();

  const onPress = async () => {
    // Todo: if there is already a chatroom the redirect there

    // create a chat room
    const newChatRoom = await DataStore.save(new ChatRoom({ newMessages: 0 }));

    // add authenticated user to the chat room
    const authUser = await Auth.currentAuthenticatedUser();
    const dbUser = await DataStore.query(User, authUser.attributes.sub);
    await DataStore.save(
      new ChatRoomUser({
        user: dbUser,
        chatRoom: newChatRoom,
      })
    );

    // add clicked user to the chat room
    await DataStore.save(
      new ChatRoomUser({
        user,
        chatRoom: newChatRoom,
      })
    );

    navigation.navigate("ChatRoom", { id: newChatRoom.id });
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
