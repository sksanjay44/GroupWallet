import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Users, Settings, Copy, Share } from 'lucide-react-native';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Colors } from '@/constants/Colors';
import { GlobalStyles } from '@/constants/Styles';

export default function GroupsScreen() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupEmoji, setGroupEmoji] = useState('👥');

  const mockGroups = [
    {
      id: '1',
      name: 'Roommates',
      emoji: '🏠',
      members: 4,
      totalExpenses: 12500,
      yourBalance: 150,
      inviteCode: 'ROOM123',
    },
    {
      id: '2',
      name: 'Office Team',
      emoji: '💼',
      members: 8,
      totalExpenses: 45600,
      yourBalance: -275,
      inviteCode: 'WORK456',
    },
    {
      id: '3',
      name: 'Trip Squad',
      emoji: '✈️',
      members: 6,
      totalExpenses: 28900,
      yourBalance: 420,
      inviteCode: 'TRIP789',
    },
  ];

  const emojis = ['👥', '🏠', '💼', '🎉', '✈️', '🍕', '🏋️', '📚', '🎬', '🎵'];

  const handleCreateGroup = () => {
    if (groupName.trim()) {
      // Here you would create the group
      console.log('Creating group:', { name: groupName, emoji: groupEmoji });
      setShowCreateModal(false);
      setGroupName('');
      setGroupEmoji('👥');
    }
  };

  return (
    <SafeAreaView style={GlobalStyles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>My Groups</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Plus size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.groupsContainer}>
          {mockGroups.map((group) => (
            <Card key={group.id} style={styles.groupCard}>
              <View style={styles.groupHeader}>
                <View style={styles.groupInfo}>
                  <Text style={styles.groupEmoji}>{group.emoji}</Text>
                  <View style={styles.groupDetails}>
                    <Text style={styles.groupName}>{group.name}</Text>
                    <Text style={styles.groupMembers}>{group.members} members</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.settingsButton}>
                  <Settings size={20} color={Colors.text.tertiary} />
                </TouchableOpacity>
              </View>

              <View style={styles.groupStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Total Expenses</Text>
                  <Text style={styles.statValue}>₹{group.totalExpenses.toLocaleString()}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Your Balance</Text>
                  <Text
                    style={[
                      styles.statValue,
                      { color: group.yourBalance >= 0 ? Colors.success : Colors.error }
                    ]}
                  >
                    {group.yourBalance >= 0 ? '+' : ''}₹{group.yourBalance}
                  </Text>
                </View>
              </View>

              <View style={styles.groupActions}>
                <Button
                  variant="outline"
                  size="small"
                  onPress={() => {}}
                  style={styles.actionButton}
                >
                  View Details
                </Button>
                <TouchableOpacity style={styles.shareButton}>
                  <Share size={16} color={Colors.primary} />
                  <Text style={styles.shareText}>Invite</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))}
        </View>

        <Card style={styles.joinCard}>
          <View style={styles.joinHeader}>
            <Users size={24} color={Colors.secondary} />
            <Text style={styles.joinTitle}>Join a Group</Text>
          </View>
          <Text style={styles.joinDescription}>
            Have an invite code? Enter it below to join an existing group.
          </Text>
          <View style={styles.joinActions}>
            <Input
              placeholder="Enter invite code"
              style={styles.codeInput}
            />
            <Button
              variant="secondary"
              size="small"
              onPress={() => {}}
              style={styles.joinButton}
            >
              Join
            </Button>
          </View>
        </Card>
      </ScrollView>

      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create Group</Text>
            <TouchableOpacity onPress={handleCreateGroup}>
              <Text style={styles.modalDone}>Create</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.emojiSection}>
              <Text style={styles.sectionLabel}>Choose an emoji</Text>
              <View style={styles.emojiGrid}>
                {emojis.map((emoji) => (
                  <TouchableOpacity
                    key={emoji}
                    style={[
                      styles.emojiButton,
                      groupEmoji === emoji && styles.emojiButtonSelected
                    ]}
                    onPress={() => setGroupEmoji(emoji)}
                  >
                    <Text style={styles.emojiText}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Input
              label="Group Name"
              placeholder="Enter group name"
              value={groupName}
              onChangeText={setGroupName}
              style={styles.groupNameInput}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  
  groupsContainer: {
    padding: 20,
    paddingTop: 10,
  },
  
  groupCard: {
    marginBottom: 16,
  },
  
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  groupInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  groupEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  
  groupDetails: {
    flex: 1,
  },
  
  groupName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  
  groupMembers: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  
  settingsButton: {
    padding: 8,
  },
  
  groupStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  
  statItem: {
    alignItems: 'center',
  },
  
  statLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  
  groupActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  actionButton: {
    flex: 1,
    marginRight: 12,
  },
  
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  
  shareText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: 4,
  },
  
  joinCard: {
    margin: 20,
    marginTop: 0,
  },
  
  joinHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  joinTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginLeft: 8,
  },
  
  joinDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  
  joinActions: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  
  codeInput: {
    flex: 1,
    marginRight: 12,
    marginBottom: 0,
  },
  
  joinButton: {
    marginBottom: 16,
  },
  
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  
  modalCancel: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  
  modalDone: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  
  modalContent: {
    flex: 1,
    padding: 20,
  },
  
  emojiSection: {
    marginBottom: 32,
  },
  
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  
  emojiButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  emojiButtonSelected: {
    backgroundColor: Colors.primary + '20',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  
  emojiText: {
    fontSize: 24,
  },
  
  groupNameInput: {
    marginBottom: 0,
  },
});