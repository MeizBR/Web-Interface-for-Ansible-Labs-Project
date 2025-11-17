import React, { useState } from "react";
import "./App.css";

const BACKEND_BASE = "http://ip:port";   // change to your backend
const ANSIBLE_LAB_URL = "http://ip:port";  // change to the real URL you want to open

export default function App() {
  const [status, setStatus] = useState("");
  const [showSshButton, setShowSshButton] = useState(false);
  const [sshUrl, setSshUrl] = useState(ANSIBLE_LAB_URL);
  const [loading, setLoading] = useState(false);

  const launchInfrastructure = async () => {
    setStatus("Launching infrastructure... Please wait ⏳");
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_BASE}/launch`, { method: "POST" });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.status === "finished") {
        setStatus("Infrastructure launched successfully! 🚀");
        // show SSH/button
        setShowSshButton(true);

        // If backend returns a dynamic URL, use it:
        if (data.ssh_url) {
          setSshUrl(data.ssh_url);
        }
      } else if (res.ok) {
        // res.ok but not "finished" — still an error case for us
        setStatus("Launch finished with warnings or partial failure ❗");
      } else {
        setStatus("Error launching infrastructure ❌");
      }
    } catch (err) {
      setStatus("Could not reach backend ❌");
    } finally {
      setLoading(false);
    }
  };

  const destroyInfrastructure = async () => {
    setStatus("Destroying infrastructure... Please wait 🛑⏳");
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_BASE}/destroy`, { method: "POST" });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.status === "finished") {
        setStatus("Infrastructure destroyed successfully! 💥");
        // hide SSH/button after destroy
        setShowSshButton(false);
      } else if (res.ok) {
        setStatus("Destroy finished with warnings or partial failure ❗");
      } else {
        setStatus("Error destroying infrastructure ❌");
      }
    } catch (err) {
      setStatus("Could not reach backend ❌");
    } finally {
      setLoading(false);
    }
  };

  const openSshTab = () => {
    if (!sshUrl) return;
    // open new tab safely
    window.open(sshUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="container">
      <h1 className="title">Meiez KodeKloud</h1>
      <h2 className="subtitle">Ansible Labs</h2>

      <button
        className="button"
        onClick={launchInfrastructure}
        disabled={loading}
      >
        {loading ? "Working..." : "Launch Infrastructure"}
      </button>

      <button
        className="button destroy-btn"
        onClick={destroyInfrastructure}
        style={{ backgroundColor: "#d9534f", marginTop: "10px" }}
        disabled={loading}
      >
        Destroy Infrastructure
      </button>

      {/* SSH button: only visible when showSshButton is true */}
      {showSshButton && (
        <button
          className="button ssh-btn"
          onClick={openSshTab}
          style={{ backgroundColor: "goldenrod", marginTop: "10px" }}
        >
          Access the Ansible lab
        </button>
      )}

      {status && <p className="status">{status}</p>}
    </div>
  );
}
