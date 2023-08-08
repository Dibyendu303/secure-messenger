import { View, Text, Image } from "react-native";
import React, { useEffect, useState } from "react";
import { Feather } from "@expo/vector-icons";
import { Auth, DataStore } from "aws-amplify";
import { ChatRoomUser, User } from "../src/models";

const ChatRoomHeader = ({ id }) => {
  const [displayUser, setDisplayUser] = useState<User | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchUsers = async () => {
      const chatRoomUserIds = (await DataStore.query(ChatRoomUser))
        .filter((chatRoomUser) => chatRoomUser.chatRoomId === id)
        .map((user) => user.userId);

      const chatRoomUsers = await Promise.all(
        chatRoomUserIds.map(async (id) => await DataStore.query(User, id))
      );
      const authUser = await Auth.currentAuthenticatedUser();
      setDisplayUser(
        chatRoomUsers.find((user) => user.id !== authUser.attributes.sub) ||
          null
      );
    };
    fetchUsers();
  }, []);

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
          uri: displayUser?.imageUri,
        }}
        style={{ width: 30, height: 30, borderRadius: 30 }}
      />
      <Text
        style={{
          flex: 1,
          fontWeight: "bold",
          marginLeft: 10,
        }}
      >
        {displayUser?.name}
      </Text>
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
