import { useNavigation } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useLayoutEffect, useState, useCallback } from "react";
import { Pressable, StyleSheet, View, Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import EditPlantModal from "@/components/edit-plant-modal";
import PhotoGallery from "@/components/photo-gallery";
import { Fonts, Colors } from "@/constants/theme";
import { Plant, CareCategory } from "@/types/plant";
import { usePlantManagement } from "@/hooks/usePlantManagement";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function PlantDetailScreen() {
    const router = useRouter();
    const navigation = useNavigation();
    const params = useLocalSearchParams();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? "light"];

    const { recordCareTask, updatePlant } = usePlantManagement();

    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [plant, setPlant] = useState<Plant | null>(
        params.plant ? JSON.parse(params.plant as string) : null
    );

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: false,
        });
    }, [navigation]);

    if (!plant) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <ThemedText>Plant not found</ThemedText>
            </View>
        );
    }

    const handleRecordCareTask = useCallback(
        async (category: CareCategory) => {
            try {
                setIsRecording(true);
                const updatedPlant = await recordCareTask(plant.id, category);
                if (updatedPlant) {
                    setPlant(updatedPlant);
                    Alert.alert('Success', `${category} recorded successfully!`);
                }
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Failed to record task';
                Alert.alert('Error', message);
            } finally {
                setIsRecording(false);
            }
        },
        [plant.id, recordCareTask]
    );

    const handleUpdatePlant = useCallback(
        async (id: string, updates: any) => {
            try {
                setIsRecording(true);
                const updatedPlant = await updatePlant(id, updates);
                if (updatedPlant) {
                    setPlant(updatedPlant);
                    setIsEditModalVisible(false);
                }
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Failed to update plant';
                Alert.alert('Error', message);
            } finally {
                setIsRecording(false);
            }
        },
        [updatePlant]
    );

    const getNextCareDate = (category: CareCategory) => {
        const schedule = plant.careSchedules.find(s => s.category === category);
        if (!schedule) return null;

        const lastPerformed = schedule.lastPerformed || plant.createdAt;
        const nextDate = new Date(lastPerformed);
        nextDate.setDate(nextDate.getDate() + schedule.frequency);

        return nextDate;
    };

    const getCareStatus = (category: CareCategory) => {
        const nextDate = getNextCareDate(category);
        if (!nextDate) return { text: 'Not scheduled', status: 'unknown' as const };

        const now = new Date();
        const daysUntil = Math.ceil((nextDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntil < 0) {
            return { text: `${Math.abs(daysUntil)} days overdue`, status: 'overdue' as const };
        } else if (daysUntil === 0) {
            return { text: 'Due today', status: 'due' as const };
        } else if (daysUntil <= 2) {
            return { text: `Due in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`, status: 'soon' as const };
        }
        return { text: `Due in ${daysUntil} days`, status: 'upcoming' as const };
    };

    return (
        <View style={[styles.screenContainer, { backgroundColor: colors.background }]}>
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
                <Pressable
                    style={styles.backButton}
                    onPress={() => router.back()}
                    disabled={isRecording}
                >
                    <IconSymbol name="chevron.left" size={20} color="white" />
                    <ThemedText style={styles.backText}>Back</ThemedText>
                </Pressable>

                <ThemedView style={styles.titleContainer}>
                    <ThemedText
                        type="title"
                        style={{
                            fontFamily: Fonts.rounded,
                        }}
                    >
                        {plant.name}
                    </ThemedText>
                    {plant.location && (
                        <ThemedText style={styles.location}>
                            📍 {plant.location}
                        </ThemedText>
                    )}
                </ThemedView>

                {/* Plant Information Section */}
                <ThemedView style={styles.infoSection}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>
                        Plant Information
                    </ThemedText>

                    <ThemedView style={styles.infoItem}>
                        <ThemedText style={styles.label}>Species</ThemedText>
                        <ThemedText style={styles.value}>{plant.species}</ThemedText>
                    </ThemedView>

                    {plant.notes && (
                        <ThemedView style={styles.infoItem}>
                            <ThemedText style={styles.label}>Notes</ThemedText>
                            <ThemedText style={styles.value}>{plant.notes}</ThemedText>
                        </ThemedView>
                    )}

                    <ThemedView style={styles.infoItem}>
                        <ThemedText style={styles.label}>Added</ThemedText>
                        <ThemedText style={styles.value}>
                            {new Date(plant.createdAt).toLocaleDateString()}
                        </ThemedText>
                    </ThemedView>
                </ThemedView>

                {/* Care Schedule Section */}
                <ThemedView style={styles.careSection}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>
                        Care Schedule
                    </ThemedText>

                    {plant.careSchedules.map(schedule => {
                        const { text, status } = getCareStatus(schedule.category as CareCategory);
                        const statusColor =
                            status === 'overdue'
                                ? '#d9534f'
                                : status === 'due'
                                    ? '#ff9800'
                                    : status === 'soon'
                                        ? '#ffc107'
                                        : '#4CAF50';

                        return (
                            <View key={schedule.category} style={styles.careItem}>
                                <View style={styles.careHeader}>
                                    <ThemedText style={styles.careTitle}>
                                        {schedule.category.charAt(0).toUpperCase() +
                                            schedule.category.slice(1)}
                                    </ThemedText>
                                    <ThemedText style={[styles.careStatus, { color: statusColor }]}>
                                        {text}
                                    </ThemedText>
                                </View>

                                <ThemedView style={styles.careDetails}>
                                    <ThemedText style={styles.careFrequency}>
                                        Every {schedule.frequency} day{schedule.frequency !== 1 ? 's' : ''}
                                    </ThemedText>
                                    {schedule.lastPerformed && (
                                        <ThemedText style={styles.careLastPerformed}>
                                            Last done:{' '}
                                            {Math.floor(
                                                (new Date().getTime() -
                                                    new Date(schedule.lastPerformed).getTime()) /
                                                (1000 * 60 * 60 * 24)
                                            )}{' '}
                                            days ago
                                        </ThemedText>
                                    )}
                                </ThemedView>

                                <Pressable
                                    style={[styles.recordButton, { backgroundColor: statusColor }]}
                                    onPress={() =>
                                        handleRecordCareTask(schedule.category as CareCategory)
                                    }
                                    disabled={isRecording}
                                >
                                    <IconSymbol
                                        name="checkmark.circle.fill"
                                        size={18}
                                        color="white"
                                    />
                                    <ThemedText style={styles.recordButtonText}>
                                        Mark as Done
                                    </ThemedText>
                                </Pressable>
                            </View>
                        );
                    })}
                </ThemedView>

                {/* Photo Gallery Section */}
                <PhotoGallery plantId={plant.id} />

                {/* Action Buttons */}
                <View style={styles.actionSection}>
                    <Pressable
                        style={[styles.actionButton, { backgroundColor: colors.tint }]}
                        onPress={() => setIsEditModalVisible(true)}
                        disabled={isRecording}
                    >
                        <IconSymbol name="pencil" size={20} color="white" />
                        <ThemedText style={styles.actionButtonText}>Edit Plant</ThemedText>
                    </Pressable>
                </View>

                <View style={styles.bottomSpacer} />
            </ParallaxScrollView>

            <EditPlantModal
                isVisible={isEditModalVisible}
                plant={plant}
                onClose={() => setIsEditModalVisible(false)}
                onUpdatePlant={handleUpdatePlant}
                isLoading={isRecording}
            />
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
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        borderRadius: 8,
    },
    backText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
    titleContainer: {
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    location: {
        fontSize: 14,
        opacity: 0.7,
        marginTop: 4,
    },
    infoSection: {
        marginHorizontal: 16,
        marginBottom: 20,
        padding: 16,
        borderRadius: 12,
        backgroundColor: "rgba(76, 175, 80, 0.1)",
    },
    sectionTitle: {
        marginBottom: 12,
        fontSize: 16,
    },
    infoItem: {
        marginVertical: 8,
        paddingVertical: 8,
    },
    label: {
        fontWeight: "600",
        fontSize: 14,
        marginBottom: 4,
    },
    value: {
        fontSize: 14,
        opacity: 0.8,
    },
    careSection: {
        marginHorizontal: 16,
        marginBottom: 24,
        padding: 16,
        borderRadius: 12,
        backgroundColor: "rgba(76, 175, 80, 0.05)",
    },
    careItem: {
        marginBottom: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(0, 0, 0, 0.1)",
    },
    careHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    careTitle: {
        fontSize: 16,
        fontWeight: "600",
    },
    careStatus: {
        fontSize: 13,
        fontWeight: "500",
    },
    careDetails: {
        marginBottom: 12,
    },
    careFrequency: {
        fontSize: 13,
        opacity: 0.7,
        marginBottom: 4,
    },
    careLastPerformed: {
        fontSize: 12,
        opacity: 0.6,
    },
    recordButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 10,
        borderRadius: 8,
        gap: 8,
    },
    recordButtonText: {
        color: "white",
        fontWeight: "600",
        fontSize: 14,
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
        gap: 8,
    },
    actionButtonText: {
        color: "white",
        fontWeight: "600",
        fontSize: 16,
    },
    bottomSpacer: {
        height: 20,
    },
});
