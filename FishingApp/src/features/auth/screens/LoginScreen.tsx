import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import * as Google from "expo-auth-session/providers/google";
import { colors } from "../../../theme/colors";
import { useAuth } from "../hooks/useAuth";
import { AuthStatus } from "../types";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const GOOGLE_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ||
  process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID;

export function LoginScreen() {
  const router = useRouter();
  const { login, loginWithGoogle, error, clearError, isLoading, status } =
    useAuth();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: GOOGLE_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === "success" && response.authentication?.idToken) {
      loginWithGoogle({ idToken: response.authentication.idToken });
    } else if (response?.type === "error") {
      Alert.alert("Google Sign-In failed", response.error?.message ?? "");
    }
  }, [response, loginWithGoogle]);

  useEffect(() => {
    if (status === AuthStatus.AUTHENTICATED) {
      router.replace("/");
    }
  }, [status, router]);

  useEffect(() => {
    if (error) {
      Alert.alert("Authentication error", error, [
        { text: "OK", onPress: clearError },
      ]);
    }
  }, [error, clearError]);

  const canSubmit = useMemo(
    () => email.trim().length > 0 && password.length >= 6 && !isLoading,
    [email, password, isLoading]
  );

  const handleLogin = async () => {
    if (!canSubmit) return;
    await login({ email: email.trim(), password });
  };

  const handleGoogleLogin = async () => {
    if (!GOOGLE_CLIENT_ID) {
      Alert.alert(
        "Google Sign-In unavailable",
        "Set EXPO_PUBLIC_GOOGLE_CLIENT_ID in your env to enable Google login."
      );
      return;
    }
    await promptAsync();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <LinearGradient
        colors={["rgba(18, 219, 192, 0.7)", "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.6 }}
        style={[styles.hero, { paddingTop: insets.top + 32 }]}
      >
        <View style={styles.heroContent}>
          <Text style={styles.title}>Καλώς ήρθατε </Text>
          <Text style={styles.subtitle}>
            Συνδεθείτε για να συνεχίσετε την περιπέτειά σας και να απολαύσετε
            προσωπικές προβλέψεις.
          </Text>
        </View>
      </LinearGradient>

      <View style={[styles.inner, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Σύνδεση με Email</Text>

          <View style={styles.form}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="name@example.com"
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
              placeholderTextColor="rgba(255,255,255,0.4)"
            />

            <Text style={styles.label}>Κωδικός</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="********"
              secureTextEntry
              style={styles.input}
              placeholderTextColor="rgba(255,255,255,0.4)"
            />

            <TouchableOpacity
              style={[
                styles.primaryButton,
                !canSubmit && styles.buttonDisabled,
              ]}
              onPress={handleLogin}
              disabled={!canSubmit}
            >
              <LinearGradient
                colors={["#12dbc0", "#0fb8a4"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.primaryButtonGradient}
              >
                <Text style={styles.primaryButtonText}>
                  {isLoading ? "Σύνδεση..." : "Σύνδεση"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ή</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleLogin}
            activeOpacity={0.85}
          >
            <Ionicons name="logo-google" size={20} color={colors.white} />
            <Text style={styles.googleButtonText}>Συνδεθείτε με Google</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.linkContainer}
          onPress={() => router.replace("/register")}
        >
          <Text style={styles.linkText}>
            Δεν έχετε λογαριασμό;{" "}
            <Text style={styles.linkHighlight}>Εγγραφείτε εδώ</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBg,
  },
  hero: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  heroContent: {
    gap: 12,
    maxWidth: 320,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    color: colors.white,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 32,
    lineHeight: 22,
  },
  card: {
    backgroundColor: "rgba(14, 23, 33, 0.75)",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 6,
  },
  sectionTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  form: {
    gap: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.white,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: colors.white,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  primaryButton: {
    borderRadius: 14,
    marginTop: 8,
    overflow: "hidden",
  },
  primaryButtonGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  dividerText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    paddingVertical: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    gap: 12,
  },
  googleButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "600",
  },
  linkContainer: {
    marginTop: 12,
    alignItems: "center",
  },
  linkText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  linkHighlight: {
    color: colors.accent,
    fontWeight: "600",
  },
});
