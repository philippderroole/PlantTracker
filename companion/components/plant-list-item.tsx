import { Plant } from "@/types/plant";
import * as React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import Checkbox from "./checkbox";

export default function PlantListItem({ plant }: { plant: Plant }) {
    return (
        <View style={styles.view}>
            <Image style={styles.plantImageIcon} resizeMode="cover" />
            <View style={styles.textArea}>
                <Text style={[styles.plantName, styles.cuthuluFlexBox]}>
                    {plant.name}
                </Text>
                <Text style={[styles.speciesText, styles.cuthuluFlexBox]}>
                    {plant.species}
                </Text>
            </View>
            <View style={styles.trailing}>
                <Checkbox />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    cuthuluFlexBox: {
        textAlign: "left",
        color: "#000",
        fontFamily: "Inter-Regular",
        alignSelf: "stretch",
    },
    view: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        paddingRight: 16,
        gap: 16,
        flex: 1,
    },
    plantImageIcon: {
        height: 70,
        width: 70,
        borderRadius: 45,
    },
    textArea: {
        flex: 1,
    },
    plantName: {
        fontSize: 24,
    },
    speciesText: {
        fontSize: 14,
    },
    trailing: {
        justifyContent: "center",
    },
});
