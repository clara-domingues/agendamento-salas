import { supabase } from './supabaseClient'

export function iniciarMinhasReservas() {
  const container = document.getElementById('view-minhas')
  container.innerHTML = `
    <h2 id="titulo-minhas">Minhas reservas</h2>
    <p id="minhas-aviso"></p>
    <ul id="minhas-lista"></ul>
  `

  const titulo = container.querySelector('#titulo-minhas')
  const aviso = container.querySelector('#minhas-aviso')
  const lista = container.querySelector('#minhas-lista')

  async function atualizar() {
    lista.innerHTML = ''
    const { data: userSession } = await supabase.auth.getSession()
    const user = userSession?.session?.user

    if (!user) return

    // Verificar se é Admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.is_admin || false

    if (isAdmin) {
      titulo.textContent = 'Todas as reservas (Painel Admin)'
    } else {
      titulo.textContent = 'Minhas reservas'
    }

    let query = supabase.from('reservas').select('*, salas(nome)').order('data', { ascending: true })
    if (!isAdmin) {
      query = query.eq('user_id', user.id)
    }

    const { data: reservas } = await query

    if (!reservas || reservas.length === 0) {
      aviso.textContent = 'Nenhuma reserva encontrada.'
      return
    }

    aviso.textContent = ''
    reservas.forEach((r) => {
      const li = document.createElement('li')
      
      const spanInfo = document.createElement('span')
      const [ano, mes, dia] = r.data.split('-')
      const textoUsuario = isAdmin ? ` (${r.user_email})` : ''
      spanInfo.textContent = `${dia}/${mes}/${ano} - ${r.inicio.slice(0,5)} às ${r.fim.slice(0,5)} - ${r.salas ? r.salas.nome : 'Sala'}${textoUsuario}`

      const botao = document.createElement('button')
      botao.textContent = 'Cancelar'
      // Estilo direto em vermelho
      botao.style.backgroundColor = '#ef4444'
      botao.style.color = '#ffffff'
      botao.style.border = 'none'
      botao.style.padding = '8px 16px'
      botao.style.borderRadius = '6px'
      botao.style.fontWeight = '600'
      botao.style.cursor = 'pointer'

      botao.addEventListener('click', async () => {
        if (!confirm('Deseja cancelar esta reserva?')) return
        await supabase.from('reservas').delete().eq('id', r.id)
        document.dispatchEvent(new CustomEvent('reservas-mudaram'))
      })

      li.appendChild(spanInfo)
      li.appendChild(botao)
      lista.appendChild(li)
    })
  }

  document.addEventListener('reservas-mudaram', atualizar)
  atualizar()
}