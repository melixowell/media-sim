const tg = window.Telegram?.WebApp;

if (tg) {
  tg.ready();
  tg.expand();
}

const TOTAL_DAYS = 10;

const stateDefaults = {
  day: 1,
  rating: 55,
  budget: 70,
  reputation: 60,
  index: 0,
  finished: false,
};

let state = { ...stateDefaults };

const scenarios = [
  {
    title: 'Новый сезон начинается с тревожной планёрки',
    text: 'Утреннее шоу проседает, а конкуренты уже забрали часть молодой аудитории.',
    choices: [
      {
        text: 'Обновить сетку с короткими новостными дайджестами',
        effects: { rating: 7, budget: -6, reputation: 3 },
        log: 'Ритм эфира стал бодрее, слушатели вернулись в утренний слот.',
      },
      {
        text: 'Оставить привычный формат без резких шагов',
        effects: { rating: -5, reputation: 2 },
        log: 'Стабильность сохранилась, но рост аудитории не случился.',
      },
      {
        text: 'Сделать агрессивный инфотейнмент с горячими темами',
        effects: { rating: 9, reputation: -6, budget: -2 },
        log: 'Рейтинги подскочили, однако часть аудитории считает эфир слишком шумным.',
      },
    ],
  },
  {
    title: 'Ультиматум от рекламного отдела',
    text: 'Крупный бренд готов удвоить контракт, если получит эксклюзив в прайм-тайме.',
    choices: [
      {
        text: 'Подписать эксклюзив без обсуждений',
        effects: { budget: 18, rating: -6, reputation: -4 },
        log: 'Финансы укрепились, но слушатели заметили навязчивость рекламы.',
      },
      {
        text: 'Запустить нативную партнёрскую рубрику',
        effects: { budget: 10, rating: 4, reputation: 3 },
        log: 'Баланс между коммерцией и контентом сработал.',
      },
      {
        text: 'Отказаться и сделать ставку на доверие аудитории',
        effects: { budget: -9, reputation: 7, rating: 3 },
        log: 'Денег меньше, но редакционный бренд стал заметно сильнее.',
      },
    ],
  },
  {
    title: 'Сбой в прямом эфире во время интервью',
    text: 'Из-за старого пульта пропал звук у гостя федерального уровня.',
    choices: [
      {
        text: 'Экстренно купить новое оборудование',
        effects: { budget: -20, reputation: 8, rating: 5 },
        log: 'Инвестиция болезненная, но качество эфира заметно выросло.',
      },
      {
        text: 'Попросить техников временно латать систему',
        effects: { budget: -5, rating: -6, reputation: -5 },
        log: 'Временное решение сработало плохо — аудитория разочарована.',
      },
      {
        text: 'Арендовать студию у партнёров на месяц',
        effects: { budget: -9, rating: 3, reputation: 4 },
        log: 'Репутацию сохранили, выиграв время для нормального апгрейда.',
      },
    ],
  },
  {
    title: 'Соцсети раскручивают скандал с ведущим',
    text: 'Архивный пост вечернего ведущего вызвал волну критики.',
    choices: [
      {
        text: 'Публично поддержать ведущего',
        effects: { rating: 4, reputation: -9 },
        log: 'Лояльная аудитория осталась, но имидж станции заметно пострадал.',
      },
      {
        text: 'Временно снять ведущего с эфира',
        effects: { reputation: 7, rating: -4, budget: -3 },
        log: 'Кризис локализован, но вечерний слот потерял драйв.',
      },
      {
        text: 'Провести открытый эфир с вопросами слушателей',
        effects: { reputation: 5, rating: 5, budget: -2 },
        log: 'Прозрачность спасла ситуацию и вернула интерес аудитории.',
      },
    ],
  },
  {
    title: 'Музыкальный редактор предлагает рискованный ребрендинг',
    text: 'Новый звук может привлечь зумеров, но отпугнуть постоянных слушателей.',
    choices: [
      {
        text: 'Запустить полный ребрендинг станции',
        effects: { rating: 8, reputation: -4, budget: -8 },
        log: 'Молодая аудитория пришла, но часть старой базы ушла.',
      },
      {
        text: 'Сделать вечерний экспериментальный слот',
        effects: { rating: 5, budget: -4, reputation: 3 },
        log: 'Эксперимент дал рост без критического оттока.',
      },
      {
        text: 'Ничего не менять в музыкальной политике',
        effects: { rating: -4, reputation: 2 },
        log: 'Консервативная стратегия удержала ядро, но не принесла нового трафика.',
      },
    ],
  },
  {
    title: 'Город накрывает шторм: нужен экстренный информационный эфир',
    text: 'Слушатели ждут оперативной и точной информации в течение всей ночи.',
    choices: [
      {
        text: 'Перевести станцию в режим живого инфоэфира',
        effects: { reputation: 9, rating: 6, budget: -10 },
        log: 'Редакция сработала как служба спасения — доверие резко выросло.',
      },
      {
        text: 'Ограничиться короткими сводками раз в час',
        effects: { budget: -2, reputation: -5, rating: -3 },
        log: 'Экономно, но аудитория сочла станцию бесполезной в кризис.',
      },
      {
        text: 'Подключить городских блогеров к спецвыпуску',
        effects: { rating: 7, reputation: 1, budget: -5 },
        log: 'Интерес высокий, но качество экспертизы вызвало споры.',
      },
    ],
  },
  {
    title: 'Конкурент переманивает твою звезду утреннего шоу',
    text: 'Ведущий просит повысить контракт и дать свободу в контенте.',
    choices: [
      {
        text: 'Поднять гонорар и сохранить ведущего',
        effects: { budget: -12, rating: 7, reputation: 3 },
        log: 'Слушатели рады, станция удержала флагманский слот.',
      },
      {
        text: 'Отпустить ведущего и дать шанс новой команде',
        effects: { budget: 4, rating: -7, reputation: -2 },
        log: 'Расходы снизились, но аудитория резко отреагировала на замену.',
      },
      {
        text: 'Предложить долю от цифровой подписки и KPI',
        effects: { budget: -5, rating: 4, reputation: 5 },
        log: 'Гибкая схема укрепила и отношения, и имидж инновационной станции.',
      },
    ],
  },
  {
    title: 'Подкаст-направление требует отдельной редакции',
    text: 'Директор хочет цифровой рост, но ресурсов на всё сразу не хватает.',
    choices: [
      {
        text: 'Вложиться в подкаст-студию и монтаж',
        effects: { budget: -14, reputation: 6, rating: 3 },
        log: 'Цифровая аудитория растёт, бренд станции становится современнее.',
      },
      {
        text: 'Отложить развитие и держать фокус на FM-эфире',
        effects: { budget: 0, rating: -3, reputation: -2 },
        log: 'Краткосрочно спокойно, но тренд на цифровой рост упущен.',
      },
      {
        text: 'Сделать пилоты с аутсорс-командой',
        effects: { budget: -6, rating: 2, reputation: 4 },
        log: 'Осторожный запуск дал первые успехи без критических затрат.',
      },
    ],
  },
  {
    title: 'Политический гость требует согласовать вопросы заранее',
    text: 'Сложный эфир: можно получить мощный инфоповод, но есть риск обвинений в цензуре.',
    choices: [
      {
        text: 'Согласовать все вопросы и сохранить доступ к гостю',
        effects: { rating: 5, reputation: -7, budget: 3 },
        log: 'Интервью вышло громким, но журналистское сообщество критикует мягкость.',
      },
      {
        text: 'Отказаться от условий и отменить интервью',
        effects: { rating: -4, reputation: 8 },
        log: 'Рейтинг просел, зато редакционная независимость укрепилась.',
      },
      {
        text: 'Согласовать только фактуру, но оставить острые темы',
        effects: { rating: 4, reputation: 4, budget: 1 },
        log: 'Удалось провести честный разговор и не потерять эфирный вес.',
      },
    ],
  },
  {
    title: 'Финал сезона: совет директоров оценивает твою стратегию',
    text: 'Тебе нужно решить, в какую сторону развивать станцию в следующем году.',
    choices: [
      {
        text: 'Ставка на большие шоу и звёздных гостей',
        effects: { budget: -10, rating: 8, reputation: 1 },
        log: 'Станция стала громче и заметнее, но расходы выросли.',
      },
      {
        text: 'Ставка на общественно полезный контент и локальные темы',
        effects: { reputation: 9, rating: 3, budget: -4 },
        log: 'Бренд приобрёл вес и доверие, сформировав крепкое сообщество слушателей.',
      },
      {
        text: 'Ставка на digital-first: стримы, клипы, AI-рекомендации',
        effects: { rating: 6, budget: -6, reputation: 5 },
        log: 'Станция уверенно вошла в новый медиасезон и расширила цифровую аудиторию.',
      },
    ],
  },
];

