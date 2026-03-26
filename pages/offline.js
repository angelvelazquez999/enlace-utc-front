export default function OfflinePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <section style={{ maxWidth: "36rem" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>
          Sin conexión
        </h1>
        <p style={{ marginBottom: "1rem", lineHeight: 1.6 }}>
          No hay conexión a Internet en este momento. Puedes intentar de nuevo
          cuando recuperes señal.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{
            background: "#0b1020",
            color: "#fff",
            border: "none",
            borderRadius: "0.5rem",
            padding: "0.75rem 1rem",
            cursor: "pointer",
          }}
        >
          Reintentar
        </button>
      </section>
    </main>
  );
}
