const modal = document.querySelector('#modal');
const toast = document.querySelector('#toast');
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

function openModal(title = 'Novo agendamento') {
  document.querySelector('#modalTitle').textContent = title;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  if (title === 'Novo agendamento') modal.querySelector('input[name="client"]').focus();
}

function closeModal() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
}

document.querySelector('#newBooking').addEventListener('click', () => openModal());
document.querySelector('#newPlan').addEventListener('click', () => showToast('A criação de planos estará disponível em breve.'));
document.querySelector('#closeModal').addEventListener('click', closeModal);
modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeModal(); });

document.querySelector('#bookingForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const client = data.get('client').trim();
  const time = data.get('time');
  const service = data.get('service');
  const date = data.get('date');
  const row = document.createElement('div');
  row.className = 'appointment';
  row.innerHTML = `<div class="time"></div><div class="appointment-line"><i class="dot green-dot"></i></div><div class="client-avatar a4"></div><div class="appointment-info"><b></b><span></span></div><div class="appointment-price">—</div><button class="more" aria-label="Mais opções">···</button>`;
  row.querySelector('.time').innerHTML = `${time}<small>30 min</small>`;
  row.querySelector('.client-avatar').textContent = client.split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase();
  row.querySelector('.appointment-info b').textContent = client;
  row.querySelector('.appointment-info span').textContent = `${service} · A definir`;
  const appointments = document.querySelector('.appointments');
  appointments.append(row);
  closeModal();
  event.currentTarget.reset();
  showToast(`Agendamento de ${client} para ${time} adicionado à lista.`);
  if (date && date !== new Date().toISOString().slice(0, 10)) showToast(`Agendamento salvo para ${date} às ${time}.`);
});

document.querySelectorAll('.sidebar .nav-item').forEach((link) => {
  link.addEventListener('click', () => {
    document.querySelectorAll('.sidebar .nav-item').forEach(item => item.classList.remove('active'));
    link.classList.add('active');
    document.querySelector('#sidebar').classList.remove('open');
  });
});

document.querySelector('#mobileMenu').addEventListener('click', () => document.querySelector('#sidebar').classList.toggle('open'));
document.querySelector('.agenda-footer').addEventListener('click', () => showToast('A configuração de horários bloqueados estará disponível em breve.'));
document.querySelectorAll('.more').forEach(button => button.addEventListener('click', () => showToast('Opções do agendamento em breve.')));
