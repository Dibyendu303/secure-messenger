import React, { useEffect, useState } from "react";
import { Text, View, Image, Pressable, ActivityIndicator } from "react-native";
import styles from "./styles";
import { useNavigation } from "@react-navigation/native";
import { ChatRoomUser, Message, User } from "../../src/models";
import { Auth, DataStore } from "aws-amplify";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const ChatRoomItem = ({ chatRoom }) => {
  // const [users, setUsers] = useState<User[]>([]);
  const [displayUser, setDisplayUser] = useState<User | null>(null);
  const [lastMessage, setLastMessage] = useState<Message | undefined>();
  const [isLastMessageMine, setIsLastMessageMine] = useState<bool>(false);
  const [user, setUser] = useState<string | null>(null);
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const chatRoomUserIds = (await DataStore.query(ChatRoomUser))
        .filter((chatRoomUser) => chatRoomUser.chatRoomId === chatRoom.id)
        .map((user) => user.userId);

      const chatRoomUsers = await Promise.all(
        chatRoomUserIds.map(async (id) => await DataStore.query(User, id))
      );
      // setUsers(chatRoomUsers);
      const authUser = await Auth.currentAuthenticatedUser();
      setDisplayUser(
        chatRoomUsers.find((user) => user.id !== authUser.attributes.sub) ||
          null
      );
      setUser(authUser.attributes.sub);
      setIsLoading(false);
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!chatRoom?.chatRoomLastMessageId) return;
    getLastMessage();
  }, [chatRoom]);

  const getLastMessage = async () => {
    if (!chatRoom?.chatRoomLastMessageId) return;
    try {
      const lastmsg = await DataStore.query(
        Message,
        chatRoom.chatRoomLastMessageId
      );
      setLastMessage(lastmsg);
      setIsLastMessageMine(lastmsg?.userID === user);
    } catch (e) {
      console.log(
        "Error in getting last message with chatroomId: ",
        chatRoom.id
      );
      console.log(e);
    }
  };

  const getLastMessageContent = () => {
    let output = "";
    if (isLastMessageMine) output += "You: ";
    if (!lastMessage) return "";
    if (lastMessage.content) return output + lastMessage.content;
    else if (lastMessage.image)
      return (
        <Text>
          {output}Image
          <Feather name="image" size={12} color="lightgray" />
        </Text>
      );
    else if (lastMessage.audio)
      return (
        <Text>
          {output}Audio
          <MaterialCommunityIcons
            name="microphone"
            size={12}
            color="lightgray"
          />
        </Text>
      );
  };

  const onPress = () => {
    navigation.navigate("ChatRoom", { id: chatRoom.id });
  };
  const time = dayjs(lastMessage?.createdAt).fromNow();

  if (!displayUser) {
    return <ActivityIndicator />;
  }

  if (isLoading) {
    return <ActivityIndicator />;
  }

  return (
    <Pressable onPress={onPress} style={styles.container}>
      <Image
        source={{ uri: chatRoom.imageUri || displayUser.imageUri }}
        style={styles.image}
      />
      {!!chatRoom.newMessages && (
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>{chatRoom.newMessages}</Text>
        </View>
      )}
      <View style={styles.rightContainer}>
        <View style={styles.row}>
          <Text style={styles.name}>{chatRoom.name || displayUser.name}</Text>
          <Text style={styles.text}>{time}</Text>
        </View>
        <Text numberOfLines={1} style={styles.text}>
          {getLastMessageContent()}
        </Text>
      </View>
    </Pressable>
  );
};

export default ChatRoomItem;
