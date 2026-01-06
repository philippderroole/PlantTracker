import { useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    TextInput,
    Pressable,
    View,
    Alert,
    Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PlantCreateInput } from '@/types/plant';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SafeAreaView } from 'react-native-safe-area-context';

interface AddPlantModalProps {
    isVisible: boolean;
    onClose: () => void;
    onAddPlant: (plant: PlantCreateInput) => Promise<void>;
    isLoading?: boolean;
}

export default function AddPlantModal({
    isVisible,
    onClose,
    onAddPlant,
    isLoading = false,
}: AddPlantModalProps) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    const [name, setName] = useState('');
    const [species, setSpecies] = useState('');
    const [imageUri, setImageUri] = useState<string | null>(null);

    const handlePickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    const handleCameraImage = async () => {
        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    const handleSubmit = async () => {
        if (!name.trim()) {
            Alert.alert('Missing Information', 'Please enter a plant name');
            return;
        }

        try {
            const newPlant: PlantCreateInput = {
                name: name.trim(),
                species: species.trim() || undefined,
                imageUri: imageUri || undefined,
                careSchedules: [
                    { category: 'watering', frequency: 7 },
                    { category: 'fertilization', frequency: 30 },
                ],
            };

            await onAddPlant(newPlant);

            // Reset form
            setName('');
            setSpecies('');
            setImageUri(null);
            onClose();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to add plant';
            Alert.alert('Error', errorMessage);
        }
    };

    return (
        <Modal
            visible={isVisible}
            animationType="slide"
            onRequestClose={onClose}
            presentationStyle="formSheet"
        >
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.header}>
                    <Pressable onPress={onClose} disabled={isLoading}>
                        <ThemedText style={styles.cancelButton}>Cancel</ThemedText>
                    </Pressable>
                    <ThemedText type="title">Add Plant</ThemedText>
                    <Pressable onPress={handleSubmit} disabled={isLoading || !name.trim()}>
                        <ThemedText
                            style={[
                                styles.saveButton,
                                (isLoading || !name.trim()) && styles.disabledButton,
                            ]}
                        >
                            {isLoading ? 'Saving...' : 'Save'}
                        </ThemedText>
                    </Pressable>
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Plant Photo */}
                    <View style={styles.section}>
                        <ThemedText style={styles.label}>Photo</ThemedText>
                        {imageUri ? (
                            <View style={styles.imageContainer}>
                                <Image source={{ uri: imageUri }} style={styles.image} />
                                <Pressable
                                    style={[styles.changeButton, { backgroundColor: colors.tint }]}
                                    onPress={handlePickImage}
                                    disabled={isLoading}
                                >
                                    <ThemedText style={styles.changeButtonText}>Change</ThemedText>
                                </Pressable>
                            </View>
                        ) : (
                            <View style={styles.noImageContainer}>
                                <View style={styles.imageButtonRow}>
                                    <Pressable
                                        style={[styles.imageButton, { borderColor: colors.tint }]}
                                        onPress={handlePickImage}
                                        disabled={isLoading}
                                    >
                                        <ThemedText style={[styles.imageButtonText, { color: colors.tint }]}>
                                            📷 Gallery
                                        </ThemedText>
                                    </Pressable>
                                    <Pressable
                                        style={[styles.imageButton, { borderColor: colors.tint }]}
                                        onPress={handleCameraImage}
                                        disabled={isLoading}
                                    >
                                        <ThemedText style={[styles.imageButtonText, { color: colors.tint }]}>
                                            📸 Camera
                                        </ThemedText>
                                    </Pressable>
                                </View>
                            </View>
                        )}
                    </View>

                    {/* Plant Name */}
                    <View style={styles.section}>
                        <ThemedText style={styles.label}>Plant Name *</ThemedText>
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    color: colors.text,
                                    borderColor: colors.icon,
                                    backgroundColor: colors.background === '#fff' ? '#f5f5f5' : '#2a2a2a',
                                },
                            ]}
                            placeholder="e.g., My Monstera"
                            placeholderTextColor={colors.icon}
                            value={name}
                            onChangeText={setName}
                            editable={!isLoading}
                        />
                    </View>

                    {/* Plant Species (Optional) */}
                    <View style={styles.section}>
                        <ThemedText style={styles.label}>Species (Optional)</ThemedText>
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    color: colors.text,
                                    borderColor: colors.icon,
                                    backgroundColor: colors.background === '#fff' ? '#f5f5f5' : '#2a2a2a',
                                },
                            ]}
                            placeholder="e.g., Monstera deliciosa"
                            placeholderTextColor={colors.icon}
                            value={species}
                            onChangeText={setSpecies}
                            editable={!isLoading}
                        />
                    </View>

                    <ThemedView style={styles.infoBox}>
                        <ThemedText style={styles.infoText}>
                            📝 You can customize care schedules and location after adding the plant.
                        </ThemedText>
                    </ThemedView>
                </ScrollView>
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    cancelButton: {
        fontSize: 16,
        color: '#0a7ea4',
    },
    saveButton: {
        fontSize: 16,
        color: '#0a7ea4',
        fontWeight: '600',
    },
    disabledButton: {
        opacity: 0.5,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    section: {
        marginBottom: 24,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    imageContainer: {
        alignItems: 'center',
    },
    image: {
        width: 200,
        height: 200,
        borderRadius: 12,
        marginBottom: 12,
    },
    changeButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    changeButtonText: {
        color: 'white',
        fontWeight: '600',
    },
    noImageContainer: {
        alignItems: 'center',
        padding: 24,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: '#ccc',
        borderRadius: 12,
    },
    imageButtonRow: {
        flexDirection: 'row',
        gap: 12,
    },
    imageButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 2,
        alignItems: 'center',
    },
    imageButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
    },
    infoBox: {
        marginTop: 20,
        padding: 12,
        borderRadius: 8,
        backgroundColor: 'rgba(10, 126, 164, 0.1)',
    },
    infoText: {
        fontSize: 14,
        lineHeight: 20,
    },
});

