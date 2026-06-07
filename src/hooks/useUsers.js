import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchUsers = useCallback(async () => {
    const { data } = await supabase
      .from('users')
      .select('id, username, email, role, manager_id, is_active')
      .order('username')
    setUsers(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  async function updateUser(id, changes) {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...changes } : u))
    const { error } = await supabase.from('users').update(changes).eq('id', id)
    if (error) fetchUsers()
  }

  return { users, loading, updateUser, refresh: fetchUsers }
}
