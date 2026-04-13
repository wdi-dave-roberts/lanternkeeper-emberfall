/**
 * Lanternkeeper: Emberfall
 * A calm, cozy game about tending to your creative fire
 */

import React, { useState, useEffect } from 'react';
import { SafeAreaView, StatusBar, ActivityIndicator, View } from 'react-native';
import { Emotion, Quest, IdeaSeed, DailyLog } from './src/data/types';
import { getRandomQuest, getAnotherQuest } from './src/data/quests';
import { getRandomFeedback } from './src/data/feedback';
import {
  loadState,
  saveLog,
  saveSeed,
  getTodayDate,
  hasCheckedInToday,
} from './src/storage/storage';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import CheckInScreen from './src/screens/CheckInScreen';
import QuestScreen from './src/screens/QuestScreen';
import IdeaSeedScreen from './src/screens/IdeaSeedScreen';

type Screen = 'home' | 'checkIn' | 'quest' | 'ideaSeeds';

export default function App() {
  // Loading state
  const [isLoading, setIsLoading] = useState(true);

  // Navigation state
  const [screen, setScreen] = useState<Screen>('home');

  // Game state
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion | null>(null);
  const [currentQuest, setCurrentQuest] = useState<Quest | null>(null);
  const [feedbackLine, setFeedbackLine] = useState<string | null>(null);
  const [ideaSeeds, setIdeaSeeds] = useState<IdeaSeed[]>([]);
  const [lastCheckIn, setLastCheckIn] = useState<string | undefined>();

  // Load saved data on startup
  useEffect(() => {
    async function load() {
      const state = await loadState();
      setIdeaSeeds(state.ideaSeeds);
      setLastCheckIn(state.lastCheckIn);
      setIsLoading(false);
    }
    load();
  }, []);

  // Check if already checked in today
  const alreadyCheckedIn = hasCheckedInToday(lastCheckIn);

  // Navigation handlers
  const handleStartCheckIn = () => {
    setScreen('checkIn');
  };

  const handleSelectEmotion = (emotion: Emotion) => {
    setSelectedEmotion(emotion);
    setCurrentQuest(getRandomQuest(emotion));
    setFeedbackLine(null);
    setScreen('quest');
  };

  const handleCompleteQuest = async () => {
    if (selectedEmotion && currentQuest) {
      // Show feedback
      const feedback = getRandomFeedback(selectedEmotion);
      setFeedbackLine(feedback);

      // Save the daily log
      const log: DailyLog = {
        date: getTodayDate(),
        emotion: selectedEmotion,
        quest: currentQuest,
        completed: true,
        completedAt: new Date().toISOString(),
      };
      await saveLog(log);
      setLastCheckIn(log.date);
    }
  };

  const handleSkipQuest = () => {
    if (selectedEmotion && currentQuest) {
      setCurrentQuest(getAnotherQuest(selectedEmotion, currentQuest.id));
    }
  };

  const handleOpenIdeaSeeds = () => {
    setScreen('ideaSeeds');
  };

  const handleAddIdeaSeed = async (text: string) => {
    const newSeed: IdeaSeed = {
      id: Date.now().toString(),
      text,
      createdAt: new Date().toISOString(),
    };

    // Update state
    setIdeaSeeds([newSeed, ...ideaSeeds]);

    // Save to storage
    await saveSeed(newSeed);
  };

  const handleGoHome = () => {
    setScreen('home');
    setSelectedEmotion(null);
    setCurrentQuest(null);
    setFeedbackLine(null);
  };

  // Loading screen
  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#1a1a2e' }}>
        <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#d4a574" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1a1a2e' }}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />

      {screen === 'home' && (
        <HomeScreen
          onStartCheckIn={handleStartCheckIn}
          onOpenIdeaSeeds={handleOpenIdeaSeeds}
          alreadyCheckedIn={alreadyCheckedIn}
        />
      )}

      {screen === 'checkIn' && (
        <CheckInScreen
          onSelectEmotion={handleSelectEmotion}
          onBack={handleGoHome}
        />
      )}

      {screen === 'quest' && selectedEmotion && (
        <QuestScreen
          emotion={selectedEmotion}
          quest={currentQuest}
          feedbackLine={feedbackLine}
          onComplete={handleCompleteQuest}
          onSkip={handleSkipQuest}
          onBack={handleGoHome}
        />
      )}

      {screen === 'ideaSeeds' && (
        <IdeaSeedScreen
          seeds={ideaSeeds}
          onAddSeed={handleAddIdeaSeed}
          onBack={handleGoHome}
        />
      )}
    </SafeAreaView>
  );
}
