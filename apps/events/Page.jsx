import React, { useState } from "react";
import Admin from "../../client/Admin.jsx";
import {
  api,
  useLoad,
  Field,
  Feedback,
  Loading,
  Empty,
  Title,
} from "../../client/ui.jsx";
const interests = [
  "Web Development",
  "Design",
  "AI & Data",
  "Mobile",
  "Cybersecurity",
];
function Attendees() {
  const s = useLoad("/admin/attendees"),
    [q, setQ] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const rows = (s.data || []).filter((r) =>
    (r.name + r.email + r.organization + r.event_title)
      .toLowerCase()
      .includes(q.toLowerCase()),
  );
  return (
    <>
      <div className="section-bar">
        <h2>Attendee register</h2>
        <input
          aria-label="Search attendees"
          className="search"
          placeholder="Search name, email, college or event"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <Feedback error={error} />
      <Loading state={s} />
      <div className="panel table-panel table-scroll">
        <table>
          <thead>
            <tr>
              <th>Participant</th>
              <th>Event & interests</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>
                  <strong>{r.name}</strong>
                  {r.email}
                  <p>{r.organization}</p>
                </td>
                <td>
                  <strong>{r.event_title}</strong>
                  {r.interests.map((i) => (
                    <span className="badge" key={i}>
                      {i}
                    </span>
                  ))}
                </td>
                <td>
                  <span className="badge confirmed">{r.status}</span>
                </td>
                <td>
                  <button
                    className="secondary"
                    disabled={busy}
                    onClick={async () => {
                      setBusy(true);
                      setError("");
                      try {
                        await api(`/admin/attendees/${r.id}`, "PATCH", {
                          status:
                            r.status === "Confirmed"
                              ? "Checked in"
                              : "Confirmed",
                        });
                        await s.reload();
                      } catch (e) {
                        setError(e.message);
                      } finally {
                        setBusy(false);
                      }
                    }}
                  >
                    {r.status === "Confirmed" ? "Check in" : "Undo check-in"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!s.loading && !rows.length && (
        <Empty>No attendees match your search.</Empty>
      )}
    </>
  );
}
export default function Events() {
  const s = useLoad("/events"),
    [tab, setTab] = useState("public"),
    [selected, setSelected] = useState(null),
    [form, setForm] = useState({
      name: "",
      email: "",
      organization: "",
      interests: [],
    }),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [success, setSuccess] = useState("");
  const event = s.data?.find((e) => e.id === selected);
  async function register(e) {
    e.preventDefault();
    if (busy) return;
    setError("");
    setSuccess("");
    if (!form.interests.length) {
      setError("Choose at least one domain interest.");
      return;
    }
    setBusy(true);
    try {
      await api(`/events/${selected}/registrations`, "POST", form);
      setForm({ name: "", email: "", organization: "", interests: [] });
      setSelected(null);
      setSuccess("You are registered! Your place is confirmed.");
      await s.reload();
    } catch (e) {
      setError(e.message);
      await s.reload();
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Title eyebrow="03 / YOUR COMMUNITY" title="Good things happen together.">
        Discover a workshop, meet your people, and take the next step.
      </Title>
      <div className="tabs">
        <button
          className={tab === "public" ? "selected" : ""}
          onClick={() => setTab("public")}
        >
          Explore events
        </button>
        <button
          className={tab === "admin" ? "selected" : ""}
          onClick={() => setTab("admin")}
        >
          Admin dashboard
        </button>
      </div>
      {tab === "admin" ? (
        <Admin>
          <Attendees />
        </Admin>
      ) : (
        <>
          <Feedback error={error} success={success} />
          <Loading state={s} />
          <div
            className="split"
            style={{ gridTemplateColumns: event ? undefined : "1fr" }}
          >
            <div className="event-list">
              {s.data?.map((ev) => (
                <article className="event-card" key={ev.id}>
                  <div className="date-box">
                    <b>
                      {new Date(ev.schedule).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        timeZone: "Asia/Karachi",
                      })}
                    </b>
                    <span>
                      {new Date(ev.schedule).toLocaleDateString("en-GB", {
                        month: "short",
                        timeZone: "Asia/Karachi",
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="eyebrow">CAMPUS / LEARN & CONNECT</span>
                    <h3>{ev.title}</h3>
                    <p>{ev.description}</p>
                    <div className="event-info">
                      <span>
                        {new Date(ev.schedule).toLocaleString("en-GB", {
                          dateStyle: "medium",
                          timeStyle: "short",
                          timeZone: "Asia/Karachi",
                        })}{" "}
                        PKT
                      </span>
                      <span className="badge">
                        {ev.available_places} of {ev.capacity} places left
                      </span>
                      <button
                        className="primary"
                        disabled={busy || ev.available_places === 0}
                        onClick={() => {
                          setSelected(ev.id);
                          setError("");
                        }}
                      >
                        {ev.available_places === 0
                          ? "Fully booked"
                          : "Register now"}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            {event && (
              <section className="panel register-panel">
                <h2>Save your seat</h2>
                <p className="hint">{event.title}</p>
                <form onSubmit={register}>
                  <fieldset disabled={busy}>
                    {[
                      ["name", "Full name"],
                      ["email", "Email"],
                      ["organization", "College or organization"],
                    ].map(([key, label]) => (
                      <Field key={key} label={label}>
                        <input
                          required
                          type={key === "email" ? "email" : "text"}
                          maxLength={key === "email" ? 254 : 120}
                          value={form[key]}
                          onChange={(e) =>
                            setForm({ ...form, [key]: e.target.value })
                          }
                        />
                      </Field>
                    ))}
                    <fieldset>
                      <legend className="hint">
                        Domain interests (choose at least one)
                      </legend>
                      <div className="check-grid">
                        {interests.map((i) => (
                          <label key={i}>
                            <input
                              type="checkbox"
                              checked={form.interests.includes(i)}
                              onChange={(e) =>
                                setForm({
                                  ...form,
                                  interests: e.target.checked
                                    ? [...form.interests, i]
                                    : form.interests.filter((x) => x !== i),
                                })
                              }
                            />
                            {i}
                          </label>
                        ))}
                      </div>
                    </fieldset>
                    <p className="hint">
                      Your contact details are visible only to the event
                      administrator.
                    </p>
                    <button className="primary">
                      {busy ? "Registering…" : "Confirm registration"}
                    </button>
                    <button
                      type="button"
                      className="secondary"
                      onClick={() => setSelected(null)}
                    >
                      Cancel
                    </button>
                  </fieldset>
                </form>
              </section>
            )}
          </div>
          {!s.loading && !s.data?.length && (
            <Empty title="New events are on the way.">
              Check back soon for campus opportunities.
            </Empty>
          )}
        </>
      )}
    </>
  );
}
