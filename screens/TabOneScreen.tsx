import React, { useLayoutEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { Text, View, Image, StyleSheet, FlatList } from "react-native";
import ChatRoomItem from "../components/ChatRoomItem";

import ChatRoomsData from "../assets/dummy-data/ChatRooms";

export default function TabOneScreen() {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, []);

  return (
    <View style={styles.page}>
      <FlatList
        data={ChatRoomsData}
        renderItem={({ item }) => <ChatRoomItem chatRoom={item} />}
      />
      {/* <ChatRoomItem chatRoom={ChatRoomsData[0]} />
      <ChatRoomItem chatRoom={ChatRoomsData[1]} /> */}
      {/* {ChatRoomsData.map((chatroom)=>())}; */}
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: "white",
    flex: 1,
  },
});
