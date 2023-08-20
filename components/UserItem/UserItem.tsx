import React from "react";
import { Text, View, Image, Pressable } from "react-native";
import styles from "./styles";
import { Feather } from "@expo/vector-icons";

const ChatRoomItem = ({
  user,
  onPress,
  isSelected,
  onLongPress,
  isAdmin = false,
}) => {
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.container}
    >
      <Image
        source={{
          uri:
            user.imageUri ??
            "https://dib-aws-bucket.s3.ap-south-1.amazonaws.com/user_icon.png",
        }}
        style={styles.image}
      />
      <View style={styles.rightContainer}>
        <View style={styles.row}>
          <Text style={styles.name}>{user.name}</Text>
        </View>
        {isAdmin && <Text style={{ color: "darkgray" }}>Admin</Text>}
      </View>
      {isSelected !== undefined && (
        <Feather
          name={isSelected ? "check-circle" : "circle"}
          size={24}
          color="black"
        />
      )}
    </Pressable>
  );
};

export default ChatRoomItem;
