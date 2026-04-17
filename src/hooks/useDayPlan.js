import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { logActivity } from './useAuth';

export function useDayPlans(filters = {}) {
  return useQuery({
    queryKey: ['dayplans', filters],
    queryFn: async () => {
      let query = supabase.from('day_plans').select('*, profile:profiles!day_plans_user_id_fkey(name)').order('plan_date', { ascending: false });
      if (filters.status) query = query.eq('status', filters.status);
      if (filters.user_id) query = query.eq('user_id', filters.user_id);
      if (filters.date) query = query.eq('plan_date', filters.date);
      let { data, error } = await query;
      if (error?.message?.includes('column "user_id"') && filters.user_id) {
        let fallback = supabase.from('day_plans').select('*, profile:profiles!day_plans_user_id_fkey(name)').order('plan_date', { ascending: false });
        if (filters.status) fallback = fallback.eq('status', filters.status);
        if (filters.date) fallback = fallback.eq('plan_date', filters.date);
        const retry = await fallback;
        if (retry.error) throw retry.error;
        return retry.data;
      }
      if (error) throw error;
      return data;
    },
  });
}

export function useDayPlan(id) {
  return useQuery({
    queryKey: ['dayplans', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('day_plans').select('*, profile:profiles!day_plans_user_id_fkey(name)').eq('id', id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateDayPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (plan) => {
      let { data, error } = await supabase.from('day_plans').insert(plan).select().single();
      if (error?.message?.includes('column "user_id"')) {
        const sanitized = { ...plan };
        delete sanitized.user_id;
        const retry = await supabase.from('day_plans').insert(sanitized).select().single();
        if (retry.error) throw retry.error;
        return retry.data;
      }
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['dayplans'] });
      toast.success('Day plan created');
      logActivity('created_day_plan', 'day_plan', data.id, 'Created day plan');
    },
    onError: (err) => toast.error(err.message),
  });
}

export function useUpdateDayPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { data, error } = await supabase.from('day_plans').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['dayplans'] });
      const msg = data.status === 'submitted' ? 'Day plan submitted' : data.status === 'approved' ? 'Day plan approved' : 'Day plan updated';
      toast.success(msg);
      if (data.status === 'submitted') logActivity('submitted_day_plan', 'day_plan', data.id, 'Submitted day plan');
      if (data.status === 'approved') logActivity('approved_day_plan', 'day_plan', data.id, 'Approved day plan');
    },
    onError: (err) => toast.error(err.message),
  });
}

export function useDeleteDayPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('day_plans').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dayplans'] });
      toast.success('Day plan deleted');
    },
    onError: (err) => toast.error(err.message),
  });
}
