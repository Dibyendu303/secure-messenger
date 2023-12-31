import { View, Text, ActivityIndicator, Pressable, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import { S3Image } from "aws-amplify-react-native";
import { Auth, DataStore, Storage } from "aws-amplify";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useActionSheet } from "@expo/react-native-action-sheet";
import styles from "./styles";
import { User } from "../../src/models";
import AudioPlayer from "../AudioPlayer/AudioPlayer";
import { Message as MessageModel } from "../../src/models";
import MessageReply from "../MessageReply/MessageReply";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PRIVATE_KEY } from "../../screens/SettingsScreen";
import { useNavigation } from "@react-navigation/native";
import { box } from "tweetnacl";
import { decrypt, stringToUint8Array } from "../../utils/crypto";

const Message = (props) => {
  const { setAsMessageReply, message: propMessage } = props;
  const [message, setMessage] = useState<MessageModel>(propMessage);
  const [decryptedMessage, setDecryptedMessage] = useState<string>("");
  const [user, setUser] = useState<User | undefined>();
  const [isReceived, setIsReceived] = useState<boolean | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState<MessageModel | null>(null);
  const [isDeleted, setIsDeleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();

  const { showActionSheetWithOptions } = useActionSheet();

  useEffect(() => {
    DataStore.query(User, message.userID).then(setUser);
  }, []);

  useEffect(() => {
    decryptMessage();
  }, [message, user]);

  useEffect(() => {
    getReplyMessage();
    setMessage(propMessage);
  }, [propMessage]);

  useEffect(() => {
    const subscription = DataStore.observe(MessageModel, message.id).subscribe(
      (msg) => {
        if (msg.model === MessageModel) {
          if (msg.opType === "UPDATE") {
            setMessage((message) => ({ ...message, ...msg.element }));
          } else if (msg.opType === "DELETE") {
            setIsDeleted(true);
          }
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

  const decryptMessage = async () => {
    if (!message?.content || !user?.publicKey) {
      return;
    }
    const ourSecretKeyString = await AsyncStorage.getItem(PRIVATE_KEY);
    if (!ourSecretKeyString) {
      Alert.alert(
        `You haven't generated your key pair yet.`,
        `Go to settings and generate a new key pair`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Go to Settings",
            onPress: () => navigation.navigate("Settings"),
            style: "default",
          },
        ]
      );
      return;
    }
    try {
      const ourSecretKey = stringToUint8Array(ourSecretKeyString);
      const sharedKey = box.before(
        stringToUint8Array(user.publicKey),
        ourSecretKey
      );

      const decryptedMessage = decrypt(sharedKey, message.content);
      setDecryptedMessage(decryptedMessage.message);
      setIsLoading(false);
    } catch (e) {
      console.log("Error in decrypting message. ");
    }
  };
  const getReplyMessage = async () => {
    if (!message?.replyTo) return;
    const replyMsg = await DataStore.query(MessageModel, message.replyTo);
    setReplyMessage(replyMsg);
  };

  const setAsRead = async () => {
    if (isReceived === true && message.status !== "READ") {
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
      console.log("Error in retreiving audio from S3 storage. ", e);
    }
  };

  const deleteMessage = async () => {
    try {
      const toDelete = await DataStore.query(MessageModel, message.id);
      if (toDelete) {
        await DataStore.delete(toDelete);
        setIsDeleted(true);
      }
    } catch (e) {
      console.log(`Unable to delete message: ${message.id}`, e);
    }
  };

  const confirmDelete = () => {
    Alert.alert("Delete message", "Are you sure want to delete this message?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        onPress: deleteMessage,
        style: "destructive",
      },
    ]);
  };

  const onActionPress = (index) => {
    if (index === 0) {
      setAsMessageReply(message);
    } else {
      if (isReceived) {
        Alert.alert("Can't perform action", "This is not your message");
      } else if (!isDeleted) {
        confirmDelete();
      }
    }
  };

  const openActionMenu = () => {
    const options = ["Reply", "Delete", "Cancel"];
    const destructiveButtonIndex = 1;
    const cancelButtonIndex = 2;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        destructiveButtonIndex,
      },
      onActionPress
    );
  };

  if (!user || isReceived === null) {
    return <ActivityIndicator />;
  }

  if (isLoading) {
    return <ActivityIndicator />;
  }

  return (
    <Pressable
      onLongPress={openActionMenu}
      style={[
        styles.container,
        isReceived
          ? styles.receivedMessageContainer
          : styles.sentMessageContainer,
        {
          paddingRight: isReceived || replyMessage ? 10 : 5,
        },
      ]}
    >
      {isDeleted ? (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 5,
            paddingHorizontal: 5,
          }}
        >
          <MaterialCommunityIcons name="cancel" size={14} color="grey" />
          <Text style={{ color: "grey" }}>Message Deleted</Text>
        </View>
      ) : (
        <>
          {replyMessage && <MessageReply message={replyMessage} />}
          <View style={styles.row}>
            <View style={styles.innerContainer}>
              {audioUri && (
                <View
                  style={{ width: 230, marginBottom: message.content ? 5 : 0 }}
                >
                  <AudioPlayer recordingUri={audioUri} />
                </View>
              )}
              {message.image && (
                <View
                  style={{
                    width: "100%",
                    marginBottom: message.content ? 5 : 0,
                  }}
                >
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
                <Text
                  style={isReceived ? styles.receivedText : styles.sentText}
                >
                  {decryptedMessage}
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
          </View>
        </>
      )}
    </Pressable>
  );
};

export default Message;
{
  /*  */
}
