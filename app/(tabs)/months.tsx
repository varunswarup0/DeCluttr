import { Stack } from 'expo-router';
import { useState } from 'react';
import { View, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { Container } from '~/components/Container';
import { Text } from '~/components/nativewindui/Text';
import { deleteAssetsFromMonth } from '~/lib/mediaLibrary';

interface Month {
  year: number;
  month: number;
  label: string;
}

const generateMonths = (count: number = 12): Month[] => {
  const months: Month[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      label: d.toLocaleString('default', { month: 'long', year: 'numeric' }),
    });
  }
  return months;
};

export default function Months() {
  const [busy, setBusy] = useState(false);
  const months = generateMonths(12);

  const handleDelete = async (m: Month) => {
    Alert.alert('Delete Month', `Remove all photos from ${m.label}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setBusy(true);
          const success = await deleteAssetsFromMonth(m.year, m.month);
          setBusy(false);
          Alert.alert(
            success ? 'Deleted' : 'Error',
            success ? 'Month cleared.' : 'Failed to delete'
          );
        },
      },
    ]);
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Months' }} />
      <Container>
        <ScrollView className="flex-1 py-4" contentContainerStyle={{ paddingBottom: 40 }}>
          {months.map((m) => (
            <TouchableOpacity
              key={`${m.year}-${m.month}`}
              onPress={() => handleDelete(m)}
              disabled={busy}
              className="mb-4 rounded-md border border-border p-4">
              <Text>{m.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Container>
    </>
  );
}
