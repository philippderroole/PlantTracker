import { useRouter, useFocusEffect } from "expo-router";
import { useState, useCallback } from "react";
import { StyleSheet, Text, View, FlatList, Pressable, Image } from "react-native";

import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Fonts, Colors } from "@/constants/theme";
import { Plant, CareCategory } from "@/types/plant";
import { usePlantManagement } from "@/hooks/usePlantManagement";
import { useTaskManagement, Task } from "@/hooks/useTaskManagement";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function HomeScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? "light"];
    const { plants, isLoading, recordCareTask, refreshPlants } = usePlantManagement();
    const { sortedTasks, dueTasks, updateTasks, completeTask } = useTaskManagement();

    // Load plants when screen is focused
    useFocusEffect(
        useCallback(() => {
            refreshPlants();
        }, [refreshPlants])
    );

    // Update tasks when plants change
    useFocusEffect(
        useCallback(() => {
            updateTasks(plants);
        }, [plants, updateTasks])
    );

    const handleTaskPress = (task: any) => {
        const plant = plants.find(p => p.id === task.plantId);
        if (plant) {
            router.push({
                pathname: "/plant-detail",
                params: { plant: JSON.stringify(plant) },
            });
        }
    };

    const handleCompleteTask = useCallback(async (task: any) => {
        try {
            await completeTask(task);
            // Reload plants to update tasks
            await refreshPlants();
        } catch (error) {
            console.error("Error completing task:", error);
        }
    }, [completeTask, refreshPlants]);

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
                    Care Tasks
                </ThemedText>
            </ThemedView>
            {sortedTasks.length === 0 && !isLoading ? (
                <ThemedView style={styles.emptyContainer}>
                    <ThemedText style={styles.emptyText}>
                        No care tasks due today. Great job! 🌱
                    </ThemedText>
                </ThemedView>
            ) : (
                <TaskList tasks={sortedTasks} onTaskPress={handleTaskPress} onCompleteTask={handleCompleteTask} />
            )}
        </ParallaxScrollView>
    );
}

interface TaskListProps {
    tasks: Task[];
    onTaskPress: (task: Task) => void;
    onCompleteTask: (task: Task) => void;
}

function TaskList({ tasks, onTaskPress, onCompleteTask }: TaskListProps) {
    return (
        <FlatList
            data={tasks}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
                <TaskItem task={item} onPress={onTaskPress} onComplete={onCompleteTask} />
            )}
            contentContainerStyle={styles.taskListContainer}
        />
    );
}

interface TaskItemProps {
    task: Task;
    onPress: (task: Task) => void;
    onComplete: (task: Task) => void;
}

function TaskItem({ task, onPress, onComplete }: TaskItemProps) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? "light"];
    const isOverdue = new Date() > task.dueDate;
    const daysUntilDue = Math.ceil((task.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    return (
        <View style={[styles.taskCard, { borderColor: isOverdue ? "#f44336" : colors.tint }]}>
            <Pressable
                style={styles.taskCheckbox}
                onPress={() => onComplete(task)}
            >
                <IconSymbol name="checkmark" size={14} color="#fff" />
            </Pressable>
            <Pressable style={styles.taskContent} onPress={() => onPress(task)}>
                <ThemedText style={styles.taskCategory}>
                    {task.category.charAt(0).toUpperCase() + task.category.slice(1)}
                </ThemedText>
                <ThemedText type="defaultSemiBold" style={styles.taskPlantName}>
                    {task.plantName}
                </ThemedText>
                <ThemedText style={[styles.taskDueDate, { color: isOverdue ? "#f44336" : colors.icon }]}>
                    {isOverdue ? "Overdue" : daysUntilDue === 0 ? "Due today" : `Due in ${daysUntilDue} days`}
                </ThemedText>
            </Pressable>
            <ThemedText style={styles.taskFrequency}>
                Every {task.frequency}d
            </ThemedText>
        </View>
    );
}

const styles = StyleSheet.create({
    taskListContainer: {
        gap: 8,
        paddingHorizontal: 0,
    },
    taskCard: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        marginHorizontal: 8,
        marginVertical: 4,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: "#4CAF50",
    },
    taskCheckbox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#4CAF50",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    taskContent: {
        flex: 1,
    },
    taskCategory: {
        fontSize: 12,
        opacity: 0.6,
    },
    taskPlantName: {
        fontSize: 16,
        marginTop: 2,
    },
    taskDueDate: {
        fontSize: 12,
        marginTop: 4,
    },
    taskFrequency: {
        fontSize: 12,
        opacity: 0.6,
    },
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
});
