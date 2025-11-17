import React, { useState } from "react";
import "./App.css"; // import the CSS file

export default function App() {
  const [status, setStatus] = useState("");
  const [infraLink, setInfraLink] = useState("");

  const launchInfrastructure = async () => {
    setStatus("Launching infrastructure... Please wait ⏳");
    try {
      const res = await fetch("http://YOUR_BACKEND_IP:3000/launch", {
        method: "POST",
      });
      const data = await res.json();

      if (res.ok) {
        setStatus("Infrastructure launched successfully! 🚀");
      } else {
        setStatus("Error launching infrastructure ❌");
      }
    } catch (err) {
      setStatus("Could not reach backend ❌");
    }
  };

  return (
    <div className="container">
      <h1 className="title">Meiez KodeKloud</h1>
      <h2 className="subtitle">Ansible Labs</h2>

      <button className="button" onClick={launchInfrastructure}>
        Launch Infrastructure
      </button>

      {status && <p className="status">{status}</p>}

      {infraLink && (
        <p className="link">
          Your infrastructure link:{" "}
          <a href={infraLink} target="_blank" rel="noreferrer">
            {infraLink}
          </a>
        </p>
      )}
    </div>
  );
}
