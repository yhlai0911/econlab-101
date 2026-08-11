(function () {
  'use strict';

  function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function easeInOut(t) { t = clamp(t, 0, 1); return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
  function easeOut(t) { t = clamp(t, 0, 1); return 1 - Math.pow(1 - t, 3); }
  function easeIn(t) { t = clamp(t, 0, 1); return t * t * t; }
  function pulse(t, cycles) { return (Math.sin(t * Math.PI * 2 * (cycles || 1)) + 1) / 2; }
  function windowProgress(time, start, duration) { return clamp((time - start) / duration, 0, 1); }
  function active(time, start, end) { return time >= start && time < end; }
  function sceneOpacity(time, start, end, fade) {
    fade = fade || 0.8;
    if (time < start || time >= end) return 0;
    if (time < start + fade) return easeOut((time - start) / fade);
    if (time > end - fade) return easeIn((end - time) / fade);
    return 1;
  }
  function setTransform(el, x, y, scale, rotate) {
    if (!el) return;
    el.style.transform = `translate3d(${x || 0}px, ${y || 0}px, 0) scale(${scale == null ? 1 : scale}) rotate(${rotate || 0}deg)`;
  }
  function setOpacity(el, opacity) { if (el) el.style.opacity = String(clamp(opacity, 0, 1)); }
  function setText(el, text) { if (el && el.textContent !== String(text)) el.textContent = String(text); }
  function setAttr(el, name, value) { if (el) el.setAttribute(name, String(value)); }
  function setStyle(el, name, value) { if (el) el.style[name] = value; }
  function map(value, inMin, inMax, outMin, outMax) {
    const t = clamp((value - inMin) / (inMax - inMin), 0, 1);
    return lerp(outMin, outMax, t);
  }

  window.EconAnim = {
    clamp, lerp, easeInOut, easeOut, easeIn, pulse, windowProgress, active,
    sceneOpacity, setTransform, setOpacity, setText, setAttr, setStyle, map,
    create(config) {
      const duration = Number(config.duration || 60);
      const render = config.render;
      let time = 0;
      let playing = false;
      let last = performance.now();
      let raf = 0;
      let rate = 1;

      function seek(next, notify) {
        time = clamp(Number(next) || 0, 0, duration);
        render(time, duration);
        if (notify !== false) {
          window.parent?.postMessage({ type: 'econ-animation-time', id: config.id, time, duration }, '*');
        }
        return time;
      }
      function tick(now) {
        if (playing) {
          const dt = Math.min(0.08, (now - last) / 1000);
          time += dt * rate;
          if (time >= duration) {
            time = duration;
            playing = false;
          }
          seek(time);
        }
        last = now;
        raf = requestAnimationFrame(tick);
      }
      function play() { playing = true; last = performance.now(); }
      function pause() { playing = false; }
      function toggle() { playing ? pause() : play(); }
      function restart() { seek(0); play(); }
      function setRate(next) { rate = clamp(Number(next) || 1, 0.25, 2); }

      function fitStage() {
        const stage = document.querySelector('.stage');
        if (!stage) return;
        const baseWidth = Number(stage.dataset.width || 1920);
        const baseHeight = Number(stage.dataset.height || 1080);
        const scale = Math.min(window.innerWidth / baseWidth, window.innerHeight / baseHeight);
        const left = (window.innerWidth - baseWidth * scale) / 2;
        const top = (window.innerHeight - baseHeight * scale) / 2;
        stage.style.transformOrigin = 'top left';
        stage.style.transform = `translate(${left}px, ${top}px) scale(${scale})`;
        document.body.style.position = 'relative';
      }
      window.addEventListener('resize', fitStage);
      fitStage();

      window.addEventListener('message', (event) => {
        const data = event.data || {};
        if (data.type === 'econ-animation-play') play();
        if (data.type === 'econ-animation-pause') pause();
        if (data.type === 'econ-animation-toggle') toggle();
        if (data.type === 'econ-animation-seek') seek(data.time);
        if (data.type === 'econ-animation-rate') setRate(data.rate);
        if (data.type === 'econ-animation-restart') restart();
      });

      document.addEventListener('keydown', (event) => {
        if (event.code === 'Space') { event.preventDefault(); toggle(); }
        if (event.code === 'ArrowRight') seek(time + 5);
        if (event.code === 'ArrowLeft') seek(time - 5);
      });
      document.addEventListener('click', (event) => {
        if (event.target.closest('[data-no-toggle]')) return;
        toggle();
      });

      window.renderSeek = (seconds) => seek(seconds, false);
      window.__playerReady = true;
      window.__renderReady = true;
      window.__econAnimation = { id: config.id, duration, seek, play, pause, toggle, restart, setRate, get time() { return time; } };
      render(0, duration);
      raf = requestAnimationFrame(tick);
      if (config.autoplay) play();
      window.parent?.postMessage({ type: 'econ-animation-ready', id: config.id, duration }, '*');
      return window.__econAnimation;
    }
  };
})();
