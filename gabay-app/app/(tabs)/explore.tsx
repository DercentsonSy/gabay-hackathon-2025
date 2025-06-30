import React, { useState } from 'react';
import { Image } from 'expo-image';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { Card, Searchbar, Chip } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Sample accessibility guides and tutorials for the demo
const accessibilityFeatures = [
  {
    id: '1',
    title: 'Voice Assistant Guide',
    description: 'Learn how to use the Gabay voice assistant for hands-free operation.',
    image: 'https://via.placeholder.com/300x200/6200ee/ffffff?text=Voice+Assistant',
    duration: '2 min video',
    type: 'Video Tutorial'
  },
  {
    id: '2',
    title: 'Screen Reader Support',
    description: 'How to optimize your experience with screen readers like TalkBack and VoiceOver.',
    image: 'https://via.placeholder.com/300x200/6200ee/ffffff?text=Screen+Reader',
    duration: '3 min read',
    type: 'Guide'
  },
  {
    id: '3',
    title: 'Visual Adjustments',
    description: 'Customize the app display for better visibility with color contrast and text size options.',
    image: 'https://via.placeholder.com/300x200/6200ee/ffffff?text=Visual+Settings',
    duration: '1 min video',
    type: 'Video Tutorial'
  }
];

const resourceCategories = ['All', 'Guides', 'Tutorials', 'Videos', 'Settings'];

const accessibilityResources = [
  {
    id: '1',
    title: 'Send Money with Voice Commands',
    category: 'Tutorials',
    readTime: '3 min',
    image: 'https://via.placeholder.com/100x100/e0e0e0/6200ee?text=Send+Money'
  },
  {
    id: '2',
    title: 'Setting Up Touch Accommodations',
    category: 'Settings',
    readTime: '4 min',
    image: 'https://via.placeholder.com/100x100/e0e0e0/6200ee?text=Touch+Settings'
  },
  {
    id: '3',
    title: 'Pay Bills with Voice Assistant',
    category: 'Tutorials',
    readTime: '2 min',
    image: 'https://via.placeholder.com/100x100/e0e0e0/6200ee?text=Bills'
  },
  {
    id: '4',
    title: 'Accessibility Features Overview',
    category: 'Guides',
    readTime: '5 min',
    image: 'https://via.placeholder.com/100x100/e0e0e0/6200ee?text=Overview'
  },
];

