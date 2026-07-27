import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Ionicons } from '@expo/vector-icons';
import Modal from 'react-native-modal';

interface AppModalProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export default function AppModal({ visible, onClose, title, children }: AppModalProps) {
    return (
        <Modal
            isVisible={visible}
            onBackdropPress={onClose}
            onSwipeComplete={onClose}
            swipeDirection="down"
            backdropOpacity={0.4}
            useNativeDriverForBackdrop
            style={styles.modal}
            propagateSwipe={true} // Allow scrolling inside the modal
        >
            <View style={styles.modalContent}>
                <View className="w-12 h-1.5 bg-slate-100 rounded-full self-center mb-6" />
                
                <View className="flex-row justify-between items-center mb-6 px-2">
                    <Text style={{ fontSize: wp(5) }} className="font-[Outfit-Bold] text-slate-900">{title}</Text>
                    <TouchableOpacity onPress={onClose} className="bg-slate-50 p-2 rounded-full">
                        <Ionicons name="close" size={20} color="#94A3B8" />
                    </TouchableOpacity>
                </View>

                <ScrollView 
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: hp(5) }}
                    bounces={false} // Improves swipe handling on IOS
                >
                    {children}
                </ScrollView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modal: {
        justifyContent: 'flex-end',
        margin: 0,
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 35,
        borderTopRightRadius: 35,
        paddingHorizontal: 25,
        paddingTop: 15,
        maxHeight: hp(85), // Default to 85, let content drive if smaller
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    }
});
