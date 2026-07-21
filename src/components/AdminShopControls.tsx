'use client'

import { approveShop, rejectShop } from '@/app/actions/admin'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function AdminShopControls({ shopId, status }: { shopId: string, status: string }) {
  const [loading, setLoading] = useState(false)

  async function handleApprove() {
    setLoading(true)
    const res = await approveShop(shopId)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success('تمت الموافقة وتفعيل المحل!')
    }
    setLoading(false)
  }

  async function handleReject() {
    if (!confirm('هل أنت متأكد من رفض وحذف هذا المحل تماماً؟')) return
    setLoading(true)
    const res = await rejectShop(shopId)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success('تم الحذف بنجاح!')
    }
    setLoading(false)
  }

  return (
    <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
      {status === 'pending' && (
        <button 
          onClick={handleApprove} 
          disabled={loading}
          style={{
            padding: '8px 16px', 
            background: '#10B981', 
            color: 'white', 
            border: 'none', 
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          موافقة ✅
        </button>
      )}
      <button 
        onClick={handleReject} 
        disabled={loading}
        style={{
          padding: '8px 16px', 
          background: '#EF4444', 
          color: 'white', 
          border: 'none', 
          borderRadius: '6px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {status === 'pending' ? 'رفض ❌' : 'حذف المحل 🗑️'}
      </button>
    </div>
  )
}
