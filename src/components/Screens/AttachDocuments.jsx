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
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import {
  uploadDocument,
  getProjectDocuments,
  deleteDocument,
  getDocumentDownloadUrl,
} from "../../api/endpoint";
import Feather from "@expo/vector-icons/Feather";
import { Spinner } from "./ReportScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AttachDocuments = ({ route }) => {
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
      <View style={{ flexDirection: "column", flex: 1 }}>
        <Text style={styles.documentName}>{item.fileName}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 10 }}>
          {item.uploader.profileImage && (
            <Image
              source={{ uri: item.uploader.profileImage }}
              style={styles.profileImage}
            />
          )}
          <Text style={{ color: "#666" }}>{item.uploader.fullname}</Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", gap: 10 }}>
        <TouchableOpacity onPress={() => handleDownloadDocument(item)}>
          <Feather name="download" size={24} color="black" />
        </TouchableOpacity>
        {(creatorId === userId || item.uploaderId === userId) && (
          <TouchableOpacity
            onPress={() => handleDeleteDocument(item.id, item.uploaderId)}
          >
            <Feather name="trash-2" size={24} color="red" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Attach Documents for {projectName}</Text>

      <TouchableOpacity
        style={styles.iconContainer}
        onPress={handlePickDocument}
      >
        <Feather name="upload" size={50} color="black" />
        <Text style={styles.iconText}>Pick a Document</Text>
      </TouchableOpacity>

      {loadingDocument && (
        <View style={styles.progressBarContainer}>
          <Animated.View
            style={[styles.progressBar, { width: progressWidth }]}
          />
        </View>
      )}

      {document && !loadingDocument && (
        <Text style={styles.documentText}>{document.name}</Text>
      )}
      {document && (
        <TouchableOpacity
          style={[
            styles.uploadButton,
            uploading ? styles.disabledButton : null,
          ]}
          onPress={handleUploadDocument}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.uploadButtonText}>Upload Document</Text>
          )}
        </TouchableOpacity>
      )}
      {loading ? (
        <Spinner />
      ) : documents.length > 0 ? (
        <FlatList
          data={documents}
          keyExtractor={(item) => item.id.toString()}
          style={styles.documentList}
          renderItem={renderDocument}
        />
      ) : (
        <Text style={styles.emptyList}>No documents uploaded yet.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f7f7f7",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  iconText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
  },
  progressBarContainer: {
    width: "80%",
    height: 10,
    backgroundColor: "#e0e0e0",
    borderRadius: 5,
    overflow: "hidden",
    marginTop: 20,
    alignSelf: "center",
    marginBottom: 20,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#007bff",
  },
  documentText: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: "center",
    color: "#555",
  },
  disabledButton: {
    backgroundColor: "#b0b0b0",
  },
  uploadButton: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  documentList: {
    marginTop: 20,
  },
  documentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "#fff",
    marginBottom: 10,
    borderRadius: 10,
    elevation: 3,
  },
  documentName: {
    flex: 1,
    flexShrink: 1,
    marginRight: 10,
    fontSize: 16,
    color: "#333",
  },
  emptyList: {
    textAlign: "center",
    color: "#555",
    marginTop: 20,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginTop: 5,
  },
});

export default AttachDocuments;
