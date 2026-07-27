import React from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { useAuth } from '../../data/AuthContext';

interface LogoutConfirmationModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export default function LogoutConfirmationModal({
    visible,
    onClose,
    onConfirm
}: LogoutConfirmationModalProps) {
    const { isDarkMode } = useAuth();

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View 
                    style={[
                        styles.modalContent, 
                        { backgroundColor: isDarkMode ? '#1E293B' : 'white' }
                    ]}
                >
                    {/* Logout Warning Icon */}
                    <View 
                        style={[
                            styles.iconContainer, 
                            { backgroundColor: isDarkMode ? '#312E81' : '#FEF2F2' }
                        ]}
                    >
                        <Ionicons name="log-out" size={32} color="#EF4444" />
                    </View>

                    {/* Titles */}
                    <Text 
                        style={[
                            styles.modalTitle, 
                            { color: isDarkMode ? '#F8FAFC' : '#0F172A' }
                        ]}
                    >
                        Confirm Logout
                    </Text>
                    <Text style={styles.modalSubtitle}>
                        Are you sure you want to log out of EasyRoute? You will need to input your PIN to access your account again.
                    </Text>

                    {/* Action Buttons */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            onPress={onClose}
                            style={[
                                styles.actionButton,
                                styles.cancelButton,
                                { backgroundColor: isDarkMode ? '#334155' : '#F8FAFC', borderColor: isDarkMode ? '#475569' : '#E2E8F0' }
                            ]}
                        >
                            <Text 
                                style={[
                                    styles.buttonText, 
                                    { color: isDarkMode ? '#94A3B8' : '#475569' }
                                ]}
                            >
                                Cancel
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={onConfirm}
                            style={[
                                styles.actionButton,
                                styles.confirmButton
                            ]}
                        >
                            <Text style={[styles.buttonText, styles.confirmText]}>
                                Log Out
                            </Text>
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
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    modalContent: {
        width: '100%',
        maxWidth: 340,
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 10,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: wp(4.8),
        fontFamily: 'Outfit-Bold',
        marginBottom: 8,
    },
    modalSubtitle: {
        fontSize: wp(3.3),
        fontFamily: 'Outfit-Medium',
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    actionButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        borderWidth: 1,
    },
    confirmButton: {
        backgroundColor: '#EF4444',
    },
    buttonText: {
        fontSize: 14,
        fontFamily: 'Outfit-Bold',
    },
    confirmText: {
        color: 'white',
    },
});
