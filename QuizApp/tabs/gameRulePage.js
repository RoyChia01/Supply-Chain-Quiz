import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
    TouchableOpacity,
    Platform,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const scaleSize = (size) => size * (width / 375); // Base size scaling

const GameRulebook = ({ containerStyle }) => {
  const [expandedSection, setExpandedSection] = useState(null);

  // Air Force theme colors
  const COLORS = {
    lightBlue: '#446d92',
    gold: '#FFD700',
    darkBlue: '#2F4F6D',
    navy: '#1A2E43',      // Darker shade for backgrounds
    white: '#FFFFFF',
    lightGray: '#E5E9F0',
    mediumGray: '#C8D1DC'
  };

  const toggleSection = (sectionId) => {
    if (expandedSection === sectionId) {
      setExpandedSection(null);
    } else {
      setExpandedSection(sectionId);
    }
  };

  const sections = [
    {
      id: 1,
      title: "1. Objective",
      content: "Players will participate in quizzes focused on the supply chain. By completing quizzes, players earn points (for leaderboard ranking) and tokens (for in-game purchases). The goal is to accumulate the highest points while strategically using power-ups."
    },
    {
      id: 2,
      title: "2. Quiz Mechanics",
      content: [
        "Players can attempt each quiz multiple times, but only the first attempt will count for points and tokens.",
        "Subsequent attempts will not provide additional points or tokens.",
        "Once a quiz is completed, it is marked as completed and cannot be reattempted for rewards."
      ]
    },
    {
      id: 3,
      title: "3. Scoring System",
      content: [
        "Points determine the leaderboard ranking.",
        "Tokens are used for in-game purchases (e.g., power-ups).",
        "Power-ups may modify quiz scores and token earnings."
      ]
    },
    {
      id: 4,
      title: "4. Leaderboard & Rankings",
      content: [
        "Players are ranked solely by points on the leaderboard.",
        "Tokens do not affect rankings and are only for in-game purchases.",
        "The leaderboard does not reset—all accumulated points remain."
      ]
    },
    {
      id: 5,
      title: "5. Power-Ups",
      content: "Players can use power-ups to enhance their performance or disrupt opponents. The available power-ups are:",
      subsections: [
        {
          id: "5.1",
          title: "5.1 Multiplier",
          content: [
            "Doubles the earned score in the next quiz attempt.",
            "Must be activated before attempting the quiz.",
            "Only applies to the first valid attempt of that quiz."
          ]
        },
        {
          id: "5.2",
          title: "5.2 Sabotage",
          content: [
            "Select an opponent and reduce their next quiz attempt score by half.",
            "A player can only be targeted by one Sabotage at a time.",
            "If the target has an active Shield, the Sabotage is nullified, and the Shield breaks."
          ]
        },
        {
          id: "5.3",
          title: "5.3 Shield",
          content: [
            "Protects the player from one attack (e.g., Sabotage).",
            "The Shield breaks once it successfully defends against an attack."
          ]
        },
        {
          id: "5.4",
          title: "5.4 Roll the Dice",
          content: [
            "A gamble-based power-up with randomized rewards or penalties solely affecting tokens only:",
            "Win 15 tokens",
            "Win 6 tokens",
            "Lose 6 tokens",
            "Lose 10 tokens",
            "Each player gets 3 attempts per session."
          ]
        }
      ]
    },
    {
      id: 6,
      title: "6. Power-Up Rules",
      content: [
        "Power-ups must be used before the quiz attempt they affect.",
        "Players cannot stack multiple power-ups on the same quiz attempt."
      ]
    },
    {
      id: 7,
      title: "7. Strategy & Gameplay",
      content: [
        "Use Multiplier for high-scoring quizzes to maximize points.",
        "Sabotage opponents strategically to disrupt their progress.",
        "Keep a Shield active to prevent score reduction.",
        "Use Roll the Dice wisely to gain extra tokens."
      ]
    },
    {
      id: 8,
      title: "8. In-Game Shop",
      content: [
        "Tokens can be spent in the shop for power-ups and other items.",
        "Power-ups purchased remain available until used.",
        "Each power up can be bought only once every week"
      ]
    }
  ];

  const renderContent = (content) => {
    if (Array.isArray(content)) {
      return (
        <View style={styles.bulletPoints}>
          {content.map((item, index) => (
            <View key={index} style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>{item}</Text>
            </View>
          ))}
        </View>
      );
    }
    return <Text style={styles.sectionContent}>{content}</Text>;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
        backgroundColor: COLORS.navy,
      paddingTop: Platform.OS === 'ios' ? scaleSize(60) : scaleSize(60), // Slightly taller on Android
    },
    header: {
      backgroundColor: COLORS.darkBlue,
      alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: COLORS.gold,
        padding:10
    },
    headerText: {
      color: COLORS.white,
      fontSize: 22,
      fontWeight: 'bold',
    },
    subHeaderText: {
      color: COLORS.gold,
      fontSize: 24,
      marginTop: 5,
      fontWeight: '600',
      letterSpacing: 1,
    },
    scrollView: {
      flex: 1,
      padding: 10,
    },
    section: {
      marginBottom: 12,
      borderRadius: 8,
      overflow: 'hidden',
      backgroundColor: COLORS.darkBlue,
      borderWidth: 1,
      borderColor: COLORS.lightBlue,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 15,
      backgroundColor: COLORS.lightBlue,
      borderLeftWidth: 4,
      borderLeftColor: COLORS.gold,
    },
    sectionTitle: {
      color: COLORS.white,
      fontSize: 20,
      fontWeight: 'bold',
    },
    sectionBody: {
      padding: 15,
    },
    sectionContent: {
      color: COLORS.lightGray,
      fontSize: 18,
      lineHeight: 22,
    },
    subsection: {
      marginTop: 15,
      padding: 12,
      backgroundColor: 'rgba(68, 109, 146, 0.3)', // Transparent light blue
      borderRadius: 6,
      borderLeftWidth: 2,
      borderLeftColor: COLORS.gold,
    },
    subsectionTitle: {
      color: COLORS.gold,
      fontSize: 15,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    bulletPoints: {
      marginTop: 5,
    },
    bulletPoint: {
      flexDirection: 'row',
      marginBottom: 8,
    },
    bullet: {
      color: COLORS.gold,
      fontSize: 20,
      marginRight: 8,
      width: 10,
    },
    bulletText: {
      color: COLORS.lightGray,
      fontSize: 18,
      flex: 1,
      lineHeight: 20,
    },
  });

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.header}>
        <Text style={styles.subHeaderText}>SUPPLY CHAIN RULEBOOK</Text>
      </View>
      
      <ScrollView style={styles.scrollView}>
        {sections.map((section) => (
          <View key={section.id} style={styles.section}>
            <TouchableOpacity 
              style={styles.sectionHeader} 
              onPress={() => toggleSection(section.id)}
            >
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Ionicons 
                name={expandedSection === section.id ? "chevron-up" : "chevron-down"} 
                size={24} 
                color={COLORS.gold} 
              />
            </TouchableOpacity>
            
            {expandedSection === section.id && (
              <View style={styles.sectionBody}>
                {renderContent(section.content)}
                
                {section.subsections && section.subsections.map((subsection) => (
                  <View key={subsection.id} style={styles.subsection}>
                    <Text style={styles.subsectionTitle}>{subsection.title}</Text>
                    {renderContent(subsection.content)}
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default GameRulebook;