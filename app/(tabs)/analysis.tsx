import { Stack } from 'expo-router';
import { useState } from 'react';
import { View, Alert } from 'react-native';
import { Button } from '~/components/nativewindui/Button';
import { Text } from '~/components/nativewindui/Text';
import {
  analyzePhotosWithProgress,
  PhotoAnalysisResult,
  getDeletionCandidates,
} from '~/lib/photoAnalyzer';
import { ProgressIndicator } from '~/components/nativewindui/ProgressIndicator';
import { useRecycleBinStore } from '~/store/store';

export default function AnalysisScreen() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PhotoAnalysisResult | null>(null);
  const [progress, setProgress] = useState(0);
  const addDeletedPhoto = useRecycleBinStore((s) => s.addDeletedPhoto);

  const handleQuickClean = () => {
    if (!result) return;
    const candidates = getDeletionCandidates(result);
    candidates.forEach((asset) => {
      addDeletedPhoto({ id: asset.id, imageUri: asset.uri, deletedAt: new Date() });
    });
    Alert.alert(
      'Quick Clean Complete',
      `${candidates.length} photo${candidates.length === 1 ? '' : 's'} moved to recycle bin.`
    );
  };

  const handleScan = async () => {
    setLoading(true);
    setProgress(0);
    try {
      const res = await analyzePhotosWithProgress((done, total) => {
        setProgress(Math.round((done / total) * 100));
      });
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
            <Text className="mb-1">Portrait: {result.byOrientation.portrait.length}</Text>
            <Text className="mb-1">Landscape: {result.byOrientation.landscape.length}</Text>
            <Text className="mb-1">Square: {result.byOrientation.square.length}</Text>
            <Text className="mb-1">Screenshots: {result.screenshots.length}</Text>
            <Text className="mb-1">Selfies: {result.selfies.length}</Text>
            <Text className="mb-1">Old photos: {result.oldPhotos.length}</Text>
            <Text className="mb-1">Low res: {result.lowRes.length}</Text>
            <Text>Duplicate groups: {result.duplicates.length}</Text>
          </View>
        ) : (
          <Text className="mb-4 text-center">
            Analyze your gallery to categorize photos and find duplicates.
          </Text>
        )}
        {loading && (
          <View className="my-4 w-full">
            <ProgressIndicator value={progress} />
            <Text className="mt-2 text-center">Scanning: {progress}%</Text>
          </View>
        )}
        <Button onPress={handleScan} variant="primary" disabled={loading} className="mb-2">
          <Text>{loading ? 'Scanning…' : 'Start Scan'}</Text>
        </Button>
        {result && !loading && (
          <Button onPress={handleQuickClean} variant="secondary">
            <Text>Quick Clean</Text>
          </Button>
        )}
      </View>
    </>
  );
}
