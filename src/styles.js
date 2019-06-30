import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: "#00000077",
    },
    mask: {
        flex: 1,
        backgroundColor: "transparent"
    },
    container: {
        backgroundColor: "#fff",
        overflow: "hidden",
    },
    sides: {
        width: 0,
        height: "100%"
    },
    upDown: {
        width: "100%",
        height: 0
    }
});

export default styles;