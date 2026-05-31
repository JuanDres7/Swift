import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, User, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import authService from '../services/authService'

const labelStyle = { display:'block', fontFamily:'Space Mono', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'#9C9890', marginBottom:6 }

export default function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const { access_token } = await authService.login(username, password)
      localStorage.setItem('swift_token', access_token)
      toast.success('Acceso concedido')
      navigate('/')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 flex items-center justify-center" style={{ background:'#111', borderRadius:2 }}>
            <span style={{ fontFamily:'Space Mono', fontSize:13, color:'#fff', fontWeight:700 }}>S/</span>
          </div>
          <span style={{ fontFamily:'Space Grotesk', fontWeight:700, fontSize:20, color:'#111', letterSpacing:'-0.02em' }}>SWIFT</span>
        </div>

        {/* Card */}
        <div className="tech-card p-7">
          <p className="bracket-label mb-1">[// secure_access]</p>
          <h1 style={{ fontFamily:'Space Grotesk', fontWeight:700, fontSize:20, letterSpacing:'-0.02em', color:'#111', marginBottom:24 }}>
            Iniciar sesión
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label style={labelStyle}>Usuario</label>
              <div style={{ position:'relative' }}>
                <User className="w-3.5 h-3.5" style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', color:'#AEAB9F' }} />
                <input
                  value={username} onChange={e => setUsername(e.target.value)}
                  required autoFocus className="input-field" style={{ paddingLeft:32 }}
                  placeholder="admin"
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Contraseña</label>
              <div style={{ position:'relative' }}>
                <Lock className="w-3.5 h-3.5" style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', color:'#AEAB9F' }} />
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)}
                  required className="input-field" style={{ paddingLeft:32 }}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{ width:'100%', justifyContent:'center', marginTop:8 }}>
              {loading ? '[ Verificando... ]' : '[ Acceder ]'}
              {!loading && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </form>
        </div>

        <p className="text-center mt-5" style={{ fontFamily:'Space Mono', fontSize:9, color:'#C5C2BB', letterSpacing:'0.1em' }}>
          SWIFT_SYS // ACCESO RESTRINGIDO
        </p>
      </div>
    </div>
  )
}
