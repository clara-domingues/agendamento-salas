import { salas, reservas, dataLocal } from './mockData'

export function paraMinutos(hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

// Regra central: duas reservas se cruzam quando uma começa antes de a outra terminar
export function temConflito(salaId, data, inicio, fim) {
  return reservas.some(
    (r) =>
      r.salaId === salaId &&
      r.data === data &&
      r.inicio < fim &&
      r.fim > inicio
  )
}

// Devolve uma mensagem de erro, ou null se a reserva for válida
export function validarReserva({ salaId, data, inicio, fim }, agora = new Date()) {
  const sala = salas.find((s) => s.id === salaId)
  if (!sala) return 'Escolha uma sala.'
  if (!data || !inicio || !fim) return 'Preencha data, início e fim.'

  const diaSemana = new Date(data + 'T00:00:00').getDay()
  if (diaSemana === 0 || diaSemana === 6) {
    return 'A sala não abre aos fins de semana.'
  }

  if (fim <= inicio) return 'O horário de fim deve ser depois do início.'

  if (paraMinutos(inicio) % 30 !== 0 || paraMinutos(fim) % 30 !== 0) {
    return 'Use horários de 30 em 30 minutos (ex.: 09:00, 09:30).'
  }

  if (inicio < sala.abertura || fim > sala.fechamento) {
    return `A sala funciona das ${sala.abertura} às ${sala.fechamento}.`
  }

  const hoje = dataLocal(agora)
  if (data < hoje) return 'Não é possível reservar em uma data que já passou.'

  const horaAgora =
    String(agora.getHours()).padStart(2, '0') +
    ':' +
    String(agora.getMinutes()).padStart(2, '0')
  if (data === hoje && inicio < horaAgora) return 'Esse horário já passou.'

  if (temConflito(salaId, data, inicio, fim)) {
    return 'Esse horário já está reservado. Veja a disponibilidade e escolha outro.'
  }

  return null
}