export default function AccessibilityScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const handleFeaturePress = (id: string) => {
    console.log(`Feature ${id} pressed`);
    // router.push(`/(tabs)/accessibility/features/${id}`);
  };

  const handleResourcePress = (id: string) => {
    console.log(`Resource ${id} pressed`);
    // router.push(`/(tabs)/accessibility/resources/${id}`);
  };

  const onChangeSearch = (query: string) => setSearchQuery(query);

  const filteredResources = selectedCategory === 'All' 
    ? accessibilityResources 
    : accessibilityResources.filter(resource => resource.category === selectedCategory);

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Accessibility Hub</Text>
        <Text style={styles.headerSubtitle}>Features for persons with disabilities</Text>
      </View>
      
      {/* Search Bar */}
      <Searchbar
        placeholder="Search topics, courses, articles"
        onChangeText={onChangeSearch}
        value={searchQuery}
        style={styles.searchBar}
        iconColor="#6200ee"
      />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Featured Courses Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Accessibility Features</Text>
            <TouchableOpacity 
              onPress={() => console.log('View all features')}
              accessible={true}
              accessibilityLabel="See all accessibility features"
              accessibilityHint="View the complete list of accessibility features"
            >
              <Text style={styles.viewAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {/* Courses Horizontal Scroll */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.coursesContainer}
            accessible={true}
            accessibilityLabel="Horizontal list of accessibility features"
          >
            {accessibilityFeatures.map((feature) => (
              <TouchableOpacity 
                key={feature.id} 
                style={styles.courseCard}
                onPress={() => handleFeaturePress(feature.id)}
                accessible={true}
                accessibilityLabel={feature.title}
                accessibilityHint={feature.description}
              >
                <Image 
                  source={{ uri: feature.image }} 
                  style={styles.courseImage} 
                  contentFit="cover"
                  accessible={true}
                  accessibilityLabel={`Image for ${feature.title}`}
                />
                <View style={styles.courseContent}>
                  <Text style={styles.courseTitle}>{feature.title}</Text>
                  <Text style={styles.courseDescription} numberOfLines={2}>
                    {feature.description}
                  </Text>
                  <View style={styles.courseMetadata}>
                    <View style={styles.metaItem}>
                      <Ionicons name="time-outline" size={14} color="#666" />
                      <Text style={styles.metaText}>{feature.duration}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="videocam-outline" size={14} color="#666" />
                      <Text style={styles.metaText}>{feature.type}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        {/* Articles Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Accessibility Resources</Text>
            <TouchableOpacity 
              onPress={() => console.log('View all resources')}
              accessible={true}
              accessibilityLabel="See all resources"
              accessibilityHint="View the complete list of accessibility resources"
            >
              <Text style={styles.viewAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {/* Category Filter */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.categoriesContainer}
          >
            {resourceCategories.map((category) => (
              <Chip 
                key={category}
                selected={selectedCategory === category}
                onPress={() => setSelectedCategory(category)}
                style={[styles.categoryChip, selectedCategory === category && styles.selectedCategoryChip]}
                textStyle={selectedCategory === category ? styles.selectedCategoryText : styles.categoryText}
              >
                {category}
              </Chip>
            ))}
          </ScrollView>
          
          {/* Articles List */}
          <View style={styles.articlesContainer}>
            {filteredResources.map((resource) => (
              <TouchableOpacity 
                key={resource.id} 
                style={styles.articleItem}
                onPress={() => handleResourcePress(resource.id)}
                accessible={true}
                accessibilityLabel={resource.title}
                accessibilityHint={`${resource.category} resource, reading time ${resource.readTime}`}
              >
                <Image 
                  source={{ uri: resource.image }} 
                  style={styles.articleImage} 
                  contentFit="cover"
                  accessible={true}
                  accessibilityLabel={`Image for ${resource.title}`}
                />
                <View style={styles.articleContent}>
                  <Text style={styles.articleTitle}>{resource.title}</Text>
                  <View style={styles.articleMeta}>
                    <Text style={styles.articleCategory}>{resource.category}</Text>
                    <View style={styles.metaItem}>
                      <Ionicons name="time-outline" size={14} color="#666" />
                      <Text style={styles.metaText}>{resource.readTime}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Financial Tip of the Day */}
          <Card style={styles.tipCard}>
            <Card.Content>
              <View style={styles.tipHeader}>
                <Ionicons name="accessibility-outline" size={24} color="#6200ee" />
                <Text style={styles.tipTitle}>Accessibility Tip</Text>
              </View>
              <Text style={styles.tipContent}>
                You can activate the voice assistant at any time by pressing the microphone button in the bottom right corner. Try commands like "Send money" or "Pay bills".
              </Text>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 50,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  searchBar: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 0,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  viewAllText: {
    color: '#6200ee',
    fontWeight: '600',
  },
  coursesContainer: {
    paddingLeft: 16,
  },
  courseCard: {
    width: 280,
    marginRight: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  courseImage: {
    width: '100%',
    height: 140,
  },
  courseContent: {
    padding: 12,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#333',
  },
  courseDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  courseMetadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#666',
  },
  categoriesContainer: {
    paddingLeft: 16,
    marginBottom: 16,
  },
  categoryChip: {
    marginRight: 8,
    backgroundColor: '#f0f0f0',
  },
  selectedCategoryChip: {
    backgroundColor: '#e0cfff',
  },
  categoryText: {
    color: '#333',
  },
  selectedCategoryText: {
    color: '#6200ee',
    fontWeight: '600',
  },
  articlesContainer: {
    paddingHorizontal: 16,
  },
  articleItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    elevation: 1,
  },
  articleImage: {
    width: 80,
    height: 80,
  },
  articleContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  articleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  articleMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  articleCategory: {
    fontSize: 12,
    color: '#6200ee',
    fontWeight: '600',
  },
  tipCard: {
    marginTop: 20,
    marginHorizontal: 16,
    marginBottom: 30,
    borderRadius: 12,
    elevation: 2,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  tipContent: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
});
