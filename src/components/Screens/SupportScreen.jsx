import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import { createTicket, getUserTickets } from "../../api/endpoint";
import { Feather, FontAwesome6 } from "@expo/vector-icons";
import UserTickets from "./UserTickets";

export default function SupportScreen({ navigation }) {
  const [data, setData] = useState({ title: "", description: "" });
  const [loading, setIsLoading] = useState(false);
  const [loadingTicket, setLoadingTicket] = useState(false);
  const [userTickets, setUserTickets] = useState([]);
  const [visible, setVisible] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  function getInput(name, value) {
    setData((prev) => ({ ...prev, [name]: value }));
  }

  async function postTicket() {
    setIsLoading(true);
    try {
      if (!data.title.trim() || !data.description.trim()) {
        Toast.show({
          type: "info",
          text1: "empty fields",
          text2: "Please type your message",
          visibilityTime: 4000,
          autoHide: true,
        });
        return;
      }
      await createTicket(data);

      setData({ title: "", description: "" });

      Toast.show({
        type: "success",
        text1: "Ticket sent",
        text2: "Your request has been sent successfully",
        autoHide: true,
      });
    } catch (error) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Your request could not be submitted. Please try again.",
        visibilityTime: 4000,
        autoHide: true,
      });
    } finally {
      setIsLoading(false);
    }
  }

  const isFormValid = data.title.trim() && data.description.trim();

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={{ marginRight: 20 }}
          onPress={() => setVisible(true)}
        >
          <FontAwesome6 name="message" size={20} color="black" />
        </TouchableOpacity>
      ),
    });
  }, []);

  async function fetchUserTickets() {
    try {
      setLoadingTicket(true);
      const res = await getUserTickets();
      setUserTickets(res.data);
    } catch (error) {
      console.error("Error fetching user tickets:", error);
    } finally {
      setLoadingTicket(false);
    }
  }

  useEffect(() => {
    fetchUserTickets();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerIcon}>
              <Feather name="headphones" size={24} color="#3498db" />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Support Center</Text>
              <Text style={styles.headerSubtitle}>
                Need help? We're here for you.
              </Text>
            </View>
          </View>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Feather name="info" size={20} color="#3498db" />
              <Text style={styles.infoTitle}>
                Before submitting your request
              </Text>
            </View>
            <View style={styles.infoList}>
              <Text style={styles.infoItem}>
                • Describe your problem clearly and in detail
              </Text>
              <Text style={styles.infoItem}>
                • Includes steps to reproduce the issue if applicable
              </Text>
              <Text style={styles.infoItem}>
                • Our team will respond within 24 hours.
              </Text>
            </View>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            <View style={styles.formHeader}>
              <Feather name="edit-3" size={20} color="#27ae60" />
              <Text style={styles.formTitle}>New Support Request</Text>
            </View>

            {/* Title Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Title of your request <Text style={styles.required}>*</Text>
              </Text>
              <View
                style={[
                  styles.inputContainer,
                  focusedField === "title" && styles.inputFocused,
                ]}
              >
                <Feather
                  name="type"
                  size={18}
                  color="#7f8c8d"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="Eg: Problem with login"
                  placeholderTextColor="#bdc3c7"
                  onChangeText={(text) => getInput("title", text)}
                  value={data.title}
                  autoCapitalize="sentences"
                  onFocus={() => setFocusedField("title")}
                  onBlur={() => setFocusedField(null)}
                  maxLength={100}
                />
              </View>
              <Text style={styles.characterCount}>
                {data.title.length}/100 charecters
              </Text>
            </View>

            {/* Description Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Detailed description <Text style={styles.required}>*</Text>
              </Text>
              <View
                style={[
                  styles.inputContainer,
                  styles.textAreaContainer,
                  focusedField === "description" && styles.inputFocused,
                ]}
              >
                <Feather
                  name="message-square"
                  size={18}
                  color="#7f8c8d"
                  style={styles.textAreaIcon}
                />
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Please describe your problem or request in detail. Include any relevant information that may help us better understand your situation."
                  placeholderTextColor="#bdc3c7"
                  onChangeText={(text) => getInput("description", text)}
                  value={data.description}
                  autoCapitalize="sentences"
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                  onFocus={() => setFocusedField("description")}
                  onBlur={() => setFocusedField(null)}
                  maxLength={500}
                />
              </View>
              <Text style={styles.characterCount}>
                {data.description.length}/500 charecters
              </Text>
            </View>

            {/* Priority Info */}
            <View style={styles.priorityInfo}>
              <View style={styles.priorityHeader}>
                <Feather name="clock" size={16} color="#f39c12" />
                <Text style={styles.priorityTitle}>
                  Estimated response time
                </Text>
              </View>
              <Text style={styles.priorityText}>
                Our support team will review your request and respond within 24
                hours during business days.
              </Text>
            </View>
          </View>

          {/* Contact Info Card */}
          <View style={styles.contactCard}>
            <View style={styles.contactHeader}>
              <Feather name="phone" size={18} color="#e74c3c" />
              <Text style={styles.contactTitle}>Do you need urgent help?</Text>
            </View>
            <Text style={styles.contactText}>
              For emergencies or critical issues, you can contact us directly:
            </Text>
            <View style={styles.contactMethods}>
              <View style={styles.contactMethod}>
                <Feather name="mail" size={16} color="#3498db" />
                <Text style={styles.contactMethodText}>
                  soporte@agilcurn.com
                </Text>
              </View>
              <View style={styles.contactMethod}>
                <Feather name="phone" size={16} color="#27ae60" />
                <Text style={styles.contactMethodText}>+1 (555) 123-4567</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.submitContainer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!isFormValid || loading) && styles.submitButtonDisabled,
            ]}
            onPress={postTicket}
            disabled={!isFormValid || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Feather name="send" size={18} color="#fff" />
                <Text style={styles.submitButtonText}>Send Request</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      <UserTickets
        visible={visible || false}
        setVisible={setVisible}
        loading={loadingTicket}
        setLoading={setLoadingTicket}
        userTickets={userTickets}
        setUserTickets={setUserTickets}
        fetchUserTickets={fetchUserTickets}
      />
      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#ebf3fd",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2c3e50",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#7f8c8d",
    lineHeight: 20,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#3498db",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginLeft: 8,
  },
  infoList: {
    gap: 8,
  },
  infoItem: {
    fontSize: 14,
    color: "#7f8c8d",
    lineHeight: 20,
  },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
    marginLeft: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 8,
  },
  required: {
    color: "#e74c3c",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e9ecef",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputFocused: {
    borderColor: "#3498db",
    backgroundColor: "#fff",
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#2c3e50",
    padding: 0,
  },
  textAreaContainer: {
    alignItems: "flex-start",
    paddingVertical: 16,
  },
  textAreaIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  characterCount: {
    fontSize: 12,
    color: "#7f8c8d",
    textAlign: "right",
    marginTop: 4,
  },
  priorityInfo: {
    backgroundColor: "#fef9e7",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#f39c12",
  },
  priorityHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  priorityTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2c3e50",
    marginLeft: 8,
  },
  priorityText: {
    fontSize: 14,
    color: "#7f8c8d",
    lineHeight: 20,
  },
  contactCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#e74c3c",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginLeft: 8,
  },
  contactText: {
    fontSize: 14,
    color: "#7f8c8d",
    lineHeight: 20,
    marginBottom: 16,
  },
  contactMethods: {
    gap: 12,
  },
  contactMethod: {
    flexDirection: "row",
    alignItems: "center",
  },
  contactMethodText: {
    fontSize: 14,
    color: "#2c3e50",
    marginLeft: 8,
    fontWeight: "500",
  },
  submitContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  submitButton: {
    backgroundColor: "#27ae60",
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#27ae60",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    backgroundColor: "#bdc3c7",
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
