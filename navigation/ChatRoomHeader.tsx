import { View, Text, Image, Pressable } from "react-native";
import React, { useEffect, useState } from "react";
import { Feather } from "@expo/vector-icons";
import { Auth, DataStore } from "aws-amplify";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { ChatRoom, ChatRoomUser, User } from "../src/models";
import { useNavigation } from "@react-navigation/native";

dayjs.extend(relativeTime);

const ChatRoomHeader = ({ id }) => {
  const [displayUser, setDisplayUser] = useState<User | null>(null);
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const navigation = useNavigation();

  useEffect(() => {
    if (!displayUser) return;
    const subscription = DataStore.observe(User, displayUser.id).subscribe(
      (msg) => {
        // console.log(msg.model, msg.opType, msg.element);
        if (msg.model === User && msg.opType === "UPDATE") {
          const newData = { ...displayUser, ...msg.element };
          setDisplayUser(newData);
        }
      }
    );
    return () => subscription.unsubscribe();
  }, [displayUser]);

  useEffect(() => {
    if (!id) return;
    fetchChatRoom();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const chatRoomUserIds = (await DataStore.query(ChatRoomUser))
      .filter((chatRoomUser) => chatRoomUser.chatRoomId === id)
      .map((user) => user.userId);

    const chatRoomUsers = await Promise.all(
      chatRoomUserIds.map(async (id) => await DataStore.query(User, id))
    );
    setAllUsers(chatRoomUsers);
    const authUser = await Auth.currentAuthenticatedUser();
    setDisplayUser(
      chatRoomUsers.find((user) => user.id !== authUser.attributes.sub) || null
    );
  };

  const fetchChatRoom = async () => {
    try {
      const chatRoom = await DataStore.query(ChatRoom, id);
      setChatRoom(chatRoom);
    } catch (e) {
      console.log("Error in fetching chatroom in chatroom header. ", e);
    }
  };

  const getLastOnlineText = () => {
    if (!displayUser?.lastOnlineAt) return null;
    const diff = new Date().getTime() - displayUser.lastOnlineAt;
    if (diff < 5 * 60 * 1000) return "Online";
    const time = dayjs(displayUser.lastOnlineAt).fromNow();
    return `Last seen: ${time}`;
  };

  const isGroup = allUsers.length > 2;

  const getUserNames = () => {
    return allUsers.map((user) => user.name).join(", ");
  };

  const openInfo = () => {
    if (isGroup || chatRoom?.name) {
      navigation.navigate("GroupInfoScreen", { id });
    }
  };

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "110%",
        marginLeft: "-10%",
      }}
    >
      <Image
        source={{
          uri: chatRoom?.imageUri || displayUser?.imageUri,
        }}
        style={{ width: 30, height: 30, borderRadius: 30 }}
      />
      <Pressable
        onPress={openInfo}
        style={{
          flex: 1,
          marginLeft: 10,
        }}
      >
        <Text style={{ fontWeight: "bold", fontSize: 16 }}>
          {chatRoom?.name || displayUser?.name}
        </Text>
        {isGroup && (
          <Text numberOfLines={1} style={{ fontSize: 12, color: "gray" }}>
            {getUserNames()}
          </Text>
        )}
        {!isGroup && displayUser?.lastOnlineAt && (
          <Text style={{ fontSize: 12, color: "gray" }}>
            {getLastOnlineText()}
          </Text>
        )}
      </Pressable>
      <Feather
        name="camera"
        size={24}
        color="black"
        style={{ marginRight: 20 }}
      />
      <Feather name="edit-2" size={24} color="black" />
    </View>
  );
};

export default ChatRoomHeader;
