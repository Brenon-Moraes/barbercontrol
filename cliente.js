const views = [...document.querySelectorAll('.client-view')];
const sidebar = document.querySelector('#clientSidebar');
const toastEl = document.querySelector('#clientToast');
const bookingModal = document.querySelector('#bookingModal');
const partnerModal = document.querySelector('#partnerModal');
let toastTimeout;
let bookingStep = 1;
let selectedService = '';
let selectedDate = '';
let selectedTime = '';
let bookingTab = 'upcoming';
const customerBookings = { upcoming: [], past: [] };
const services = [
  { name: 'Corte de cabelo', duration: '30 min', price: 'R$ 45,00', icon: '✂' },
  { name: 'Corte + barba', duration: '50 min', price: 'R$ 70,00', icon: '⌁' },
  { name: 'Barba tradicional', duration: '30 min', price: 'R$ 35,00', icon: '◇' },
  { name: 'Corte + sobrancelha', duration: '40 min', price: 'R$ 60,00', icon: '✦' }
];

function showClientToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toastEl.classList.remove('show'), 3000);
}

function navigateTo(viewName) {
  const view = document.querySelector(`#view-${viewName}`);
  if (!view) return;
  views.forEach(item => item.classList.toggle('active', item === view));
  document.querySelectorAll('.client-nav-item').forEach(item => item.classList.toggle('active', item.dataset.view === viewName));
  document.querySelector('#crumbLabel').textContent = view.dataset.title;
  sidebar.classList.remove('open');
  history.replaceState(null, '', `#${viewName}`);
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (viewName === 'agendamentos') renderBookings();
}

document.querySelectorAll('[data-view]').forEach(item => item.addEventListener('click', (event) => {
  event.preventDefault();
  navigateTo(item.dataset.view);
}));

document.querySelectorAll('[data-toast]').forEach(button => button.addEventListener('click', () => showClientToast(button.dataset.toast)));
document.querySelector('#clientMenu').addEventListener('click', () => sidebar.classList.toggle('open'));
document.querySelectorAll('[data-open-booking]').forEach(button => button.addEventListener('click', openBooking));
document.querySelectorAll('[data-booking-tab]').forEach(button => button.addEventListener('click', () => {
  bookingTab = button.dataset.bookingTab;
  document.querySelectorAll('[data-booking-tab]').forEach(tab => tab.classList.toggle('active', tab === button));
  renderBookings();
}));

function todayISO() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function openBooking() {
  bookingStep = 1;
  selectedService = '';
  selectedDate = '';
  selectedTime = '';
  bookingModal.classList.add('open');
  bookingModal.setAttribute('aria-hidden', 'false');
  renderBookingStep();
}

function closeBooking() {
  bookingModal.classList.remove('open');
  bookingModal.setAttribute('aria-hidden', 'true');
}

document.querySelectorAll('[data-close-booking]').forEach(button => button.addEventListener('click', closeBooking));
bookingModal.addEventListener('click', event => { if (event.target === bookingModal) closeBooking(); });

