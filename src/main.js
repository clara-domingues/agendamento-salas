import './style.css'
import { supabase } from './supabaseClient'
import { iniciarDisponibilidade } from './disponibilidade'
import { iniciarNovaReserva } from './novaReserva'
import { iniciarMinhasReservas } from './minhasReservas'


const loginView = document.getElementById('login-view')
const homeView = document.getElementById('home-view')
const form = document.getElementById('login-form')
const emailInput = document.getElementById('email')
const passwordInput = document.getElementById('password')
const message = document.getElementById('message')
const userEmail = document.getElementById('user-email')
const views = document.querySelectorAll('.view')
const navButtons = document.querySelectorAll('nav button')

let emailAtual = ''

function show(text) {
  message.textContent = text
}

function showView(name) {
  views.forEach((v) => (v.hidden = v.id !== `view-${name}`))
}

function render(session) {
  const logado = Boolean(session)
  loginView.hidden = logado
  homeView.hidden = !logado
  if (logado) {
    emailAtual = session.user.email
    userEmail.textContent = emailAtual
    showView('disponibilidade')
    document.dispatchEvent(new CustomEvent('reservas-mudaram'))
  }
}

navButtons.forEach((b) =>
  b.addEventListener('click', () => {
    showView(b.dataset.view)
    document.dispatchEvent(new CustomEvent('reservas-mudaram'))
  })
)

form.addEventListener('submit', async (e) => {
  e.preventDefault()
  show('')
  const { error } = await supabase.auth.signInWithPassword({
    email: emailInput.value,
    password: passwordInput.value,
  })
  if (error) {
    show(
      error.message.includes('Invalid login credentials')
        ? 'E-mail ou senha incorretos.'
        : 'Erro: ' + error.message
    )
  }
})

document.getElementById('signup-btn').addEventListener('click', async () => {
  show('')
  const { error } = await supabase.auth.signUp({
    email: emailInput.value,
    password: passwordInput.value,
  })
  if (error) show('Não foi possível criar a conta: ' + error.message)
  else show('Conta criada! Agora é só entrar.')
})

document.getElementById('logout-btn').addEventListener('click', () => {
  supabase.auth.signOut()
})

supabase.auth.onAuthStateChange((_evento, session) => render(session))
supabase.auth.getSession().then(({ data }) => render(data.session))

iniciarDisponibilidade()
iniciarNovaReserva(() => emailAtual)
iniciarMinhasReservas(() => emailAtual)