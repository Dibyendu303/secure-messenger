import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import UserItem from "../components/UserItem";
import userData from "../assets/dummy-data/Users";
import { DataStore } from "aws-amplify";
import { User } from "../src/models";

export default function UsersScreen() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // query users
    const fetchUsers = async () => {
      try {
        console.log("Fetching users");
        const fetchedUsers = await DataStore.query(User);
        setUsers(fetchedUsers);
        console.log("Successfully fetched users");
        console.log(fetchedUsers);
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
