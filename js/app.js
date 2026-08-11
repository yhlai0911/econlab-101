import { challenges, defaults, scenes } from './data.js';
import { renderScene } from './renderers.js';

const STORAGE_KEY = 'econlab101-beginner-v02';
const $ = (selector) => document.querySelector(selector);

let state = loadState();
let timerId = null;
let timerSeconds = 0;
let toastId = null;

const dom = {
  stage: $('#stage'),
  sceneTitle: $('#sceneTitle'),
  sceneCount: $('#sceneCount'),
  footerScene: $('#footerScene'),
  progress: $('#progressBar'),
  prev: $('#prevBtn'),
  next: $('#nextBtn'),
  menu: $('#menuDialog'),
  map: $('#mapDialog'),
  textbook: $('#textbookDialog'),
  teacher: $('#teacherDialog'),
  mapList: $('#mapList'),
  teacherTitle: $('#teacherTitle'),
  teacherContent: $('#teacherContent'),
  teacherStatus: $('#teacherStatus'),
  motionStatus: $('#motionStatus'),
  timerText: $('#timerText'),
  toast: $('#toast'),
};

applyQueryState();
init();

function init() {
  document.body.classList.toggle('teacher-mode', state.teacher);
  document.body.classList.toggle('reduce-motion', state.reduceMotion);
  bindStaticEvents();
  render();
}

function loadState() {
  try {
    return { ...defaults, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') };
  } catch {
    return { ...defaults };
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // The lesson still works when storage is unavailable.
  }
}

function applyQueryState() {
  const query = new URLSearchParams(location.search);
  const requestedScene = query.get('scene');
  if (requestedScene) {
    const index = scenes.findIndex((scene) => scene.id === requestedScene);
    if (index >= 0) state.scene = index;
  }
  if (query.get('teacher') === '1') state.teacher = true;
}

function bindStaticEvents() {
  $('#menuBtn').addEventListener('click', () => dom.menu.showModal());
  document.querySelectorAll('[data-close]').forEach((button) => {
    button.addEventListener('click', () => $(`#${button.dataset.close}`).close());
  });

  $('#openMap').addEventListener('click', () => {
    dom.menu.close();
    renderMap();
    dom.map.showModal();
  });
  $('#openTextbook').addEventListener('click', () => {
    dom.menu.close();
    dom.textbook.showModal();
  });
  $('#toggleTeacher').addEventListener('click', toggleTeacherMode);
  $('#toggleMotion').addEventListener('click', toggleMotion);
  $('#fullscreenBtn').addEventListener('click', () => {
    dom.menu.close();
    toggleFullscreen();
  });
  $('#teacherFullscreen').addEventListener('click', toggleFullscreen);
  $('#resetBtn').addEventListener('click', resetProgress);
  $('#teacherNoteQuick').addEventListener('click', openTeacherNotes);
  $('#timerBtn').addEventListener('click', toggleTimer);

  dom.prev.addEventListener('click', () => goToScene(state.scene - 1));
  dom.next.addEventListener('click', () => {
    markCurrentSceneDone();
    goToScene(state.scene + 1);
  });

  document.addEventListener('keydown', (event) => {
    if (event.target.matches('input, textarea')) return;
    if (event.key === 'ArrowRight') {
      markCurrentSceneDone();
      goToScene(state.scene + 1);
    }
    if (event.key === 'ArrowLeft') goToScene(state.scene - 1);
    if (event.key.toLowerCase() === 'f') toggleFullscreen();
    if (event.key.toLowerCase() === 't' && state.teacher) openTeacherNotes();
  });
}

function toggleTeacherMode() {
  state.teacher = !state.teacher;
  document.body.classList.toggle('teacher-mode', state.teacher);
  saveState();
  syncMenuLabels();
  dom.menu.close();
  showToast(state.teacher ? '已切換為教師授課模式' : '已回到學生自學模式');
}

function toggleMotion() {
  state.reduceMotion = !state.reduceMotion;
  document.body.classList.toggle('reduce-motion', state.reduceMotion);
  saveState();
  syncMenuLabels();
}

function resetProgress() {
  if (!confirm('要清除這台裝置上的學習進度嗎？')) return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage failures.
  }
  state = { ...defaults };
  dom.menu.close();
  render();
  showToast('已重新開始');
}

function syncMenuLabels() {
  dom.teacherStatus.textContent = `目前：${state.teacher ? '開啟' : '關閉'}`;
  dom.motionStatus.textContent = `目前：${state.reduceMotion ? '減少' : '開啟'}`;
}

function render() {
  syncMenuLabels();
  const scene = scenes[state.scene];
  dom.sceneTitle.textContent = scene.title;
  dom.footerScene.textContent = scene.title;
  dom.sceneCount.textContent = `第 ${state.scene + 1}／${scenes.length} 幕`;
  dom.progress.style.width = `${((state.scene + 1) / scenes.length) * 100}%`;
  dom.prev.disabled = state.scene === 0;
  dom.next.disabled = state.scene === scenes.length - 1;
  dom.next.textContent = state.scene === scenes.length - 2 ? '進入 PBL →' : '下一幕 →';
  dom.stage.innerHTML = renderScene(scene.id, state);
  bindStageEvents();
  window.scrollTo({ top: 0, behavior: state.reduceMotion ? 'auto' : 'smooth' });
}

function goToScene(index) {
  if (index < 0 || index >= scenes.length) return;
  state.scene = index;
  saveState();
  render();
}

