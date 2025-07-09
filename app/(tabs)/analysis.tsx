import { Stack } from 'expo-router';
import { useState } from 'react';
import { View, Alert } from 'react-native';
import { Button } from '~/components/nativewindui/Button';
import { Text } from '~/components/nativewindui/Text';
import { analyzePhotos, PhotoAnalysisResult } from '~/lib/photoAnalyzer';

export default function AnalysisScreen() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PhotoAnalysisResult | null>(null);

  const handleScan = async () => {
    setLoading(true);
    try {
      const res = await analyzePhotos();
      setResult(res);
    } catch (err) {
      console.error('Failed to analyze photos', err);
      Alert.alert('Error', 'Failed to analyze photos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Scan' }} />
      <View className="flex-1 items-center justify-center p-4">
        {result ? (
          <View className="mb-6 items-center">
            <Text variant="title3" className="mb-4">
              Results
            </Text>
            <Text className="mb-1">
              Portrait: {result.byOrientation.portrait.length}
            </Text>
            <Text className="mb-1">
              Landscape: {result.byOrientation.landscape.length}
            </Text>
            <Text className="mb-1">
              Square: {result.byOrientation.square.length}
            </Text>
            <Text>Duplicate groups: {result.duplicates.length}</Text>
          </View>
        ) : (
          <Text className="mb-4 text-center">
            Analyze your gallery to categorize photos and find duplicates.
          </Text>
        )}
        <Button onPress={handleScan} variant="primary" disabled={loading}>
          <Text>{loading ? 'Scanning…' : 'Start Scan'}</Text>
        </Button>
      </View>
    </>
  );
}
