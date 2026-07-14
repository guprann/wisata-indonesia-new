'use client';

import { useEffect, useRef, useState } from 'react';
import { api, safeImg, formatNumber, formatRupiah, PLACEHOLDER } from '@/lib/api';

const SUGGESTIONS = [
  'Berapa harga tiket masuknya?',
  'Ratingnya berapa dan apakah worth dikunjungi?',
  'Di mana lokasinya?',
  'Ada fasilitas apa saja?',
  'Seberapa ramai tempat ini?',
];

// Render teks sederhana: **tebal** -> <strong>, sisanya apa adanya (aman dari XSS)
function renderRich(text) {
  return String(text)
    .split(/(\*\*[^*]+\*\*)/g)
    .filter(Boolean)
    .map((part, i) => {
      const m = part.match(/^\*\*([^*]+)\*\*$/);
      return m ? <strong key={i}>{m[1]}</strong> : <span key={i}>{part}</span>;
    });
}

function AiChat({ item }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  // Reset percakapan saat destinasi berganti
  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: `Halo! 👋 Saya asisten AI untuk ${item?.nama || 'destinasi ini'}. Tanyakan apa saja seputar tempat ini — harga tiket, rating, lokasi, fasilitas, dan lainnya.`,
      },
    ]);
    setInput('');
    setLoading(false);
  }, [item?.id, item?.nama]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  async function send(text) {
    const question = (text ?? input).trim();
    if (!question || loading) return;

    const history = messages.filter((m) => m.role === 'user' || m.role === 'assistant');
    const nextMessages = [...messages, { role: 'user', content: question }];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await api.ask(item.id, question, history);
      setMessages((prev) => [...prev, { role: 'assistant', content: res.answer, source: res.source }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Maaf, terjadi kendala: ${err.message}. Coba lagi ya.`, error: true },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ai-chat">
      <div className="ai-messages" ref={scrollRef}>
        {messages.map((m, i) => (
          <div key={i} className={`ai-msg ${m.role}`}>
            {m.role === 'assistant' && <span className="ai-avatar">🤖</span>}
            <div className={`ai-bubble ${m.error ? 'error' : ''}`}>{renderRich(m.content)}</div>
          </div>
        ))}
        {loading && (
          <div className="ai-msg assistant">
            <span className="ai-avatar">🤖</span>
            <div className="ai-bubble ai-typing">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
      </div>

      {messages.length <= 1 && (
        <div className="ai-suggestions">
          {SUGGESTIONS.map((s) => (
            <button key={s} type="button" className="ai-chip" onClick={() => send(s)} disabled={loading}>
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        className="ai-input-row"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <input
          type="text"
          className="ai-input"
          placeholder={`Tanya tentang ${item?.nama || 'destinasi ini'}...`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          maxLength={500}
        />
        <button type="submit" className="ai-send" disabled={loading || !input.trim()}>
          {loading ? '…' : '➤'}
        </button>
      </form>
    </div>
  );
}

export default function DetailModal({ item, open, onClose, onEdit, onShowMap }) {
  const [tab, setTab] = useState('info');

  useEffect(() => {
    if (open) setTab('info');
  }, [open, item?.id]);

  if (!item) return null;
  return (
    <div className={`modal-overlay ${open ? 'open' : ''}`} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal detail-modal">
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>
        <div className="modal-body">
          <div className="detail-hero">
            <img
              key={item.gambar}
              src={safeImg(item.gambar)}
              alt={item.nama}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = PLACEHOLDER;
              }}
            />
            <div className="detail-hero-text">
              <h2>{item.nama}</h2>
              <p>
                📍 {item.provinsi || '-'} · {item.kategori || '-'}
              </p>
            </div>
          </div>

          <div className="detail-tabs">
            <button className={`detail-tab ${tab === 'info' ? 'active' : ''}`} onClick={() => setTab('info')}>
              📋 Informasi
            </button>
            <button className={`detail-tab ${tab === 'ai' ? 'active' : ''}`} onClick={() => setTab('ai')}>
              🤖 Tanya AI
            </button>
          </div>

          <div className="detail-content">
            {tab === 'info' ? (
              <>
                <div className="detail-grid">
                  <div className="detail-box">
                    <div className="d-icon">⭐</div>
                    <div className="d-val">{item.rating ?? '-'}</div>
                    <div className="d-lbl">Rating</div>
                  </div>
                  <div className="detail-box">
                    <div className="d-icon">🎟️</div>
                    <div className="d-val">{formatRupiah(item.hargaTiket)}</div>
                    <div className="d-lbl">Tiket Masuk</div>
                  </div>
                  <div className="detail-box">
                    <div className="d-icon">👥</div>
                    <div className="d-val">
                      {item.pengunjungPerBulan ? formatNumber(item.pengunjungPerBulan) : '-'}
                    </div>
                    <div className="d-lbl">Pengunjung/bln</div>
                  </div>
                  <div className="detail-box">
                    <div className="d-icon">🧭</div>
                    <div className="d-val">
                      {item.latitude ?? '-'}, {item.longitude ?? '-'}
                    </div>
                    <div className="d-lbl">Koordinat</div>
                  </div>
                </div>
                {item.fasilitas && item.fasilitas.length > 0 && (
                  <div className="detail-fasilitas">
                    <h4>🏖️ Fasilitas Utama</h4>
                    <div className="fasilitas-tags">
                      {item.fasilitas.map((f, i) => (
                        <span className="f-tag" key={i}>
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="form-actions">
                  <button className="btn btn-outline" onClick={() => onShowMap(item)}>
                    🗺️ Lihat di Peta
                  </button>
                  <button className="btn btn-primary" onClick={() => onEdit(item.id)}>
                    ✏️ Edit Wisata
                  </button>
                </div>
              </>
            ) : (
              <AiChat item={item} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
