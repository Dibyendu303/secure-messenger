import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList, Pressable, Text } from "react-native";
import { Auth, DataStore } from "aws-amplify";
import ChatRoomItem from "../components/ChatRoomItem";
import { ChatRoom, ChatRoomUser } from "../src/models";

export default function HomeScreen() {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);

  useEffect(() => {
    const subscription = DataStore.observe(ChatRoom).subscribe((msg) => {
      // console.log(msg.model, msg.opType, msg.element);
      // if (msg.model === MessageModel && msg.opType === "UPDATE") {
      //   setMessage((message) => ({ ...message, ...msg.element }));
      // }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchChatRooms = async () => {
      const currUser = await Auth.currentAuthenticatedUser();
      const currUserId = currUser.attributes.sub;

      const chatRoomUsers = await DataStore.query(ChatRoomUser);

      const myChatRooms = chatRoomUsers
        .filter((chatRoomUser) => chatRoomUser.userId === currUserId)
        .map((chatRoomUser) => chatRoomUser.chatRoomId);

      const fetchedChatRooms = await Promise.all(
        myChatRooms.map(async (id) => await DataStore.query(ChatRoom, id))
      );
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
