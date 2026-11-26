/* Popup pengaturan Duel Tambang (beranda). Mencegat klik tombol Bermain yang mengarah ke /duel-tambang,
   menampilkan popup, lalu menyimpan pengaturan ke sessionStorage 'duel' dan membuka arena (dibaca duel.js). */
(() => {
  const d = document.getElementById('ddDuel'), w = document.getElementById('ddAwas');
  if (!d) return;
  const $ = s => d.querySelector(s), $$ = s => [...d.querySelectorAll(s)];
  const S = { soal: 10, pemain: 2, jenis: 'gabungan' };

  const pilih = (sel, fn) => $$(sel + ' button').forEach(b => b.onclick = () => { $$(sel + ' button').forEach(x => x.classList.toggle('on', x === b)); fn(b.dataset.v); });
  function renderNama() {
    const lama = Object.fromEntries($$('.dd-in').map(e => [e.dataset.k, e.value])); // pertahankan nama yang sudah diketik
    const kiri = Math.ceil(S.pemain / 2), isi = (el, t, n) => {
      el.replaceChildren(...Array.from({ length: n }, (_, i) => {
        const e = document.createElement('input');
        Object.assign(e, { className: 'dd-in', maxLength: 12, placeholder: `Nama pemain ${i + 1}`, autocomplete: 'off', value: lama[t + i] || '' });
        e.dataset.k = t + i; e.dataset.t = t; e.oninput = () => e.classList.remove('salah'); return e;
      }));
    };
    isi($('#ddKiri'), 'k', kiri); isi($('#ddKanan'), 'r', S.pemain - kiri);
  }
  pilih('#ddPemain', v => { S.pemain = +v; renderNama(); });
  pilih('#ddJenis', v => S.jenis = v);
  $('#ddSoal').oninput = e => $('#ddVSoal').textContent = S.soal = +e.target.value;
  renderNama();

  // buka popup saat Bermain pada kartu Duel Tambang diklik
  document.addEventListener('click', e => {
    if (e.button || e.ctrlKey || e.metaKey || e.shiftKey) return;
    const a = e.target.closest('a[href$="/duel-tambang"]');
    if (!a || d.contains(a)) return;
    e.preventDefault(); d.dataset.url = a.href; d.showModal();
  });
  $('#ddTutup').onclick = $('#ddBatal').onclick = () => d.close();

  // Mulai: semua nama wajib terisi, bila tidak muncul peringatan di tengah layar
  $('#ddMulai').onclick = () => {
    const ins = $$('.dd-in'), kosong = ins.filter(e => !e.value.trim());
    ins.forEach(e => e.classList.toggle('salah', !e.value.trim()));
    if (kosong.length) { w.showModal(); w.addEventListener('close', () => kosong[0].focus(), { once: true }); return; }
    sessionStorage.setItem('duel', JSON.stringify({ soal: S.soal, jenis: S.jenis, pemain: ins.map(e => ({ nama: e.value.trim(), tim: e.dataset.t })) }));
    location.href = d.dataset.url;
  };

  // Coba suara
  const ada = 'speechSynthesis' in window, st = $('#ddStatus');
  const cek = () => {
    if (!ada) return st.textContent = 'Browser ini belum mendukung suara. Soal tetap tampil tertulis.';
    const v = speechSynthesis.getVoices().find(x => x.lang.toLowerCase().startsWith('id'));
    st.textContent = v ? `Suara bahasa Indonesia siap (${v.name})` : 'Suara bahasa Indonesia belum ditemukan. Soal tetap tampil tertulis.';
  };
  if (ada) speechSynthesis.onvoiceschanged = cek;
  cek();
  $('#ddUji').onclick = () => { if (!ada) return; speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance('Halo, Teman Baca! Siap menarik tambang?'); u.lang = 'id-ID'; u.rate = .9; speechSynthesis.speak(u); };
})();