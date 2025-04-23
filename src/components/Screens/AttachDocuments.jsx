import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { shareAsync } from "expo-sharing";
import * as Sharing from "expo-sharing";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Platform,
  ActivityIndicator,
  Animated,
  Image,
  LayoutAnimation,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import {
  uploadDocument,
  getProjectDocuments,
  deleteDocument,
  getDocumentDownloadUrl,
} from "../../api/endpoint";
import { Feather, AntDesign } from "@expo/vector-icons";
import { Spinner } from "./ReportScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AttachDocuments = ({ route, navigation }) => {
  const { projectId, projectName, creatorId } = route.params;
  const [document, setDocument] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadingDocument, setLoadingDocument] = useState(false);
  const [userId, setUserId] = useState(null);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const projectDocuments = await getProjectDocuments(projectId);
      setDocuments(projectDocuments);
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setIsLoading(false);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [projectId]);

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync();

      if (result.assets && result.assets.length > 0) {
        const selectedDocument = result.assets[0];
        setLoadingDocument(true);
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 6000,
          useNativeDriver: false,
        }).start(() => {
          setDocument(selectedDocument);
          setLoadingDocument(false);
          progressAnim.setValue(0);
        });
      }
    } catch (error) {
      console.error("Error al seleccionar documento:", error);
    }
  };
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const handleUploadDocument = async () => {
    if (document) {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", {
        uri: document.uri,
        name: document.name.replace(/[()]/g, ""),
        type: document.mimeType || "application/octet-stream",
      });
      try {
        await uploadDocument(projectId, formData);
        fetchDocuments();
        setDocument(null);
      } catch (error) {
        console.error("Upload failed", error);
        alert("Failed to upload document. Please try again.");
      } finally {
        setUploading(false);
      }
    } else {
      alert("Please select a document first.");
    }
  };

  const handleDownloadDocument = async (document) => {
    try {
      const uri = getDocumentDownloadUrl(projectId, document.id);
      const fileName = document.fileName || "downloaded_file.docx";
      const fileUri = FileSystem.documentDirectory + fileName;

      const downloadResumable = FileSystem.createDownloadResumable(
        uri,
        fileUri
      );
      const { uri: localUri } = await downloadResumable.downloadAsync();

      console.log("Download Successful", `File downloaded to: ${localUri}`);

      let fileProviderUri;

      const permissions =
        await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

      if ((Platform.OS = "android")) {
        if (permissions.granted) {
          const newUri =
            await FileSystem.StorageAccessFramework.createFileAsync(
              permissions.directoryUri,
              fileName,
              document.mimeType || "application/octet-stream"
            );

          const base64 = await FileSystem.readAsStringAsync(localUri, {
            encoding: FileSystem.EncodingType.Base64,
          });

          await FileSystem.writeAsStringAsync(newUri, base64, {
            encoding: FileSystem.EncodingType.Base64,
          });
        } else {
          shareAsync(fileProviderUri);
        }
      } else {
        await Sharing.shareAsync(localUri);
      }
    } catch (error) {
      console.error("Failed to open document", error);
    }
  };

  useEffect(() => {
    const fetchUserId = async () => {
      const storedUserId = await AsyncStorage.getItem("userId");
      setUserId(Number(storedUserId));
    };

    fetchUserId();
  }, []);

  const handleDeleteDocument = async (documentId, uploaderId) => {
    if (creatorId === userId || uploaderId === userId) {
      try {
        await deleteDocument(projectId, documentId);
        fetchDocuments();
      } catch (error) {
        console.error("Error deleting document:", error);
      }
    } else {
      alert("You are not authorized to delete this document.");
    }
  };

  const renderDocument = ({ item }) => (
    <View style={styles.documentItem}>
      <View style={styles.documentInfo}>
        <Text
          style={styles.documentName}
          numberOfLines={1}
          ellipsizeMode="middle"
        >
          {item.fileName}
        </Text>
        <View style={styles.uploaderContainer}>
          {item.uploader.profileImage && (
            <Image
              source={{ uri: item.uploader.profileImage }}
              style={styles.profileImage}
            />
          )}
          <Text style={styles.uploaderName}>{item.uploader.fullname}</Text>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => handleDownloadDocument(item)}
        >
          <Feather name="download" size={22} color="#4F46E5" />
        </TouchableOpacity>

        {(creatorId === userId || item.uploaderId === userId) && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => handleDeleteDocument(item.id, item.uploaderId)}
          >
            <Feather name="trash-2" size={22} color="#EF4444" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.normalHeader}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <AntDesign name="arrowleft" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.titleHeader}>Attach Documents</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      <View style={{padding: 20, flex: 1}}>
        <Text style={styles.title}>Documents for {projectName}</Text>

        <View style={styles.uploadSection}>
          <TouchableOpacity
            style={styles.uploadContainer}
            onPress={handlePickDocument}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <Feather name="upload-cloud" size={40} color="#4F46E5" />
            </View>
            <Text style={styles.iconText}>Select Document</Text>
          </TouchableOpacity>

          {loadingDocument && (
            <View style={styles.progressBarContainer}>
              <Animated.View
                style={[styles.progressBar, { width: progressWidth }]}
              />
            </View>
          )}

          {document && !loadingDocument && (
            <View style={styles.selectedDocContainer}>
              <Feather
                name="file"
                size={18}
                color="#4F46E5"
                style={styles.fileIcon}
              />
              <Text
                style={styles.documentText}
                numberOfLines={1}
                ellipsizeMode="middle"
              >
                {document.name}
              </Text>
            </View>
          )}

          {document && (
            <TouchableOpacity
              style={[
                styles.uploadButton,
                uploading ? styles.disabledButton : null,
              ]}
              onPress={handleUploadDocument}
              disabled={uploading}
              activeOpacity={0.8}
            >
              {uploading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <Feather
                    name="upload"
                    size={18}
                    color="white"
                    style={styles.buttonIcon}
                  />
                  <Text style={styles.uploadButtonText}>Upload</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Uploaded Documents</Text>

        {loading ? (
          <Spinner />
        ) : documents.length > 0 ? (
          <FlatList
            data={documents}
            keyExtractor={(item) => item.id.toString()}
            style={styles.documentList}
            renderItem={renderDocument}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Feather name="file-text" size={50} color="#D1D5DB" />
            <Text style={styles.emptyList}>No documents uploaded yet</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 10,
  },
  normalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  titleHeader: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 24,
    color: "#111827",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: "#374151",
  },
  uploadSection: {
    marginBottom: 20,
  },
  uploadContainer: {
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    backgroundColor: "#F3F4F6",
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  iconText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#4B5563",
  },
  progressBarContainer: {
    width: "100%",
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
    marginTop: 16,
    marginBottom: 16,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#4F46E5",
  },
  selectedDocContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF2FF",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  fileIcon: {
    marginRight: 8,
  },
  documentText: {
    fontSize: 15,
    flex: 1,
    color: "#4B5563",
  },
  uploadButton: {
    backgroundColor: "#4F46E5",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "center",
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonIcon: {
    marginRight: 8,
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    backgroundColor: "#9CA3AF",
    shadowOpacity: 0,
    elevation: 0,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 24,
  },
  documentList: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  documentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  documentInfo: {
    flex: 1,
    marginRight: 12,
  },
  documentName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
    marginBottom: 8,
  },
  uploaderContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  uploaderName: {
    fontSize: 14,
    color: "#6B7280",
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  emptyList: {
    fontSize: 16,
    color: "#9CA3AF",
    marginTop: 12,
  },
  spinnerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
});

export default AttachDocuments;
