import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useAccounts() {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('accounts').select('id, name, industry').eq('is_active', true).order('name')
      .then(({ data }) => { setAccounts(data ?? []); setLoading(false) })
  }, [])

  return { accounts, loading }
}
