let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    audioCtx = new Ctx();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playTone(ctx, frequency, startAt, duration, volume) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.value = frequency;

  gain.gain.setValueAtTime(0.001, startAt);
  gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, startAt + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startAt);
  osc.stop(startAt + duration + 0.05);
}

// Getar (hanya berfungsi di HP) — pelengkap suara
function vibrate() {
  try {
    if (navigator.vibrate) {
      navigator.vibrate([180, 80, 220]);
    }
  } catch {
    /* getaran tidak didukung — abaikan */
  }
}

export function playReservationTones() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Harmonik ganda agar lebih tegas dan terdengar lebih keras:
    // nada dasar + oktaf di atasnya bersamaan (bukan cuma satu oktaf tunggal)
    const layer = (freq, t0, dur) => {
      playTone(ctx, freq, t0, dur, 0.7);         // nada utama — lebih keras
      playTone(ctx, freq * 2, t0, dur, 0.3);     // harmonik oktaf — bikin lebih nyaring
    };

    // "Ding-ding" khas WhatsApp: A5 lalu E5, dua kali lebih panjang & keras
    layer(880,  now + 0.05, 0.24);
    layer(1318.51, now + 0.35, 0.28);
  } catch {
    /* audio gagal — abaikan agar tidak memblokir notifikasi */
  }

  vibrate();
}

/** Nama lama: dipanggil oleh AdminLayout */
export function playAlertSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    const layer = (freq, t0, dur) => {
      playTone(ctx, freq, t0, dur, 0.7);
      playTone(ctx, freq * 2, t0, dur, 0.3);
    };

    layer(880,  now + 0.05, 0.24);
    layer(1318.51, now + 0.35, 0.28);
  } catch {
    /* audio gagal — abaikan */
  }

  vibrate();
}
