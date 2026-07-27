import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    SafeAreaView,
    StatusBar,
    StyleSheet
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { useAuth } from "../shared/data/AuthContext";
import api from "../shared/data/api";

interface Message {
    id: string;
    text: string;
    sender: "user" | "bot";
    timestamp: Date;
    suggestions?: string[];
}

export default function ChatbotScreen() {
    const { isDarkMode, user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    // Dynamic Theme Variables
    const bgColor = isDarkMode ? "#0F172A" : "#F8FAFC";
    const cardBg = isDarkMode ? "#1E293B" : "#FFFFFF";
    const borderColor = isDarkMode ? "#334155" : "#E2E8F0";
    const primaryText = isDarkMode ? "#F8FAFC" : "#0F172A";
    const secondaryText = isDarkMode ? "#94A3B8" : "#64748B";
    const accentColor = isDarkMode ? "#38BDF8" : "#003580";

    useEffect(() => {
        setMessages([
            {
                id: "welcome",
                text: `Hi ${user ? user.name : "there"}! 👋 I am your EasyRoute Travel Assistant. I'm here to help you design itineraries, estimate smart budgets, find eco-friendly routes, or review your bookings. Ask me anything, or tap one of the suggested topics below!`,
                sender: "bot",
                timestamp: new Date(),
                suggestions: ["Budget Tips", "Create a Plan", "Eco-Friendly Travel", "How to Book"]
            }
        ]);
    }, [user]);

    const scrollToBottom = () => {
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 80);
    };

    const handleSendMessage = async (textToSend: string) => {
        if (!textToSend.trim() || isLoading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text: textToSend,
            sender: "user",
            timestamp: new Date()
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);
        scrollToBottom();

        try {
            const response = await api.post("chatbot/message", { message: textToSend });
            
            if (response.data.success) {
                const botMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    text: response.data.data.reply,
                    sender: "bot",
                    timestamp: new Date(response.data.data.timestamp),
                    suggestions: response.data.data.suggestions
                };
                setMessages((prev) => [...prev, botMsg]);
            }
        } catch (error) {
            console.error("Chatbot API failed:", error);
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: "Sorry, I am having trouble connecting to my servers. Please make sure you are logged in and try again later.",
                sender: "bot",
                timestamp: new Date()
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
            scrollToBottom();
        }
    };

    const renderMessageText = (text: string, isUser: boolean) => {
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return (
            <Text style={[
                styles.messageText, 
                isUser ? styles.userMessageText : (isDarkMode ? styles.botMessageTextDark : styles.botMessageText)
            ]}>
                {parts.map((part, index) => {
                    if (part.startsWith("**") && part.endsWith("**")) {
                        return (
                            <Text key={index} style={{ fontFamily: "Outfit-Bold" }}>
                                {part.slice(2, -2)}
                            </Text>
                        );
                    }
                    return part;
                })}
            </Text>
        );
    };

    const renderItem = ({ item }: { item: Message }) => {
        const isUser = item.sender === "user";
        return (
            <View style={[styles.messageContainer, isUser ? styles.userContainer : styles.botContainer]}>
                {!isUser && (
                    <View style={[styles.botAvatar, { backgroundColor: accentColor }]}>
                        <Ionicons name="sparkles" size={14} color="white" />
                    </View>
                )}
                {/* Fixed wrapper to align content properly to the right side for the user */}
                <View style={{ flex: 1, alignItems: isUser ? "flex-end" : "flex-start" }}>
                    <View style={[
                        styles.bubble,
                        isUser ? [styles.userBubble, { backgroundColor: accentColor }] : (isDarkMode ? styles.botBubbleDark : styles.botBubble),
                        { borderColor: borderColor }
                    ]}>
                        {renderMessageText(item.text, isUser)}
                        <Text style={[styles.timeText, isUser ? styles.userTimeText : styles.botTimeText]}>
                            {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </View>

                    {item.suggestions && item.suggestions.length > 0 && (
                        <View style={[styles.suggestionsContainer, isUser ? { justifyContent: "flex-end" } : null]}>
                            {item.suggestions.map((sug, idx) => (
                                <TouchableOpacity
                                    key={idx}
                                    onPress={() => handleSendMessage(sug)}
                                    activeOpacity={0.7}
                                    style={[
                                        styles.suggestionChip, 
                                        isDarkMode ? styles.suggestionChipDark : styles.suggestionChipLight,
                                        { borderColor: isDarkMode ? "#334155" : "#BFDBFE" }
                                    ]}
                                >
                                    <Text style={[styles.suggestionText, { color: accentColor }]}>
                                        {sug}
                                    </Text>
                                    <Ionicons name="arrow-forward-circle-outline" size={14} color={accentColor} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={bgColor} />

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardContainer}
                keyboardVerticalOffset={Platform.OS === "ios" ? 44 : 0} 
            >
                {/* Chat Header */}
                <View style={[styles.header, { backgroundColor: cardBg, borderBottomColor: borderColor }]}>
                    <View style={styles.headerTitleContainer}>
                        <View style={[styles.avatarLarge, { backgroundColor: accentColor }]}>
                            <Ionicons name="airplane" size={18} color="white" />
                            <View style={[styles.activeDot, { borderColor: cardBg }]} />
                        </View>
                        <View style={{ marginLeft: 12 }}>
                            <Text style={[styles.headerTitle, { color: primaryText }]}>Travel Planner Bot</Text>
                            <Text style={[styles.headerSubtitle, { color: secondaryText }]}>AI Itinerary & Budget Assistant</Text>
                        </View>
                    </View>
                </View>

                {/* Messages List */}
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    keyboardDismissMode="on-drag"
                    ListFooterComponent={
                        isLoading ? (
                            <View style={styles.typingContainer}>
                                <View style={[styles.botAvatar, { backgroundColor: accentColor }]}>
                                    <Ionicons name="sparkles" size={14} color="white" />
                                </View>
                                <View style={[styles.bubble, isDarkMode ? styles.botBubbleDark : styles.botBubble, styles.typingBubble, { borderColor: borderColor }]}>
                                    <ActivityIndicator size="small" color={accentColor} />
                                    <Text style={[styles.typingText, isDarkMode ? styles.botMessageTextDark : styles.botMessageText]}>
                                        Assistant is typing...
                                    </Text>
                                </View>
                            </View>
                        ) : null
                    }
                />

                {/* Input Area */}
                <View style={[styles.inputContainer, { backgroundColor: cardBg, borderTopColor: borderColor }]}>
                    <TextInput
                        value={input}
                        onChangeText={setInput}
                        onFocus={scrollToBottom}
                        placeholder="Ask about budgets, routes, or booking..."
                        placeholderTextColor={secondaryText}
                        style={[styles.textInput, {
                            backgroundColor: isDarkMode ? "#0F172A" : "#F8FAFC",
                            color: primaryText,
                            borderColor: borderColor
                        }]}
                    />
                    <TouchableOpacity
                        onPress={() => handleSendMessage(input)}
                        disabled={!input.trim() || isLoading}
                        style={[
                            styles.sendButton,
                            (!input.trim() || isLoading) 
                                ? styles.sendButtonDisabled 
                                : { backgroundColor: accentColor }
                        ]}
                    >
                        <Ionicons name="send" size={18} color="white" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    keyboardContainer: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: Platform.OS === "android" ? 30 : 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
    },
    headerTitleContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    avatarLarge: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
    },
    activeDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#22C55E",
        position: "absolute",
        bottom: -1,
        right: -1,
        borderWidth: 2,
    },
    headerTitle: {
        fontSize: wp(4.2),
        fontFamily: "Outfit-Bold",
    },
    headerSubtitle: {
        fontSize: wp(3),
        fontFamily: "Outfit-Medium",
        marginTop: 1,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 20,
        flexGrow: 1,
    },
    messageContainer: {
        flexDirection: "row",
        marginBottom: 16,
        alignItems: "flex-end",
    },
    userContainer: {
        justifyContent: "flex-end",
    },
    botContainer: {
        justifyContent: "flex-start",
    },
    botAvatar: {
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 8,
    },
    bubble: {
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: 10,
        maxWidth: wp("72%"),
    },
    userBubble: {
        alignSelf: "flex-end",
        borderBottomRightRadius: 4,
    },
    botBubble: {
        backgroundColor: "white",
        borderBottomLeftRadius: 4,
        borderWidth: 1,
    },
    botBubbleDark: {
        backgroundColor: "#1E293B",
        borderBottomLeftRadius: 4,
        borderWidth: 1,
    },
    messageText: {
        fontSize: 14,
        lineHeight: 19,
    },
    userMessageText: {
        color: "white",
        fontFamily: "Outfit-Medium",
    },
    botMessageText: {
        color: "#1E293B",
        fontFamily: "Outfit-Medium",
    },
    botMessageTextDark: {
        color: "#F1F5F9",
        fontFamily: "Outfit-Medium",
    },
    timeText: {
        fontSize: 9,
        marginTop: 5,
        alignSelf: "flex-end",
        fontFamily: "Outfit-Regular",
    },
    userTimeText: {
        color: "rgba(255, 255, 255, 0.7)",
    },
    botTimeText: {
        color: "#94A3B8",
    },
    suggestionsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 6,
        marginTop: 8,
        paddingLeft: 4,
    },
    suggestionChip: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 6,
        gap: 4,
    },
    suggestionChipLight: {
        backgroundColor: "#EFF6FF",
    },
    suggestionChipDark: {
        backgroundColor: "#0F172A",
    },
    suggestionText: {
        fontSize: 11,
        fontFamily: "Outfit-Bold",
    },
    typingContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    typingBubble: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingVertical: 8,
    },
    typingText: {
        fontSize: 12,
        fontFamily: "Outfit-Medium",
        marginLeft: 2,
    },
    inputContainer: {
        flexDirection: "row",
        paddingHorizontal: 12,
        paddingVertical: 10,
        alignItems: "center",
        borderTopWidth: 1,
    },
    textInput: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 22,
        paddingHorizontal: 16,
        paddingVertical: Platform.OS === "ios" ? 15 : 15,
        fontSize: 14,
        fontFamily: "Outfit-Medium",
        marginRight: 8,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    sendButtonDisabled: {
        backgroundColor: "#E2E8F0",
    },
});