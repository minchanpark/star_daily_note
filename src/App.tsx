import { AuthProvider } from './contexts/AuthContext'
import { NightSky } from './components/sky'

export default function App() {
  return (
    <AuthProvider>
      <NightSky />
    </AuthProvider>
  )
}
