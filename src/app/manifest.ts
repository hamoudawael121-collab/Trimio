import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Trimio - احجز صالونك الآن',
    short_name: 'Trimio',
    description: 'المنصة الأولى لحجز مواعيد صالونات الحلاقة والكوافيرات',
    start_url: '/',
    display: 'standalone',
    background_color: '#F0F9FF',
    theme_color: '#0EA5E9',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}
