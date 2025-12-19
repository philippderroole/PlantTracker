import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";

import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Fonts } from "@/constants/theme";
import { Plant } from "@/types/plant";

export default function TabTwoScreen() {
    const router = useRouter();
    const [plants, setPlants] = useState<Plant[]>([
        {
            id: "1",
            name: "Monstera",
            species: "Monstera deliciosa",
            imageUri: "https://reactnative.dev/img/tiny_logo.png",
            lastWatered: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            wateringFrequency: 7,
        },
        {
            id: "2",
            name: "Pothos",
            species: "Epipremnum aureum",
            imageUri: "https://reactnative.dev/img/tiny_logo.png",
            lastWatered: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            wateringFrequency: 5,
        },
        {
            id: "3",
            name: "Snake Plant",
            species: "Sansevieria trifasciata",
            imageUri: "https://reactnative.dev/img/tiny_logo.png",
            lastWatered: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
            wateringFrequency: 14,
        },
    ]);

    const onPressFunction = (plant: Plant) => {
        router.push({
            pathname: "/plant-detail",
            params: { plant: JSON.stringify(plant) },
        });
    };

    const handleAddPlant = () => {
        console.log("Add new plant");
    };

    return (
        <View style={styles.screenContainer}>
            <ParallaxScrollView
                headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
                headerImage={
                    <IconSymbol
                        size={310}
                        color="#808080"
                        name="chevron.left.forwardslash.chevron.right"
                        style={styles.headerImage}
                    />
                }
            >
                <ThemedView style={styles.titleContainer}>
                    <ThemedText
                        type="title"
                        style={{
                            fontFamily: Fonts.rounded,
                        }}
                    >
                        Your plants
                    </ThemedText>
                </ThemedView>
                <View style={styles.plantsList}>
                    {plants.map((plant) => (
                        <Pressable
                            key={plant.id}
                            style={styles.plantCard}
                            onPress={() => onPressFunction(plant)}
                        >
                            <Image
                                style={styles.plantImage}
                                source={{
                                    uri: plant.imageUri,
                                }}
                            />
                            <View style={styles.plantInfo}>
                                <ThemedText
                                    type="subtitle"
                                    style={styles.plantName}
                                >
                                    {plant.name}
                                </ThemedText>
                                <ThemedText style={styles.plantSpecies}>
                                    {plant.species}
                                </ThemedText>
                                {plant.lastWatered && (
                                    <ThemedText style={styles.plantDetails}>
                                        Last watered:{" "}
                                        {Math.floor(
                                            (Date.now() -
                                                plant.lastWatered.getTime()) /
                                                (24 * 60 * 60 * 1000)
                                        )}{" "}
                                        days ago
                                    </ThemedText>
                                )}
                                {plant.wateringFrequency && (
                                    <ThemedText style={styles.plantDetails}>
                                        Water every {plant.wateringFrequency}{" "}
                                        days
                                    </ThemedText>
                                )}
                            </View>
                        </Pressable>
                    ))}
                </View>
            </ParallaxScrollView>
            <Pressable style={styles.fab} onPress={handleAddPlant}>
                <IconSymbol name="plus" size={24} color="white" />
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    screenContainer: {
        flex: 1,
        position: "relative",
    },
    headerImage: {
        color: "#808080",
        bottom: -90,
        left: -35,
        position: "absolute",
    },
    titleContainer: {
        flexDirection: "row",
        gap: 8,
    },
    fab: {
        position: "absolute",
        bottom: 30,
        right: 30,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "#4CAF50",
        justifyContent: "center",
        alignItems: "center",
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
        zIndex: 10,
    },
    plantsList: {
        paddingHorizontal: 8,
        paddingBottom: 20,
        gap: 12,
        flexDirection: "column",
    },
    plantCard: {
        flexDirection: "row",
        borderRadius: 12,
        overflow: "hidden",
        backgroundColor: "#e8f5e9",
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        minHeight: 100,
    },
    plantImage: {
        width: 100,
        height: 100,
    },
    plantInfo: {
        flex: 1,
        padding: 12,
        justifyContent: "space-between",
    },
    plantName: {
        fontWeight: "600",
        marginBottom: 4,
    },
    plantSpecies: {
        fontSize: 12,
        fontStyle: "italic",
        marginBottom: 8,
    },
    plantDetails: {
        fontSize: 12,
        marginTop: 2,
    },
});
