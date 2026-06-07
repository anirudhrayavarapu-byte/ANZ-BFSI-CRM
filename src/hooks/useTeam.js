import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { getFollowUpStatus } from '../utils/followUpStatus'

export function useTeam() {
  const { profile } = useAuthStore()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return

    async function fetch() {
      const isSuperManager = profile.role === 'super_manager'

      let membersQuery = supabase.from('users').select('id, username, role')
      if (!isSuperManager) {
        membersQuery = membersQuery.eq('manager_id', profile.id)
      } else {
        membersQuery = membersQuery.neq('id', profile.id)
      }
      const { data: teamMembers } = await membersQuery

      if (!teamMembers?.length) {
        setMembers([])
        setLoading(false)
        return
      }

      const memberIds = teamMembers.map(m => m.id)

      const { data: clients } = await supabase
        .from('clients')
        .select('id, name, title, assigned_to, account_id, accounts(name), meetings(next_followup_date, meeting_date)')
        .in('assigned_to', memberIds)
        .eq('is_active', true)

      const enriched = teamMembers.map(member => {
        const myClients = (clients ?? []).filter(c => c.assigned_to === member.id)
        let overdue = 0, dueSoon = 0, onTrack = 0

        myClients.forEach(c => {
          const latest = c.meetings?.sort((a, b) => new Date(b.meeting_date) - new Date(a.meeting_date))[0]
          const status = getFollowUpStatus(latest?.next_followup_date)
          if (status === 'overdue') overdue++
          else if (status === 'today' || status === 'upcoming') dueSoon++
          else onTrack++
        })

        return { ...member, clients: myClients, overdue, dueSoon, onTrack }
      })

      setMembers(enriched)
      setLoading(false)
    }

    fetch()
  }, [profile])

  return { members, loading }
}
