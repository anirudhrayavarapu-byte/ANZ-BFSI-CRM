import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useMeetings(clientId) {
  const [meetings, setMeetings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!clientId) return
    async function fetch() {
      const { data } = await supabase
        .from('meetings')
        .select('*, users!logged_by ( username )')
        .eq('client_id', clientId)
        .order('meeting_date', { ascending: false })
      setMeetings(data ?? [])
      setLoading(false)
    }
    fetch()
  }, [clientId])

  return { meetings, loading }
}
