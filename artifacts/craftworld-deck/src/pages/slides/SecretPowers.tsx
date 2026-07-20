export default function SecretPowers() {
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
          <div>C:\SYSTEM\CRAFTWORLD\POWERS.HTML</div>
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
            HTTP://WWW.CRAFTWORLD.GAME/POWERS
          </div>
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "row",
            position: "relative",
            overflow: "hidden",
            backgroundImage: "radial-gradient(#000 0.15vw, transparent 0.15vw)",
            backgroundSize: "2vw 2vw",
            padding: "3vw",
            gap: "3vw",
          }}
        >
          <div style={{ flex: 1, backgroundColor: "#000000", border: "0.4vw solid #000000", boxShadow: "0.8vw 0.8vw 0vw #FF3B00", padding: "2.5vw", color: "#FFFFFF", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "1.4vw", fontWeight: "bold", color: "#FF3B00" }}>SECRET NUMBERS HIDDEN PER GAME</div>
            <div style={{ fontSize: "12vw", fontWeight: 900, lineHeight: 1, margin: "1vh 0" }}>90</div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "1.3vw", borderTop: "0.2vw solid #FF3B00", paddingTop: "1.5vh", marginTop: "1vh" }}>
              NUMBERS RE-SCATTER TO NEW HIDING SPOTS EVERY SINGLE-PLAYER GAME
            </div>
          </div>

          <div style={{ flex: 1.2, display: "flex", flexDirection: "column", gap: "2vw", justifyContent: "center" }}>
            <h2 style={{ fontSize: "4.5vw", fontWeight: 900, margin: 0, textTransform: "uppercase", lineHeight: 0.95 }}>
              <span style={{ display: "block" }}>20 SECRET</span>
              <span style={{ display: "block", color: "#FFFFFF", WebkitTextStroke: "0.15vw #000000" }}>POWERS</span>
            </h2>
            <div style={{ backgroundColor: "#FF3B00", border: "0.4vw solid #000000", boxShadow: "0.8vw 0.8vw 0vw #000000", padding: "1.8vw", color: "#FFFFFF" }}>
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "1.4vw", fontWeight: 700, margin: 0, lineHeight: 1.5 }}>
                {">"} Type a found number into the code box to unlock a power. _
              </p>
            </div>
            <div style={{ backgroundColor: "#FFFFFF", border: "0.4vw solid #000000", boxShadow: "0.8vw 0.8vw 0vw #000000", padding: "1.8vw" }}>
              <p style={{ fontSize: "1.5vw", fontWeight: 500, margin: 0, lineHeight: 1.6 }}>
                Super Speed, Super Jump, Titan Strength, Stone Skin, Vampire, Eagle Eye — and 14 more to discover.
              </p>
            </div>
          </div>

          <div style={{ position: "absolute", bottom: "1vw", right: "2vw", fontFamily: "'DM Mono', monospace", fontSize: "1.5vw", fontWeight: "bold", backgroundColor: "#FFFFFF", padding: "0.5vw 1vw", border: "0.2vw solid #000" }}>
            PAGE 04 / 05
          </div>
        </div>
      </div>
    </div>
  );
}
