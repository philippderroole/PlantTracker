import React, { useCallback, useEffect, useState } from 'react';
import {
    View,
    StyleSheet,
    Image,
    Pressable,
    ScrollView,
    Alert,
    ActivityIndicator,
    Modal,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { usePhotoManagement, PlantPhoto } from '@/hooks/usePhotoManagement';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import * as ImagePicker from 'expo-image-picker';

interface PhotoGalleryProps {
    plantId: string;
    onPhotoAdded?: (photo: PlantPhoto) => void;
}

export default function PhotoGallery({ plantId, onPhotoAdded }: PhotoGalleryProps) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const { getPlantPhotos, addPhoto, deletePhoto, isLoading } = usePhotoManagement();

    const [photos, setPhotos] = useState<PlantPhoto[]>([]);
    const [selectedPhoto, setSelectedPhoto] = useState<PlantPhoto | null>(null);
    const [isCameraModalVisible, setIsCameraModalVisible] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    // Load photos on mount and when plantId changes
    useEffect(() => {
        loadPhotos();
    }, [plantId]);

    const loadPhotos = useCallback(async () => {
        try {
            const loadedPhotos = await getPlantPhotos(plantId);
            setPhotos(loadedPhotos);
        } catch (error) {
            console.error('Error loading photos:', error);
        }
    }, [plantId, getPlantPhotos]);

    const requestCameraPermissions = async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            return status === 'granted';
        } catch (error) {
            console.error('Error requesting camera permissions:', error);
            return false;
        }
    };

    const requestLibraryPermissions = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            return status === 'granted';
        } catch (error) {
            console.error('Error requesting library permissions:', error);
            return false;
        }
    };

    const handleTakePhoto = async () => {
        const hasPermission = await requestCameraPermissions();
        if (!hasPermission) {
            Alert.alert('Permission Required', 'Camera permission is required to take photos');
            return;
        }

        try {
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                await handlePhotoSelected(result.assets[0].uri);
            }
            setIsCameraModalVisible(false);
        } catch (error) {
            Alert.alert('Error', 'Failed to take photo');
            console.error('Error taking photo:', error);
        }
    };

    const handlePickFromLibrary = async () => {
        const hasPermission = await requestLibraryPermissions();
        if (!hasPermission) {
            Alert.alert('Permission Required', 'Media library permission is required');
            return;
        }

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                await handlePhotoSelected(result.assets[0].uri);
            }
            setIsCameraModalVisible(false);
        } catch (error) {
            Alert.alert('Error', 'Failed to pick photo');
            console.error('Error picking photo:', error);
        }
    };

    const handlePhotoSelected = async (imageUri: string) => {
        try {
            setIsAdding(true);
            const newPhoto = await addPhoto(plantId, imageUri);
            if (newPhoto) {
                setPhotos(prev => [newPhoto, ...prev]);
                onPhotoAdded?.(newPhoto);
                Alert.alert('Success', 'Photo added successfully');
            } else {
                Alert.alert('Error', 'Failed to save photo');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to add photo');
            console.error('Error adding photo:', error);
        } finally {
            setIsAdding(false);
        }
    };

    const handleDeletePhoto = (photo: PlantPhoto) => {
        Alert.alert('Delete Photo', 'Are you sure you want to delete this photo?', [
            { text: 'Cancel', onPress: () => { }, style: 'cancel' },
            {
                text: 'Delete',
                onPress: async () => {
                    try {
                        const success = await deletePhoto(photo.id);
                        if (success) {
                            setPhotos(prev => prev.filter(p => p.id !== photo.id));
                            setSelectedPhoto(null);
                            Alert.alert('Success', 'Photo deleted');
                        }
                    } catch (error) {
                        Alert.alert('Error', 'Failed to delete photo');
                    }
                },
                style: 'destructive',
            },
        ]);
    };

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <ThemedText type="defaultSemiBold" style={styles.title}>
                    Photo Gallery
                </ThemedText>
                <Pressable
                    style={[styles.addButton, { backgroundColor: colors.tint }]}
                    onPress={() => setIsCameraModalVisible(true)}
                >
                    <IconSymbol name="camera.fill" size={16} color="#fff" />
                </Pressable>
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.tint} />
                </View>
            ) : photos.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <IconSymbol name="photo" size={48} color={colors.icon} style={{ opacity: 0.5 }} />
                    <ThemedText style={styles.emptyText}>No photos yet</ThemedText>
                    <ThemedText style={styles.emptySubtext}>
                        Tap the camera icon to add your first photo
                    </ThemedText>
                </View>
            ) : (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.photoScroll}
                    contentContainerStyle={styles.photoScrollContent}
                >
                    {photos.map(photo => (
                        <Pressable
                            key={photo.id}
                            style={styles.photoThumb}
                            onPress={() => setSelectedPhoto(photo)}
                        >
                            <Image
                                source={{ uri: photo.imageUri }}
                                style={styles.photoImage}
                                resizeMode="cover"
                            />
                            <ThemedText style={styles.photoDate}>
                                {new Date(photo.timestamp).toLocaleDateString()}
                            </ThemedText>
                        </Pressable>
                    ))}
                </ScrollView>
            )}

            {/* Photo Modal */}
            <Modal
                visible={isCameraModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setIsCameraModalVisible(false)}
            >
                <View style={[styles.modalOverlay, { backgroundColor: colors.background }]}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <ThemedText type="defaultSemiBold">Add Photo</ThemedText>
                            <Pressable
                                onPress={() => setIsCameraModalVisible(false)}
                                style={styles.closeButton}
                            >
                                <IconSymbol name="xmark" size={24} color={colors.text} />
                            </Pressable>
                        </View>

                        <View style={styles.modalOptions}>
                            <Pressable
                                style={[styles.optionButton, { borderColor: colors.tint }]}
                                onPress={handleTakePhoto}
                                disabled={isAdding}
                            >
                                <IconSymbol name="camera.fill" size={32} color={colors.tint} />
                                <ThemedText style={{ color: colors.tint, marginTop: 8 }}>
                                    Take Photo
                                </ThemedText>
                            </Pressable>

                            <Pressable
                                style={[styles.optionButton, { borderColor: colors.tint }]}
                                onPress={handlePickFromLibrary}
                                disabled={isAdding}
                            >
                                <IconSymbol name="photo.fill" size={32} color={colors.tint} />
                                <ThemedText style={{ color: colors.tint, marginTop: 8 }}>
                                    Choose from Library
                                </ThemedText>
                            </Pressable>
                        </View>

                        {isAdding && (
                            <View style={styles.addingContainer}>
                                <ActivityIndicator size="large" color={colors.tint} />
                                <ThemedText style={styles.addingText}>Adding photo...</ThemedText>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>

            {/* Selected Photo Viewer */}
            <Modal
                visible={selectedPhoto !== null}
                transparent
                animationType="fade"
                onRequestClose={() => setSelectedPhoto(null)}
            >
                <View style={[styles.photoViewerOverlay, { backgroundColor: 'rgba(0,0,0,0.9)' }]}>
                    {selectedPhoto && (
                        <View style={styles.photoViewerContent}>
                            <Pressable
                                style={styles.closeViewerButton}
                                onPress={() => setSelectedPhoto(null)}
                            >
                                <IconSymbol name="xmark.circle.fill" size={32} color="#fff" />
                            </Pressable>

                            <Image
                                source={{ uri: selectedPhoto.imageUri }}
                                style={styles.largePhoto}
                                resizeMode="contain"
                            />

                            <View style={[styles.photoInfo, { backgroundColor: colors.background }]}>
                                <ThemedText type="defaultSemiBold">
                                    {new Date(selectedPhoto.timestamp).toLocaleDateString()}
                                </ThemedText>
                                {selectedPhoto.notes && (
                                    <ThemedText style={styles.photoNotes}>{selectedPhoto.notes}</ThemedText>
                                )}

                                <Pressable
                                    style={[styles.deleteButton, { backgroundColor: '#d9534f' }]}
                                    onPress={() => {
                                        setSelectedPhoto(null);
                                        handleDeletePhoto(selectedPhoto);
                                    }}
                                >
                                    <IconSymbol name="trash.fill" size={16} color="#fff" />
                                    <ThemedText style={{ color: '#fff', marginLeft: 8 }}>Delete</ThemedText>
                                </Pressable>
                            </View>
                        </View>
                    )}
                </View>
            </Modal>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 12,
    },
    title: {
        fontSize: 18,
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContainer: {
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 12,
    },
    emptySubtext: {
        fontSize: 14,
        opacity: 0.6,
        marginTop: 8,
        textAlign: 'center',
    },
    photoScroll: {
        height: 140,
        marginHorizontal: -16,
        paddingHorizontal: 16,
    },
    photoScrollContent: {
        gap: 12,
        paddingVertical: 8,
    },
    photoThumb: {
        width: 120,
        height: 120,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#f0f0f0',
    },
    photoImage: {
        flex: 1,
        width: '100%',
    },
    photoDate: {
        position: 'absolute',
        bottom: 4,
        left: 4,
        right: 4,
        fontSize: 10,
        backgroundColor: 'rgba(0,0,0,0.6)',
        color: '#fff',
        padding: 4,
        borderRadius: 4,
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContent: {
        paddingHorizontal: 16,
        paddingVertical: 24,
        paddingBottom: 40,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    closeButton: {
        padding: 8,
    },
    modalOptions: {
        flexDirection: 'row',
        gap: 16,
        justifyContent: 'center',
    },
    optionButton: {
        flex: 1,
        paddingVertical: 24,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addingContainer: {
        marginTop: 24,
        alignItems: 'center',
    },
    addingText: {
        marginTop: 12,
    },
    photoViewerOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    photoViewerContent: {
        width: '100%',
        height: '100%',
        justifyContent: 'space-between',
    },
    closeViewerButton: {
        position: 'absolute',
        top: 40,
        right: 16,
        zIndex: 10,
    },
    largePhoto: {
        flex: 1,
        width: '100%',
    },
    photoInfo: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        gap: 12,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    photoNotes: {
        fontSize: 14,
        opacity: 0.7,
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 12,
    },
});