function renderBookingStep() {
  const content = document.querySelector('#bookingStepContent');
  document.querySelector('#stepNumber').textContent = bookingStep;
  document.querySelector('#bookingProgress').style.width = `${bookingStep * 33.333}%`;
  if (bookingStep === 1) {
    content.innerHTML = `<h2 id="bookingModalTitle">Escolha seu serviço</h2><p class="client-modal-intro">O que você gostaria de fazer na sua próxima visita?</p><div class="service-options">${services.map(service => `<button class="service-option${selectedService === service.name ? ' selected' : ''}" data-service="${service.name}"><span class="service-option-icon">${service.icon}</span><span><b>${service.name}</b><small>${service.duration} · ${service.price}</small></span><em></em></button>`).join('')}</div><div class="modal-footer"><span>Você pode alterar antes de confirmar</span><button class="client-primary" id="nextBookingStep" ${selectedService ? '' : 'disabled'}>Continuar →</button></div>`;
    content.querySelectorAll('[data-service]').forEach(button => button.addEventListener('click', () => {
      selectedService = button.dataset.service;
      renderBookingStep();
    }));
    content.querySelector('#nextBookingStep').addEventListener('click', () => { if (!selectedService) return; bookingStep = 2; renderBookingStep(); });
  } else if (bookingStep === 2) {
    const dateMin = todayISO();
    const slots = ['09:00', '09:30', '10:00', '10:30', '11:00', '13:30', '14:00', '15:00', '16:00', '17:00', '17:30', '18:00'];
    content.innerHTML = `<h2 id="bookingModalTitle">Escolha data e horário</h2><p class="client-modal-intro">Veja os horários disponíveis e escolha o que combina com você.</p><label class="time-slot-label" for="bookingDate">DATA DA VISITA</label><input id="bookingDate" class="booking-date-input" type="date" min="${dateMin}" value="${selectedDate || dateMin}"><div class="time-slot-label">HORÁRIOS DISPONÍVEIS</div><div class="time-slots">${slots.map(time => `<button class="time-slot${selectedTime === time ? ' selected' : ''}" data-time="${time}">${time}</button>`).join('')}</div><div class="modal-footer"><button class="subtle-link" id="backBookingStep">← Voltar</button><button class="client-primary" id="nextBookingStep" ${selectedTime ? '' : 'disabled'}>Continuar →</button></div>`;
    selectedDate ||= dateMin;
    content.querySelector('#bookingDate').addEventListener('change', event => { selectedDate = event.target.value; });
    content.querySelectorAll('[data-time]').forEach(button => button.addEventListener('click', () => {
      selectedTime = button.dataset.time;
      renderBookingStep();
    }));
    content.querySelector('#backBookingStep').addEventListener('click', () => { bookingStep = 1; renderBookingStep(); });
    content.querySelector('#nextBookingStep').addEventListener('click', () => { if (!selectedDate || !selectedTime) return; bookingStep = 3; renderBookingStep(); });
  } else {
    const service = services.find(item => item.name === selectedService);
    const date = new Date(`${selectedDate}T12:00:00`).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
    content.innerHTML = `<div class="booking-confirmation"><div class="confirmation-mark">✓</div><h2 id="bookingModalTitle">Tudo pronto para confirmar</h2><p>Confira os detalhes do seu horário antes de finalizar.</p><div class="confirm-summary"><b>${service.name}</b><span>${date} · ${selectedTime}</span><span>Barbearia Wechel · ${service.duration}</span><span>${service.price}</span></div><button class="client-primary" id="confirmBooking">Confirmar agendamento</button><button class="plan-terms" id="backBookingStep">← Alterar horário</button></div>`;
    content.querySelector('#confirmBooking').addEventListener('click', () => {
      const booking = { service: service.name, date: selectedDate, time: selectedTime, duration: service.duration, price: service.price };
      customerBookings.upcoming.push(booking);
      customerBookings.upcoming.sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
      closeBooking();
      updateHomeBookings();
      renderBookings();
      showClientToast('Horário reservado! Você já pode encontrá-lo nos seus agendamentos.');
    });
    content.querySelector('#backBookingStep').addEventListener('click', () => { bookingStep = 2; renderBookingStep(); });
  }
}

function formatBookingDate(iso) {
  const date = new Date(`${iso}T12:00:00`);
  return { day: date.toLocaleDateString('pt-BR', { day: '2-digit' }), month: date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''), weekday: date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }) };
}

function makeBookingRow(booking, past = false) {
  const row = document.createElement('article');
  row.className = 'client-booking-row';
  const date = formatBookingDate(booking.date);
  const dateBox = document.createElement('div');
  dateBox.className = 'booking-date-box';
  const day = document.createElement('b'); day.textContent = date.day;
  const month = document.createElement('span'); month.textContent = date.month;
  dateBox.append(day, month);
  const info = document.createElement('div');
  info.className = 'client-booking-info';
  const title = document.createElement('b'); title.textContent = booking.service;
  const details = document.createElement('p'); details.textContent = `${date.weekday} · ${booking.time} · ${booking.duration}`;
  const shop = document.createElement('small'); shop.textContent = 'Barbearia Wechel';
  info.append(title, details, shop);
  row.append(dateBox, info);
  const actions = document.createElement('div'); actions.className = 'client-booking-actions';
  const state = document.createElement('span'); state.className = 'booking-state'; state.textContent = past ? 'Concluído' : 'Confirmado'; actions.append(state);
  if (!past) {
    const cancel = document.createElement('button'); cancel.className = 'booking-cancel'; cancel.textContent = 'Cancelar';
    cancel.addEventListener('click', () => {
      if (!window.confirm('Deseja remover este agendamento da lista demonstrativa?')) return;
      customerBookings.upcoming = customerBookings.upcoming.filter(item => item !== booking);
      renderBookings(); updateHomeBookings(); showClientToast('Agendamento removido da demonstração.');
    });
    actions.append(cancel);
  }
  row.append(actions);
  return row;
}

