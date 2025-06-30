import { StyleSheet, View, Text, FlatList, Dimensions, TouchableOpacity, SafeAreaView } from 'react-native';
import React, { useState, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// Onboarding screens data
const data = [
  {
    id: '1',
    title: 'Welcome to Gabay',
    text: 'Your AI-powered financial assistant for all your banking needs',
    icon: 'wallet-outline',
    color: '#0070e0',
  },
  {
    id: '2',
    title: 'Voice Assistance',
    text: 'Just speak to Gabay to send money, pay bills, or check your balance',
    icon: 'mic-outline',
    color: '#0088ff',
  },
  {
    id: '3',
    title: 'Personalized Insights',
    text: 'Get tailored financial advice and insights powered by Alibaba Cloud AI',
    icon: 'analytics-outline',
    color: '#00a0ff',
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();
  const slidesRef = useRef<FlatList>(null);

  const handleSkip = () => {
    router.replace('/(tabs)');
  };

  const renderItem = ({ item }: { item: typeof data[0] }) => {
    return (
      <View style={styles.slide}>
        <View style={[styles.iconContainer, {backgroundColor: item.color}]}>
          <Ionicons name={item.icon as any} size={60} color="white" />
        </View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.text}>{item.text}</Text>
      </View>
    );
  };

  const handleScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const currentIndex = event.nativeEvent.contentOffset.x / slideSize;
    setCurrentIndex(currentIndex);
  };

  const updateCurrentSlideIndex = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const currentIndex = event.nativeEvent.contentOffset.x / slideSize;
    setCurrentIndex(currentIndex);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />

      <TouchableOpacity 
        style={styles.skipButton} 
        onPress={handleSkip}
        activeOpacity={0.7}
        accessibilityLabel="Skip onboarding"
        accessibilityHint="Skip to the main app"
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <LinearGradient
        colors={['#0070e0', '#0089dc']}
        style={styles.headerGradient}
      />
      
      <FlatList
        data={data}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onScroll={handleScroll}
        onMomentumScrollEnd={updateCurrentSlideIndex}
        ref={slidesRef}
      />

      <View style={styles.indicatorContainer}>
        {data.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              currentIndex === index && styles.activeIndicator,
            ]}
          />
        ))}
      </View>

      <View style={styles.buttonsContainer}>
        {currentIndex > 0 && (
          <TouchableOpacity 
            style={styles.prevButton}
            onPress={() => {
              slidesRef.current?.scrollToIndex({
                index: currentIndex - 1,
                animated: true,
              });
            }}
            activeOpacity={0.7}
            accessibilityLabel="Previous slide"
          >
            <Ionicons name="chevron-back" size={24} color="#0070e0" />
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={styles.nextButton} 
          onPress={() => {
            if (currentIndex < data.length - 1) {
              slidesRef.current?.scrollToIndex({
                index: currentIndex + 1,
                animated: true,
              });
            } else {
              router.replace('/(tabs)');
            }
          }}
          activeOpacity={0.7}
          accessibilityLabel={currentIndex === data.length - 1 ? "Get Started" : "Next slide"}
        >
          {currentIndex === data.length - 1 ? (
            <Text style={styles.nextButtonText}>Get Started</Text>
          ) : (
            <View style={styles.nextButtonContent}>
              <Text style={styles.nextButtonText}>Next</Text>
              <Ionicons name="chevron-forward" size={24} color="white" style={styles.nextIcon} />
            </View>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 170,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  skipText: {
    fontSize: 14,
    color: '#0070e0',
    fontWeight: '600',
  },
  slide: {
    width: width,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  iconContainer: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#0070e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#0070e0',
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
    lineHeight: 24,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  indicator: {
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: '#d0d0d0',
    marginHorizontal: 4,
    transitionProperty: 'width',
    transitionDuration: '0.3s',
  },
  activeIndicator: {
    backgroundColor: '#0070e0',
    width: 24,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 50,
    width: '100%',
  },
  prevButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  nextButton: {
    flex: 1,
    marginLeft: 20,
    height: 54,
    borderRadius: 8,
    backgroundColor: '#0070e0',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  nextButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  nextIcon: {
    marginLeft: 8,
  },
  buttonContent: {
    height: 50,
  },
});
