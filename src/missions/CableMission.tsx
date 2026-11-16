import { useEffect, useMemo, useState } from 'react';
import { MissionProps } from './types';
import { startDrag } from './dnd';
import { audio } from '../audio/audio';
import { Icon } from '../ui/Icon';

interface Wire {
  id: string;
  name: string;
  color: string;
  striped: boolean;
}

const WIRES: Wire[] = [
  { id: 'wo', name: 'Putih Orange', color: '#f97316', striped: true },
  { id: 'o', name: 'Orange', color: '#f97316', striped: false },
  { id: 'wg', name: 'Putih Hijau', color: '#16a34a', striped: true },
  { id: 'b', name: 'Biru', color: '#2563eb', striped: false },
  { id: 'wb', name: 'Putih Biru', color: '#2563eb', striped: true },
  { id: 'g', name: 'Hijau', color: '#16a34a', striped: false },
  { id: 'wbr', name: 'Putih Cokelat', color: '#92400e', striped: true },
  { id: 'br', name: 'Cokelat', color: '#92400e', striped: false },
];
const T568B = ['wo', 'o', 'wg', 'b', 'wb', 'g', 'wbr', 'br'];
const wireById = (id: string) => WIRES.find((w) => w.id === id)!;

export function wireStyle(w: Wire): React.CSSProperties {
  return {
    background: w.striped ? `repeating-linear-gradient(135deg, #ffffff 0 7px, ${w.color} 7px 12px)` : w.color,
  };
}

function shuffle<T>(a: T[]) {
  const arr = [...a];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  // avoid starting already sorted
  if (arr.join() === T568B.join()) return shuffle(a);
  return arr;
}

type Stage = 'standard' | 'strip' | 'arrange' | 'crimp' | 'done';

