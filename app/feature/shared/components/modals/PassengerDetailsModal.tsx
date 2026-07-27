import React from 'react';
import {
    Modal,
    View,
    Text,
    ScrollView,
    TextInput,
    Switch,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';

interface PassengerDetailsModalProps {
    visible: boolean;
    onClose: () => void;
    passengerName: string;
    setPassengerName: (val: string) => void;
    passengerPhone: string;
    setPassengerPhone: (val: string) => void;
    seatPreference: string;
    setSeatPreference: (val: string) => void;
    mealPreference: string;
    setMealPreference: (val: string) => void;
    specialAssistance: boolean;
    setSpecialAssistance: (val: boolean) => void;
    specialAssistanceType: string;
    setSpecialAssistanceType: (val: string) => void;
    specialAssistanceEquipment: string;
    setSpecialAssistanceEquipment: (val: string) => void;
    emergencyContactName: string;
    setEmergencyContactName: (val: string) => void;
    emergencyContactPhone: string;
    setEmergencyContactPhone: (val: string) => void;
    hasInsurance: boolean;
    setHasInsurance: (val: boolean) => void;
    luggageCount: number;
    setLuggageCount: (val: number) => void;
    onSubmit: () => void;
    isSubmitting: boolean;
    routeDetailsText?: string;
}

export default function PassengerDetailsModal({
    visible,
    onClose,
    passengerName,
    setPassengerName,
    passengerPhone,
    setPassengerPhone,
    seatPreference,
    setSeatPreference,
    mealPreference,
    setMealPreference,
    specialAssistance,
    setSpecialAssistance,
    specialAssistanceType,
    setSpecialAssistanceType,
    specialAssistanceEquipment,
    setSpecialAssistanceEquipment,
    emergencyContactName,
    setEmergencyContactName,
    emergencyContactPhone,
    setEmergencyContactPhone,
    hasInsurance,
    setHasInsurance,
    luggageCount,
    setLuggageCount,
    onSubmit,
    isSubmitting,
    routeDetailsText
}: PassengerDetailsModalProps) {
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    {/* Modal Header */}
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.headerTitle}>Passenger Details</Text>
                            {routeDetailsText && (
                                <Text style={styles.headerSubtitle}>{routeDetailsText}</Text>
                            )}
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color="#64748B" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        {/* Passenger Name */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>PASSENGER FULL NAME</Text>
                            <TextInput
                                value={passengerName}
                                onChangeText={setPassengerName}
                                placeholder="Enter full name (as on ID)"
                                placeholderTextColor="#CBD5E1"
                                style={styles.textInput}
                            />
                        </View>

                        {/* Passenger Phone */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>PHONE NUMBER</Text>
                            <TextInput
                                value={passengerPhone}
                                onChangeText={setPassengerPhone}
                                placeholder="e.g. +1 555-0199"
                                placeholderTextColor="#CBD5E1"
                                keyboardType="phone-pad"
                                style={styles.textInput}
                            />
                        </View>

                        {/* Seat Preference */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>SEAT PREFERENCE</Text>
                            <View style={styles.buttonGroup}>
                                {['Window', 'Aisle', 'Middle'].map((pref) => (
                                    <TouchableOpacity
                                        key={pref}
                                        onPress={() => setSeatPreference(pref)}
                                        style={[
                                            styles.optionButton,
                                            seatPreference === pref ? styles.optionButtonActive : null
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.optionText,
                                                seatPreference === pref ? styles.optionTextActive : null
                                            ]}
                                        >
                                            {pref}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Meal Preference */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>MEAL PREFERENCE</Text>
                            <View style={styles.buttonGroup}>
                                {['Standard', 'Vegetarian', 'Vegan'].map((meal) => (
                                    <TouchableOpacity
                                        key={meal}
                                        onPress={() => setMealPreference(meal)}
                                        style={[
                                            styles.optionButton,
                                            mealPreference === meal ? styles.optionButtonActive : null
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.optionText,
                                                mealPreference === meal ? styles.optionTextActive : null
                                            ]}
                                        >
                                            {meal}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Luggage Count */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>LUGGAGE SELECTOR</Text>
                            <View style={styles.buttonGroup}>
                                {[0, 1, 2].map((num) => (
                                    <TouchableOpacity
                                        key={num}
                                        onPress={() => setLuggageCount(num)}
                                        style={[
                                            styles.optionButton,
                                            luggageCount === num ? styles.optionButtonActive : null
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.optionText,
                                                luggageCount === num ? styles.optionTextActive : null
                                            ]}
                                        >
                                            {num === 0 ? 'Handbag' : `${num} Bag (+£${num * 20})`}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Insurance Switch Row */}
                        <View style={styles.switchRow}>
                            <View style={styles.switchTextContainer}>
                                <Text style={styles.switchTitle}>🛡 Premium Travel Insurance</Text>
                                <Text style={styles.switchSubtitle}>Add insurance covering trip disruptions and emergency medical care (+£29).</Text>
                            </View>
                            <Switch
                                value={hasInsurance}
                                onValueChange={setHasInsurance}
                                trackColor={{ false: "#CBD5E1", true: "#003580" }}
                            />
                        </View>

                        {/* Special Assistance Switch Row */}
                        <View style={styles.switchRow}>
                            <View style={styles.switchTextContainer}>
                                <Text style={styles.switchTitle}>♿ Special Assistance Needed</Text>
                                <Text style={styles.switchSubtitle}>Check this if you require wheel-chair access or boarding assistance.</Text>
                            </View>
                            <Switch
                                value={specialAssistance}
                                onValueChange={setSpecialAssistance}
                                trackColor={{ false: "#CBD5E1", true: "#003580" }}
                            />
                        </View>

                        {/* Conditional Special Assistance inputs */}
                        {specialAssistance && (
                            <View style={styles.conditionalContainer}>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>TYPE OF ASSISTANCE / CONDITION</Text>
                                    <TextInput
                                        value={specialAssistanceType}
                                        onChangeText={setSpecialAssistanceType}
                                        placeholder="e.g. Wheelchair access, Visual impairment"
                                        placeholderTextColor="#CBD5E1"
                                        style={styles.textInput}
                                    />
                                </View>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>ADDITIONAL EQUIPMENT REQUIRED</Text>
                                    <TextInput
                                        value={specialAssistanceEquipment}
                                        onChangeText={setSpecialAssistanceEquipment}
                                        placeholder="e.g. Folding wheelchair size details"
                                        placeholderTextColor="#CBD5E1"
                                        style={styles.textInput}
                                    />
                                </View>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>EMERGENCY CONTACT FULL NAME</Text>
                                    <TextInput
                                        value={emergencyContactName}
                                        onChangeText={setEmergencyContactName}
                                        placeholder="Enter contact full name"
                                        placeholderTextColor="#CBD5E1"
                                        style={styles.textInput}
                                    />
                                </View>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>EMERGENCY CONTACT PHONE</Text>
                                    <TextInput
                                        value={emergencyContactPhone}
                                        onChangeText={setEmergencyContactPhone}
                                        placeholder="e.g. +1 555-0199"
                                        placeholderTextColor="#CBD5E1"
                                        keyboardType="phone-pad"
                                        style={styles.textInput}
                                    />
                                </View>
                            </View>
                        )}
                    </ScrollView>

                    {/* Confirmation Buttons */}
                    <View style={styles.footerButtons}>
                        <TouchableOpacity
                            onPress={onClose}
                            style={styles.cancelButton}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={onSubmit}
                            disabled={isSubmitting}
                            style={styles.submitButton}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <Text style={styles.submitButtonText}>Confirm & Book</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        maxHeight: '90%',
        paddingBottom: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    headerTitle: {
        fontSize: wp(5.2),
        fontFamily: 'Outfit-Bold',
        color: '#0F172A',
    },
    headerSubtitle: {
        fontSize: wp(3.2),
        fontFamily: 'Outfit-Medium',
        color: '#64748B',
        marginTop: 2,
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F8FAFC',
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 40,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 10,
        fontFamily: 'Outfit-Bold',
        color: '#94A3B8',
        letterSpacing: 1,
        marginBottom: 8,
    },
    textInput: {
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#F1F5F9',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 14,
        fontFamily: 'Outfit-Medium',
        color: '#0F172A',
    },
    buttonGroup: {
        flexDirection: 'row',
        gap: 8,
    },
    optionButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        backgroundColor: 'white',
        alignItems: 'center',
    },
    optionButtonActive: {
        backgroundColor: '#003580',
        borderColor: '#003580',
    },
    optionText: {
        fontSize: 12,
        fontFamily: 'Outfit-Bold',
        color: '#475569',
    },
    optionTextActive: {
        color: 'white',
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        marginBottom: 16,
    },
    switchTextContainer: {
        flex: 1,
        marginRight: 8,
    },
    switchTitle: {
        fontSize: 12,
        fontFamily: 'Outfit-Bold',
        color: '#0F172A',
    },
    switchSubtitle: {
        fontSize: 9,
        fontFamily: 'Outfit-Medium',
        color: '#64748B',
        marginTop: 2,
    },
    conditionalContainer: {
        paddingLeft: 12,
        borderLeftWidth: 2,
        borderLeftColor: '#003580',
        marginTop: 8,
        marginBottom: 16,
    },
    footerButtons: {
        flexDirection: 'row',
        gap: 16,
        paddingHorizontal: 24,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 16,
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 16,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 15,
        fontFamily: 'Outfit-Bold',
        color: '#475569',
    },
    submitButton: {
        flex: 1,
        paddingVertical: 16,
        backgroundColor: '#003580',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitButtonText: {
        fontSize: 15,
        fontFamily: 'Outfit-Bold',
        color: 'white',
    },
});
