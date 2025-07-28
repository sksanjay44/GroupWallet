import { supabase } from './supabase';
import { Group, GroupMember } from '@/types';

export async function createGroup(
  name: string,
  emoji: string = '👥',
  description?: string
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Create the group
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .insert({
        name,
        emoji,
        description,
        admin_id: user.id,
      })
      .select()
      .single();

    if (groupError) throw groupError;

    // Add the creator as the first member
    const { error: memberError } = await supabase
      .from('group_members')
      .insert({
        user_id: user.id,
        group_id: group.id,
        role: 'admin',
      });

    if (memberError) throw memberError;

    return { group, error: null };
  } catch (error) {
    console.error('Error creating group:', error);
    return { group: null, error };
  }
}

export async function joinGroup(inviteCode: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Find the group by invite code
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('*')
      .eq('invite_code', inviteCode.toUpperCase())
      .single();

    if (groupError) throw new Error('Invalid invite code');

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('group_members')
      .select('id')
      .eq('user_id', user.id)
      .eq('group_id', group.id)
      .single();

    if (existingMember) {
      throw new Error('You are already a member of this group');
    }

    // Add user to the group
    const { error: memberError } = await supabase
      .from('group_members')
      .insert({
        user_id: user.id,
        group_id: group.id,
        role: 'member',
      });

    if (memberError) throw memberError;

    return { group, error: null };
  } catch (error) {
    console.error('Error joining group:', error);
    return { group: null, error };
  }
}

export async function getUserGroups(userId: string) {
  try {
    const { data, error } = await supabase
      .from('group_members')
      .select(`
        *,
        group:group_id(
          *,
          admin:admin_id(id, name)
        )
      `)
      .eq('user_id', userId)
      .order('joined_at', { ascending: false });

    if (error) throw error;

    return { groups: data, error: null };
  } catch (error) {
    console.error('Error fetching user groups:', error);
    return { groups: null, error };
  }
}

export async function getGroupDetails(groupId: string) {
  try {
    const { data, error } = await supabase
      .from('groups')
      .select(`
        *,
        admin:admin_id(id, name, avatar),
        members:group_members(
          *,
          user:user_id(id, name, avatar)
        )
      `)
      .eq('id', groupId)
      .single();

    if (error) throw error;

    return { group: data, error: null };
  } catch (error) {
    console.error('Error fetching group details:', error);
    return { group: null, error };
  }
}

export async function updateGroup(
  groupId: string,
  updates: {
    name?: string;
    emoji?: string;
    description?: string;
  }
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Check if user is admin
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('admin_id')
      .eq('id', groupId)
      .single();

    if (groupError) throw groupError;
    if (group.admin_id !== user.id) {
      throw new Error('Only group admin can update group details');
    }

    // Update the group
    const { data, error } = await supabase
      .from('groups')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', groupId)
      .select()
      .single();

    if (error) throw error;

    return { group: data, error: null };
  } catch (error) {
    console.error('Error updating group:', error);
    return { group: null, error };
  }
}

export async function removeGroupMember(groupId: string, userId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Check if current user is admin
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('admin_id')
      .eq('id', groupId)
      .single();

    if (groupError) throw groupError;
    if (group.admin_id !== user.id && user.id !== userId) {
      throw new Error('Only group admin or the member themselves can remove membership');
    }

    // Remove the member
    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId);

    if (error) throw error;

    return { error: null };
  } catch (error) {
    console.error('Error removing group member:', error);
    return { error };
  }
}

export async function generateNewInviteCode(groupId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Check if user is admin
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('admin_id')
      .eq('id', groupId)
      .single();

    if (groupError) throw groupError;
    if (group.admin_id !== user.id) {
      throw new Error('Only group admin can generate new invite code');
    }

    // Generate new invite code
    const newInviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();

    const { data, error } = await supabase
      .from('groups')
      .update({
        invite_code: newInviteCode,
        updated_at: new Date().toISOString(),
      })
      .eq('id', groupId)
      .select('invite_code')
      .single();

    if (error) throw error;

    return { inviteCode: data.invite_code, error: null };
  } catch (error) {
    console.error('Error generating invite code:', error);
    return { inviteCode: null, error };
  }
}