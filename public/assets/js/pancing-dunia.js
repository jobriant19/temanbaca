/* PANCING PINTAR: dunia 3D (Three.js r128). Isi: langit, laut, pantai, perahu, joran + tangan, model ikan.
   Dimuat SEBELUM pancing.js; logika game (fase, soal, mikrofon) ada di pancing.js. */
const acak = (a, b) => a + Math.random() * (b - a);
const lerp = (a, b, t) => a + (b - a) * t;
const M = (o) => new THREE.MeshStandardMaterial(o);
const kotak = (w, h, d, mat) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
const taruh = (m, x, y, z, induk) => { m.position.set(x, y, z); induk.add(m); return m; };
const gel = (x, z, t) => Math.sin(x * .12 + t * .9) * .32 + Math.sin(z * .17 + t * 1.2) * .26 + Math.sin((x + z) * .31 + t * 2.1) * .07;
const tanah = (z) => .42 - (z + 130) * .06; // tinggi daratan pantai di kedalaman z
const SUMBU_Y = new THREE.Vector3(0, 1, 0);
const logam = M({ color: 0xc9d1dc, metalness: .85, roughness: .28 });

// gambar kanvas 2D -> tekstur
const lukis = (n, fn) => {
    const c = document.createElement('canvas');
    c.width = c.height = n;
    fn(c.getContext('2d'), n);
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = 4;
    return t;
};
// batang (silinder) dari titik a ke b, jari-jari r1 di a dan r2 di b
const batang = (a, b, r1, r2, mat, induk) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r2, r1, a.distanceTo(b), 8), mat);
    m.position.copy(a).add(b).multiplyScalar(.5);
    m.quaternion.setFromUnitVectors(SUMBU_Y, b.clone().sub(a).normalize());
    induk.add(m);
    return m;
};
// derau stabil per titik: titik kembar di sambungan mesh bergeser sama, jadi tidak retak
const derau = (x, y, z) => { const n = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453; return n - Math.floor(n); };

