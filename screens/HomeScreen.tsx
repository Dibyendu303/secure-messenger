import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList, Pressable, Text } from "react-native";
import { Auth, DataStore } from "aws-amplify";
import ChatRoomItem from "../components/ChatRoomItem";
import { ChatRoom, ChatRoomUser } from "../src/models";
import { useNavigation } from "@react-navigation/native";

export default function HomeScreen() {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const navigation = useNavigation();

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

  return (
    <View style={styles.page}>
      {chatRooms.length > 0 ? (
        <FlatList
          data={chatRooms}
          renderItem={({ item }) => <ChatRoomItem chatRoom={item} />}
        />
      ) : (
        <View
          style={{
            width: "100%",
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Pressable onPress={() => navigation.navigate("UsersScreen")}>
            <Text
              style={{ color: "#3777f0", fontSize: 24, fontWeight: "bold" }}
            >
              Click here
            </Text>
          </Pressable>
          <Text style={{ fontSize: 18 }}>to start a new chat.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: "white",
    flex: 1,
  },
});
