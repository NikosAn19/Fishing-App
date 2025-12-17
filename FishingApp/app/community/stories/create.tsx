import { Stack } from 'expo-router';
import CreateStoryScreen from '../../../src/features/community/stories/screens/CreateStoryScreen';

export default function CreateStoryRoute() {
    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <CreateStoryScreen />
        </>
    );
}
