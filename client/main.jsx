import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { api, Feedback } from "./ui.jsx";
import Notes from "../apps/notes/Page.jsx";
import Expenses from "../apps/expenses/Page.jsx";
import Events from "../apps/events/Page.jsx";
import Showcase from "../apps/showcase/Page.jsx";
import "./styles.css";
const catalog = [
  {
    id: "notes",
    symbol: "✎",
    title: "Notes",
    tag: "CAPTURE & ORGANIZE",
    description:
      "A home for your ideas. Write, find and refine your everyday notes.",
    color: "sage",
  },
  {
    id: "expenses",
    symbol: "↗",
    title: "Expense Tracker",
    tag: "TRACK & UNDERSTAND",
    description: "Know what comes in, what goes out and where you stand.",
    color: "peach",
  },
  {
    id: "events",
    symbol: "▦",
    title: "Campus Events",
    tag: "DISCOVER & CONNECT",
    description:
      "Find your next opportunity. Save a seat and meet your community.",
    color: "lavender",
  },
  {
    id: "showcase",
    symbol: "✧",
    title: "Project Showcase",
    tag: "BUILD & INSPIRE",
    description:
      "Explore student work and put your own ideas in the spotlight.",
    color: "blue",
  },
];
function App() {
  const [page, setPage] = useState(location.hash.slice(1) || "home"),
    [enabled, setEnabled] = useState([]),
    [error, setError] = useState("");
  useEffect(() => {
    const onHash = () => setPage(location.hash.slice(1) || "home");
    addEventListener("hashchange", onHash);
    api("/config")
      .then((c) => setEnabled(c.modules))
      .catch((e) => setError(e.message));
    return () => removeEventListener("hashchange", onHash);
  }, []);
  const available = catalog.filter((a) => enabled.includes(a.id));
  const chosen = page === "home" ? null : available.find((a) => a.id === page);
  return (
    <div className="layout">
      <aside className="sidebar">
        <a className="brand" href="#home">
          <span className="brand-mark">
            f<span>↗</span>
          </span>
          <span>
            full stack<span className="brand-period">.</span>
          </span>
        </a>
        <p className="sidebar-label">YOUR WORKSPACE</p>
        <nav>
          <a className={page === "home" ? "active" : ""} href="#home">
            <span>⌂</span> Dashboard
          </a>
          {available.map((a) => (
            <a
              key={a.id}
              className={page === a.id ? "active" : ""}
              href={"#" + a.id}
            >
              <span>{a.symbol}</span>
              {a.title}
            </a>
          ))}
        </nav>
        <div className="sidebar-foot">
          <div className="avatar">CN</div>
          <div>
            <b>CodeNova Internship</b>
            <small>Full Stack Development · Batch 01</small>
          </div>
        </div>
      </aside>
      <main>
        <header>
          <span>
            WORKSPACE <span className="slash">/</span>{" "}
            {chosen?.title || "Overview"}
          </span>
          <span className="batch">
            <i /> BATCH 01 <span>·</span> 2026
          </span>
        </header>
        <Feedback error={error} />
        {page === "home" ? (
          <>
            <section className="hero">
              <div>
                <p className="eyebrow">
                  A LITTLE MORE ORGANIZED. A LOT MORE POSSIBLE.
                </p>
                <h1>
                  Your ideas.
                  <br />
                  Your progress.
                  <br />
                  <em>One workspace.</em>
                </h1>
                <p className="hero-copy">
                  From a thought in your notebook to your next big project.
                  <br />
                  Everything you need to keep moving forward.
                </p>
                <a className="primary inline" href="#applications">
                  Explore your apps <span>↗</span>
                </a>
              </div>
              <div className="hero-art" aria-hidden="true">
                <div className="orbit orbit-one" />
                <div className="orbit orbit-two" />
                <div className="art-card art-note">
                  <span>✎</span>
                  <b>A good idea starts here.</b>
                  <i />
                  <i />
                  <i />
                </div>
                <div className="art-card art-chart">
                  <span>SMALL STEPS, REAL PROGRESS</span>
                  <div className="bars">
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                  </div>
                  <b>Keep building. ↗</b>
                </div>
                <span className="art-spark">✳</span>
              </div>
            </section>
            <section id="applications">
              <div className="section-bar">
                <div>
                  <p className="eyebrow">BUILT FOR YOUR EVERYDAY</p>
                  <h2>Four ways to move forward.</h2>
                </div>
                <span className="muted">
                  {available.length} connected applications
                </span>
              </div>
              <div className="app-grid">
                {available.map((a, i) => (
                  <article className={"app-card " + a.color} key={a.id}>
                    <div className="app-card-top">
                      <span className="app-symbol">{a.symbol}</span>
                      <span className="app-number">0{i + 1}</span>
                    </div>
                    <p className="eyebrow">{a.tag}</p>
                    <h3>{a.title}</h3>
                    <p>{a.description}</p>
                    <a className="app-link" href={"#" + a.id}>
                      Open App <span>↗</span>
                    </a>
                  </article>
                ))}
              </div>
            </section>
            <div className="home-bottom">
              <span className="small-icon">◈</span>
              <div>
                <b>Built with care. Made to work.</b>
                <p>Four full-stack applications. One connected experience.</p>
              </div>
              <span className="tech-label">
                REACT <span>·</span> EXPRESS <span>·</span> SQLITE
              </span>
            </div>
          </>
        ) : page === "applications" ? (
          <>
            <h1>Your applications</h1>
            {available.map((a) => (
              <p key={a.id}>
                <a href={"#" + a.id}>Open {a.title} ↗</a>
              </p>
            ))}
          </>
        ) : chosen ? (
          page === "expenses" ? (
            <Expenses />
          ) : page === "events" ? (
            <Events />
          ) : page === "showcase" ? (
            <Showcase />
          ) : (
            <Notes />
          )
        ) : (
          <div className="empty">
            <h2>App unavailable</h2>
            <a href="#home">Back to dashboard</a>
          </div>
        )}
        <footer>
          <span>Designed for learning. Built for real life.</span>
          <span>CodeNova / Full Stack Development</span>
        </footer>
      </main>
    </div>
  );
}
createRoot(document.getElementById("root")).render(<App />);