/* ================= DUNIA: langit, laut, pantai, perahu ================= */
function buatDunia(S, C) {
    const tick = [];

    /* ---- Cahaya (dari belakang-atas agar tangan & joran terang, bayangan jatuh ke depan) ---- */
    S.add(new THREE.HemisphereLight(0xdff1ff, 0x2a6f8f, .9));
    const sinar = new THREE.DirectionalLight(0xfff0cf, 1.15);
    sinar.position.set(30, 50, 25);
    sinar.castShadow = true;
    Object.assign(sinar.shadow, { bias: -.0006, normalBias: .02 });
    sinar.shadow.mapSize.set(2048, 2048);
    Object.assign(sinar.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 10, far: 130 });
    S.add(sinar);

    /* ---- Langit gradasi, matahari, awan ---- */
    const langit = new THREE.Mesh(new THREE.SphereGeometry(450, 24, 16), new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false }));
    {
        const p = langit.geometry.attributes.position, c = [], a = new THREE.Color(0xd6eeff), b = new THREE.Color(0x2a7fe6);
        for (let i = 0; i < p.count; i++) {
            const t = a.clone().lerp(b, Math.pow(Math.min(1, Math.max(0, p.getY(i) / 300)), .6));
            c.push(t.r, t.g, t.b);
        }
        langit.geometry.setAttribute('color', new THREE.Float32BufferAttribute(c, 3));
    }
    S.add(langit);
    const surya = new THREE.Mesh(new THREE.SphereGeometry(12, 20, 14), new THREE.MeshBasicMaterial({ color: 0xfff4b8, fog: false }));
    surya.position.set(90, 120, -300);
    S.add(surya);
    [26, 42].forEach((r, i) => {
        const h = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 14), new THREE.MeshBasicMaterial({ color: 0xffe9a0, transparent: true, opacity: .22 - i * .1, fog: false }));
        h.position.copy(surya.position);
        S.add(h);
    });
    const bahanAwan = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .93, fog: false });
    const awan = Array.from({ length: 9 }, () => {
        const g = new THREE.Group();
        for (let j = 0; j < 6; j++) {
            const s = new THREE.Mesh(new THREE.SphereGeometry(acak(5, 11), 10, 8), bahanAwan);
            s.position.set(j * 7 - 17, acak(-1.5, 3) + (j % 2 ? 2 : 0), acak(-3, 3));
            s.scale.y = .55;
            g.add(s);
        }
        g.position.set(acak(-250, 250), acak(65, 115), acak(-300, -120));
        S.add(g);
        return g;
    });
    tick.push((dt) => awan.forEach((g) => { g.position.x += dt * 2; if (g.position.x > 300) g.position.x = -300; }));

    /* ---- Laut: ombak per frame + puncak berbuih ---- */
    const lautG = new THREE.PlaneGeometry(330, 330, 100, 100).rotateX(-Math.PI / 2);
    const lautP = lautG.attributes.position, nL = lautP.count, dasar = new Float32Array(nL * 3);
    {
        const dalam = new THREE.Color(0x0a56a8), dangkal = new THREE.Color(0x3fd6c8);
        for (let i = 0; i < nL; i++) {
            const t = dalam.clone().lerp(dangkal, 1 - THREE.MathUtils.smoothstep(lautP.getZ(i), -125, -50));
            dasar.set([t.r, t.g, t.b], i * 3);
        }
        lautG.setAttribute('color', new THREE.BufferAttribute(new Float32Array(dasar), 3));
    }
    const lautW = lautG.attributes.color;
    const laut = new THREE.Mesh(lautG, M({ vertexColors: true, roughness: .18, metalness: .2 }));
    laut.receiveShadow = true;
    S.add(laut);
    tick.push((dt, t) => {
        for (let i = 0; i < nL; i++) {
            const h = gel(lautP.getX(i), lautP.getZ(i), t), k = THREE.MathUtils.smoothstep(h, .22, .62) * .5;
            lautP.setY(i, h);
            lautW.setXYZ(i, dasar[i * 3] + (1 - dasar[i * 3]) * k, dasar[i * 3 + 1] + (1 - dasar[i * 3 + 1]) * k, dasar[i * 3 + 2] + (1 - dasar[i * 3 + 2]) * k);
        }
        lautP.needsUpdate = lautW.needsUpdate = true;
        lautG.computeVertexNormals();
    });

    /* ---- Pantai: pasir -> rumput, buih ombak ---- */
    const daratG = new THREE.PlaneGeometry(420, 120, 1, 12);
    {
        const p = daratG.attributes.position, c = [], pasir = new THREE.Color(0xf2dfa8), rumput = new THREE.Color(0x4caf6a);
        for (let i = 0; i < p.count; i++) {
            const t = pasir.clone().lerp(rumput, THREE.MathUtils.smoothstep(p.getY(i), 5, 30));
            c.push(t.r, t.g, t.b);
        }
        daratG.setAttribute('color', new THREE.Float32BufferAttribute(c, 3));
    }
    const darat = new THREE.Mesh(daratG, M({ vertexColors: true, roughness: 1 }));
    darat.rotation.x = -Math.PI / 2 + .06;
    darat.position.set(0, .42, -130);
    S.add(darat);
    const buih = [0, 1].map((i) => {
        const m = new THREE.Mesh(new THREE.PlaneGeometry(420, 1.6 + i).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .5, depthWrite: false }));
        m.position.set(0, .15 + i * .01, -123 + i * 3);
        S.add(m);
        return m;
    });
    tick.push((dt, t) => buih.forEach((m, i) => { m.material.opacity = .4 + Math.sin(t * 1.5 + i * 2) * .15; m.position.z = -123 + i * 3 + Math.sin(t * .9 + i * 2) * 1.2; }));

    /* ---- Dua gunung ---- */
    const gunung = (x, z, r, h) => {
        const g = new THREE.ConeGeometry(r, h, 11, 9, true), p = g.attributes.position, c = [];
        const hutan = new THREE.Color(0x2c7a50), batu = new THREE.Color(0x6e7787), salju = new THREE.Color(0xe8f0fa);
        for (let i = 0; i < p.count; i++) {
            const y = p.getY(i), k = (y + h / 2) / h;
            if (k < .97) { const d = derau(p.getX(i), y, p.getZ(i)); p.setXYZ(i, p.getX(i) * (.88 + d * .24), y + (d - .5) * h * .05, p.getZ(i) * (.88 + d * .24)); }
            const w = k < .45 ? hutan.clone().lerp(batu, k / .45 * .35) : k < .75 ? batu.clone().lerp(hutan, .15) : batu.clone().lerp(salju, THREE.MathUtils.smoothstep(k, .75, .88));
            c.push(w.r, w.g, w.b);
        }
        g.setAttribute('color', new THREE.Float32BufferAttribute(c, 3));
        g.computeVertexNormals();
        const m = new THREE.Mesh(g, M({ vertexColors: true, flatShading: true, roughness: 1 }));
        m.position.set(x, h / 2 - 2, z);
        S.add(m);
    };
    gunung(-62, -215, 78, 105);
    gunung(92, -222, 92, 88);

    /* ---- Pohon kelapa melengkung, semak, batu ---- */
    const kulitKayu = M({ color: 0x8a5a2b, roughness: 1 }), daunA = M({ color: 0x2f9e44, side: THREE.DoubleSide, flatShading: true }), daunB = M({ color: 0x45b35a, side: THREE.DoubleSide, flatShading: true });
    const kelapa = M({ color: 0x5a3a1a, roughness: .8 });
    const palma = (x, z, s) => {
        const g = new THREE.Group(), lean = acak(-1.6, 1.6) * s, tinggi = 10 * s, pts = [];
        for (let k = 0; k <= 5; k++) pts.push(new THREE.Vector3(lean * (k / 5) ** 2, tinggi * k / 5, 0));
        for (let k = 0; k < 5; k++) batang(pts[k], pts[k + 1], (.42 - k * .04) * s, (.42 - (k + 1) * .04) * s, kulitKayu, g);
        const puncak = pts[5];
        for (let i = 0; i < 9; i++) {
            const pivot = new THREE.Group(), seg1 = new THREE.Group(), seg2 = new THREE.Group(), dn = i % 2 ? daunA : daunB;
            pivot.position.copy(puncak);
            pivot.rotation.y = (i / 9) * Math.PI * 2 + acak(-.2, .2);
            seg1.rotation.z = -acak(.9, 1.2);
            seg2.position.y = 4.6 * s;
            seg2.rotation.z = -acak(.5, .9);
            seg1.add(new THREE.Mesh(new THREE.ConeGeometry(.75 * s, 4.7 * s, 4).translate(0, 2.35 * s, 0), dn), seg2);
            seg2.add(new THREE.Mesh(new THREE.ConeGeometry(.6 * s, 3.4 * s, 4).translate(0, 1.7 * s, 0), dn));
            seg1.children[0].scale.z = seg2.children[0].scale.z = .15;
            pivot.add(seg1);
            g.add(pivot);
        }
        for (let i = 0; i < 3; i++) taruh(new THREE.Mesh(new THREE.SphereGeometry(.35 * s, 8, 6), kelapa), puncak.x + Math.cos(i * 2.1) * .4 * s, puncak.y - .45 * s, Math.sin(i * 2.1) * .4 * s, g);
        g.position.set(x, tanah(z), z);
        S.add(g);
        return g;
    };
    const palmaDaftar = [[-40, -135, 1.4], [-18, -142, 1.8], [12, -138, 1.5], [38, -146, 2], [62, -136, 1.3], [-62, -150, 1.7], [88, -150, 1.8], [-8, -128, 1.1]].map((a) => palma(...a));
    tick.push((dt, t) => palmaDaftar.forEach((g, i) => (g.rotation.z = Math.sin(t * .8 + i) * .012)));
    const semak = M({ color: 0x3a9a55, flatShading: true });
    for (let i = 0; i < 26; i++) {
        const z = -acak(128, 160), m = new THREE.Mesh(new THREE.IcosahedronGeometry(acak(.8, 2), 0), i % 3 ? semak : M({ color: 0x2c7d46, flatShading: true }));
        m.position.set(acak(-120, 120), tanah(z) + .4, z);
        m.scale.y = .7;
        S.add(m);
    }
    const batuM = M({ color: 0x8b8f96, flatShading: true, roughness: 1 });
    const bukaBatu = (x, z, r) => { const m = new THREE.Mesh(new THREE.DodecahedronGeometry(r, 0), batuM); m.position.set(x, tanah(z) + r * .3, z); m.scale.y = .6; m.rotation.set(acak(0, 3), acak(0, 3), 0); S.add(m); };
    for (let i = 0; i < 14; i++) bukaBatu(acak(-110, 110), -acak(124, 134), acak(.6, 2.2));

    /* ---- Mercusuar lengkap: batu, menara, balkon, ruang lampu, atap ---- */
    const mercu = new THREE.Group();
    [0xffffff, 0xe03a3a, 0xffffff, 0xe03a3a].forEach((c, i) => taruh(new THREE.Mesh(new THREE.CylinderGeometry(2.2 - i * .3, 2.5 - i * .3, 5, 16), M({ color: c, roughness: .6 })), 0, 2.5 + i * 5, 0, mercu));
    taruh(new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.1, .5, 16), M({ color: 0x2b2f38 })), 0, 20.3, 0, mercu);
    taruh(new THREE.Mesh(new THREE.TorusGeometry(2.3, .08, 6, 24).rotateX(Math.PI / 2), M({ color: 0x2b2f38 })), 0, 21.4, 0, mercu);
    taruh(new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.35, 2, 16, 1, true), new THREE.MeshStandardMaterial({ color: 0xcfeeff, transparent: true, opacity: .35, side: THREE.DoubleSide })), 0, 21.5, 0, mercu);
    const lampu = taruh(new THREE.Mesh(new THREE.SphereGeometry(.9, 12, 10), new THREE.MeshBasicMaterial({ color: 0xfff3a0 })), 0, 21.5, 0, mercu);
    taruh(new THREE.Mesh(new THREE.ConeGeometry(2, 2.6, 16), M({ color: 0xc02a2a })), 0, 24.1, 0, mercu);
    taruh(new THREE.Mesh(new THREE.BoxGeometry(.9, 1.6, .2), M({ color: 0x3a2a1a })), 0, 1, 2.35, mercu);
    [8, 14].forEach((y) => taruh(new THREE.Mesh(new THREE.BoxGeometry(.5, .8, .2), M({ color: 0x1d3a5c })), 0, y, 2.05 - (y - 8) * .02, mercu));
    mercu.position.set(-85, tanah(-145), -145);
    S.add(mercu);
    for (let i = 0; i < 9; i++) { const a = i / 9 * 6.28; bukaBatu(-85 + Math.cos(a) * 4.2, -145 + Math.sin(a) * 4.2, acak(1.2, 2.4)); }
    tick.push((dt, t) => lampu.scale.setScalar(1 + Math.sin(t * 3) * .08));

    /* ---- Dermaga kayu menjorok ke laut ---- */
    const dermaga = new THREE.Group(), papan = M({ color: 0xa8743c, roughness: .9 });
    taruh(kotak(2.8, .12, 28, papan), 0, .75, -14, dermaga);
    for (let i = 0; i < 8; i++) [-1.3, 1.3].forEach((s) => taruh(new THREE.Mesh(new THREE.CylinderGeometry(.13, .13, 2.4, 8), M({ color: 0x5b3a1c })), s, -.2, -2 - i * 3.6, dermaga));
    dermaga.position.set(34, 0, -100);
    S.add(dermaga);

    /* ---- Burung camar, kapal layar jauh, pelampung tanda ---- */
    const burung = Array.from({ length: 7 }, () => { // camar: badan, kepala + paruh, ekor, kaki, sayap dua ruas berujung hitam
        const g = new THREE.Group(), putih = M({ color: 0xffffff, roughness: .7 }), jingga = M({ color: 0xffa31a, roughness: .5 }), hitam = M({ color: 0x1e2229, side: THREE.DoubleSide });
        const sayapM = M({ color: 0xe3e9ef, roughness: .8, side: THREE.DoubleSide });
        taruh(new THREE.Mesh(new THREE.SphereGeometry(.3, 14, 10), putih), 0, 0, 0, g).scale.set(.75, .7, 2.1);
        taruh(new THREE.Mesh(new THREE.SphereGeometry(.17, 12, 9), putih), 0, .1, .66, g);
        taruh(new THREE.Mesh(new THREE.ConeGeometry(.05, .3, 6).rotateX(Math.PI / 2), jingga), 0, .07, .9, g);
        taruh(new THREE.Mesh(new THREE.SphereGeometry(.025, 6, 5), M({ color: 0xd62f2f })), 0, .035, .98, g);
        [-1, 1].forEach((s2) => taruh(new THREE.Mesh(new THREE.SphereGeometry(.028, 6, 5), hitam), s2 * .1, .14, .74, g));
        taruh(new THREE.Mesh(new THREE.ConeGeometry(.3, .6, 3).rotateX(-Math.PI / 2), putih), 0, 0, -.9, g).scale.y = .15;
        taruh(kotak(.34, .02, .1, hitam), 0, .0, -1.08, g);
        [-1, 1].forEach((s2) => taruh(new THREE.Mesh(new THREE.CylinderGeometry(.012, .012, .35, 5).rotateX(Math.PI / 2), jingga), s2 * .08, -.2, -.5, g));
        const bentuk = (pts) => { const sh = new THREE.Shape(); sh.moveTo(...pts[0]); pts.slice(1).forEach((q) => sh.lineTo(...q)); return new THREE.ShapeGeometry(sh).rotateX(Math.PI / 2); };
        g.sayap = [-1, 1].map((s2) => {
            const dalam = new THREE.Group(), luar = new THREE.Group();
            dalam.position.set(s2 * .2, .12, .1);
            luar.position.x = s2 * 1;
            dalam.add(new THREE.Mesh(bentuk([[0, .38], [1, .26], [1, -.14], [.5, -.4], [0, -.34]]).scale(s2, 1, 1), sayapM), luar);
            luar.add(new THREE.Mesh(bentuk([[0, .26], [1.15, .04], [1.1, -.06], [.55, -.2], [0, -.14]]).scale(s2, 1, 1), sayapM));
            luar.add(new THREE.Mesh(bentuk([[.7, .12], [1.15, .04], [1.1, -.06], [.7, -.19]]).scale(s2, 1, 1), hitam)).position.y = .003; // ujung sayap hitam
            g.add(dalam);
            return { dalam, luar, s: s2 };
        });
        g.scale.setScalar(3);
        g.rotation.order = 'YXZ';
        S.add(g);
        return g;
    });
    tick.push((dt, t) => burung.forEach((g, i) => {
        const a = t * (.11 + (i % 3) * .015) + i * .9, mengepak = Math.sin(t * .35 + i * 1.7) > -.25; // bergantian mengepak & meluncur
        const w = mengepak ? Math.sin(t * 6 + i) * .55 : .12 + Math.sin(t * .8 + i) * .04, w2 = mengepak ? Math.sin(t * 6 + i - .8) * .45 : .05;
        g.position.set(Math.cos(a) * (42 + (i % 3) * 8), 20 + i * 2.5 + Math.sin(t * .8 + i) * 2 + (mengepak ? Math.sin(t * 6 + i) * .25 : 0), -70 + Math.sin(a) * 32);
        g.rotation.set(-.06, -a, Math.sin(t * .3 + i) * .18); // sedikit miring saat berbelok
        g.sayap.forEach(({ dalam, luar, s }) => { dalam.rotation.z = s * w; luar.rotation.z = s * (w + w2 * .6); });
    }));
    const layar = (x, z, s) => {
        const g = new THREE.Group(), putih = M({ color: 0xffffff, side: THREE.DoubleSide, roughness: .9 });
        taruh(new THREE.Mesh(new THREE.BoxGeometry(1.6, .6, 5), M({ color: 0x2d4a8a })), 0, .3, 0, g);
        taruh(new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, 6, 6), M({ color: 0x6a4a2a })), 0, 3.4, 0, g);
        taruh(new THREE.Mesh(new THREE.ConeGeometry(2, 5.4, 3).scale(.04, 1, 1), putih), 0, 3.4, .7, g).rotation.x = 0;
        taruh(new THREE.Mesh(new THREE.ConeGeometry(1.3, 4, 3).scale(.04, 1, 1), putih), 0, 2.6, -1.1, g);
        g.scale.setScalar(s);
        g.position.set(x, 0, z);
        g.rotation.y = acak(-.4, .4);
        S.add(g);
        return g;
    };
    const kapal = [layar(55, -88, 1.3), layar(-40, -100, 1)];
    tick.push((dt, t) => kapal.forEach((g, i) => { g.position.y = gel(g.position.x, g.position.z, t) + .1; g.rotation.z = Math.sin(t * .8 + i) * .04; }));
    const pelampungTanda = [[-9, -26], [11, -34], [-17, -44]].map(([x, z], i) => {
        const g = new THREE.Group();
        taruh(new THREE.Mesh(new THREE.CylinderGeometry(.35, .42, .8, 12), M({ color: i % 2 ? 0xff5a2a : 0xffd23f })), 0, .3, 0, g);
        taruh(new THREE.Mesh(new THREE.SphereGeometry(.35, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), M({ color: 0xffffff })), 0, .7, 0, g);
        taruh(new THREE.Mesh(new THREE.CylinderGeometry(.04, .04, 1, 6), M({ color: 0x333333 })), 0, 1.4, 0, g);
        g.position.set(x, 0, z);
        S.add(g);
        return g;
    });
    tick.push((dt, t) => pelampungTanda.forEach((g, i) => { g.position.y = gel(g.position.x, g.position.z, t) - .1; g.rotation.set(Math.sin(t * 1.3 + i) * .08, 0, Math.cos(t + i) * .08); }));

    /* ---- Perahu: lambung berpapan, dek bertekstur, pagar, bangku, peralatan (kamera di dalamnya = tampilan orang pertama) ---- */
    const perahu = new THREE.Group();
    S.add(perahu);
    const serat = lukis(256, (x, n) => {
        for (let i = 0; i < 8; i++) {
            x.fillStyle = `hsl(${acak(24, 32)} ${acak(48, 60)}% ${acak(38, 50)}%)`;
            x.fillRect(i * 32, 0, 32, n);
            for (let k = 0; k < 16; k++) { x.fillStyle = `rgba(70,35,10,${acak(.05, .2)})`; x.fillRect(i * 32 + acak(1, 30), 0, acak(.5, 1.6), n); }
            x.fillStyle = 'rgba(40,20,6,.6)';
            x.fillRect(i * 32, 0, 2, n);
            [18, 238].forEach((y) => { x.beginPath(); x.arc(i * 32 + 16, y, 1.8, 0, 6.3); x.fill(); });
        }
    });
    const serat2 = serat.clone();
    serat.repeat.set(1, 2);
    serat2.repeat.set(.45, .45);
    serat2.needsUpdate = true;
    const mDek = M({ map: serat, roughness: .85 }), mDek2 = M({ map: serat2, roughness: .85, side: THREE.DoubleSide });
    const papanSisi = [0xa9743a, 0xb5803f, 0x9c6a33].map((c) => M({ color: c, roughness: .88 })), kayuTua = M({ color: 0x6a4521, roughness: .9 });
    taruh(kotak(2.2, .12, 5.2, mDek), 0, 0, 0, perahu);
    [-1, 1].forEach((s) => {
        papanSisi.forEach((m, i) => taruh(kotak(.1, .26, 5.2, m), s * 1.1, .16 + i * .26, 0, perahu));
        taruh(kotak(.24, .07, 5.3, kayuTua), s * 1.1, .86, 0, perahu);
        for (let z = -2.2; z <= 2.2; z += 1.1) taruh(kotak(.08, .75, .12, kayuTua), s * 1.02, .42, z, perahu);
        papanSisi.forEach((m, i) => taruh(kotak(.1, .26, 2.1, m), s * .56, .16 + i * .26, -3.45, perahu).rotation.y = s * .6);
        taruh(kotak(.24, .07, 2.1, kayuTua), s * .56, .86, -3.45, perahu).rotation.y = s * .6;
    });
    {
        const sh = new THREE.Shape();
        sh.moveTo(-1.1, 0); sh.lineTo(1.1, 0); sh.lineTo(0, -1.6);
        taruh(new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: .12, bevelEnabled: false }).rotateX(Math.PI / 2), mDek2), 0, .06, -2.6, perahu);
    }
    taruh(kotak(.14, .95, .2, kayuTua), 0, .45, -4.1, perahu); // linggi haluan
    taruh(kotak(2.1, .08, .3, kayuTua), 0, .62, -1.9, perahu); // bangku melintang
    [-.95, .95].forEach((x) => taruh(kotak(.08, .5, .22, kayuTua), x, .36, -1.9, perahu));
    taruh(kotak(2.1, .08, .3, kayuTua), 0, .62, 2.3, perahu);

    // peralatan: kotak pancing (kiri), cooler, ember berisi ikan (kanan), gulungan tali, jangkar, lentera, pelampung, joran cadangan, jaring
    const alat = new THREE.Group();
    taruh(kotak(.6, .28, .34, M({ color: 0xd93a3a, roughness: .5 })), 0, 0, 0, alat);
    taruh(kotak(.62, .06, .36, M({ color: 0xb02a2a })), 0, .17, 0, alat);
    [-.2, .2].forEach((x) => taruh(kotak(.08, .06, .02, M({ color: 0xffd23f })), x, .05, .18, alat));
    taruh(new THREE.Mesh(new THREE.TorusGeometry(.09, .012, 6, 12, Math.PI), logam), 0, .2, 0, alat);
    taruh(alat, -.6, .21, -.5, perahu).rotation.y = .3;
    const cooler = new THREE.Group();
    taruh(kotak(.7, .4, .42, M({ color: 0xf2f5f8, roughness: .6 })), 0, 0, 0, cooler);
    taruh(kotak(.72, .08, .44, M({ color: 0x2f7de1 })), 0, .24, 0, cooler);
    taruh(kotak(.2, .04, .05, M({ color: 0x222222 })), 0, .3, 0, cooler);
    taruh(cooler, -.62, .26, -1.35, perahu).rotation.y = -.15;
    const ember = new THREE.Group(), isiEmber = new THREE.Group();
    ember.add(new THREE.Mesh(new THREE.CylinderGeometry(.24, .19, .4, 20, 1, true), M({ color: 0x2b7de9, side: THREE.DoubleSide })));
    taruh(new THREE.Mesh(new THREE.CircleGeometry(.19, 16).rotateX(-Math.PI / 2), M({ color: 0x1f4f99 })), 0, -.19, 0, ember);
    taruh(new THREE.Mesh(new THREE.TorusGeometry(.24, .015, 6, 20).rotateX(Math.PI / 2), logam), 0, .2, 0, ember);
    taruh(isiEmber, 0, 0, 0, ember);
    taruh(ember, .62, .26, -.9, perahu);
    taruh(new THREE.Mesh(new THREE.CircleGeometry(.215, 20).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x5fb8ff, transparent: true, opacity: .42, roughness: .05 })), 0, .02, 0, ember); // air di dalam ember
    [.2, .17, .14].forEach((r, i) => taruh(new THREE.Mesh(new THREE.TorusGeometry(r, .035, 8, 24).rotateX(Math.PI / 2), M({ color: 0xd9c08a, roughness: 1 })), .5, .08 + i * .06, -2.8, perahu));
    {
        const ja = new THREE.Group(), besi = M({ color: 0x3a4048, metalness: .6, roughness: .5 });
        taruh(new THREE.Mesh(new THREE.CylinderGeometry(.02, .02, .7, 8).rotateZ(Math.PI / 2), besi), 0, 0, 0, ja);
        taruh(new THREE.Mesh(new THREE.CylinderGeometry(.02, .02, .35, 8), besi), -.3, .12, 0, ja);
        taruh(new THREE.Mesh(new THREE.TorusGeometry(.05, .014, 6, 12), besi), .38, 0, 0, ja);
        [-1, 1].forEach((s) => taruh(new THREE.Mesh(new THREE.ConeGeometry(.05, .18, 4), besi), -.3 + s * .12, .3, 0, ja).rotation.z = -s * 1.1);
        taruh(ja, -.55, .1, -3.2, perahu).rotation.y = .5;
    }
    const lentera = new THREE.Group();
    lentera.add(new THREE.Mesh(new THREE.CylinderGeometry(.08, .08, .22, 10), new THREE.MeshBasicMaterial({ color: 0xffe27a })));
    taruh(new THREE.Mesh(new THREE.ConeGeometry(.11, .1, 10), logam), 0, .16, 0, lentera);
    taruh(lentera, -1.04, .98, -1.8, perahu);
    const ban = new THREE.Group(); // ban penyelamat: 8 busur bergantian merah-putih + tali
    for (let i = 0; i < 8; i++) {
        const seg = new THREE.Mesh(new THREE.TorusGeometry(.3, .09, 10, 6, Math.PI / 4), M({ color: i % 2 ? 0xffffff : 0xd62f2f, roughness: .6 }));
        seg.rotation.z = i * Math.PI / 4;
        ban.add(seg);
    }
    taruh(new THREE.Mesh(new THREE.TorusGeometry(.3, .095, 6, 40).scale(1, 1, .25), M({ color: 0xe8d7a8, roughness: 1 })), 0, 0, 0, ban).scale.setScalar(1.001);
    taruh(ban, 1.04, .95, -1.6, perahu).rotation.y = Math.PI / 2;
    [[-1, 0xd62f2f, -.95, -1.4], [-.9, 0x2f9ed6, -.7, -1.2]].forEach(([x, c, tx, tz]) => {
        const a = new THREE.Vector3(x, .1, -.2), b = new THREE.Vector3(tx, 2.4, tz);
        batang(a, b, .02, .012, M({ color: c, roughness: .3 }), perahu);
        batang(a, a.clone().lerp(b, .2), .032, .03, M({ color: 0x9b6b3a }), perahu);
    });
    { // jaring ikan bertangkai: tangkai kayu berhenti di tepi bingkai, bingkai menghadap kamera, kantong jaring menjorok ke depan
        const a = new THREE.Vector3(1, .1, -.3), b = new THREE.Vector3(.92, 2, -1.25), dir = b.clone().sub(a).normalize(), R = .3;
        const kayu = M({ color: 0xb5763a, roughness: .8 });
        batang(a, b, .028, .022, kayu, perahu);
        taruh(new THREE.Mesh(new THREE.SphereGeometry(.03, 8, 6), M({ color: 0x1a1a1a })), a.x, a.y, a.z, perahu); // tutup pangkal
        const X = new THREE.Vector3(1, 0, 0).addScaledVector(dir, -dir.x).normalize(), N = new THREE.Vector3().crossVectors(X, dir);
        const jaring = new THREE.Group();
        jaring.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(X, dir, N));
        jaring.position.copy(b).addScaledVector(dir, R);
        jaring.add(new THREE.Mesh(new THREE.TorusGeometry(R, .02, 8, 28), M({ color: 0xd8d8d8, metalness: .6, roughness: .35 })));
        jaring.add(new THREE.Mesh(new THREE.SphereGeometry(R, 12, 9, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2).rotateX(Math.PI / 2).scale(1, 1, 1.15), new THREE.MeshBasicMaterial({ color: 0xe8f1ff, wireframe: true })));
        taruh(kotak(.07, .05, .07, M({ color: 0xd8d8d8, metalness: .6 })), 0, -R, 0, jaring); // sambungan tangkai-bingkai
        perahu.add(jaring);
    }

    /* ---- Perlengkapan tambahan: dayung, jaket pelampung, topi, nampan umpan, botol, cleat + tali, bendera, fender, baut, genangan ---- */
    {
        const kayuMuda = M({ color: 0xc89a5a, roughness: .8 }), oranye = M({ color: 0xff7a1a, roughness: .9 }), besi = M({ color: 0x3a4048, metalness: .7, roughness: .4 });
        // dayung bersandar di dinding kiri
        batang(new THREE.Vector3(-.98, .14, 1.5), new THREE.Vector3(-.96, .16, -2.1), .028, .024, kayuMuda, perahu);
        taruh(kotak(.22, .03, .75, kayuMuda), -.96, .16, -2.5, perahu);
        // tempat dayung (oarlock) di pagar kedua sisi
        [-1, 1].forEach((s) => {
            taruh(new THREE.Mesh(new THREE.CylinderGeometry(.025, .025, .14, 8), besi), s * 1.1, .96, .2, perahu);
            taruh(new THREE.Mesh(new THREE.TorusGeometry(.06, .012, 6, 14, Math.PI * 1.5), besi), s * 1.1, 1.06, .2, perahu).rotation.y = Math.PI / 2;
            for (let z = -2.4; z <= 2.4; z += .6) taruh(new THREE.Mesh(new THREE.CylinderGeometry(.012, .012, .02, 6), besi), s * 1.1, .895, z, perahu); // baut pagar
            // cleat (pengikat tali) di haluan + tali menjuntai ke dek
            taruh(kotak(.2, .03, .05, besi), s * .5, .93, -3.7, perahu).rotation.y = s * .6;
            taruh(new THREE.Mesh(new THREE.CylinderGeometry(.015, .015, .06, 6), besi), s * .5, .9, -3.7, perahu);
        });
        // jaket pelampung oranye di bangku depan
        const jaket = new THREE.Group();
        taruh(kotak(.5, .12, .3, oranye), 0, 0, 0, jaket);
        taruh(kotak(.16, .13, .31, M({ color: 0x222222 })), 0, .005, 0, jaket);
        taruh(kotak(.06, .02, .3, M({ color: 0xffe14a })), .15, .07, 0, jaket);
        taruh(jaket, .5, .72, -1.9, perahu).rotation.y = .2;
        // topi jerami di atas cooler
        const topi = new THREE.Group(), jerami = M({ color: 0xe8cf86, roughness: 1 });
        taruh(new THREE.Mesh(new THREE.CylinderGeometry(.16, .16, .015, 20), jerami), 0, 0, 0, topi);
        taruh(new THREE.Mesh(new THREE.CylinderGeometry(.08, .1, .1, 16), jerami), 0, .055, 0, topi);
        taruh(new THREE.Mesh(new THREE.CylinderGeometry(.101, .101, .025, 16), M({ color: 0xc02a2a })), 0, .035, 0, topi);
        taruh(topi, -.62, .5, -1.35, perahu).rotation.set(.1, 0, -.12);
        // nampan umpan buatan + botol minum di bangku
        const nampan = new THREE.Group();
        taruh(kotak(.5, .035, .3, M({ color: 0xf2f5f8, roughness: .5 })), 0, 0, 0, nampan);
        [0xff4a4a, 0xffd23f, 0x3fd6a0, 0x4aa8ff, 0xff7ac6].forEach((c, i) => {
            const u = taruh(new THREE.Mesh(new THREE.SphereGeometry(.03, 10, 8), M({ color: c, metalness: .5, roughness: .25 })), -.19 + i * .095, .045, (i % 2 ? .06 : -.06), nampan);
            u.scale.x = 1.7;
            taruh(new THREE.Mesh(new THREE.TorusGeometry(.016, .004, 5, 10), logam), -.19 + i * .095 + .055, .045, (i % 2 ? .06 : -.06), nampan);
        });
        taruh(nampan, -.45, .685, -1.95, perahu).rotation.y = -.15;
        const botol = new THREE.Group();
        taruh(new THREE.Mesh(new THREE.CylinderGeometry(.045, .045, .2, 14), M({ color: 0x4aa8ff, transparent: true, opacity: .75, roughness: .1 })), 0, 0, 0, botol);
        taruh(new THREE.Mesh(new THREE.CylinderGeometry(.02, .028, .04, 10), M({ color: 0xffffff })), 0, .12, 0, botol);
        taruh(botol, -.08, .76, -1.9, perahu);
        // fender putih tergantung di luar pagar kiri
        [.4, -1.1].forEach((z) => {
            taruh(new THREE.Mesh(new THREE.CylinderGeometry(.09, .09, .4, 12), M({ color: 0xf5f5f5, roughness: .6 })), -1.28, .62, z, perahu);
            batang(new THREE.Vector3(-1.1, .88, z), new THREE.Vector3(-1.27, .82, z), .008, .008, M({ color: 0xd9c08a }), perahu);
        });
        // genangan air di dek (tampak basah)
        [[.2, -2.3, .5], [-.1, -.6, .35]].forEach(([x, z, r]) => {
            const gn = taruh(new THREE.Mesh(new THREE.CircleGeometry(r, 18).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x1d3a52, transparent: true, opacity: .35, roughness: .02, metalness: .2 })), x, .064, z, perahu);
            gn.scale.x = 1.6;
            gn.receiveShadow = false;
        });
    }
    perahu.add(C);
    C.position.set(0, 1.45, 1);
    perahu.traverse((o) => { if (o.isMesh) o.castShadow = o.receiveShadow = true; });

    return {
        perahu, isiEmber,
        tick(dt, t) {
            perahu.position.y = .5 + gel(0, 0, t) * .7;
            perahu.rotation.set(Math.sin(t * 1.1) * .02, 0, Math.sin(t * .8) * .03);
            tick.forEach((f) => f(dt, t));
        },
    };
}

