export default function WaysToPlay() {
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
          <div>C:\SYSTEM\CRAFTWORLD\MODES.HTML</div>
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
            HTTP://WWW.CRAFTWORLD.GAME/MODES
          </div>
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            position: "relative",
            overflow: "hidden",
            backgroundImage: "radial-gradient(#000 0.15vw, transparent 0.15vw)",
            backgroundSize: "2vw 2vw",
            padding: "3vw",
            gap: "2vw",
          }}
        >
          <h2 style={{ fontSize: "5vw", fontWeight: 900, margin: 0, lineHeight: 0.9, textTransform: "uppercase", backgroundColor: "#FF3B00", color: "#FFFFFF", padding: "1vw 2vw", border: "0.4vw solid #000000", boxShadow: "0.6vw 0.6vw 0vw #000000", alignSelf: "flex-start" }}>
            THREE WAYS TO PLAY
          </h2>

          <div style={{ flex: 1, display: "flex", gap: "2.5vw", marginTop: "2vh" }}>
            <div style={{ flex: 1, backgroundColor: "#FF3B00", border: "0.4vw solid #000000", boxShadow: "0.8vw 0.8vw 0vw #000000", padding: "2vw", color: "#FFFFFF", display: "flex", flexDirection: "column" }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "1.2vw", fontWeight: "bold", marginBottom: "1vh" }}>MODE_01</div>
              <h3 style={{ fontSize: "2.4vw", fontWeight: 900, margin: "0 0 2vh 0", textTransform: "uppercase", lineHeight: 1 }}>COLLECT NUMBERS</h3>
              <div style={{ width: "100%", height: "0.3vw", backgroundColor: "#FFFFFF", marginBottom: "2vh" }} />
              <p style={{ fontSize: "1.4vw", lineHeight: 1.5, margin: 0 }}>
                Hunt glowing secret numbers hidden across the world — even inside houses.
              </p>
            </div>
            <div style={{ flex: 1, backgroundColor: "#D9D9D9", border: "0.4vw solid #000000", boxShadow: "0.8vw 0.8vw 0vw #000000", padding: "2vw", color: "#000000", display: "flex", flexDirection: "column" }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "1.2vw", fontWeight: "bold", marginBottom: "1vh" }}>MODE_02</div>
              <h3 style={{ fontSize: "2.4vw", fontWeight: 900, margin: "0 0 2vh 0", textTransform: "uppercase", lineHeight: 1 }}>FREE PLAY</h3>
              <div style={{ width: "100%", height: "0.3vw", backgroundColor: "#000000", marginBottom: "2vh" }} />
              <p style={{ fontSize: "1.4vw", lineHeight: 1.5, margin: 0 }}>
                Pure building and exploring. No numbers, no powers — just you and the blocks.
              </p>
            </div>
            <div style={{ flex: 1, backgroundColor: "#000000", border: "0.4vw solid #000000", boxShadow: "0.8vw 0.8vw 0vw #FF3B00", padding: "2vw", color: "#FFFFFF", display: "flex", flexDirection: "column" }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "1.2vw", fontWeight: "bold", marginBottom: "1vh", color: "#FF3B00" }}>MODE_03</div>
              <h3 style={{ fontSize: "2.4vw", fontWeight: 900, margin: "0 0 2vh 0", textTransform: "uppercase", lineHeight: 1 }}>MULTIPLAYER</h3>
              <div style={{ width: "100%", height: "0.3vw", backgroundColor: "#FF3B00", marginBottom: "2vh" }} />
              <p style={{ fontSize: "1.4vw", lineHeight: 1.5, margin: 0 }}>
                A shared world where you see other players walking around in real time.
              </p>
            </div>
          </div>

          <div style={{ position: "absolute", bottom: "1vw", right: "2vw", fontFamily: "'DM Mono', monospace", fontSize: "1.5vw", fontWeight: "bold", backgroundColor: "#FFFFFF", padding: "0.5vw 1vw", border: "0.2vw solid #000" }}>
            PAGE 03 / 05
          </div>
        </div>
      </div>
    </div>
  );
}