const els = {
  rating: document.getElementById('rating'),
  budget: document.getElementById('budget'),
  reputation: document.getElementById('reputation'),
  day: document.getElementById('day'),
  progress: document.getElementById('progress'),
  ratingBar: document.getElementById('rating-bar'),
  budgetBar: document.getElementById('budget-bar'),
  reputationBar: document.getElementById('reputation-bar'),
  dayBar: document.getElementById('day-bar'),
  card: document.getElementById('scenario-card'),
  title: document.getElementById('scenario-title'),
  text: document.getElementById('scenario-text'),
  choiceA: document.getElementById('choice-a'),
  choiceB: document.getElementById('choice-b'),
  choiceC: document.getElementById('choice-c'),
  log: document.getElementById('log'),
  restart: document.getElementById('restart'),
  logTemplate: document.getElementById('log-item-template'),
};

const choiceButtons = [els.choiceA, els.choiceB, els.choiceC];

function clamp(value) {
  return Math.max(0, Math.min(100, value));
}

function statTone(value) {
  if (value >= 70) {
    return 'good';
  }
  if (value <= 30) {
    return 'bad';
  }
  return 'neutral';
}

function updateMeter(element, value, max = 100) {
  element.style.width = `${(value / max) * 100}%`;
}

function animateCardPulse() {
  els.card.classList.remove('fade-in');
  void els.card.offsetWidth;
  els.card.classList.add('fade-in');
}

