import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../../theme/colors';
import { PublicChannel } from '../matrix/api/client';
import ChannelItem from './ChannelItem';

interface RegionAccordionProps {
  regionName: string;
  channels: PublicChannel[];
  onChannelPress: (channelId: string) => void;
}

export default function RegionAccordion({ regionName, channels, onChannelPress }: RegionAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Helper to extract technique name from "Region - Technique"
  const getTechniqueName = (fullName: string) => {
    const parts = fullName.split(' - ');
    return parts.length > 1 ? parts[1] : fullName;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleExpand} style={styles.header}>
        <Text style={styles.title}>{regionName}</Text>
        <Ionicons 
          name={isExpanded ? "chevron-up" : "chevron-down"} 
          size={20} 
          color={colors.textSecondary} 
        />
      </TouchableOpacity>
      
      {isExpanded && (
        <View style={styles.content}>
          {channels.map((channel) => (
            <ChannelItem 
              key={channel._id}
              channel={{
                id: channel.matrixRoomId,
                name: getTechniqueName(channel.name),
                region: regionName,
                category: getTechniqueName(channel.name),
                unreadCount: 0
              }}
              onPress={() => onChannelPress(channel.matrixRoomId)}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
    // No background for container
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    // No background for header, just text
  },
  title: {
    color: colors.textSecondary, // Use secondary text color for region name
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
    textTransform: 'uppercase', // Keep uppercase via style if desired, or remove
  },
  content: {
    paddingLeft: 0, // No indent needed if we want full width items
  },
});
