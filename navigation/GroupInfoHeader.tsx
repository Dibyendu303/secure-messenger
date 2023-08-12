import { View, Text, Image, Pressable } from "react-native";
import React, { useEffect, useState } from "react";
import { Feather } from "@expo/vector-icons";
import { Auth, DataStore } from "aws-amplify";
import dayjs from "dayjs";
import { ChatRoom, ChatRoomUser, User } from "../src/models";
import { useNavigation } from "@react-navigation/native";

const GroupInfoHeader = ({ id }) => {
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const navigation = useNavigation();

  useEffect(() => {
    if (!id) return;
    fetchChatRoom();
  }, []);

  const fetchChatRoom = async () => {
    try {
      const chatRoom = await DataStore.query(ChatRoom, id);
      setChatRoom(chatRoom);
    } catch (e) {
      console.log("Error in fetching chatroom in chatroom header. ", e);
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
          uri: chatRoom?.imageUri,
        }}
        style={{ width: 30, height: 30, borderRadius: 30 }}
      />
      <View
        style={{
          flex: 1,
          marginLeft: 10,
          justifyContent: "center",
          alignItems: "center",
          marginRight: "10%",
        }}
      >
        <Text style={{ fontWeight: "bold", fontSize: 16 }}>
          {chatRoom?.name}
        </Text>
      </View>
    </View>
  );
};

export default GroupInfoHeader;
