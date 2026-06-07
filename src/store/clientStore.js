import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useClientStore = create((set, get) => ({
  details: {},

  fetchDetails: async (clientId) => {
    const { data } = await supabase
      .from('client_details')
      .select('*')
      .eq('client_id', clientId)
      .single()
    if (data) set(state => ({ details: { ...state.details, [clientId]: data } }))
    else set(state => ({ details: { ...state.details, [clientId]: {} } }))
  },

  updateDetail: async (clientId, field, value) => {
    set(state => ({
      details: {
        ...state.details,
        [clientId]: { ...(state.details[clientId] ?? {}), [field]: value },
      },
    }))

    const existing = get().details[clientId]?.id
    if (existing) {
      await supabase
        .from('client_details')
        .update({ [field]: value, updated_at: new Date().toISOString() })
        .eq('client_id', clientId)
    } else {
      const { data } = await supabase
        .from('client_details')
        .insert({ client_id: clientId, [field]: value })
        .select()
        .single()
      if (data) set(state => ({ details: { ...state.details, [clientId]: data } }))
    }
  },
}))
