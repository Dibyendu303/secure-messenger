import React from "react";
import { View, StyleSheet, FlatList, Pressable, Text } from "react-native";
import ChatRoomItem from "../components/ChatRoomItem";

import ChatRoomsData from "../assets/dummy-data/ChatRooms";
import { Auth } from "aws-amplify";

export default function HomeScreen() {
  const logOut = () => {
    Auth.signOut();
  };
  return (
    <View style={styles.page}>
      <FlatList
        data={ChatRoomsData}
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