function renderStats() {
  els.rating.textContent = state.rating;
  els.budget.textContent = state.budget;
  els.reputation.textContent = state.reputation;
  els.day.textContent = state.day;
  els.progress.textContent = `День ${Math.min(state.day, TOTAL_DAYS)} / ${TOTAL_DAYS}`;

  updateMeter(els.ratingBar, state.rating);
  updateMeter(els.budgetBar, state.budget);
  updateMeter(els.reputationBar, state.reputation);
  updateMeter(els.dayBar, Math.min(state.day, TOTAL_DAYS), TOTAL_DAYS);

  ['good', 'bad', 'neutral'].forEach((tone) => {
    els.ratingBar.classList.remove(tone);
    els.budgetBar.classList.remove(tone);
    els.reputationBar.classList.remove(tone);
  });

  els.ratingBar.classList.add(statTone(state.rating));
  els.budgetBar.classList.add(statTone(state.budget));
  els.reputationBar.classList.add(statTone(state.reputation));
}

function addLog(text, tone) {
  const item = els.logTemplate.content.firstElementChild.cloneNode(true);
  item.textContent = text;
  if (tone) {
    item.classList.add(tone);
  }
  item.classList.add('log-appear');
  els.log.prepend(item);
}

function disableChoices() {
  choiceButtons.forEach((btn) => {
    btn.disabled = true;
    btn.textContent = '—';
  });
}

function endGame(reason, win = false) {
  state.finished = true;
  els.title.textContent = win ? 'Сезон завершён!' : 'Игра окончена';
  els.text.textContent = reason;
  disableChoices();

  if (tg?.MainButton) {
    tg.MainButton.setText('Поделиться результатом');
    tg.MainButton.show();
    tg.MainButton.onClick(() => {
      const summary = `Главред: сезон ${state.day - 1}/${TOTAL_DAYS}, рейтинг ${state.rating}, бюджет ${state.budget}, репутация ${state.reputation}`;
      tg.sendData(summary);
    });
  }
}

function renderScenario() {
  animateCardPulse();

  if (state.rating <= 0) {
    endGame('Рейтинг обвалился до нуля. Станция потеряла эфирное окно.');
    return;
  }

  if (state.budget <= 0) {
    endGame('Бюджет исчерпан. Эфирная сетка развалилась без финансирования.');
    return;
  }

  if (state.reputation <= 0) {
    endGame('Репутация разрушена: партнёры разрывают контракты, аудитория уходит.');
    return;
  }

  if (state.index >= scenarios.length) {
    const total = state.rating + state.budget + state.reputation;
    const ending =
      total >= 210
        ? 'Триумф! Ты вывел станцию в лидеры рынка и получил предложение возглавить медиахолдинг.'
        : total >= 160
          ? 'Уверенный успех: сезон закрыт в плюсе, команда остаётся с тобой на следующий год.'
          : 'Сезон закрыт на грани: станция выжила, но совет директоров ждёт более сильной стратегии.';
    endGame(ending, true);
    return;
  }

  const scenario = scenarios[state.index];
  els.title.textContent = scenario.title;
  els.text.textContent = scenario.text;

  scenario.choices.forEach((choice, idx) => {
    const button = choiceButtons[idx];
    button.disabled = false;
    button.textContent = choice.text;
    button.onclick = () => applyChoice(choice);
  });
}

function applyChoice(choice) {
  if (state.finished) {
    return;
  }

  const previousTotal = state.rating + state.budget + state.reputation;

  state.rating = clamp(state.rating + (choice.effects.rating || 0));
  state.budget = clamp(state.budget + (choice.effects.budget || 0));
  state.reputation = clamp(state.reputation + (choice.effects.reputation || 0));

  const nextTotal = state.rating + state.budget + state.reputation;
  const tone = nextTotal >= previousTotal ? 'good' : 'bad';

  addLog(`День ${state.day}: ${choice.log}`, tone);

  state.day += 1;
  state.index += 1;

  renderStats();
  renderScenario();
}

function resetGame() {
  state = { ...stateDefaults };
  els.log.innerHTML = '';
  if (tg?.MainButton) {
    tg.MainButton.hide();
  }
  renderStats();
  renderScenario();
  addLog('Ты вступаешь в должность главреда. До первого эфира осталось 60 минут.', 'good');
}

els.restart.addEventListener('click', resetGame);

resetGame();
