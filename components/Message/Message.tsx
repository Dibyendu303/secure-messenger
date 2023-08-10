import { View, Text, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import styles from "./styles";
import { User } from "../../src/models";
import { Auth, DataStore, Storage } from "aws-amplify";
import { S3Image } from "aws-amplify-react-native";
import AudioPlayer from "../AudioPlayer/AudioPlayer";

const Message = ({ message }) => {
  const [user, setUser] = useState<User | undefined>();
  const [isReceived, setIsReceived] = useState(false);
  const [audioUri, setAudioUri] = useState<string | null>(null);

  useEffect(() => {
    DataStore.query(User, message.userID).then(setUser);
  }, []);

  useEffect(() => {
    loadAudioUri();
  }, [message]);

  useEffect(() => {
    const checkIfReceived = async () => {
      if (!user) return;
      const authUser = await Auth.currentAuthenticatedUser();
      setIsReceived(user.id !== authUser.attributes.sub);
    };
    checkIfReceived();
  }, [user]);

  const loadAudioUri = async () => {
    if (!message.audio) return;
    try {
      const resp = await Storage.get(message.audio);
      console.log(
        "Successfully retreived audio from S3 storage for message: ",
        message.content
      );
      setAudioUri(resp);
    } catch (e) {
      console.log("Error in retreiving audio from S3 storage");
      console.log(e);
    }
  };

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
      {audioUri && (
        <View style={{ width: 250, marginBottom: message.content ? 5 : 0 }}>
          <AudioPlayer recordingUri={audioUri} />
        </View>
      )}
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
