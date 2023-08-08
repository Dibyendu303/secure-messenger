import React, { useEffect, useState } from "react";
import { Text, View, Image, Pressable, ActivityIndicator } from "react-native";
import styles from "./styles";
import { useNavigation } from "@react-navigation/native";
import { ChatRoomUser, User } from "../../src/models";
import { Auth, DataStore } from "aws-amplify";

const ChatRoomItem = ({ chatRoom }) => {
  // const [users, setUsers] = useState<User[]>([]);
  const [displayUser, setDisplayUser] = useState<User | null>(null);

  const navigation = useNavigation();

  useEffect(() => {
    const fetchUsers = async () => {
      const chatRoomUserIds = (await DataStore.query(ChatRoomUser))
        .filter((chatRoomUser) => chatRoomUser.chatRoomId === chatRoom.id)
        .map((user) => user.userId);

      const chatRoomUsers = await Promise.all(
        chatRoomUserIds.map(async (id) => await DataStore.query(User, id))
      );
      console.log(chatRoomUsers);
      // setUsers(chatRoomUsers);
      const authUser = await Auth.currentAuthenticatedUser();
      setDisplayUser(
        chatRoomUsers.find((user) => user.id !== authUser.attributes.sub) ||
          null
      );
    };
    fetchUsers();
  }, []);

  const onPress = () => {
    navigation.navigate("ChatRoom", { id: chatRoom.id });
  };

  if (!displayUser) {
    return <ActivityIndicator />;
  }

  return (
    <Pressable onPress={onPress} style={styles.container}>
      <Image source={{ uri: displayUser.imageUri }} style={styles.image} />
      {!!chatRoom.newMessages && (
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>{chatRoom.newMessages}</Text>
        </View>
      )}
      <View style={styles.rightContainer}>
        <View style={styles.row}>
          <Text style={styles.name}>{displayUser.name}</Text>
          <Text style={styles.text}>{chatRoom.lastMessage?.createdAt}</Text>
        </View>
        <Text numberOfLines={1} style={styles.text}>
          {chatRoom.lastMessage?.content}
        </Text>
      </View>
    </Pressable>
  );
};

export default ChatRoomItem;
