import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import UserItem from "../components/UserItem";
import { DataStore } from "aws-amplify";
import { User } from "../src/models";
import NewGroupButton from "../components/NewGroupButton";

export default function UsersScreen() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // query users
    const fetchUsers = async () => {
      try {
        const fetchedUsers = await DataStore.query(User);
        setUsers(fetchedUsers);
      } catch (e) {
        console.log("Unable to fetch users from Datastore");
        console.log(e);
      }
    };
    fetchUsers();
  }, []);

  return (
    <View style={styles.page}>
      <FlatList
        data={users}
        renderItem={({ item }) => <UserItem user={item} />}
        ListHeaderComponent={NewGroupButton}
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
