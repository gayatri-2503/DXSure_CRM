import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { logActivity } from './useAuth';

export function useFollowUps(filters = {}) {
  return useQuery({
    queryKey: ['followups', filters],
    queryFn: async () => {
      let query = supabase.from('follow_ups').select('*, client:clients(name), lead:leads(title, contact_name)').order('scheduled_at', { ascending: true });
      if (filters.status) query = query.eq('status', filters.status);
      if (filters.type) query = query.eq('type', filters.type);
      if (filters.user_id) query = query.eq('user_id', filters.user_id);
      if (filters.date_from) query = query.gte('scheduled_at', filters.date_from);
      if (filters.date_to) query = query.lte('scheduled_at', filters.date_to);
      let { data, error } = await query;
      if (error?.message?.includes('column "user_id"') && filters.user_id) {
        let retryQuery = supabase.from('follow_ups').select('*, client:clients(name), lead:leads(title, contact_name)').order('scheduled_at', { ascending: true });
        if (filters.status) retryQuery = retryQuery.eq('status', filters.status);
        if (filters.type) retryQuery = retryQuery.eq('type', filters.type);
        if (filters.date_from) retryQuery = retryQuery.gte('scheduled_at', filters.date_from);
        if (filters.date_to) retryQuery = retryQuery.lte('scheduled_at', filters.date_to);
        const retry = await retryQuery;
        if (retry.error) throw retry.error;
        return retry.data;
      }
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateFollowUp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (followUp) => {
      let { data, error } = await supabase.from('follow_ups').insert(followUp).select().single();
      if (error?.message?.includes('column "user_id"')) {
        const sanitized = { ...followUp };
        delete sanitized.user_id;
        const retry = await supabase.from('follow_ups').insert(sanitized).select().single();
        if (retry.error) throw retry.error;
        return retry.data;
      }
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['followups'] });
      toast.success('Follow-up scheduled');
      logActivity('created_followup', 'follow_up', data.id, 'Created follow-up');
    },
    onError: (err) => toast.error(err.message),
  });
}

export function useUpdateFollowUp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { data, error } = await supabase.from('follow_ups').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['followups'] });
      const action = data.status === 'completed' ? 'completed_followup' : 'updated follow-up';
      toast.success(data.status === 'completed' ? 'Follow-up completed' : 'Follow-up updated');
      logActivity(action, 'follow_up', data.id, `${action}: follow-up`);
    },
    onError: (err) => toast.error(err.message),
  });
}

export function useDeleteFollowUp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('follow_ups').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['followups'] });
      toast.success('Follow-up deleted');
    },
    onError: (err) => toast.error(err.message),
  });
}
