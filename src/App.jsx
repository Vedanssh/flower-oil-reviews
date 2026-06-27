import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

// ---- The signature mark: a five-petal blossom used as the rating unit ----
function Blossom({ filled, size = 22, color = "#4C8A66", dim = "#C9DCD0" }) {
  const petals = [0, 72, 144, 216, 288];
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <g transform="translate(20,20)">
        {petals.map((deg) => (
          <ellipse
            key={deg}
            rx="5.6"
            ry="11"
            cx="0"
            cy="-8"
            transform={`rotate(${deg})`}
            fill={filled ? color : "none"}
            stroke={filled ? color : dim}
            strokeWidth="1.6"
          />
        ))}
        <circle r="4" fill={filled ? "#285A40" : dim} />
      </g>
    </svg>
  );
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export default function App() {
  const PAGE_SIZE = 5; // how many reviews to show per "Load more"

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [stats, setStats] = useState({ avg: 0, count: 0 });

  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState("");
  const [consent, setConsent] = useState(true);

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    loadStats();
    loadPage(0, true);
  }, []);

  // Pulls just the ratings of every approved review (a tiny payload) so the
  // average and total count stay correct even though we only show 5 at a time.
  async function loadStats() {
    const { data, error } = await supabase
      .from("reviews")
      .select("rating")
      .eq("approved", true);
    if (!error && data) {
      const count = data.length;
      const avg = count ? data.reduce((a, r) => a + r.rating, 0) / count : 0;
      setStats({ avg, count });
    }
  }

  // Fetches one batch of full reviews using a database range, so only the
  // rows we actually display get downloaded.
  async function loadPage(offset, isFirst = false) {
    if (isFirst) setLoading(true);
    else setLoadingMore(true);
    setLoadError("");

    const { data, error } = await supabase
      .from("reviews")
      .select("id,name,rating,text,created_at")
      .eq("approved", true)
      .order("created_at", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) {
      setLoadError("We couldn't load the reviews just now. Please refresh in a moment.");
    } else if (data) {
      setReviews((prev) => (isFirst ? data : [...prev, ...data]));
    }

    setLoading(false);
    setLoadingMore(false);
  }

  const { avg, count } = stats;
  const hasMore = reviews.length < count;

  async function submit() {
    setError("");
    if (!name.trim()) return setError("Please add your name so we know who to thank.");
    if (!rating) return setError("Tap the blossoms to leave a rating.");
    if (text.trim().length < 4)
      return setError("Tell us a little about the oil — even one line helps.");

    setSaving(true);
    // We never send `approved` — the database defaults it to false,
    // so every review waits for approval before it shows up.
    const { error } = await supabase.from("reviews").insert({
      name: consent ? name.trim() : "A happy customer",
      rating,
      text: text.trim(),
    });
    setSaving(false);

    if (error) {
      setError("Could not save just now. Please try again in a moment.");
      return;
    }

    setName("");
    setRating(0);
    setText("");
    setConsent(true);
    setDone(true);
  }

  return (
    <div className="rw">
      <div className="rw-wrap">
        <div className="rw-masthead">
          <img
            className="rw-logo"
            src="/logo.png"
            alt="Swasthyya Manthan — Wellness & self care"
          />
        </div>

        <h1 className="rw-title">Kkeshavi Elixir</h1>
        <p className="rw-sub">
          Nature's Treasures pressed into oil — made at home by two pairs of careful hands. If you've tried a
          bottle, we'd love to hear how it felt. Your note helps the next person choose.
        </p>
        <div className="rw-headdivider" />

        <div className="rw-summary">
          <div className="rw-avg">{count ? avg.toFixed(1) : "—"}</div>
          <div>
            <div style={{ display: "flex", gap: 3 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <Blossom key={n} filled={n <= Math.round(avg)} size={18} />
              ))}
            </div>
            <div style={{ fontSize: 13, color: "#7c9082", marginTop: 4 }}>
              {count
                ? `${count} review${count > 1 ? "s" : ""} from friends and family`
                : "Be the first to share a review"}
            </div>
          </div>
        </div>

        {done ? (
          <div className="rw-card rw-thanks">
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
              <Blossom filled size={34} />
            </div>
            <h3 className="rw-thanks-title">Thank you 🌼</h3>
            <p className="rw-thanks-text">
              Your review has been sent. It will appear on the wall once it's approved.
            </p>
            <button className="rw-btn" onClick={() => setDone(false)}>
              Write another
            </button>
          </div>
        ) : (
          <div className="rw-card">
            <label className="rw-label">Your name</label>
            <input
              className="rw-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Meera Patel"
            />

            <label className="rw-label" style={{ marginTop: 18 }}>
              Your rating
            </label>
            <div className="rw-stars" onMouseLeave={() => setHover(0)}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHover(n)}
                  aria-label={`${n} blossom${n > 1 ? "s" : ""}`}
                >
                  <Blossom filled={n <= (hover || rating)} size={30} />
                </button>
              ))}
            </div>

            <label className="rw-label" style={{ marginTop: 18 }}>
              Your review
            </label>
            <textarea
              className="rw-textarea"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What did you use it for, and how did it feel?"
            />

            <label className="rw-consent">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
              />
              Show my name with the review
            </label>

            {error && <div className="rw-err">{error}</div>}

            <div style={{ marginTop: 18 }}>
              <button className="rw-btn" onClick={submit} disabled={saving}>
                {saving ? "Sharing…" : "Share my review"}
              </button>
            </div>
          </div>
        )}

        <h2 className="rw-section">What people are saying</h2>
        <div className="rw-divider" />

        {loading ? (
          <div className="rw-empty">Gathering the reviews…</div>
        ) : loadError ? (
          <div className="rw-empty">{loadError}</div>
        ) : reviews.length === 0 ? (
          <div className="rw-empty">No reviews yet — Be the first to share your thoughts. 🌼</div>
        ) : (
          reviews.map((r) => (
            <div className="rw-review" key={r.id}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <span className="rw-rname">{r.name}</span>
                <span className="rw-rdate">{formatDate(r.created_at)}</span>
              </div>
              <div style={{ display: "flex", gap: 2, marginTop: 6 }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <Blossom key={n} filled={n <= r.rating} size={15} />
                ))}
              </div>
              <p className="rw-rtext">{r.text}</p>
            </div>
          ))
        )}

        {!loading && !loadError && hasMore && (
          <div className="rw-loadmore">
            <button
              className="rw-btn-ghost"
              onClick={() => loadPage(reviews.length)}
              disabled={loadingMore}
            >
              {loadingMore ? "Loading…" : `Load more reviews (${count - reviews.length} more)`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}