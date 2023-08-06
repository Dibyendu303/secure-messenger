import { View, Text } from "react-native";
import React from "react";
import styles from "./styles";

const myID = "u1";

const Message = ({ message }) => {
  const isReceived = message.user.id !== myID;
  return (
    <View
      style={[
        styles.container,
        isReceived
          ? styles.receivedMessageContainer
          : styles.sentMessageContainer,
      ]}
    >
      <Text style={isReceived ? styles.receivedText : styles.sentText}>
        {message.content}
      </Text>
    </View>
  );
};

export default Message;
