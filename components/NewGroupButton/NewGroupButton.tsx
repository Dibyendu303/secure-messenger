import { View, Text, Pressable } from "react-native";
import React from "react";
import { FontAwesome } from "@expo/vector-icons";

const NewGroupButton = () => {
  return (
    <Pressable>
      <View style={{ flexDirection: "row", padding: 10, alignItems: "center" }}>
        <FontAwesome name="group" size={24} color="#4f4f4f" />
        <Text>New Group</Text>
      </View>
    </Pressable>
  );
};

export default NewGroupButton;
