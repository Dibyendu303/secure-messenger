import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  audioContainer: {
    borderRadius: 10,
    backgroundColor: "white",
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    alignSelf: "stretch",
    flex: 1,
  },
  audioProgressBarContainer: {
    marginHorizontal: 15,
    // backgroundColor: "lightgreen",
    flex: 1,
  },
  audioProgressBar: {
    backgroundColor: "lightgray",
    height: 5,
    width: "100%",
    position: "relative",
  },
  audioProgressBarCircle: {
    backgroundColor: "#3777f0",
    height: 12,
    width: 12,
    position: "absolute",
    top: -3.5,
    borderRadius: 100,
  },
});

export default styles;
