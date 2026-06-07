import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useMeetingStore = create((set) => ({
  submitting: false,
  error: null,

  logMeeting: async (payload) => {
    set({ submitting: true, error: null })
    const { error } = await supabase.from('meetings').insert(payload)
    if (error) {
      set({ submitting: false, error: error.message })
      return { success: false }
    }
    set({ submitting: false })
    return { success: true }
  },
}))
