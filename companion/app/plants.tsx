import { useRouter } from "expo-router";
import { useState, useCallback } from "react";
import { Pressable, StyleSheet, View, FlatList, Alert, ActivityIndicator } from "react-native";

import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import PlantListItem from "@/components/plant-list-item";
import AddPlantModal from "@/components/add-plant-modal";
import EditPlantModal from "@/components/edit-plant-modal";
import { Fonts, Colors } from "@/constants/theme";
import { Plant } from "@/types/plant";
import { usePlantManagement } from "@/hooks/usePlantManagement";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function PlantsScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? "light"];

    const {
        plants,
        isLoading,
        error,
        addPlant,
        updatePlant,
        deletePlant,
    } = usePlantManagement();

    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const handleAddPlant = useCallback(async (plantData: any) => {
        try {
            setIsSaving(true);
            await addPlant(plantData);
            setIsAddModalVisible(false);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to add plant';
            Alert.alert('Error', message);
        } finally {
            setIsSaving(false);
        }
    }, [addPlant]);

    const handleOpenEdit = useCallback((plant: Plant) => {
        setSelectedPlant(plant);
        setIsEditModalVisible(true);
    }, []);

    const handleUpdatePlant = useCallback(async (updates: any) => {
        if (!selectedPlant) return;
        try {
            setIsSaving(true);
            await updatePlant(selectedPlant.id, updates);
            setIsEditModalVisible(false);
            setSelectedPlant(null);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to update plant';
            Alert.alert('Error', message);
        } finally {
            setIsSaving(false);
        }
    }, [selectedPlant, updatePlant]);

    const handleDeletePlant = useCallback(async (plantId: string) => {
        try {
            setIsSaving(true);
            await deletePlant(plantId);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to delete plant';
            Alert.alert('Error', message);
        } finally {
            setIsSaving(false);
        }
    }, [deletePlant]);

    const handlePlantPress = useCallback((plant: Plant) => {
        router.push({
            pathname: "/plant-detail",
            params: { plant: JSON.stringify(plant) },
        });
    }, [router]);

    const renderPlantItem = useCallback(
        ({ item }: { item: Plant }) => (
            <PlantListItem
                plant={item}
                onPress={() => handlePlantPress(item)}
                onEdit={() => handleOpenEdit(item)}
                onDelete={() => handleDeletePlant(item.id)}
            />
        ),
        [handlePlantPress, handleOpenEdit, handleDeletePlant]
    );

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
                        Your Plants
                    </ThemedText>
                    <ThemedText style={styles.plantCount}>
                        {plants.length} {plants.length === 1 ? 'plant' : 'plants'}
                    </ThemedText>
                </ThemedView>

                {error && (
                    <ThemedView style={styles.errorContainer}>
                        <ThemedText style={styles.errorText}>
                            ⚠️ {error}
                        </ThemedText>
                    </ThemedView>
                )}

                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.tint} />
                        <ThemedText style={styles.loadingText}>Loading plants...</ThemedText>
                    </View>
                ) : plants.length === 0 ? (
                    <ThemedView style={styles.emptyContainer}>
                        <IconSymbol
                            size={64}
                            color={colors.icon}
                            name="leaf"
                            style={styles.emptyIcon}
                        />
                        <ThemedText type="title" style={styles.emptyTitle}>
                            No Plants Yet
                        </ThemedText>
                        <ThemedText style={styles.emptyText}>
                            Add your first plant to get started
                        </ThemedText>
                        <Pressable
                            style={[styles.emptyButton, { backgroundColor: colors.tint }]}
                            onPress={() => setIsAddModalVisible(true)}
                        >
                            <ThemedText style={styles.emptyButtonText}>
                                Add Plant
                            </ThemedText>
                        </Pressable>
                    </ThemedView>
                ) : (
                    <FlatList
                        data={plants}
                        renderItem={renderPlantItem}
                        keyExtractor={item => item.id}
                        scrollEnabled={false}
                        style={styles.listContainer}
                    />
                )}

                <View style={styles.bottomSpacer} />
            </ParallaxScrollView>

            {!isLoading && plants.length > 0 && (
                <Pressable
                    style={styles.fab}
                    onPress={() => setIsAddModalVisible(true)}
                    disabled={isSaving}
                >
                    <IconSymbol name="plus" size={24} color="white" />
                </Pressable>
            )}

            <AddPlantModal
                isVisible={isAddModalVisible}
                onClose={() => setIsAddModalVisible(false)}
                onAddPlant={handleAddPlant}
                isLoading={isSaving}
            />

            <EditPlantModal
                isVisible={isEditModalVisible}
                plant={selectedPlant}
                onClose={() => {
                    setIsEditModalVisible(false);
                    setSelectedPlant(null);
                }}
                onUpdatePlant={async (id, updates) => {
                    await handleUpdatePlant(updates);
                }}
                isLoading={isSaving}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    screenContainer: {
        flex: 1,
        position: "relative",
    },
    headerImage: {
        bottom: -90,
        left: -35,
        position: "absolute",
    },
    titleContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    plantCount: {
        fontSize: 14,
        opacity: 0.6,
    },
    errorContainer: {
        backgroundColor: "rgba(217, 83, 79, 0.1)",
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        borderLeftWidth: 4,
        borderLeftColor: "#d9534f",
    },
    errorText: {
        color: "#d9534f",
        fontSize: 14,
    },
    loadingContainer: {
        paddingVertical: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        opacity: 0.6,
    },
    listContainer: {
        paddingHorizontal: 8,
    },
    emptyContainer: {
        alignItems: "center",
        paddingVertical: 60,
        paddingHorizontal: 20,
    },
    emptyIcon: {
        marginBottom: 16,
        opacity: 0.3,
    },
    emptyTitle: {
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 16,
        opacity: 0.6,
        marginBottom: 24,
        textAlign: "center",
    },
    emptyButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    emptyButtonText: {
        color: "white",
        fontWeight: "600",
        fontSize: 16,
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
    bottomSpacer: {
        height: 20,
    },
});
