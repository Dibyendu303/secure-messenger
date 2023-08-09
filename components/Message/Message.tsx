import { View, Text, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import styles from "./styles";
import { User } from "../../src/models";
import { Auth, DataStore } from "aws-amplify";
import { S3Image } from "aws-amplify-react-native";

const Message = ({ message }) => {
  const [user, setUser] = useState<User | undefined>();
  const [isReceived, setIsReceived] = useState(false);
  useEffect(() => {
    DataStore.query(User, message.userID).then(setUser);
  }, []);

  useEffect(() => {
    const checkIfReceived = async () => {
      if (!user) return;
      const authUser = await Auth.currentAuthenticatedUser();
      setIsReceived(user.id !== authUser.attributes.sub);
    };
    checkIfReceived();
  }, [user]);

  if (!user) {
    return <ActivityIndicator />;
  }

  return (
    <View
      style={[
        styles.container,
        isReceived
          ? styles.receivedMessageContainer
          : styles.sentMessageContainer,
      ]}
    >
      {message.image && (
        <View style={{ width: "75%", marginBottom: message.content ? 5 : 0 }}>
          <S3Image
            imgKey={message.image}
            style={{
              width: "100%",
              aspectRatio: 4 / 3,
            }}
            resizeMode="cover"
          />
        </View>
      )}
      {message.content && (
        <Text style={isReceived ? styles.receivedText : styles.sentText}>
          {message.content}
        </Text>
      )}
    </View>
  );
};

export default Message;
