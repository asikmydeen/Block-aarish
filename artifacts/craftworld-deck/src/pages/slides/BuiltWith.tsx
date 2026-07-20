export default function BuiltWith() {
  return (
    <div
      className="w-screen h-screen overflow-hidden relative"
      style={{
        backgroundColor: "#D9D9D9",
        color: "#000000",
        fontFamily: "'Space Grotesk', sans-serif",
        boxSizing: "border-box",
        padding: "2vw",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#FFFFFF",
          border: "0.4vw solid #000000",
          boxShadow: "1vw 1vw 0vw #FF3B00",
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        <div
          style={{
            height: "5vh",
            backgroundColor: "#000000",
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            padding: "0 1vw",
            fontFamily: "'DM Mono', monospace",
            fontSize: "1vw",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", gap: "0.5vw" }}>
            <div style={{ width: "1.2vw", height: "1.2vw", backgroundColor: "#FF3B00", borderRadius: "50%", border: "0.1vw solid #FFF" }} />
            <div style={{ width: "1.2vw", height: "1.2vw", backgroundColor: "#D9D9D9", borderRadius: "50%", border: "0.1vw solid #FFF" }} />
            <div style={{ width: "1.2vw", height: "1.2vw", backgroundColor: "#FFFFFF", borderRadius: "50%", border: "0.1vw solid #FFF" }} />
          </div>
          <div>C:\SYSTEM\CRAFTWORLD\TECH.HTML</div>
          <div style={{ fontWeight: "bold" }}>[X]</div>
        </div>

        <div
          style={{
            height: "6vh",
            borderBottom: "0.3vw solid #000000",
            backgroundColor: "#D9D9D9",
            display: "flex",
            alignItems: "center",
            padding: "0 1vw",
            gap: "1vw",
          }}
        >
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "1.2vw", fontWeight: "bold" }}>BACK</div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "1.2vw", fontWeight: "bold" }}>FWD</div>
          <div
            style={{
              flex: 1,
              backgroundColor: "#FFFFFF",
              border: "0.2vw solid #000000",
              height: "3.5vh",
              display: "flex",
              alignItems: "center",
              padding: "0 1vw",
              fontFamily: "'DM Mono', monospace",
              fontSize: "1vw",
            }}
          >
            HTTP://WWW.CRAFTWORLD.GAME/TECH
          </div>
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
            backgroundImage: "radial-gradient(#000 0.15vw, transparent 0.15vw)",
            backgroundSize: "2vw 2vw",
            padding: "3vw",
          }}
        >
          <div style={{ backgroundColor: "#FFFFFF", border: "0.4vw solid #000000", boxShadow: "1vw 1vw 0vw #000000", padding: "3vw 4vw", position: "relative", zIndex: 10, maxWidth: "72%" }}>
            <h2 style={{ fontSize: "6vw", fontWeight: 900, margin: 0, lineHeight: 0.9, textTransform: "uppercase" }}>
              <span>BUILT</span> <span style={{ color: "#FF3B00" }}>WITH.</span>
            </h2>
            <div style={{ width: "100%", height: "0.4vw", backgroundColor: "#000", margin: "2.5vh 0" }} />
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "1.5vw", lineHeight: 1.9, fontWeight: 500 }}>
              <div>{">"} React + Three.js rendering the blocky world in the browser</div>
              <div>{">"} Physics: gravity, jumping, collisions, chunk-based world loading</div>
              <div>{">"} Real-time multiplayer over WebSockets — positions synced 10x per second</div>
              <div style={{ backgroundColor: "#FF3B00", color: "#FFFFFF", display: "inline-block", padding: "0.3vw 1vw", border: "0.2vw solid #000", marginTop: "1.5vh", fontWeight: 700 }}>
                {">"} PUBLISHED LIVE ON REPLIT _
              </div>
            </div>
          </div>

          <div style={{ position: "absolute", top: "8vw", left: "6vw", width: "5vw", height: "5vw", backgroundColor: "#FF3B00", border: "0.3vw solid #000", transform: "rotate(45deg)" }} />
          <div style={{ position: "absolute", bottom: "8vw", right: "6vw", width: "8vw", height: "8vw", borderRadius: "50%", border: "0.4vw dashed #000" }} />

          <div style={{ position: "absolute", bottom: "1vw", right: "2vw", fontFamily: "'DM Mono', monospace", fontSize: "1.5vw", fontWeight: "bold", backgroundColor: "#FFFFFF", padding: "0.5vw 1vw", border: "0.2vw solid #000" }}>
            PAGE 05 / 05
          </div>
        </div>
      </div>
    </div>
  );
}
