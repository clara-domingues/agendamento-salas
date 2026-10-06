import { supabase } from './supabaseClient'

export function iniciarNovaReserva(getEmail) {
  const container = document.getElementById('view-nova')
  container.innerHTML = `
    <h2>Nova reserva</h2>
    <form id="form-reserva">
      <div class="form-group">
        <label for="res-sala">Sala</label>
        <select id="res-sala" required></select>
      </div>
      <div class="form-group">
        <label for="res-data">Data</label>
        <input type="date" id="res-data" required />
      </div>
      <div class="form-group">
        <label for="res-inicio">Início (Expediente: 08:00 às 17:00)</label>
        <input type="time" id="res-inicio" required min="08:00" max="16:30" step="1800" />
      </div>
      <div class="form-group">
        <label for="res-fim">Fim</label>
        <input type="time" id="res-fim" required min="08:30" max="17:00" step="1800" />
      </div>
      <button type="submit">Confirmar reserva</button>
    </form>
    <p id="res-msg"></p>
  `

  const selectSala = container.querySelector('#res-sala')
  const form = container.querySelector('#form-reserva')
  const msg = container.querySelector('#res-msg')

  async function carregarSalas() {
    const { data: salas } = await supabase.from('salas').select('*')
    if (salas) {
      selectSala.innerHTML = ''
      salas.forEach((s) => {
        const opt = document.createElement('option')
        opt.value = s.id
        opt.textContent = s.nome
        selectSala.appendChild(opt)
      })
    }
  }

  carregarSalas()

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    msg.textContent = ''

    const salaId = selectSala.value
    const data = container.querySelector('#res-data').value
    const inicio = container.querySelector('#res-inicio').value
    const fim = container.querySelector('#res-fim').value

    // Validação de horário de expediente (08:00 às 17:00)
    if (inicio < '08:00' || fim > '17:00') {
      msg.textContent = 'A empresa funciona apenas entre 08:00 e 17:00.'
      return
    }

    if (inicio >= fim) {
      msg.textContent = 'O horário de fim deve ser posterior ao início.'
      return
    }

    const { data: userSession } = await supabase.auth.getSession()
    const user = userSession?.session?.user

    if (!user) {
      msg.textContent = 'Sessão expirada. Faça login novamente.'
      return
    }

    // Verificar conflitos de horário no Supabase
    const { data: conflitos } = await supabase
      .from('reservas')
      .select('*')
      .eq('sala_id', salaId)
      .eq('data', data)

    const temConflito = conflitos?.some(
      (r) =>
        (inicio >= r.inicio && inicio < r.fim) ||
        (fim > r.inicio && fim <= r.fim) ||
        (inicio <= r.inicio && fim >= r.fim)
    )

    if (temConflito) {
      msg.textContent = 'Este horário já está ocupado nesta sala.'
      return
    }

    // Gravar no Supabase
    const { error } = await supabase.from('reservas').insert([
      {
        sala_id: salaId,
        user_id: user.id,
        user_email: user.email,
        data,
        inicio,
        fim,
      },
    ])

    if (error) {
      msg.textContent = 'Erro ao salvar reserva: ' + error.message
    } else {
      msg.textContent = 'Reserva confirmada com sucesso!'
      form.reset()
      document.dispatchEvent(new CustomEvent('reservas-mudaram'))
    }
  })
}