/* ================= PEMANCING: joran, reel, dua tangan yang menggenggam gagang ================= */
function buatPemancing(C) {
    const joran = new THREE.Group();
    joran.position.set(.02, -.16, -.7);
    joran.rotation.set(.5, .03, 0);
    C.add(joran);
    const RG = .02, PJ = .42; // jari-jari gagang, panjang tiap ruas joran
    const sepanjangZ = (g, a, b) => g.rotateX(Math.PI / 2).translate(0, 0, (a + b) / 2); // silinder sumbu-y -> sumbu-z, di antara z=a..b (a > b)

    // gagang gabus bercincin + dudukan reel + tutup ujung
    const gabus = lukis(128, (x, n) => {
        x.fillStyle = '#c9a26a';
        x.fillRect(0, 0, n, n);
        for (let i = 0; i < 260; i++) { x.fillStyle = `rgba(${acak(90, 130)},${acak(60, 90)},30,${acak(.1, .35)})`; x.fillRect(acak(0, n), acak(0, n), acak(1, 3), acak(1, 3)); }
    });
    gabus.repeat.set(2, 3);
    const mGabus = M({ map: gabus, roughness: 1 }), karbon = M({ color: 0x151a22, roughness: .22, metalness: .35 }), merah = M({ color: 0xd62f2f, roughness: .4 });
    joran.add(new THREE.Mesh(sepanjangZ(new THREE.CylinderGeometry(RG, RG * .93, .36, 20), .3, -.06), mGabus));
    [.26, .14, .02].forEach((z) => taruh(new THREE.Mesh(new THREE.CylinderGeometry(RG * 1.06, RG * 1.06, .012, 20).rotateX(Math.PI / 2), M({ color: 0x3a2a1a })), 0, 0, z, joran));
    taruh(new THREE.Mesh(new THREE.SphereGeometry(RG * 1.1, 14, 10), M({ color: 0x1a1a1a, roughness: .7 })), 0, 0, .3, joran).scale.z = .6;
    joran.add(new THREE.Mesh(sepanjangZ(new THREE.CylinderGeometry(RG * 1.12, RG * 1.12, .13, 20), -.05, -.18), M({ color: 0x2a313c, metalness: .8, roughness: .35 })));
    taruh(new THREE.Mesh(new THREE.CylinderGeometry(RG * 1.18, RG * 1.18, .012, 20).rotateX(Math.PI / 2), logam), 0, 0, -.185, joran);
    taruh(new THREE.Mesh(new THREE.CylinderGeometry(RG * 1.18, RG * 1.18, .012, 20).rotateX(Math.PI / 2), logam), 0, 0, -.052, joran);

    // reel spinning di bawah dudukan: kaki, badan, spool bergulung tali, engkol berputar
    const reel = new THREE.Group(), emas = M({ color: 0xe0a93c, metalness: .85, roughness: .3 });
    taruh(kotak(.016, .006, .075, logam), 0, -RG * 1.18 - .003, -.115, joran);
    taruh(new THREE.Mesh(new THREE.CylinderGeometry(.008, .008, .04, 8), logam), 0, -.036, 0, reel);
    taruh(new THREE.Mesh(new THREE.CylinderGeometry(.032, .036, .05, 20), M({ color: 0x2a313c, metalness: .7, roughness: .35 })), 0, -.07, 0, reel);
    taruh(new THREE.Mesh(new THREE.SphereGeometry(.03, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), logam), 0, -.045, 0, reel);
    taruh(new THREE.Mesh(new THREE.CylinderGeometry(.028, .028, .016, 20).rotateX(Math.PI / 2), emas), 0, -.075, -.04, reel);
    taruh(new THREE.Mesh(new THREE.CylinderGeometry(.022, .022, .028, 20).rotateX(Math.PI / 2), M({ color: 0xf2f2f2, roughness: .9 })), 0, -.075, -.056, reel);
    taruh(new THREE.Mesh(new THREE.TorusGeometry(.036, .0025, 6, 14, Math.PI).rotateY(Math.PI / 2), logam), 0, -.075, -.04, reel);
    const engkol = new THREE.Group(), hitam = M({ color: 0x151515, roughness: .6 });
    taruh(new THREE.Mesh(new THREE.CylinderGeometry(.005, .005, .055, 8), logam), -.01, -.0275, 0, engkol);
    taruh(new THREE.Mesh(new THREE.CylinderGeometry(.02, .02, .1, 16).rotateZ(Math.PI / 2), hitam), -.06, -.055, 0, engkol); // gagang engkol (digenggam tangan kiri)
    taruh(engkol, -.04, -.07, .005, reel);
    taruh(reel, 0, -RG * 1.18, -.115, joran);

    // blank joran 6 ruas bersambung (diputar sedikit-sedikit = melengkung) + mata pancing + lilitan benang
    const segs = [];
    let induk = joran;
    for (let i = 0; i < 6; i++) {
        const g = new THREE.Group(), r = .0125 - .0018 * i, rg = Math.max(.0065, .015 - .0017 * i);
        g.position.z = i ? -PJ : -.19;
        g.add(new THREE.Mesh(new THREE.CylinderGeometry(r, r * .86, PJ, 10).rotateX(Math.PI / 2).translate(0, 0, -PJ / 2), karbon));
        taruh(new THREE.Mesh(new THREE.CylinderGeometry(r * 1.12, r * 1.12, .02, 10).rotateX(Math.PI / 2), merah), 0, 0, -.01, g);
        [.3, .78].forEach((k) => {
            taruh(new THREE.Mesh(new THREE.CylinderGeometry(r * .95, r * .95, .008, 10).rotateX(Math.PI / 2), merah), 0, 0, -PJ * k, g);
            taruh(new THREE.Mesh(new THREE.TorusGeometry(rg, .0016, 6, 14), logam), 0, -r - rg * .85, -PJ * k, g);
            taruh(new THREE.Mesh(new THREE.CylinderGeometry(.0016, .0016, rg * .9, 5), logam), 0, -r - rg * .4, -PJ * k, g);
        });
        induk.add(g);
        segs.push(g);
        induk = g;
    }
    const ujung = new THREE.Object3D();
    ujung.position.set(0, -.01, -PJ);
    segs[5].add(ujung);
    taruh(new THREE.Mesh(new THREE.TorusGeometry(.007, .0016, 6, 12), logam), 0, -.01, -PJ, segs[5]);

    /* ---- Tangan: telapak melengkung membungkus gagang, 4 jari 3 ruas + jempol, kuku ---- */
    const kulit = M({ color: 0xc98a62, roughness: .6 }), kuku = M({ color: 0xf3cfc0, roughness: .3 });
    const bola = (r, x, y, z, induk2, sk) => { const m = taruh(new THREE.Mesh(new THREE.SphereGeometry(r, 12, 9), kulit), x, y, z, induk2); if (sk) m.scale.set(...sk); return m; };
    const tangan = (zc, rg, kepal) => {
        const g = new THREE.Group(), P0 = 1.3, W = .088; // P0 = sudut buku jari (rad) pada lingkar gagang
        // telapak: irisan cincin melengkung (ekstrusi + bevel membulatkan tepinya)
        const sh = new THREE.Shape(), r1 = rg * .96, r2 = rg + .014, a1 = P0 - .95, a2 = P0;
        sh.absarc(0, 0, r2, a1, a2, false);
        sh.absarc(0, 0, r1, a2, a1, true);
        const telapak = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: W - .016, bevelEnabled: true, bevelThickness: .006, bevelSize: .004, bevelSegments: 3, curveSegments: 14 }).translate(0, 0, -(W - .016) / 2), kulit);
        telapak.position.z = zc;
        g.add(telapak);
        const titik = (a, r, z) => new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, z);
        // satu jari: titik-titik di lingkar gagang, panjang ruas -> sudut lewat rumus tali busur
        const jari = (z, ruas, rj, sudut0) => {
            const Rc = rg + rj;
            let a = sudut0, p = titik(a, Rc, z);
            bola(rj * 1.08, p.x, p.y, p.z, g);
            ruas.forEach((l, i) => {
                a += 2 * Math.asin(Math.min(1, l / (2 * Rc)));
                const q = titik(a, Rc, z), r = rj * (1 - i * .07);
                batang(p, q, r, r * .93, kulit, g);
                bola(r * .96, q.x, q.y, q.z, g);
                p = q;
            });
            const n = taruh(new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6), kuku), Math.cos(a - .18) * (Rc + rj * .78), Math.sin(a - .18) * (Rc + rj * .78), z, g);
            n.scale.set(.0072, .0026, .0066);
            n.quaternion.setFromUnitVectors(SUMBU_Y, new THREE.Vector3(Math.cos(a - .18), Math.sin(a - .18), 0));
        };
        [[-1.5, [.045, .029, .023], .0105], [-.5, [.05, .033, .025], .0108], [.5, [.047, .03, .024], .0102], [1.5, [.038, .024, .02], .0092]]
            .forEach(([k, ruas, rj]) => jari(zc + k * .0205, ruas, rj, P0 - .02 * Math.abs(k)));
        // jempol: bertumpu di pangkal telapak. kepal = menyilang di atas jari-jari (kepalan); selain itu memanjang ke depan sepanjang gagang
        const Rt = rg + .032;
        const pj = kepal
            ? [titik(P0 - .45, rg + .018, zc - .046), titik(P0 + .02, Rt, zc - .05), titik(P0 + .3, Rt, zc - .022), titik(P0 + .55, Rt - .002, zc + .008)]
            : [titik(P0 - .55, rg + .016, zc - .036), titik(P0 - .2, rg + .0135, zc - .075), titik(P0 + .08, rg + .0125, zc - .106), titik(P0 + .22, rg + .012, zc - .13)];
        bola(.021, pj[0].x, pj[0].y, pj[0].z, g, [1, 1, 1.15]);
        pj.slice(1).forEach((q, i) => { batang(pj[i], q, .0135 - i * .0012, .0125 - i * .0012, kulit, g); bola(.0128 - i * .0012, q.x, q.y, q.z, g); });
        const nk = taruh(new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6), kuku), pj[3].x * 1.03, pj[3].y * 1.03, pj[3].z - .004, g);
        nk.scale.set(.0072, .0026, .009);
        nk.quaternion.setFromUnitVectors(SUMBU_Y, new THREE.Vector3(pj[3].x, pj[3].y, 0).normalize());
        // pergelangan: penampang lonjong keluar dari ujung telapak searah lengan bawah
        const aH = a1, W0 = titik(aH, rg + .0105, zc), t = new THREE.Vector3(Math.sin(aH), -Math.cos(aH), 0);
        const pergelangan = new THREE.Mesh(new THREE.CylinderGeometry(1, 1.12, .07, 14).scale(.0145, 1, .031), kulit);
        pergelangan.position.copy(W0).addScaledVector(t, .028);
        pergelangan.quaternion.setFromUnitVectors(SUMBU_Y, t);
        g.add(pergelangan);
        const jangkar = new THREE.Object3D();
        jangkar.position.copy(W0).addScaledVector(t, .07);
        g.add(jangkar);
        g.tangan = jangkar;
        return g;
    };
    const kanan = tangan(0, RG, true), kiri = tangan(0, .02), BETA = 1; // kanan = kepalan di gagang; kiri = punggung tangan menghadap kamera di gagang engkol
    kanan.rotation.x = -.25; // miring: lengan bawah mengarah ke badan (ke arah kamera)
    kanan.scale.z = -1; // tangan kanan: jari telunjuk ke arah badan
    kanan.position.z = .13;
    kiri.position.set(-.06, -.055, 0);
    joran.add(kanan);
    engkol.add(kiri); // tangan kiri ikut mengayuh engkol
    // lengan: lengan baju + lengan bawah, direntangkan dari bahu (menempel di kamera) ke pergelangan tiap frame
    const baju = M({ color: 0x2f7de1, roughness: .85 }), garis2 = M({ color: 0x1f5db3, roughness: .85 });
    const lengan = (x, y, z) => {
        const g = new THREE.Group();
        g.add(new THREE.Mesh(new THREE.CylinderGeometry(.052, .085, 1, 14).rotateX(Math.PI / 2).translate(0, 0, .5), baju), new THREE.Mesh(new THREE.CylinderGeometry(.027, .04, 1, 12).rotateX(Math.PI / 2).translate(0, 0, .5), kulit), new THREE.Mesh(new THREE.TorusGeometry(.054, .012, 8, 18), garis2), new THREE.Mesh(new THREE.SphereGeometry(.03, 12, 10), kulit));
        taruh(g, x, y, z, C);
        return g;
    };
    const lenganK = lengan(.32, -.95, .25), lenganI = lengan(-.32, -.95, .25);
    const v = new THREE.Vector3(), vT = new THREE.Vector3();
    const rentang = (g, sasaran) => {
        sasaran.getWorldPosition(v);
        g.lookAt(v);
        const d = g.getWorldPosition(vT).distanceTo(v), a = Math.max(.1, d - .2); // 20 cm lengan bawah terlihat di bawah manset
        g.children[0].scale.z = a;
        g.children[1].position.z = a;
        g.children[1].scale.z = d - a;
        g.children[2].position.z = a;
        g.children[3].position.z = d;
    };
    [lenganK, lenganI].forEach((l) => l.traverse((o) => { if (o.isMesh) o.castShadow = true; }));
    kiri.rotation.set(BETA, -Math.PI / 2, 0);
    joran.traverse((o) => { if (o.isMesh) o.castShadow = o.receiveShadow = true; });

    let bengkok = 0;
    return {
        ujung, joran,
        // tRod = kemiringan joran, bend = lengkung ruas, engk = kecepatan putar engkol
        tick(dt, t, tRod, bend, engk) {
            joran.rotation.x += (tRod + Math.sin(t * 1.3) * .01 - joran.rotation.x) * Math.min(1, dt * 8);
            bengkok += (bend - bengkok) * Math.min(1, dt * 6);
            segs.forEach((s) => (s.rotation.x = bengkok));
            engkol.rotation.x += engk * dt;
            kiri.rotation.set(BETA - engkol.rotation.x, -Math.PI / 2, 0); // orientasi tangan tetap, hanya posisinya yang berputar
            rentang(lenganK, kanan.tangan);
            rentang(lenganI, kiri.tangan);
        },
    };
}

