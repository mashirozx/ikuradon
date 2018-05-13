import React from "react";
import {
    Text,
    Image,
    TextInput,
    StyleSheet,
    Modal,
    Picker,
    View
} from "react-native";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as TootActions from "../actions/actioncreators/toot";
import { FontAwesome } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import I18n from "../i18n";
import VisibilityIcon from "./visibilityicon";
import { bodyFormat } from "../util/parser";
import * as Permission from "../util/permission";
import { ImagePicker } from "expo";
import Networking from "../networking";
import * as Session from "../util/session";
import { MessageBarManager } from "react-native-message-bar";

const MAX_TOOT_LENGTH = 500;

class Toot extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            nsfwFlag: false,
            text: "",
            warning: "",
            visibilityModal: false,
            visibility: "public",
            reply: null,
        };
        //reply
        if (props.navReducer.reply !== null && typeof props.navReducer.reply === "object") {
            this.state.reply = {
                id: props.navReducer.reply.id,
                tootid: props.navReducer.reply.tootid,
                user: props.navReducer.reply.user,
                acct: props.navReducer.reply.acct,
                body: props.navReducer.reply.body,
                image: props.navReducer.reply.image
            };
            this.state.text = this.state.reply.acct + " ";
        }
    }
    render() {
        return (
            <View style={styles.container}>
                {this.replyText()}
                {this.toggleCwText()}
                <TextInput
                    placeholder={I18n.t("toot_placeholder")}
                    style={styles.toottext}
                    onChangeText={(text) => this.setState({ text })}
                    value={this.state.text}
                    maxLength={MAX_TOOT_LENGTH}
                    multiline={true}
                />
                <View style={styles.buttonview}>
                    <View style={styles.tootbuttonview}>
                        <TouchableOpacity style={styles.button} onPress={() => this.mediaOpen("library")}>
                            <FontAwesome name="picture-o" size={30} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button} onPress={() => this.mediaOpen("camera")}>
                            <FontAwesome name="camera" size={30} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button} onPress={() => this.setState({ visibilityModal: true })}>
                            <VisibilityIcon visibility={this.state.visibility} color="#1E90FF" size={30} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button} onPress={() => this.setState({ nsfwFlag: !this.state.nsfwFlag })}>
                            <Text style={this.toggleCwColor()}>CW</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.tootbuttonview}>
                        <View style={styles.button}>
                            <Text style={styles.textlimit}>{MAX_TOOT_LENGTH - this.state.text.length - this.state.warning.length}</Text>
                        </View>
                        <TouchableOpacity style={styles.tootbutton} onPress={() => this.props.TootActions.toot(this.state.text, this.state.visibility, this.state.nsfwFlag, this.state.warning, this.state.reply)}>
                            <Text style={styles.texttoot}>Toot!</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={this.state.visibilityModal}
                >
                    <View>
                        <Picker
                            selectedValue={this.state.visibility}
                            onValueChange={(visibility) => this.setState({ visibility })}>
                            <Picker.Item label={I18n.t("toot_visibility_public")} value="public" />
                            <Picker.Item label={I18n.t("toot_visibility_unlisted")} value="unlisted" />
                            <Picker.Item label={I18n.t("toot_visibility_private")} value="private" />
                            <Picker.Item label={I18n.t("toot_visibility_direct")} value="direct" />
                        </Picker>
                        <TouchableOpacity onPress={() => this.setState({ visibilityModal: false })}>
                            <Text>{I18n.t("global_ok")}</Text>
                        </TouchableOpacity>
                    </View>
                </Modal>
            </View>
        );
    }

    toggleCwColor() {
        if (this.state.nsfwFlag) {
            return [styles.textcw, { color: "#1E90FF" }];
        } else {
            return styles.textcw;
        }
    }

    //warningとtoot、合わせて500文字
    toggleCwText() {
        if (this.state.nsfwFlag) {
            return <TextInput
                placeholder={I18n.t("toot_cw_placeholder")}
                style={styles.warningtext}
                onChangeText={(warning) => this.setState({ warning })}
                value={this.state.warning}
                maxLength={MAX_TOOT_LENGTH}
                multiline={false}
            />;
        } else {
            return;
        }
    }
    replyText() {
        if (!this.state.reply) {
            return;
        }
        return <View style={styles.reply}>
            <View style={styles.replyHeader}>
                <Image source={{ uri: this.state.reply.image }} style={styles.replyPhoto} />
                <Text style={styles.replyName} ellipsizeMode='tail' numberOfLines={1}>{this.state.reply.user + " " + this.state.reply.acct}</Text>
            </View>
            <Text style={styles.replyBody} ellipsizeMode='tail' numberOfLines={3} >{bodyFormat(this.state.reply.body)}</Text>
        </View>;
    }

    //とりあえず画像だけで
    async mediaOpen(openType){
        /*
        let fileData;
        try {
            if (openType === "library") {
                await Permission.getBeforeAsk(Permission.CAMERA_ROLL);
                fileData = await ImagePicker.launchImageLibraryAsync();
            }
            if (openType === "camera") {
                await Permission.getBeforeAsk(Permission.CAMERA);
                fileData = await ImagePicker.launchCameraAsync();
            }
            if (!fileData || fileData.cancelled) {
                return;
            }
            console.log(Session);
            let { domain, access_token } = await Session.getDomainAndToken();
            //アップロード中とかほしいね
            let res = await Networking.fileUpload(domain, access_token, fileData, "image/jpeg");
        } catch (e) {
            MessageBarManager.showAlert({
                title: I18n.t("messages.toot_mediaopen_failed"),
                message: e.message,
                alertType: "error",
            });
        }
        return;
        */
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    toottext: {
        height: 180,
        margin: 5,
        padding: 5,
        borderWidth: 1
    },
    warningtext: {
        height: 30,
        margin: 5,
        padding: 5,
        borderWidth: 1
    },
    buttonview: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    tootbuttonview: {
        width: 120,
        height: 40,
        flexDirection: "row",
    },
    button: {
        width: 40,
        height: 40,
        margin: 5,
        alignItems: "center",
    },
    tootbutton: {
        width: 80,
        height: 40,
        margin: 5,
        alignItems: "center",
    },
    reply: {
        backgroundColor: "#D2E5FF",
        margin: 5,
        padding: 5,
        borderRadius: 5,
    },
    replyHeader: {
        alignItems: "center",
        flexDirection: "row",
        height: 26,
        margin: 2,
    },
    replyPhoto: {
        margin: 3,
        height: 24,
        width: 24,
        borderRadius: 4
    },
    replyName: {
        width: 26,
        fontSize: 16,
        flex: 1,
        flexWrap: "wrap"
    },
    replyBody: {
        margin: 2,
        paddingTop: 3,
        paddingBottom: 3,
        fontSize: 12,
    },
    textcw: {
        fontSize: 24,
    },
    textvisibility: {
        fontSize: 12,
    },
    textlimit: {
        fontSize: 20,
    },
    texttoot: {
        fontSize: 20,
        color: "#00008B"
    }
});

export default connect(state => state,
    (dispatch) => ({
        TootActions: bindActionCreators(TootActions, dispatch)
    })
)(Toot);