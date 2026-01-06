import { useEffect, useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    TextInput,
    Pressable,
    View,
    Alert,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Plant, PlantLocation, CareCategory, PlantUpdateInput } from '@/types/plant';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SafeAreaView } from 'react-native-safe-area-context';

interface EditPlantModalProps {
    isVisible: boolean;
    plant: Plant | null;
    onClose: () => void;
    onUpdatePlant: (id: string, updates: PlantUpdateInput) => Promise<void>;
    isLoading?: boolean;
}

const LOCATIONS: PlantLocation[] = [
    'bedroom',
    'balcony',
    'office',
    'living room',
    'kitchen',
    'bathroom',
    'other',
];

const CARE_CATEGORIES: CareCategory[] = ['watering', 'fertilization', 'pruning', 'repotting'];

export default function EditPlantModal({
    isVisible,
    plant,
    onClose,
    onUpdatePlant,
    isLoading = false,
}: EditPlantModalProps) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    const [name, setName] = useState('');
    const [species, setSpecies] = useState('');
    const [selectedLocation, setSelectedLocation] = useState<PlantLocation>('living room');
    const [notes, setNotes] = useState('');
    const [careSchedules, setCareSchedules] = useState<
        Array<{ category: CareCategory; frequency: number }>
    >([]);

    useEffect(() => {
        if (plant) {
            setName(plant.name);
            setSpecies(plant.species);
            setSelectedLocation(plant.location || 'living room');
            setNotes(plant.notes || '');
            setCareSchedules(
                plant.careSchedules.map(schedule => ({
                    category: schedule.category,
                    frequency: schedule.frequency,
                }))
            );
        }
    }, [plant]);

    const handleUpdateCareFrequency = (category: CareCategory, frequency: string) => {
        const freq = parseInt(frequency, 10) || 0;
        setCareSchedules(prev =>
            prev.map(schedule =>
                schedule.category === category
                    ? { ...schedule, frequency: freq }
                    : schedule
            )
        );
    };

    const handleAddCareType = (category: CareCategory) => {
        if (!careSchedules.find(s => s.category === category)) {
            setCareSchedules(prev => [...prev, { category, frequency: 14 }]);
        }
    };

    const handleRemoveCareType = (category: CareCategory) => {
        setCareSchedules(prev => prev.filter(s => s.category !== category));
    };

    const handleSubmit = async () => {
        if (!plant) return;

        if (!name.trim()) {
            Alert.alert('Missing Information', 'Please enter a plant name');
            return;
        }

        if (careSchedules.length === 0) {
            Alert.alert('Missing Information', 'Please add at least one care schedule');
            return;
        }

        try {
            const updates: PlantUpdateInput = {
                name: name.trim(),
                species: species.trim() || undefined,
                location: selectedLocation,
                notes: notes.trim() || undefined,
                careSchedules: careSchedules.map(schedule => ({
                    category: schedule.category,
                    frequency: Math.max(1, schedule.frequency),
                    lastPerformed: plant.careSchedules.find(s => s.category === schedule.category)
                        ?.lastPerformed,
                })),
            };

            await onUpdatePlant(plant.id, updates);
            onClose();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update plant';
            Alert.alert('Error', errorMessage);
        }
    };

    if (!plant) return null;

    const unusedCategories = CARE_CATEGORIES.filter(
        cat => !careSchedules.find(s => s.category === cat)
    );

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
                    <ThemedText type="title">Edit Plant</ThemedText>
                    <Pressable onPress={handleSubmit} disabled={isLoading}>
                        <ThemedText
                            style={[
                                styles.saveButton,
                                isLoading && styles.disabledButton,
                            ]}
                        >
                            {isLoading ? 'Saving...' : 'Save'}
                        </ThemedText>
                    </Pressable>
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Plant Name */}
                    <View style={styles.section}>
                        <ThemedText style={styles.label}>Plant Name</ThemedText>
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    color: colors.text,
                                    borderColor: colors.icon,
                                    backgroundColor: colors.background === '#fff' ? '#f5f5f5' : '#2a2a2a',
                                },
                            ]}
                            placeholder="Plant name"
                            placeholderTextColor={colors.icon}
                            value={name}
                            onChangeText={setName}
                            editable={!isLoading}
                        />
                    </View>

                    {/* Species */}
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
                            placeholder="Scientific name"
                            placeholderTextColor={colors.icon}
                            value={species}
                            onChangeText={setSpecies}
                            editable={!isLoading}
                        />
                    </View>

                    {/* Location */}
                    <View style={styles.section}>
                        <ThemedText style={styles.label}>Location</ThemedText>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.locationScroll}
                        >
                            {LOCATIONS.map(location => (
                                <Pressable
                                    key={location}
                                    style={[
                                        styles.locationButton,
                                        selectedLocation === location && styles.locationButtonActive,
                                    ]}
                                    onPress={() => setSelectedLocation(location)}
                                    disabled={isLoading}
                                >
                                    <ThemedText
                                        style={[
                                            styles.locationButtonText,
                                            selectedLocation === location && styles.locationButtonTextActive,
                                        ]}
                                    >
                                        {location}
                                    </ThemedText>
                                </Pressable>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Notes */}
                    <View style={styles.section}>
                        <ThemedText style={styles.label}>Notes</ThemedText>
                        <TextInput
                            style={[
                                styles.textArea,
                                {
                                    color: colors.text,
                                    borderColor: colors.icon,
                                    backgroundColor: colors.background === '#fff' ? '#f5f5f5' : '#2a2a2a',
                                },
                            ]}
                            placeholder="Care tips or notes..."
                            placeholderTextColor={colors.icon}
                            value={notes}
                            onChangeText={setNotes}
                            multiline
                            numberOfLines={3}
                            editable={!isLoading}
                        />
                    </View>

                    {/* Care Schedules */}
                    <View style={styles.section}>
                        <ThemedText style={styles.label}>Care Schedule</ThemedText>
                        <ThemedText style={styles.hint}>Frequency in days for each care task</ThemedText>

                        {careSchedules.map(schedule => (
                            <View key={schedule.category} style={styles.careItem}>
                                <ThemedText style={styles.careLabel}>
                                    {schedule.category.charAt(0).toUpperCase() + schedule.category.slice(1)}
                                </ThemedText>
                                <View style={styles.careInputContainer}>
                                    <TextInput
                                        style={[
                                            styles.careInput,
                                            {
                                                color: colors.text,
                                                borderColor: colors.icon,
                                                backgroundColor: colors.background === '#fff' ? '#f5f5f5' : '#2a2a2a',
                                            },
                                        ]}
                                        placeholder="Days"
                                        placeholderTextColor={colors.icon}
                                        value={schedule.frequency.toString()}
                                        onChangeText={freq => handleUpdateCareFrequency(schedule.category, freq)}
                                        keyboardType="number-pad"
                                        editable={!isLoading}
                                    />
                                    <ThemedText style={styles.careUnit}>days</ThemedText>
                                    <Pressable
                                        onPress={() => handleRemoveCareType(schedule.category)}
                                        disabled={isLoading || careSchedules.length === 1}
                                    >
                                        <ThemedText style={styles.removeButton}>✕</ThemedText>
                                    </Pressable>
                                </View>
                            </View>
                        ))}

                        {unusedCategories.length > 0 && (
                            <View style={styles.addCareContainer}>
                                <ThemedText style={styles.addCareLabel}>Add care types:</ThemedText>
                                <View style={styles.addCareButtons}>
                                    {unusedCategories.map(category => (
                                        <Pressable
                                            key={category}
                                            style={[styles.addCareButton, { borderColor: colors.tint }]}
                                            onPress={() => handleAddCareType(category)}
                                            disabled={isLoading}
                                        >
                                            <ThemedText style={[styles.addCareButtonText, { color: colors.tint }]}>
                                                + {category}
                                            </ThemedText>
                                        </Pressable>
                                    ))}
                                </View>
                            </View>
                        )}
                    </View>

                    <View style={styles.bottomSpacer} />
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
        marginBottom: 8,
    },
    hint: {
        fontSize: 12,
        opacity: 0.6,
        marginBottom: 12,
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
    },
    textArea: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        textAlignVertical: 'top',
    },
    locationScroll: {
        marginHorizontal: -16,
        paddingHorizontal: 16,
    },
    locationButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ccc',
        marginRight: 8,
    },
    locationButtonActive: {
        backgroundColor: '#0a7ea4',
        borderColor: '#0a7ea4',
    },
    locationButtonText: {
        fontSize: 12,
    },
    locationButtonTextActive: {
        color: 'white',
    },
    careItem: {
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    careLabel: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 6,
    },
    careInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    careInput: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 8,
        fontSize: 14,
    },
    careUnit: {
        fontSize: 12,
        fontWeight: '500',
        minWidth: 35,
    },
    removeButton: {
        fontSize: 18,
        opacity: 0.6,
        paddingHorizontal: 4,
    },
    addCareContainer: {
        marginTop: 16,
        paddingTop: 12,
    },
    addCareLabel: {
        fontSize: 12,
        fontWeight: '500',
        marginBottom: 8,
        opacity: 0.7,
    },
    addCareButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    addCareButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
    },
    addCareButtonText: {
        fontSize: 12,
        fontWeight: '500',
    },
    bottomSpacer: {
        height: 20,
    },
});
