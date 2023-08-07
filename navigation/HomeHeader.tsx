import { View, Text, Image, Pressable } from "react-native";
import React from "react";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const HomeHeader = (props) => {
  const navigation = useNavigation();
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
      }}
    >
      <Image
        source={{
          uri: "https://notjustdev-dummy.s3.us-east-2.amazonaws.com/avatars/vadim.jpg",
        }}
        style={{ width: 30, height: 30, borderRadius: 30 }}
      />
      <Text
        style={{
          flex: 1,
          textAlign: "center",
          fontWeight: "bold",
          marginLeft: 35,
        }}
      >
        Signal
      </Text>
      <Feather
        name="camera"
        size={24}
        color="black"
        style={{ marginRight: 20 }}
      />
      <Pressable onPress={() => navigation.navigate("UsersScreen")}>
        <Feather name="edit-2" size={24} color="black" />
      </Pressable>
    </View>
  );
};

export default HomeHeader;
