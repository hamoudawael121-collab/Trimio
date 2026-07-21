'use client'
import { Toaster } from 'react-hot-toast'

export default function ClientToaster() {
  return <Toaster position="bottom-left" toastOptions={{
    style: {
      borderRadius: '12px',
      background: '#333',
      color: '#fff',
      padding: '16px',
    },
    success: {
      style: {
        background: '#10B981',
      },
    },
    error: {
      style: {
        background: '#EF4444',
      },
    },
  }} />
}
