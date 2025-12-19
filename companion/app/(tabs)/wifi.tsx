import * as Location from "expo-location";
import React from "react";
import {
    ActivityIndicator,
    Alert,
    Button,
    PermissionsAndroid,
    Platform,
    Text,
    TextInput,
    View,
} from "react-native";
import WifiManager from "react-native-wifi-reborn";

async function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function askGPSPermission() {
    if (Platform.OS === "android") {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
                title: "Location permission is required for WiFi connections",
                message:
                    "This app needs location permission as this is required  " +
                    "to scan for wifi networks.",
                buttonNegative: "DENY",
                buttonPositive: "ALLOW",
            }
        );
        if (!granted) {
            throw new Error("Missing Android permission");
        }
    }
}

export default function WelcomeScreen() {
    const [ssid, setSSID] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [ssidMain, setSSIDMain] = React.useState("");
    const [passwordMain, setPasswordMain] = React.useState("");
    const [currentWifiSSID, setCurrentWifiSSID] = React.useState("");
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
        const getInitialSSID = async () => {
            try {
                await delay(1000);
                await askGPSPermission();
                await Location.requestForegroundPermissionsAsync();
                const res = await WifiManager.getCurrentWifiSSID();
                setCurrentWifiSSID(res);
            } catch (err) {
                if (err instanceof Error) {
                    Alert.alert("ERROR", err.message);
                }
            }
        };
        getInitialSSID();
    }, []);

    return (
        <View
            style={{
                flex: 1,
                paddingTop: 100,
                paddingHorizontal: 20,
            }}
        >
            <Text>Current WiFi: {currentWifiSSID}</Text>

            <View
                style={{
                    height: 1,
                    backgroundColor: "black",
                    marginVertical: 10,
                }}
            />

            <Text>IOT WIFI CONFIG</Text>

            <TextInput
                placeholder="SSID"
                value={ssid}
                onChangeText={setSSID}
                style={{ borderWidth: 1, height: 60, marginTop: 20 }}
            />
            <TextInput
                placeholder="PASSWORD"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={{ borderWidth: 1, height: 60, marginBottom: 20 }}
            />

            <View
                style={{
                    height: 1,
                    backgroundColor: "black",
                    marginVertical: 10,
                }}
            />

            <Text>MAIN WIFI CONFIG</Text>

            <TextInput
                placeholder="SSID MAIN WIFI"
                value={ssidMain}
                onChangeText={setSSIDMain}
                style={{ borderWidth: 1, height: 60, marginTop: 20 }}
            />
            <TextInput
                placeholder="PASSWORD MAIN WIFI"
                value={passwordMain}
                onChangeText={setPasswordMain}
                secureTextEntry
                style={{ borderWidth: 1, height: 60, marginBottom: 20 }}
            />

            {loading ? (
                <ActivityIndicator size={"large"} />
            ) : (
                <Button title="Connect" />
            )}
        </View>
    );
}