export default function CableMission({ api }: MissionProps) {
  const [stage, setStage] = useState<Stage>('standard');
  const [pool, setPool] = useState<string[]>(() => shuffle(T568B));
  const [pins, setPins] = useState<(string | null)[]>(Array(8).fill(null));
  const [selected, setSelected] = useState<string | null>(null);
  const [wrongPins, setWrongPins] = useState<number[]>([]);
  const [wrongInfo, setWrongInfo] = useState<string[]>([]);
  const [stripped, setStripped] = useState(false);
  const [crimpPhase, setCrimpPhase] = useState(0); // 0 idle,1 inserting,2 crimping,3 testing,4 ok
  const [testerLed, setTesterLed] = useState(-1);
  const [showRef, setShowRef] = useState(false);

  const stageIndex = ['standard', 'strip', 'arrange', 'crimp', 'done'].indexOf(stage);
  useEffect(() => {
    const labels = ['Pilih standar pengkabelan', 'Kupas kabel UTP', 'Susun 8 warna kabel ke RJ45', 'Crimping & uji LAN tester', 'Kabel berhasil dibuat'];
    api.progress(stageIndex, 4, labels[stageIndex]);
  }, [stageIndex]);

  const filled = pins.filter(Boolean).length;

  const chooseStandard = (s: 'A' | 'B' | 'X') => {
    if (s === 'B') {
      audio.play('success');
      api.good('Benar! Kabel Straight menggunakan T568B di kedua ujung.');
      setStage('strip');
    } else if (s === 'A') {
      api.mistake('T568A memang standar resmi, tetapi misi ini meminta kabel Straight dengan standar T568B (umum dipakai di Indonesia).');
    } else {
      api.mistake('Crossover (T568A ↔ T568B) dipakai untuk perangkat sejenis. PC ke Switch butuh kabel Straight.');
    }
  };

  const doStrip = () => {
    audio.play('snap');
    setStripped(true);
    setTimeout(() => {
      api.good('Jaket kabel terkupas ±2 cm. Luruskan dan pisahkan 8 inti kabel!');
      setStage('arrange');
    }, 900);
  };

  const placeWire = (wireId: string, pinIdx: number) => {
    setWrongPins([]);
    setWrongInfo([]);
    setPins((prev) => {
      const next = [...prev];
      const fromPin = next.indexOf(wireId);
      const occupant = next[pinIdx];
      if (fromPin >= 0) {
        next[fromPin] = occupant; // swap
      } else if (occupant) {
        setPool((p) => [...p.filter((x) => x !== wireId), occupant]);
      }
      if (fromPin < 0) setPool((p) => p.filter((x) => x !== wireId));
      next[pinIdx] = wireId;
      return next;
    });
    audio.play('snap');
    setSelected(null);
  };

  const returnWire = (wireId: string) => {
    setPins((prev) => prev.map((p) => (p === wireId ? null : p)));
    setPool((p) => (p.includes(wireId) ? p : [...p, wireId]));
    audio.play('drop');
    setSelected(null);
  };

  const onDrop = (drop: string | null, wireId: string) => {
    if (drop === null) return;
    if (drop === 'pool') return returnWire(wireId);
    if (drop.startsWith('pin-')) placeWire(wireId, Number(drop.slice(4)));
  };

  const clickPin = (i: number) => {
    if (selected) placeWire(selected, i);
    else if (pins[i]) {
      setSelected(pins[i]);
      audio.play('pick');
    }
  };

  const check = () => {
    if (filled < 8) {
      audio.play('error');
      api.good(`Masih ada ${8 - filled} pin kosong. Isi semua pin 1–8 terlebih dahulu.`);
      return;
    }
    const wrong: number[] = [];
    const info: string[] = [];
    pins.forEach((p, i) => {
      if (p !== T568B[i]) {
        wrong.push(i);
        info.push(`Pin ${i + 1}: terpasang ${wireById(p!).name}, seharusnya ${wireById(T568B[i]).name}`);
      }
    });
    if (wrong.length) {
      setWrongPins(wrong);
      setWrongInfo(info);
      api.mistake(`${wrong.length} posisi warna belum sesuai standar T568B. Perhatikan pin yang berwarna merah.`);
      return;
    }
    audio.play('success');
    api.good('Urutan sempurna! Masukkan kabel ke konektor dan lakukan crimping.');
    setStage('crimp');
  };

  const crimp = () => {
    setCrimpPhase(1);
    audio.play('pick');
    setTimeout(() => {
      setCrimpPhase(2);
      audio.play('crimp');
      setTimeout(() => audio.play('crimp'), 350);
    }, 900);
    setTimeout(() => {
      setCrimpPhase(3);
      let i = 0;
      const iv = setInterval(() => {
        setTesterLed(i);
        audio.play('beep');
        i++;
        if (i >= 8) {
          clearInterval(iv);
          setTimeout(() => {
            setCrimpPhase(4);
            setTesterLed(8);
            audio.play('success');
            setStage('done');
          }, 500);
        }
      }, 320);
    }, 2100);
  };

  const refList = useMemo(() => T568B.map((id) => wireById(id)), []);

  return (
    <div className="sim cab">
      <div className="sim-steps">
        {['Standar', 'Kupas', 'Susun', 'Crimp & Test'].map((s, i) => (
          <div key={s} className={`sim-step ${i < stageIndex ? 'done' : i === stageIndex ? 'active' : ''}`}>
            <span>{i < stageIndex ? '✓' : i + 1}</span>
            {s}
          </div>
        ))}
      </div>

      {stage === 'standard' && (
        <div className="cab-standard">
          <p className="sim-lead">Pilih standar pengkabelan yang tepat untuk membuat <b>kabel LAN Straight-Through</b> (PC → Switch):</p>
          <div className="choice-cards">
            <button className="choice-card" onClick={() => chooseStandard('A')}>
              <div className="cc-title">T568A</div>
              <div className="mini-wires">{['wg', 'g', 'wo', 'b', 'wb', 'o', 'wbr', 'br'].map((id) => <i key={id} style={wireStyle(wireById(id))} />)}</div>
              <small>Standar TIA/EIA-568A</small>
            </button>
            <button className="choice-card" onClick={() => chooseStandard('B')}>
              <div className="cc-title">T568B</div>
              <div className="mini-wires">{T568B.map((id) => <i key={id} style={wireStyle(wireById(id))} />)}</div>
              <small>Standar TIA/EIA-568B</small>
            </button>
            <button className="choice-card" onClick={() => chooseStandard('X')}>
              <div className="cc-title">Crossover</div>
              <div className="mini-wires half">
                {['wg', 'g', 'wo', 'b'].map((id) => <i key={id} style={wireStyle(wireById(id))} />)}
                <b>⇄</b>
                {['wo', 'o', 'wg', 'b'].map((id) => <i key={id + 'x'} style={wireStyle(wireById(id))} />)}
              </div>
              <small>A di satu ujung, B di ujung lain</small>
            </button>
          </div>
        </div>
      )}

      {stage === 'strip' && (
        <div className="cab-strip">
          <p className="sim-lead">Gunakan <b>cable stripper</b> untuk mengupas jaket luar kabel UTP Cat6.</p>
          <div className={`utp ${stripped ? 'stripped' : ''}`}>
            <div className="utp-jacket">UTP CAT6 • 23AWG • 4 PAIR</div>
            <div className="utp-cut" />
            <div className="utp-wires">
              {WIRES.map((w) => (
                <i key={w.id} style={wireStyle(w)} />
              ))}
            </div>
          </div>
          <button className="btn btn-primary" onClick={doStrip} disabled={stripped}>
            <Icon name="scissors" size={15} /> Kupas Kabel
          </button>
        </div>
      )}

      {(stage === 'arrange' || stage === 'crimp' || stage === 'done') && (
        <div className="cab-workspace">
          <div className="cab-left">
            <div className="cab-panel-title">
              Inti Kabel UTP <small>(seret ke pin RJ45 — atau klik kabel lalu klik pin)</small>
            </div>
            <div className="wire-pool" data-drop="pool">
              {pool.length === 0 && <div className="pool-empty">Semua kabel sudah dipasang</div>}
              {pool.map((id) => {
                const w = wireById(id);
                return (
                  <div
                    key={id}
                    className={`wire-chip ${selected === id ? 'selected' : ''}`}
                    onPointerDown={(e) =>
                      stage === 'arrange' &&
                      startDrag(e, {
                        payload: id,
                        onDrop,
                        onStart: () => audio.play('pick'),
                        onClick: () => {
                          setSelected(selected === id ? null : id);
                          audio.play('pick');
                        },
                      })
                    }
                  >
                    <span className="wire-strand" style={wireStyle(w)} />
                    <span className="wire-name">{w.name}</span>
                  </div>
                );
              })}
            </div>
            <div className="cab-ref">
              <button className="btn btn-ghost btn-sm" onClick={() => setShowRef((s) => !s)}>
                <Icon name="book" size={14} /> {showRef ? 'Tutup' : 'Lihat'} Kartu Referensi T568B
              </button>
              {showRef && (
                <ol className="ref-list">
                  {refList.map((w, i) => (
                    <li key={w.id}>
                      <i style={wireStyle(w)} /> Pin {i + 1} – {w.name}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>

          <div className="cab-right">
            <div className={`rj45 phase-${crimpPhase}`}>
              <div className="rj45-label">KONEKTOR RJ45 (klip menghadap bawah)</div>
              <div className="rj45-body">
                {pins.map((p, i) => {
                  const w = p ? wireById(p) : null;
                  return (
                    <div
                      key={i}
                      data-drop={`pin-${i}`}
                      className={`rj45-pin ${wrongPins.includes(i) ? 'wrong' : ''} ${p ? 'filled' : ''} ${selected && !p ? 'awaiting' : ''}`}
                      onClick={() => stage === 'arrange' && clickPin(i)}
                    >
                      <div className="pin-gold" />
                      {w ? (
                        <div
                          className={`pin-wire ${selected === p ? 'selected' : ''}`}
                          style={wireStyle(w)}
                          title={w.name}
                          onPointerDown={(e) => {
                            if (stage !== 'arrange') return;
                            e.stopPropagation();
                            startDrag(e, { payload: p!, onDrop, onClick: () => clickPin(i), onStart: () => audio.play('pick') });
                          }}
                        />
                      ) : (
                        <div className="pin-empty">?</div>
                      )}
                      <div className="pin-num">{i + 1}</div>
                    </div>
                  );
                })}
              </div>
              <div className="rj45-cable" />
              {crimpPhase >= 1 && crimpPhase <= 2 && (
                <div className={`crimp-tool ${crimpPhase === 2 ? 'press' : ''}`}>
                  <div className="jaw top" />
                  <div className="jaw bottom" />
                  <span>CRIMPING TOOL</span>
                </div>
              )}
            </div>

            {wrongInfo.length > 0 && (
              <div className="feedback-list error">
                <b>Posisi warna yang tidak sesuai:</b>
                <ul>
                  {wrongInfo.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            )}

            {stage === 'arrange' && (
              <div className="row gap">
                <button className="btn btn-ghost" onClick={() => { setPool(shuffle(T568B)); setPins(Array(8).fill(null)); setWrongPins([]); setWrongInfo([]); audio.play('click'); }}>
                  <Icon name="refresh" size={14} /> Reset
                </button>
                <button className="btn btn-primary" onClick={check}>
                  <Icon name="search" size={15} /> Periksa Susunan ({filled}/8)
                </button>
              </div>
            )}

            {stage !== 'arrange' && (
              <div className="tester">
                <div className="tester-unit">
                  <span>MASTER</span>
                  <div className="leds">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <i key={i} className={testerLed >= i ? 'on' : ''}>{i + 1}</i>
                    ))}
                  </div>
                </div>
                <div className={`tester-cable ${crimpPhase >= 3 ? 'live' : ''}`} />
                <div className="tester-unit">
                  <span>REMOTE</span>
                  <div className="leds">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <i key={i} className={testerLed >= i ? 'on' : ''}>{i + 1}</i>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {stage === 'crimp' && crimpPhase === 0 && (
              <button className="btn btn-primary btn-lg pulse" onClick={crimp}>
                <Icon name="wrench" size={16} /> CRIMP RJ45 & UJI LAN TESTER
              </button>
            )}
            {stage === 'crimp' && crimpPhase > 0 && crimpPhase < 4 && (
              <div className="sim-status">{crimpPhase === 1 ? 'Memasukkan kabel ke konektor…' : crimpPhase === 2 ? 'Menjepit konektor RJ45…' : 'LAN tester memeriksa pin 1 → 8…'}</div>
            )}
            {stage === 'done' && (
              <div className="success-card">
                <div className="sc-icon">
                  <Icon name="check" size={34} color="#4ade80" />
                </div>
                <div>
                  <b>Kabel Straight-Through berhasil dibuat!</b>
                  <p>
                    LAN tester menyala berurutan 1→8 pada kedua sisi: kabel <b>Straight</b> karena urutan pin di kedua ujung identik. Kabel ini dipakai untuk
                    menghubungkan perangkat <b>berbeda jenis</b>: PC ↔ Switch, Switch ↔ Router, Router ↔ Modem.
                  </p>
                  <button className="btn btn-success" onClick={() => api.complete()}>
                    Selesaikan Misi <Icon name="arrow-right" size={15} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

