import {
  SafeAreaView,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import Message from "../components/Message";
import MessageInput from "../components/MessageInput";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ChatRoom, Message as MessageModel } from "../src/models";
import { DataStore, SortDirection } from "aws-amplify";

const ChatRoomScreen = () => {
  const [messages, setMessages] = useState<MessageModel[]>([]);
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const [messageReplyTo, setMessageReplyTo] = useState<MessageModel | null>(
    null
  );

  const route = useRoute();
  const navigation = useNavigation();

  useEffect(() => {
    fetchChatRoom();
  }, []);

  useEffect(() => {
    const subscription = DataStore.observe(MessageModel).subscribe((msg) => {
      if (msg.model === MessageModel && msg.opType === "INSERT") {
        setMessages((previousState) => [msg.element, ...previousState]);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!chatRoom) return;
    fetchMessages(chatRoom);
  }, [chatRoom]);

  const fetchChatRoom = async () => {
    if (!route.params?.id) {
      console.warn("No chat room id provided");
      return;
    }
    const chatRoom = await DataStore.query(ChatRoom, route.params.id);
    if (!chatRoom) {
      console.error(
        "Could not find a chat room with this id: ",
        route.params.id
      );
    } else {
      setChatRoom(chatRoom);
    }
  };

  const fetchMessages = async (chatRoom) => {
    const fetchedMessages = await DataStore.query(
      MessageModel,
      (message) => message.chatroomID.eq(chatRoom.id),
      {
        sort: (s) => s.createdAt(SortDirection.DESCENDING),
      }
    );
    setMessages(fetchedMessages);
  };

  // navigation.setOptions({ titile: "Elon Musk" });

  if (!chatRoom) {
    return <ActivityIndicator />;
  }

  return (
    <SafeAreaView style={styles.page}>
      <FlatList
        data={messages}
        renderItem={({ item }) => (
          <Message
            message={item}
            setAsMessageReply={() => setMessageReplyTo(item)}
          />
        )}
        inverted
      />
      <MessageInput
        chatRoom={chatRoom}
        messageReplyTo={messageReplyTo}
        setMessageReplyTo={setMessageReplyTo}
      />
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