function markCurrentSceneDone() {
  const id = scenes[state.scene].id;
  if (!state.completed.includes(id)) state.completed.push(id);
  saveState();
}

function bindStageEvents() {
  document.querySelectorAll('[data-hook]').forEach((button) => {
    button.addEventListener('click', () => {
      state.hookChoice = button.dataset.hook;
      saveState();
      render();
    });
  });

  document.querySelectorAll('[data-demand-tab]').forEach((button) => {
    button.addEventListener('click', () => {
      state.demandTab = button.dataset.demandTab;
      saveState();
      render();
    });
  });
  $('#demandPrice')?.addEventListener('input', (event) => {
    state.demandPrice = event.target.value;
    saveState();
    render();
  });
  document.querySelectorAll('[data-demand-shift]').forEach((button) => {
    button.addEventListener('click', () => {
      state.demandShift = Number(button.dataset.demandShift);
      saveState();
      render();
    });
  });

  document.querySelectorAll('[data-supply-tab]').forEach((button) => {
    button.addEventListener('click', () => {
      state.supplyTab = button.dataset.supplyTab;
      saveState();
      render();
    });
  });
  $('#supplyPrice')?.addEventListener('input', (event) => {
    state.supplyPrice = event.target.value;
    saveState();
    render();
  });
  document.querySelectorAll('[data-supply-shift]').forEach((button) => {
    button.addEventListener('click', () => {
      state.supplyShift = Number(button.dataset.supplyShift);
      saveState();
      render();
    });
  });

  $('#marketPrice')?.addEventListener('input', (event) => {
    state.marketPrice = event.target.value;
    saveState();
    render();
  });
  document.querySelectorAll('[data-market-set]').forEach((button) => {
    button.addEventListener('click', () => {
      state.marketPrice = button.dataset.marketSet;
      saveState();
      render();
    });
  });

  document.querySelectorAll('[data-challenge-answer]').forEach((button) => {
    button.addEventListener('click', () => {
      state.challengeAnswers[state.challengeIndex] = button.dataset.challengeAnswer;
      saveState();
      render();
    });
  });
  $('#nextChallenge')?.addEventListener('click', () => {
    state.challengeIndex = Math.min(challenges.length - 1, state.challengeIndex + 1);
    saveState();
    render();
  });

  document.querySelectorAll('[data-priority]').forEach((button) => {
    button.addEventListener('click', () => {
      state.priority = button.dataset.priority;
      saveState();
      render();
    });
  });
  document.querySelectorAll('[data-policy]').forEach((button) => {
    button.addEventListener('click', () => {
      state.policy = button.dataset.policy;
      saveState();
      render();
    });
  });
  $('#pblNext')?.addEventListener('click', () => {
    state.pblStep = Math.min(2, state.pblStep + 1);
    saveState();
    render();
  });
  $('#claimInput')?.addEventListener('input', (event) => {
    state.claim = event.target.value;
    saveState();
  });
  $('#costInput')?.addEventListener('input', (event) => {
    state.cost = event.target.value;
    saveState();
  });
  $('#generateMemo')?.addEventListener('click', generateMemo);
}

function generateMemo() {
  state.claim = $('#claimInput').value.trim();
  state.cost = $('#costInput').value.trim();
  if (!state.claim || !state.cost) {
    showToast('請各寫一句理由與代價');
    return;
  }
  state.memo = 'done';
  markCurrentSceneDone();
  saveState();
  render();
}

function renderMap() {
  dom.mapList.innerHTML = scenes
    .map(
      (scene, index) => `
        <button class="map-item ${index === state.scene ? 'active' : ''}" data-map-scene="${index}">
          <b>${state.completed.includes(scene.id) ? '✓' : index + 1}</b>
          <span><strong>${scene.title}</strong><small>${scene.subtitle}</small></span>
          <small>${index === state.scene ? '現在' : ''}</small>
        </button>`,
    )
    .join('');

  dom.mapList.querySelectorAll('[data-map-scene]').forEach((button) => {
    button.addEventListener('click', () => {
      dom.map.close();
      goToScene(Number(button.dataset.mapScene));
    });
  });
}

function openTeacherNotes() {
  const scene = scenes[state.scene];
  dom.teacherTitle.textContent = `${scene.title}｜教師提示`;
  dom.teacherContent.innerHTML = `
    <article><span>教學目的</span><strong>${scene.teacher.objective}</strong></article>
    <article><span>建議追問</span><p>${scene.teacher.prompt}</p></article>
    <article><span>常見迷思</span><p>${scene.teacher.misconception}</p></article>`;
  dom.teacher.showModal();
}

function toggleTimer() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
    $('#timerBtn').textContent = '繼續計時';
    return;
  }
  $('#timerBtn').textContent = '暫停計時';
  timerId = setInterval(() => {
    timerSeconds += 1;
    const minutes = String(Math.floor(timerSeconds / 60)).padStart(2, '0');
    const seconds = String(timerSeconds % 60).padStart(2, '0');
    dom.timerText.textContent = `${minutes}:${seconds}`;
  }, 1000);
}

async function toggleFullscreen() {
  try {
    if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
    else await document.exitFullscreen();
  } catch {
    showToast('瀏覽器未允許全螢幕');
  }
}

function showToast(message) {
  clearTimeout(toastId);
  dom.toast.textContent = message;
  dom.toast.classList.add('show');
  toastId = setTimeout(() => dom.toast.classList.remove('show'), 2200);
}
