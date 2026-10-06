// Converte uma data para o formato AAAA-MM-DD usando o fuso local
export function dataLocal(d) {
  const ano = d.getFullYear()
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

const hoje = dataLocal(new Date())

// DADOS DE MENTIRA: serão substituídos pelo banco na etapa 7
export const salas = [
  { id: 1, nome: 'Sala de Reunião', abertura: '08:00', fechamento: '17:00' },
]

export const reservas = [
  { id: 1, salaId: 1, data: hoje, inicio: '09:00', fim: '10:30', usuario: 'maria@empresa.com' },
  { id: 2, salaId: 1, data: hoje, inicio: '14:00', fim: '16:00', usuario: 'joao@empresa.com' },
]