function renderBookings() {
  const list = document.querySelector('#bookingList');
  const data = customerBookings[bookingTab];
  list.replaceChildren(...data.map(item => makeBookingRow(item, bookingTab === 'past')));
  document.querySelector('#bookingEmpty').hidden = data.length > 0;
  document.querySelector('#bookingEmptyTitle').textContent = bookingTab === 'past' ? 'Seus atendimentos concluídos aparecerão aqui' : 'Seu próximo horário começa aqui';
  document.querySelector('#bookingEmptyText').textContent = bookingTab === 'past' ? 'Quando você concluir um atendimento, poderá encontrá-lo nesta lista.' : 'Ainda não há agendamentos nesta lista. Vamos encontrar um bom horário?';
  document.querySelector('#upcomingCount').textContent = customerBookings.upcoming.length;
}

function updateHomeBookings() {
  const empty = document.querySelector('#homeEmpty');
  const list = document.querySelector('#homeBookingList');
  const upcoming = customerBookings.upcoming.slice(0, 2);
  empty.hidden = upcoming.length > 0;
  list.replaceChildren(...upcoming.map(item => makeBookingRow(item)));
}

document.querySelectorAll('[data-category]').forEach(button => button.addEventListener('click', () => {
  const category = button.dataset.category;
  document.querySelectorAll('[data-category]').forEach(chip => chip.classList.toggle('active', chip === button));
  document.querySelectorAll('[data-partner-category]').forEach(card => { card.hidden = category !== 'Todos' && card.dataset.partnerCategory !== category; });
}));

document.querySelectorAll('[data-partner]').forEach(button => button.addEventListener('click', () => {
  document.querySelector('#partnerModalTitle').textContent = button.dataset.partner;
  partnerModal.classList.add('open');
  partnerModal.setAttribute('aria-hidden', 'false');
}));
document.querySelectorAll('[data-close-partner]').forEach(button => button.addEventListener('click', () => {
  partnerModal.classList.remove('open'); partnerModal.setAttribute('aria-hidden', 'true');
}));
partnerModal.addEventListener('click', event => { if (event.target === partnerModal) { partnerModal.classList.remove('open'); partnerModal.setAttribute('aria-hidden', 'true'); } });

document.querySelector('#profileForm').addEventListener('submit', event => {
  event.preventDefault();
  const name = new FormData(event.currentTarget).get('name').trim();
  document.querySelector('.client-user b').textContent = name;
  document.querySelector('.profile-photo-row b').textContent = name;
  const greeting = document.querySelector('.client-welcome h1');
  greeting.replaceChildren(document.createTextNode(`Olá, ${name.split(/\s+/)[0]} `));
  const sparkle = document.createElement('span');
  sparkle.textContent = '✦';
  greeting.append(sparkle);
  const initials = name.split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase();
  document.querySelectorAll('.client-user-avatar,.client-top-avatar,.profile-photo').forEach(node => { const badge = node.querySelector('span'); node.textContent = initials; if (badge) node.append(badge); });
  document.querySelector('#profileMessage').textContent = 'Alterações salvas nesta demonstração.';
  showClientToast('Seu perfil foi atualizado nesta demonstração.');
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    closeBooking();
    partnerModal.classList.remove('open'); partnerModal.setAttribute('aria-hidden', 'true');
    sidebar.classList.remove('open');
  }
});

const initialView = location.hash.replace('#', '');
if (initialView && document.querySelector(`#view-${initialView}`)) navigateTo(initialView);
renderBookings();
