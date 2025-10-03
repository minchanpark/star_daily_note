import { AuthProvider } from './contexts/AuthContext'
import NightSky from './components/NightSky'

export default function App() {
  return (
    <AuthProvider>
      <NightSky />
    </AuthProvider>
  )
}
