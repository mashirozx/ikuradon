import React from "react";
import Mastolist from "../mastolist";
import { View, StyleSheet } from "react-native";
import MessageBarComponent from "../messagebar";

export default class Notifications extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return <View style={styles.container}>
            <Mastolist type={"notifications"}/>
            <MessageBarComponent refName="notifications_alert" />
        </View>;
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
});