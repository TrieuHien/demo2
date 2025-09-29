import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { SectionList, StyleSheet, TextInput, View } from 'react-native';

// Simple mock course data per student id
const ALL_COURSES = [
  { id: 'c-1', title: 'Intro to JavaScript', duration: '6 weeks', category: 'Programming' },
  { id: 'c-2', title: 'Advanced React Native', duration: '8 weeks', category: 'Programming' },
  { id: 'c-3', title: 'UI/UX Fundamentals', duration: '4 weeks', category: 'Design' },
  { id: 'c-4', title: 'Visual Design Basics', duration: '5 weeks', category: 'Design' },
  { id: 'c-5', title: 'Calculus I', duration: '10 weeks', category: 'Math' },
  { id: 'c-6', title: 'Linear Algebra', duration: '9 weeks', category: 'Math' },
];

export default function StudentDetailScreen() {
  const params = useLocalSearchParams<{ id: string; name?: string }>();
  const [query, setQuery] = useState('');

  const filteredSections = useMemo(() => {
    const items = ALL_COURSES.filter((c) =>
      c.title.toLowerCase().includes(query.trim().toLowerCase())
    );
    const byCategory: Record<string, { title: string; data: typeof ALL_COURSES }> = {};
    for (const c of items) {
      if (!byCategory[c.category]) byCategory[c.category] = { title: c.category, data: [] as any } as any;
      (byCategory[c.category].data as any).push(c);
    }
    return Object.values(byCategory);
  }, [query]);

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.header}>{params.name || 'Student'}</ThemedText>
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search courses"
          value={query}
          onChangeText={setQuery}
          style={styles.search}
        />
      </View>
      <SectionList
        sections={filteredSections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section }) => (
          <View style={[styles.sectionHeaderContainer, styles.sectionHeaderDefault]}>
            <ThemedText style={styles.sectionHeaderText}>
              {section.title.toUpperCase()}
            </ThemedText>
          </View>
        )}
        renderSectionFooter={() => <View style={{ height: 4 }} />}
        stickySectionHeadersEnabled
        renderItem={({ item }) => (
          <View style={styles.item}>
            <ThemedText style={styles.courseTitle}>{item.title}</ThemedText>
            <ThemedText style={styles.courseDuration}>{item.duration}</ThemedText>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  searchContainer: { paddingHorizontal: 16, paddingBottom: 8 },
  search: {
    height: 40,
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(127,127,127,0.3)',
    backgroundColor: 'rgba(127,127,127,0.06)'
  },
  sectionHeaderContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionHeaderDefault: {
    backgroundColor: 'rgba(127,127,127,0.12)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(127,127,127,0.25)'
  },
  sectionHeaderText: {
    fontWeight: '700',
    letterSpacing: 0.6,
    fontSize: 14,
  },
  item: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(127,127,127,0.2)'
  },
  courseTitle: { fontWeight: '600' },
  courseDuration: { opacity: 0.8 }
});
