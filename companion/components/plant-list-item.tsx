import { Plant } from "@/types/plant";
import * as React from "react";
import { Image, StyleSheet, Text, View, Pressable, Alert } from "react-native";
import { ThemedText } from "./themed-text";
import { usePhotoManagement } from "@/hooks/usePhotoManagement";
import { useFocusEffect } from "@react-navigation/native";
import { getMaxDaysOverdue } from "@/utils/careCalculations";

interface PlantListItemProps {
    plant: Plant;
    onPress?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
}

export default function PlantListItem({
    plant,
    onPress,
    onEdit,
    onDelete,
}: PlantListItemProps) {
    const { getLatestPhoto } = usePhotoManagement();
    const [latestPhotoUri, setLatestPhotoUri] = React.useState<string | null>(null);

    useFocusEffect(
        React.useCallback(() => {
            const loadLatestPhoto = async () => {
                try {
                    const photo = await getLatestPhoto(plant.id);
                    setLatestPhotoUri(photo?.imageUri ?? null);
                } catch (error) {
                    console.warn('Failed to load latest photo:', error);
                }
            };
            loadLatestPhoto();
        }, [plant.id, getLatestPhoto])
    );

    const daysOverdue = getMaxDaysOverdue(plant);

    const handleDelete = () => {
        Alert.alert(
            'Delete Plant',
            `Are you sure you want to delete ${plant.name}?`,
            [
                { text: 'Cancel', onPress: () => { }, style: 'cancel' },
                {
                    text: 'Delete',
                    onPress: onDelete,
                    style: 'destructive',
                },
            ]
        );
    };

    return (
        <Pressable style={styles.container} onPress={onPress}>
            <View style={styles.view}>
                {latestPhotoUri ? (
                    <Image
                        style={styles.plantImageIcon}
                        source={{ uri: latestPhotoUri }}
                        resizeMode="cover"
                    />
                ) : plant.imageUri ? (
                    <Image
                        style={styles.plantImageIcon}
                        source={{ uri: plant.imageUri }}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={[styles.plantImageIcon, styles.placeholderImage]} />
                )}
                <View style={styles.textArea}>
                    <ThemedText style={styles.plantName}>
                        {plant.name}
                    </ThemedText>
                    <ThemedText style={styles.speciesText}>
                        {plant.species}
                    </ThemedText>
                    {plant.location && (
                        <ThemedText style={styles.location}>
                            📍 {plant.location}
                        </ThemedText>
                    )}
                    {daysOverdue > 0 && (
                        <ThemedText style={styles.overdue}>
                            ⚠️ {daysOverdue} day{daysOverdue !== 1 ? 's' : ''} overdue
                        </ThemedText>
                    )}
                </View>
                <View style={styles.actions}>
                    {onEdit && (
                        <Pressable
                            style={styles.actionButton}
                            onPress={(e) => {
                                e.stopPropagation();
                                onEdit();
                            }}
                        >
                            <Text style={styles.actionButtonText}>✏️</Text>
                        </Pressable>
                    )}
                    {onDelete && (
                        <Pressable
                            style={styles.actionButton}
                            onPress={(e) => {
                                e.stopPropagation();
                                handleDelete();
                            }}
                        >
                            <Text style={styles.actionButtonText}>🗑️</Text>
                        </Pressable>
                    )}
                </View>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 12,
    },
    view: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
        borderRadius: 12,
        backgroundColor: "rgba(0, 0, 0, 0.02)",
    },
    plantImageIcon: {
        height: 70,
        width: 70,
        borderRadius: 35,
    },
    placeholderImage: {
        backgroundColor: "#e0e0e0",
    },
    textArea: {
        flex: 1,
    },
    plantName: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 4,
    },
    speciesText: {
        fontSize: 13,
        opacity: 0.7,
        marginBottom: 4,
    },
    location: {
        fontSize: 12,
        opacity: 0.6,
    },
    overdue: {
        fontSize: 12,
        color: "#d9534f",
        marginTop: 4,
        fontWeight: "500",
    },
    actions: {
        flexDirection: "row",
        gap: 8,
    },
    actionButton: {
        paddingHorizontal: 8,
        paddingVertical: 6,
    },
    actionButtonText: {
        fontSize: 16,
    },
    trailing: {
        justifyContent: "center",
    },
});
