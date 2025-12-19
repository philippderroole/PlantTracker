import { useNavigation } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useLayoutEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Fonts } from "@/constants/theme";

export default function PlantDetailScreen() {
    const router = useRouter();
    const navigation = useNavigation();
    const params = useLocalSearchParams();

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: false,
        });
    }, [navigation]);

    // Parse the plant data from route params
    const plant = params.plant ? JSON.parse(params.plant as string) : null;

    if (!plant) {
        return (
            <View style={styles.container}>
                <ThemedText>Plant not found</ThemedText>
            </View>
        );
    }

    return (
        <View style={styles.screenContainer}>
            <ParallaxScrollView
                headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
                headerImage={
                    <IconSymbol
                        size={310}
                        color="#808080"
                        name="leaf.fill"
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
                        {plant.name}
                    </ThemedText>
                </ThemedView>

                <ThemedView style={styles.infoSection}>
                    <ThemedText type="subtitle">Plant Information</ThemedText>
                    <ThemedView style={styles.infoItem}>
                        <ThemedText style={styles.label}>Species:</ThemedText>
                        <ThemedText>{plant.species}</ThemedText>
                    </ThemedView>

                    {plant.wateringFrequency && (
                        <ThemedView style={styles.infoItem}>
                            <ThemedText style={styles.label}>
                                Water every:
                            </ThemedText>
                            <ThemedText>
                                {plant.wateringFrequency} days
                            </ThemedText>
                        </ThemedView>
                    )}

                    {plant.lastWatered && (
                        <ThemedView style={styles.infoItem}>
                            <ThemedText style={styles.label}>
                                Last watered:
                            </ThemedText>
                            <ThemedText>
                                {Math.floor(
                                    (Date.now() -
                                        new Date(plant.lastWatered).getTime()) /
                                        (24 * 60 * 60 * 1000)
                                )}{" "}
                                days ago
                            </ThemedText>
                        </ThemedView>
                    )}
                </ThemedView>

                <ThemedView style={styles.actionSection}>
                    <Pressable style={styles.actionButton}>
                        <IconSymbol name="drop.fill" size={20} color="white" />
                        <ThemedText style={styles.actionButtonText}>
                            Water Now
                        </ThemedText>
                    </Pressable>
                    <Pressable style={styles.actionButton}>
                        <IconSymbol name="pencil" size={20} color="white" />
                        <ThemedText style={styles.actionButtonText}>
                            Edit
                        </ThemedText>
                    </Pressable>
                </ThemedView>
            </ParallaxScrollView>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
                <IconSymbol name="chevron.left" size={24} color="white" />
                <ThemedText style={styles.backText}>Back</ThemedText>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    screenContainer: {
        flex: 1,
        position: "relative",
    },
    headerImage: {
        bottom: -90,
        left: -35,
        position: "absolute",
    },
    backButton: {
        position: "absolute",
        top: 50,
        left: 16,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 8,
        gap: 4,
        zIndex: 10,
    },
    backText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
    titleContainer: {
        paddingHorizontal: 16,
        marginBottom: 20,
    },
    infoSection: {
        marginHorizontal: 16,
        marginBottom: 24,
        padding: 16,
        borderRadius: 12,
        backgroundColor: "#e8f5e9",
    },
    infoItem: {
        marginTop: 12,
        paddingVertical: 8,
    },
    label: {
        fontWeight: "600",
        marginBottom: 4,
    },
    actionSection: {
        marginHorizontal: 16,
        marginBottom: 24,
        gap: 12,
    },
    actionButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: "#4CAF50",
        gap: 8,
    },
    actionButtonText: {
        color: "white",
        fontWeight: "600",
        fontSize: 16,
    },
});
