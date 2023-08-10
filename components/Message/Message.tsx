import { View, Text, ActivityIndicator, Pressable } from "react-native";
import React, { useEffect, useState } from "react";
import styles from "./styles";
import { User } from "../../src/models";
import { Auth, DataStore, Storage } from "aws-amplify";
import { S3Image } from "aws-amplify-react-native";
import AudioPlayer from "../AudioPlayer/AudioPlayer";
import { Ionicons } from "@expo/vector-icons";
import { Message as MessageModel } from "../../src/models";

const Message = (props) => {
  const { setAsMessageReply, message: propMessage } = props;
  const [message, setMessage] = useState<MessageModel>(propMessage);
  const [user, setUser] = useState<User | undefined>();
  const [isReceived, setIsReceived] = useState<boolean | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);

  useEffect(() => {
    DataStore.query(User, message.userID).then(setUser);
  }, []);

  useEffect(() => {
    setMessage(propMessage);
  }, [propMessage]);

  useEffect(() => {
    const subscription = DataStore.observe(MessageModel, message.id).subscribe(
      (msg) => {
        if (msg.model === MessageModel && msg.opType === "UPDATE") {
          setMessage((message) => ({ ...message, ...msg.element }));
        }
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    loadAudioUri();
  }, [message]);

  useEffect(() => {
    setAsRead();
  }, [isReceived, message]);

  useEffect(() => {
    const checkIfReceived = async () => {
      if (!user) return;
      const authUser = await Auth.currentAuthenticatedUser();
      setIsReceived(user.id !== authUser.attributes.sub);
    };
    checkIfReceived();
  }, [user]);

  const setAsRead = async () => {
    if (isReceived === true && message.status !== "READ") {
      console.log("Set to READ: ", message.content);
      await DataStore.save(
        MessageModel.copyOf(message, (updated) => {
          updated.status = "READ";
        })
      );
    }
  };

  const loadAudioUri = async () => {
    if (!message.audio) return;
    try {
      const resp = await Storage.get(message.audio);
      setAudioUri(resp);
    } catch (e) {
      console.log("Error in retreiving audio from S3 storage");
      console.log(e);
    }
  };

  if (!user || isReceived === null) {
    return <ActivityIndicator />;
  }

  return (
    <Pressable
      onLongPress={() => setAsMessageReply(message)}
      style={[
        styles.container,
        isReceived
          ? styles.receivedMessageContainer
          : styles.sentMessageContainer,
      ]}
    >
      <View style={styles.innerContainer}>
        {audioUri && (
          <View style={{ width: 230, marginBottom: message.content ? 5 : 0 }}>
            <AudioPlayer recordingUri={audioUri} />
          </View>
        )}
        {message.image && (
          <View
            style={{ width: "100%", marginBottom: message.content ? 5 : 0 }}
          >
            <S3Image
              imgKey={message.image}
              style={{
                width: "100%",
                aspectRatio: 4 / 3,
              }}
              resizeMode="cover"
              handleOnLoad={() => console.log("da-ta!")}
            />
          </View>
        )}
        {message.content && (
          <Text style={isReceived ? styles.receivedText : styles.sentText}>
            {message.content}
          </Text>
        )}
      </View>
      {!isReceived && message.status && (
        <View style={styles.statusContainer}>
          <Ionicons
            name={
              message.status === "DELIVERED"
                ? "checkmark"
                : message.status === "SENT"
                ? "time-outline"
                : "checkmark-done"
            }
            size={13}
            color="grey"
          />
        </View>
      )}
    </Pressable>
  );
};

export default Message;
