import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    padding: 10,
    margin: 10,
    borderRadius: 10,
    maxWidth: "75%",
  },
  sentMessageContainer: {
    marginLeft: "auto",
    marginRight: 10,
    backgroundColor: "lightgrey",
  },
  receivedMessageContainer: {
    marginLeft: 10,
    marginRight: "auto",
    backgroundColor: "#3777f0",
  },
  sentText: {
    color: "black",
  },
  receivedText: {
    color: "white",
  },
});

export default styles;
