import * as React from "react";
import { Image, StyleSheet, TouchableHighlight, View } from "react-native";

export default function Checkbox({ onClick }: { onClick?: () => void }) {
    const [checked, setChecked] = React.useState<boolean>(false);

    return (
        <TouchableHighlight onPress={() => setChecked(!checked)}>
            {checked ? <Checked /> : <Unckecked />}
        </TouchableHighlight>
    );
}

function Unckecked() {
    return <View style={[styles.checkedfalse, styles.checkLayout]}></View>;
}

function Checked() {
    return (
        <View style={[styles.checkedtrue, styles.checkLayout]}>
            <View style={[styles.check, styles.checkLayout]}>
                <Image style={styles.icon} resizeMode="cover" />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    checkLayout: {
        height: 32,
        width: 32,
        position: "absolute",
    },
    checkedfalse: {
        top: 72,
        borderStyle: "solid",
        borderColor: "#5ea86e",
        borderWidth: 2,
        justifyContent: "center",
        borderRadius: 100,
        left: 20,
        width: 32,
    },
    checkedtrue: {
        top: 20,
        backgroundColor: "#5ea86e",
        borderRadius: 100,
        left: 20,
        width: 32,
    },
    check: {
        top: 0,
        left: 0,
        overflow: "hidden",
    },
    icon: {
        height: "45.94%",
        width: "66.56%",
        top: "25%",
        right: "16.77%",
        bottom: "29.06%",
        left: "16.67%",
        maxWidth: "100%",
        maxHeight: "100%",
        position: "absolute",
        overflow: "hidden",
    },
});
