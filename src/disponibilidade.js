import { supabase } from './supabaseClient'

function gerarBlocosDe30Min() {
  const blocos = []
  for (let h = 8; h < 17; h++) {
    const hh = String(h).padStart(2, '0')
    blocos.push({ inicio: `${hh}:00:00`, fim: `${hh}:30:00`, rotulo: `${hh}:00 às ${hh}:30` })
    blocos.push({ inicio: `${hh}:30:00`, fim: `${String(h + 1).padStart(2, '0')}:00:00`, rotulo: `${hh}:30 às ${String(h + 1).padStart(2, '0')}:00` })
  }
  return blocos
}

export function iniciarDisponibilidade() {
  const container = document.getElementById('view-disponibilidade')
  container.innerHTML = `
    <h2>Disponibilidade</h2>
    <div class="form-group">
      <label for="disp-sala">Sala</label>
      <select id="disp-sala"></select>
    </div>
    <div class="form-group">
      <label for="disp-data">Data</label>
      <input type="date" id="disp-data" />
    </div>
    <ul id="disp-lista"></ul>
  `

  const selectSala = container.querySelector('#disp-sala')
  const inputData = container.querySelector('#disp-data')
  const lista = container.querySelector('#disp-lista')

  // Preencher hoje
  const hoje = new Date().toISOString().split('T')[0]
  inputData.value = hoje

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
      atualizar()
    }
  }

  async function atualizar() {
    lista.innerHTML = ''
    const salaId = selectSala.value
    const data = inputData.value
    if (!salaId || !data) return

    // Buscar reservas do Supabase para esta sala e data
    const { data: reservas } = await supabase
      .from('reservas')
      .select('*')
      .eq('sala_id', salaId)
      .eq('data', data)

    const blocos = gerarBlocosDe30Min()

    blocos.forEach((b) => {
      const conflito = reservas?.find(
        (r) =>
          (b.inicio >= r.inicio && b.inicio < r.fim) ||
          (b.fim > r.inicio && b.fim <= r.fim) ||
          (b.inicio <= r.inicio && b.fim >= r.fim)
      )

      const li = document.createElement('li')
      const spanHora = document.createElement('span')
      spanHora.className = 'hora-texto'
      spanHora.textContent = b.rotulo

      const spanBadge = document.createElement('span')

      if (conflito) {
        spanBadge.className = 'status-badge ocupado'
        spanBadge.innerHTML = `<span class="status-dot"></span> Ocupado (${conflito.user_email})`
      } else {
        spanBadge.className = 'status-badge livre'
        spanBadge.innerHTML = `<span class="status-dot"></span> Livre`
      }

      li.appendChild(spanHora)
      li.appendChild(spanBadge)
      lista.appendChild(li)
    })
  }

  selectSala.addEventListener('change', atualizar)
  inputData.addEventListener('change', atualizar)
  document.addEventListener('reservas-mudaram', atualizar)

  carregarSalas()
}