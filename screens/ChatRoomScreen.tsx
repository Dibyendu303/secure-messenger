import { SafeAreaView, StyleSheet, FlatList } from "react-native";
import React from "react";
import Message from "../components/Message";
import MessageData from "../assets/dummy-data/Chats";
import MessageInput from "../components/MessageInput";
import { useNavigation, useRoute } from "@react-navigation/native";

const ChatRoomScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  console.warn(route.params?.id);

  navigation.setOptions({ titile: "Elon Musk" });

  return (
    <SafeAreaView style={styles.page}>
      <FlatList
        data={MessageData.messages}
        renderItem={({ item }) => <Message message={item} />}
      />
      <MessageInput />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: "white",
    flex: 1,
  },
});

export default ChatRoomScreen;
