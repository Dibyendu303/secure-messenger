import React from "react";
import { View, StyleSheet, FlatList } from "react-native";
import UserItem from "../components/UserItem";
import userData from "../assets/dummy-data/Users";

export default function UsersScreen() {
  return (
    <View style={styles.page}>
      <FlatList
        data={userData}
        renderItem={({ item }) => <UserItem user={item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: "white",
    flex: 1,
  },
});
