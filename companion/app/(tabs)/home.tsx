import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import ParallaxScrollView from "@/components/parallax-scroll-view";
import PlantListItem from "@/components/plant-list-item";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Fonts } from "@/constants/theme";
import { Plant } from "@/types/plant";
import { Task } from "@/types/task";

export default function HomeScreen() {
    const [tasks, setTasks] = useState<Task[]>([
        {
            id: "1",
            title: "Water the plants",
            completed: false,
            plantId: "1",
        },
    ]);

    const plants: Plant[] = [
        {
            id: "1",
            name: "Monstera",
            species: "Monstera deliciosa",
            imageUri: "https://reactnative.dev/img/tiny_logo.png",
            lastWatered: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            wateringFrequency: 7,
        },
    ];

    return (
        <ParallaxScrollView
            headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
            headerImage={
                <IconSymbol
                    size={310}
                    color="#808080"
                    name="checkmark.circle"
                    style={styles.headerImage}
                />
            }
        >
            <ThemedView style={styles.titleContainer}>
                <ThemedText type="title" style={{ fontFamily: Fonts.rounded }}>
                    Tasks
                </ThemedText>
            </ThemedView>
            {tasks.length === 0 ? (
                <ThemedView style={styles.emptyContainer}>
                    <ThemedText style={styles.emptyText}>
                        No tasks yet. Add one with the + button!
                    </ThemedText>
                </ThemedView>
            ) : (
                <TaskList plants={plants} />
            )}
        </ParallaxScrollView>
    );
}

function TaskList({ plants }: { plants: Plant[] }) {
    return (
        <View style={styles.view}>
            <Text style={styles.water}>Water</Text>
            {plants.map((plant) => (
                <PlantListItem plant={plant} key={plant.id} />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    titleContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    headerImage: {
        bottom: -90,
        left: -35,
        position: "absolute",
    },
    emptyContainer: {
        paddingVertical: 40,
        alignItems: "center",
    },
    emptyText: {
        textAlign: "center",
    },
    listContainer: {
        marginBottom: 16,
    },
    taskItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginVertical: 4,
        marginHorizontal: 8,
        borderRadius: 8,
        backgroundColor: "#e8f5e9",
        borderLeftWidth: 4,
        borderLeftColor: "#4CAF50",
    },
    taskItemCompleted: {
        backgroundColor: "#f5f5f5",
        borderLeftColor: "#9e9e9e",
    },
    taskCheckbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: "#4CAF50",
        marginRight: 12,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#4CAF50",
    },
    taskTextCompleted: {
        textDecorationLine: "line-through",
        color: "#9e9e9e",
    },
    taskList: {
        flex: 1,
    },
    cuthuluTypo: {
        fontFamily: "Inter-Regular",
        alignSelf: "stretch",
        textAlign: "left",
        color: "#000",
    },
    checkLayout: {
        height: 32,
        width: 32,
    },
    iconPosition: {
        overflow: "hidden",
        position: "absolute",
    },
    view: {
        width: "100%",
        gap: 10,
        justifyContent: "center",
        flex: 1,
    },
    water: {
        fontWeight: "600",
        fontFamily: "Inter-SemiBold",
        textAlign: "left",
        color: "#000",
        fontSize: 24,
    },
    plantListItem: {
        width: 367,
        flexDirection: "row",
        alignItems: "center",
        paddingRight: 16,
        gap: 16,
    },
    plantImageIcon: {
        height: 70,
        width: 70,
        borderRadius: 45,
    },
    textArea: {
        flex: 1,
    },
    cuthulu: {
        fontSize: 24,
        fontFamily: "Inter-Regular",
        alignSelf: "stretch",
    },
    monsteraDeliciosa: {
        fontSize: 14,
    },
    trailing: {
        justifyContent: "center",
    },
    checkbox: {
        borderRadius: 100,
        backgroundColor: "#5ea86e",
    },
    check: {
        top: 0,
        left: 0,
        height: 32,
        width: 32,
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
    },
});
