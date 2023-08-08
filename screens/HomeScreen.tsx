import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList, Pressable, Text } from "react-native";
import ChatRoomItem from "../components/ChatRoomItem";

import ChatRoomsData from "../assets/dummy-data/ChatRooms";
import { Auth, DataStore } from "aws-amplify";
import { ChatRoom, ChatRoomUser } from "../src/models";

export default function HomeScreen() {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);

  useEffect(() => {
    const fetchChatRooms = async () => {
      const currUser = await Auth.currentAuthenticatedUser();
      const currUserId = currUser.attributes.sub;
      console.log("My ID: ", currUserId);

      console.log("Fetching chat room users");
      const chatRoomUsers = await DataStore.query(ChatRoomUser);
      console.log("Successfully fetched chat room users");

      const myChatRooms = chatRoomUsers
        .filter((chatRoomUser) => chatRoomUser.userId === currUserId)
        .map((chatRoomUser) => chatRoomUser.chatRoomId);

      console.log(myChatRooms);

      const fetchedChatRooms = await Promise.all(
        myChatRooms.map(async (id) => await DataStore.query(ChatRoom, id))
      );
      console.log(fetchedChatRooms);
      setChatRooms(fetchedChatRooms);
    };
    fetchChatRooms();
  }, []);
  const logOut = () => {
    Auth.signOut();
  };
  return (
    <View style={styles.page}>
      <FlatList
        data={chatRooms}
        renderItem={({ item }) => <ChatRoomItem chatRoom={item} />}
      />
      <Pressable
        onPress={logOut}
        style={{
          backgroundColor: "#3777f0",
          height: 50,
          justifyContent: "center",
          alignItems: "center",
          margin: 10,
        }}
      >
        <Text style={{ color: "white" }}>Logout</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: "white",
    flex: 1,
  },
});