/* ================= MODEL IKAN: badan bersisik ramping ke ekor, sirip bersinar + jari-jari sirip, ekor bercabang, insang, mata, duri ================= */
let teksSisik;
const sisik = () => teksSisik ||= lukis(128, (x, n) => { // busur-busur bertumpuk, dikalikan dengan warna badan
    x.fillStyle = '#fff';
    x.fillRect(0, 0, n, n);
    x.strokeStyle = 'rgba(0,0,0,.2)';
    x.lineWidth = 2;
    for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) { x.beginPath(); x.arc(c * 16 + (r % 2 ? 8 : 0), r * 14, 9, .1, Math.PI - .1); x.stroke(); }
});
let teksKilau;
const kilau = () => teksKilau ||= lukis(128, (x, n) => { // titik terang acak di atas hitam: hanya titik yang bersinar
    x.fillStyle = '#000';
    x.fillRect(0, 0, n, n);
    for (let i = 0; i < 46; i++) { x.fillStyle = `rgba(255,255,255,${acak(.4, 1)})`; x.beginPath(); x.arc(acak(0, n), acak(0, n), acak(.8, 2.2), 0, 6.3); x.fill(); }
});
function buatIkan(sp) {
    const g = new THREE.SphereGeometry(1, 48, 30).rotateZ(Math.PI / 2), pos = g.attributes.position, col = [];
    const a = new THREE.Color(sp.pg), b = new THREE.Color(sp.pr), l = new THREE.Color(sp.lr || 0);
    for (let i = 0; i < pos.count; i++) {
        let x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
        const t = x < -.1 ? lerp(.2, 1, THREE.MathUtils.smoothstep(x, -1, -.1)) : 1; // pangkal ekor mengecil
        pos.setXYZ(i, x, y * t, z * t);
        y *= t;
        let c = sp.lr && Math.sin(x * 9) > .5 && x > -.6 ? l.clone() : b.clone().lerp(a, THREE.MathUtils.smoothstep(y, -.25, .4));
        if (Math.abs(y) < .07 && x > -.65 && x < .48) c.lerp(new THREE.Color(0xffffff), .22); // pita kilap di sisi badan
        if (x > .46 && x < .53) c.multiplyScalar(.6); // garis tutup insang
        if (x > .53) c.multiplyScalar(1 - (x - .53) * .25); // kepala sedikit lebih gelap
        col.push(c.r, c.g, c.b);
    }
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    const m = new THREE.Group(), lb = sp.lb || .5, em = sp.em || 0x000000;
    const bahan = (c) => M({ color: c, roughness: .35, metalness: .15, emissive: em, emissiveIntensity: .5, side: THREE.DoubleSide, transparent: true, opacity: .88 });
    const langka = (sp.k || 0) >= 2;
    const badan = new THREE.Mesh(g, new THREE.MeshPhysicalMaterial({ vertexColors: true, map: sisik(), roughness: .3, metalness: .3, clearcoat: 1, clearcoatRoughness: .12,
        emissive: langka ? (sp.em ? new THREE.Color(sp.em).lerp(new THREE.Color(0xffffff), .5) : 0xffffff) : 0x000000, emissiveMap: langka ? kilau() : null, emissiveIntensity: 1.1 }));
    if (langka) badan.material.emissiveMap.repeat.set(10, 5);
    badan.material.map.repeat.set(10, 5);
    badan.scale.set(sp.pj, sp.tg, lb);
    m.add(badan);
    // sirip dari Shape (bidang xy). jari-jari = garis dari pangkal ke tepi
    const sirip = (shape, rays, mat, tinggi = 1) => {
        const f = new THREE.Group();
        f.add(new THREE.Mesh(new THREE.ShapeGeometry(shape, 12), mat));
        const v = [];
        rays.forEach((r) => v.push(r[0], r[1], 0, r[2], r[3], 0));
        f.add(new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(v, 3)), new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: .25 })));
        f.scale.y = tinggi;
        return f;
    };
    // ekor bercabang
    const ekorG = new THREE.Group(), ekorS = new THREE.Shape();
    ekorS.moveTo(0, .07); ekorS.quadraticCurveTo(-.25, .12, -.66, .55); ekorS.quadraticCurveTo(-.42, .15, -.4, 0); ekorS.quadraticCurveTo(-.42, -.15, -.66, -.55); ekorS.quadraticCurveTo(-.25, -.12, 0, -.07);
    ekorG.add(sirip(ekorS, [[0, 0, -.6, .5], [0, 0, -.52, .3], [0, 0, -.42, .12], [0, 0, -.42, -.12], [0, 0, -.52, -.3], [0, 0, -.6, -.5]], bahan(sp.ek), sp.tg * 1.25));
    ekorG.position.x = -sp.pj * .97;
    m.add(ekorG);
    // sirip punggung (tegak, melengkung ke belakang) & sirip dubur
    const pungS = new THREE.Shape();
    pungS.moveTo(.35, 0); pungS.bezierCurveTo(.3, .3, 0, .62, -.3, .56); pungS.quadraticCurveTo(-.2, .3, -.5, 0);
    const pungg = sirip(pungS, [[.3, 0, .26, .3], [.1, 0, .05, .5], [-.1, 0, -.15, .5], [-.3, 0, -.33, .3]], bahan(sp.ek), sp.tg * .9);
    pungg.scale.x = sp.pj;
    pungg.position.set(0, sp.tg * .93, 0);
    m.add(pungg);
    const duburS = new THREE.Shape();
    duburS.moveTo(.2, 0); duburS.quadraticCurveTo(.1, -.4, -.25, -.34); duburS.quadraticCurveTo(-.15, -.15, -.35, 0);
    const dubur = sirip(duburS, [[.1, 0, .05, -.3], [-.1, 0, -.12, -.28]], bahan(sp.ek), sp.tg);
    dubur.scale.x = sp.pj * .8;
    dubur.position.set(-sp.pj * .32, -sp.tg * .85, 0);
    m.add(dubur);
    const dadaL = [];
    [1, -1].forEach((z) => {
        // sirip dada (di belakang insang) & perut
        const dadaS = new THREE.Shape();
        dadaS.absellipse(-.14, 0, .2, .075, 0, Math.PI * 2);
        const dada = sirip(dadaS, [[0, 0, -.3, .05], [0, 0, -.25, -.04]], bahan(sp.ek));
        dada.position.set(sp.pj * .42, -sp.tg * .3, z * lb * .86);
        dada.rotation.set(z * .75, 0, -.35);
        dada.userData.r0 = z * .75;
        dadaL.push(dada);
        m.add(dada);
        const perutS = new THREE.Shape();
        perutS.absellipse(-.1, 0, .13, .05, 0, Math.PI * 2);
        const perut = sirip(perutS, [], bahan(sp.ek));
        perut.position.set(sp.pj * .12, -sp.tg * .86, z * lb * .3);
        perut.rotation.set(z * .6, 0, -.6);
        m.add(perut);
        // mata: bola putih, iris emas, pupil, kilau
        const mata = new THREE.Group();
        mata.add(new THREE.Mesh(new THREE.SphereGeometry(.13, 14, 10), bahan(0xffffff)));
        taruh(new THREE.Mesh(new THREE.SphereGeometry(.09, 12, 8), M({ color: 0xffc04d, roughness: .3 })), 0, 0, z * .05, mata);
        taruh(new THREE.Mesh(new THREE.SphereGeometry(.058, 10, 8), M({ color: 0x050505, roughness: .1 })), 0, 0, z * .085, mata);
        taruh(new THREE.Mesh(new THREE.SphereGeometry(.018, 6, 6), new THREE.MeshBasicMaterial({ color: 0xffffff })), .02, .03, z * .13, mata);
        mata.position.set(sp.pj * .7, sp.tg * .22, z * lb * .74);
        m.add(mata);
    });
    // mulut: celah gelap + bibir
    taruh(new THREE.Mesh(new THREE.BoxGeometry(.05, .035, lb * .5), M({ color: 0x3a1a1a })), sp.pj * .99, -sp.tg * .08, 0, m);
    taruh(new THREE.Mesh(new THREE.TorusGeometry(lb * .17, .018, 6, 14, Math.PI), M({ color: sp.pr, roughness: .6 })).rotateY(Math.PI / 2), sp.pj * .97, -sp.tg * .02, 0, m);
    if (sp.duri) {
        for (let i = 0; i < 34; i++) {
            const d = new THREE.Vector3(acak(-1, 1), acak(-1, 1), acak(-1, 1)).normalize(), c = new THREE.Mesh(new THREE.ConeGeometry(.07, .3, 5), bahan(0x8a5a10));
            c.position.set(d.x * sp.pj, d.y * sp.tg, d.z * lb);
            c.quaternion.setFromUnitVectors(SUMBU_Y, d);
            m.add(c);
        }
    }
    // ikan Legendaris/Mitos: aura bercahaya; Mitos: bintang-bintang kecil mengorbit
    let aura, orb;
    if ((sp.k || 0) >= 3) {
        aura = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), new THREE.MeshBasicMaterial({ color: sp.k >= 4 ? sp.pr : sp.pg, transparent: true, opacity: .16, blending: THREE.AdditiveBlending, depthWrite: false }));
        aura.name = 'aura';
        aura.scale.set(sp.pj * 1.4, sp.tg * 1.6, lb * 1.7);
        m.add(aura);
    }
    if ((sp.k || 0) >= 4) {
        orb = new THREE.Group();
        orb.name = 'orb';
        for (let i = 0; i < 8; i++) {
            const b = taruh(new THREE.Mesh(new THREE.OctahedronGeometry(.06), new THREE.MeshBasicMaterial({ color: [0xffffff, 0xff5fd2, 0x19e0ff][i % 3] })), Math.cos(i * .785) * sp.pj * 1.25, Math.sin(i * 2.3) * sp.tg * 1.1, Math.sin(i * .785) * sp.pj * .8, orb);
            b.userData.i = i;
        }
        m.add(orb);
    }
    m.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    m.scale.setScalar(sp.s);
    m.userData.ekor = ekorG;
    m.userData.tik = (t) => { // sirip berkibar halus, aura berdenyut, bintang berputar
        dadaL.forEach((f, i) => (f.rotation.x = f.userData.r0 + Math.sin(t * 7 + i * 2) * .2));
        pungg.scale.y = sp.tg * .9 * (1 + Math.sin(t * 5) * .07);
        if (aura) aura.scale.multiplyScalar(1 + Math.sin(t * 4) * .0015);
        if (orb) { orb.rotation.y = t * 1.6; orb.children.forEach((b) => b.rotation.set(t * 3, t * 2, 0)); }
    };
    return m;
}