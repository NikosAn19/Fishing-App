import { useRef, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<"back" | "front">("back");
  const [flash, setFlash] = useState<"off" | "on" | "auto">("off");
  const camRef = useRef<CameraView>(null);
  const router = useRouter();

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>Χρειάζεται άδεια κάμερας</Text>
          <Pressable
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Δώσε άδεια</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const takePhoto = async () => {
    if (!camRef.current) return;
    try {
      console.log("📸 Taking photo...");
      // @ts-ignore - RN types διαφέρουν ανά SDK
      const photo = await camRef.current.takePictureAsync({
        quality: 0.9,
        skipProcessing: false,
        exif: true,
      });

      if (!photo?.uri) {
        console.warn("No photo URI returned");
        return;
      }

      console.log("📋 Photo object:", photo);
      console.log("🔗 Photo URI:", photo.uri);

      // Στείλ' το στο review ΚΩΔΙΚΟΠΟΙΗΜΕΝΟ
      const encoded = encodeURIComponent(photo.uri);
      router.push({ pathname: "/review", params: { uri: encoded } });
    } catch (error) {
      console.error("❌ Error taking photo:", error);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        ref={camRef}
        style={styles.camera}
        facing={facing}
        enableTorch={flash === "on"}
      />

      {/* Top Controls */}
      <View style={styles.topControls}>
        <Pressable style={styles.closeButton} onPress={() => router.back()}>
          <Text style={styles.closeButtonText}>✕</Text>
        </Pressable>

        <Pressable
          style={styles.flashButton}
          onPress={() => setFlash(flash === "off" ? "on" : "off")}
        >
          <Text style={styles.flashButtonText}>⚡</Text>
        </Pressable>
      </View>

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        <View style={styles.controlsRow}>
          <Pressable
            style={styles.controlButton}
            onPress={() => setFacing(facing === "back" ? "front" : "back")}
          >
            <Text style={styles.controlText}>Flip</Text>
          </Pressable>

          <Pressable style={styles.captureButton} onPress={takePhoto}>
            <Text style={styles.captureText}>●</Text>
          </Pressable>

          <View style={styles.placeholderButton} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black" },
  camera: { flex: 1 },
  topControls: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    zIndex: 10,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: { color: "white", fontSize: 20, fontWeight: "bold" },
  flashButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  flashButtonText: { fontSize: 20, color: "white" },
  bottomControls: {
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10,
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 40,
  },
  controlButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 8,
  },
  controlText: { color: "white", fontSize: 16, fontWeight: "500" },
  captureButton: {
    height: 80,
    width: 80,
    borderRadius: 40,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#12dbc0",
  },
  captureText: { fontSize: 40, color: "#12dbc0" },
  placeholderButton: { width: 60 },
  permissionContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  permissionText: {
    fontSize: 18,
    color: "white",
    textAlign: "center",
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: "#12dbc0",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: { color: "white", fontSize: 16, fontWeight: "600" },
});
