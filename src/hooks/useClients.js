import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { getFollowUpStatus, sortByUrgency } from '../utils/followUpStatus'

export function useClients(searchQuery = '') {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchClients = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('clients')
      .select(`
        id, name, title, email, phone, assigned_to, account_id,
        accounts ( id, name, strategic_importance, industry ),
        meetings ( next_followup_date, meeting_date )
      `)
      .eq('is_active', true)
      .order('name')

    if (searchQuery.trim()) {
      query = query.ilike('name', `%${searchQuery}%`)
    }

    const { data, error } = await query
    if (error) { setError(error); setLoading(false); return }

    const enriched = (data ?? []).map(c => {
      const meetings = c.meetings ?? []
      const latest = [...meetings].sort((a, b) => new Date(b.meeting_date) - new Date(a.meeting_date))[0]
      const nextFollowUp = latest?.next_followup_date ?? null
      return {
        ...c,
        lastMeetingDate: latest?.meeting_date ?? null,
        nextFollowUpDate: nextFollowUp,
        followUpStatus: getFollowUpStatus(nextFollowUp),
      }
    })

    setClients(sortByUrgency(enriched, 'nextFollowUpDate'))
    setLoading(false)
  }, [searchQuery])

  useEffect(() => { fetchClients() }, [fetchClients])

  return { clients, loading, error, refetch: fetchClients }
}
