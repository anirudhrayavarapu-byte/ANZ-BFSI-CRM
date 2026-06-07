import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { getFollowUpStatus, sortByUrgency } from '../utils/followUpStatus'

export function useFollowUps() {
  const [followUps, setFollowUps] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetch() {
      setLoading(true)
      const sevenDaysOut = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('meetings')
        .select(`
          id, next_followup_date, client_id,
          clients ( id, name, account_id, accounts ( name ) )
        `)
        .not('next_followup_date', 'is', null)
        .lte('next_followup_date', sevenDaysOut)
        .order('next_followup_date', { ascending: true })

      if (error) { setError(error); setLoading(false); return }

      const seen = new Set()
      const unique = []
      for (const row of data) {
        if (!seen.has(row.client_id)) {
          seen.add(row.client_id)
          unique.push({
            ...row,
            status: getFollowUpStatus(row.next_followup_date),
          })
        }
      }

      setFollowUps(sortByUrgency(unique, 'next_followup_date').filter(f => f.status !== 'future'))
      setLoading(false)
    }
    fetch()
  }, [])

  return { followUps, loading, error }
}
