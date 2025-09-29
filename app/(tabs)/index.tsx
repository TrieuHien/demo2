import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

// Types
export type Student = {
  id: string;
  name: string;
  email: string;
  avatar: any; // static require for simplicity
};

// Preload meo1..meo20 avatars for static require usage
const MEO_AVATARS = [
  require('@/assets/images/meo1.png'),
  require('@/assets/images/meo2.png'),
  require('@/assets/images/meo3.png'),
  require('@/assets/images/meo4.png'),
  require('@/assets/images/meo5.png'),
  require('@/assets/images/meo6.png'),
  require('@/assets/images/meo7.png'),
  require('@/assets/images/meo8.png'),
  require('@/assets/images/meo9.png'),
  require('@/assets/images/meo10.png'),
  require('@/assets/images/meo11.png'),
  require('@/assets/images/meo12.png'),
  require('@/assets/images/meo13.png'),
  require('@/assets/images/meo14.png'),
  require('@/assets/images/meo15.png'),
  require('@/assets/images/meo16.png'),
  require('@/assets/images/meo17.png'),
  require('@/assets/images/meo18.png'),
  require('@/assets/images/meo19.png'),
  require('@/assets/images/meo20.png'),
];

// Mock student generator
function createMockStudent(index: number): Student {
  // Pseudo-random but stable distribution across 20 avatars
  const avatarIdx = (index * 7) % MEO_AVATARS.length;
  return {
    id: `student-${index}`,
    name: `Student ${index + 1}`,
    email: `student${index + 1}@example.edu`,
    avatar: MEO_AVATARS[avatarIdx],
  };
}

function generateStudents(offset: number, limit: number): Student[] {
  const list: Student[] = [];
  for (let i = offset; i < offset + limit; i++) {
    list.push(createMockStudent(i));
  }
  return list;
}

const PAGE_SIZE = 10;
const MAX_STUDENTS = 50;
const STORAGE_KEY = 'students:list:v2';

export default function HomeScreen() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loadedCountRef = useRef(0);

  // Hydrate from storage on mount
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          let parsed: Student[] = JSON.parse(raw);
          if (parsed.length > MAX_STUDENTS) parsed = parsed.slice(0, MAX_STUDENTS);
          setStudents(parsed);
          loadedCountRef.current = parsed.length;
          setHasMore(parsed.length < MAX_STUDENTS);
        } else {
          // initial load
          const initial = generateStudents(0, PAGE_SIZE);
          setStudents(initial);
          loadedCountRef.current = initial.length;
          setHasMore(true);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
        }
      } catch (e) {
        // fallback to fresh
        const initial = generateStudents(0, PAGE_SIZE);
        setStudents(initial);
        loadedCountRef.current = initial.length;
        setHasMore(true);
      }
    })();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate fetch fresh data
      const fresh = generateStudents(0, PAGE_SIZE);
      setStudents(fresh);
      loadedCountRef.current = fresh.length;
      setHasMore(true);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    } finally {
      setRefreshing(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      // Simulate API latency
      await new Promise((res) => setTimeout(res, 500));
      setStudents((prev) => {
        const remaining = Math.max(0, MAX_STUDENTS - prev.length);
        const toLoad = Math.min(PAGE_SIZE, remaining);
        const next = toLoad > 0 ? generateStudents(prev.length, toLoad) : [];
        const newList = [...prev, ...next];
        loadedCountRef.current = newList.length;
        const noMore = newList.length >= MAX_STUDENTS;
        setHasMore(!noMore);
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
        return newList;
      });
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore]);

  const renderItem = useCallback(({ item }: { item: Student }) => {
    return (
      <TouchableOpacity
        style={styles.itemContainer}
        activeOpacity={0.7}
        onPress={() => router.push({ pathname: `/student/${item.id}`, params: { name: item.name } })}
      >
        <Image source={item.avatar} style={styles.avatar} contentFit="cover" />
        <View style={styles.itemTextContainer}>
          <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
          <ThemedText style={styles.email}>{item.email}</ThemedText>
        </View>
      </TouchableOpacity>
    );
  }, [router]);

  const keyExtractor = useCallback((s: Student) => s.id, []);

  const ListFooter = useMemo(() => {
    if (isLoadingMore) {
      return (
        <View style={styles.footer}>
          <ActivityIndicator />
          <ThemedText style={styles.footerText}>Loading more…</ThemedText>
        </View>
      );
    }
    if (!hasMore) {
      return (
        <View style={styles.footer}>
          <ThemedText style={styles.footerText}>No more students available</ThemedText>
        </View>
      );
    }
    return <View style={{ height: 16 }} />;
  }, [isLoadingMore, hasMore]);

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.header}>Students</ThemedText>
      <FlatList
        data={students}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReachedThreshold={0.5}
        onEndReached={loadMore}
        ListFooterComponent={ListFooter}
        contentContainerStyle={styles.listContent}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 24,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(127,127,127,0.08)',
  },
  itemTextContainer: {
    marginLeft: 12,
  },
  email: {
    opacity: 0.8,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  footer: {
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    marginTop: 8,
  },
});
