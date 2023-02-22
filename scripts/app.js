let habbits = [];
const HABBUT_KEY = 'HABBUT_KEY';
let globalActiveHabbitId;

const page = {
  menu: document.querySelector('.menu__list'),
  header: {
    h1: document.querySelector('.h1'),
    progressPercent: document.querySelector('.progress__procent'),
    progressCoverBar: document.querySelector('.progress__cover-bar'),
  },
  content: {
    daysContainer: document.getElementById('days'),
    nextDay: document.querySelector('.habbit__day'),
  },
  popup: {
    index: document.getElementById('add_popup'),
    iconField: document.querySelector('.popup__form input[name="icon"]'),
  },
};
// берет данные
function loadData() {
  const habbitsString = localStorage.getItem(HABBUT_KEY);
  const habbitArray = JSON.parse(habbitsString);
  if (Array.isArray(habbitArray)) {
    habbits = habbitArray;
  }
}

// сохраняет
function saveData() {
  localStorage.setItem(HABBUT_KEY, JSON.stringify(habbits));
}

// render
function rerenderMenu(activeHabbit) {
  for (const habbit of habbits) {
    const existed = document.querySelector(`[menu-habbit-id="${habbit.id}"]`);
    if (!existed) {
      const element = document.createElement('button');
      element.setAttribute('menu-habbit-id', habbit.id);
      element.classList.add('menu__item');
      element.addEventListener('click', () => rerender(habbit.id));
      element.innerHTML = `<img src="./images/${habbit.icon}.svg" alt="${habbit.name}" />`;
      if (activeHabbit.id === habbit.id) {
        element.classList.add('menu__item_active');
      }
      page.menu.appendChild(element);
      continue;
    }
    if (activeHabbit.id === habbit.id) {
      existed.classList.add('menu__item_active');
    } else {
      existed.classList.remove('menu__item_active');
    }
  }
}
// рендер шапки
function renderHead(activeHabbit) {
  page.header.h1.innerHTML = activeHabbit.name;
  const progress =
    activeHabbit.days.length / activeHabbit.target > 1
      ? 100
      : (activeHabbit.days.length / activeHabbit.target) * 100;
  page.header.progressPercent.innerText = progress.toFixed(0);
  page.header.progressCoverBar.setAttribute('style', `width: ${progress}%`);
}

// рендер контента
function rerenderContent(activeHabbit) {
  page.content.daysContainer.innerHTML = '';
  for (const index in activeHabbit.days) {
    const element = document.createElement('div');
    element.classList.add('habbit');
    element.innerHTML = ` <div class="habbit__day">${Number(index) + 1}</div>
    <div class="habbit__comment">
      ${activeHabbit.days[index].comment}
    </div>
    <button class="habbit__delete" onClick="deleteDay(${index})">
      <img src="./images/delete.svg" alt="удалить привычку" /></button>
    `;
    page.content.daysContainer.appendChild(element);
  }
  page.content.nextDay.innerHTML = `День ${activeHabbit.days.length + 1}`;
}

// перезагрузка 
function rerender(activeHabbitId) {
  globalActiveHabbitId = activeHabbitId;
  const activeHabbit = habbits.find((habbit) => habbit.id === activeHabbitId);
  if (!activeHabbit) {
    return;
  }
  rerenderMenu(activeHabbit);
  renderHead(activeHabbit);
  rerenderContent(activeHabbit);
}
 
// добавляем дни
function addDays(e) {
  e.preventDefault();
  const data = validateAndGetFormData(e.target, ['comment']);
  if (!data) {
    return;
  }
  habbits = habbits.map((habbit) => {
    if (habbit.id === globalActiveHabbitId) {
      return {
        ...habbit,
        days: habbit.days.concat([{ comment: data.comment }]),
      };
    }
    return habbit;
  });
  resetForm(e.target, ['comment']);
  rerender(globalActiveHabbitId);
  saveData();
}

// удаление дня
function deleteDay(index) {
  habbits.map((habbit) => {
    if (habbit.id === globalActiveHabbitId) {
      habbit.days.splice(index, 1);
      return {
        ...habbit,
        days: habbit.days,
      };
    }
    return habbit;
  });
  rerender(globalActiveHabbitId);
  saveData();
}

// открываем/закрываем попап
function togglePopup() {
  if (page.popup.index.classList.contains('cover_hidden')) {
    page.popup.index.classList.remove('cover_hidden');
  } else {
    page.popup.index.classList.add('cover_hidden');
  }
}

// меняем иконку
function setIcon(context, icon) {
  page.popup.iconField.value = icon;
  const activeIcon = document.querySelector('.icon.icon_active');
  activeIcon.classList.remove('icon_active');
  context.classList.add('icon_active');
}

// очистка формы
function resetForm(form, fields) {
  for (const field of fields) {
    form[field].value = '';
  }
}
// валидация
function validateForm(form, fields) {
  const formData = new FormData(form);
  const res = {};
  for (const field of fields) {
    const fieldValue = formData.get(field);
    form[field].classList.remove('error');
    if (!fieldValue) {
      form[field].classList.add('error');
    }
    res[field] = fieldValue;
  }
  let isValid = true;
  for (const field of fields) {
    if (!res[field]) {
      isValid = false;
    }
  }
  if (!isValid) {
    return;
  }
  return res;
}
// добавление привычки
function addHabbit(e) {
  e.preventDefault();
  const data = validateForm(e.target, ['name', 'icon', 'target']);
  if (!data) {
    return;
  }
  const maxId = habbits.reduce(
    (acc, habbit) => (acc > habbit.id ? acc : habbit.id),
    0
  );
  habbits.push({
    id: maxId + 1,
    name: data.name,
    target: data.target,
    icon: data.icon,
    days: [],
  });
  resetForm(e.target, ['name', 'target']);
  togglePopup();
  saveData();
  rerender(maxId + 1);
}
(() => {
  loadData();
})();
(() => {
  rerender(habbits[0].id);
})();
