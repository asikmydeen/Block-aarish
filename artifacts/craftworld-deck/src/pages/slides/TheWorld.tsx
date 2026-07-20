export default function TheWorld() {
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
          <div>C:\SYSTEM\CRAFTWORLD\WORLD.HTML</div>
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
            HTTP://WWW.CRAFTWORLD.GAME/WORLD
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
          <div style={{ flex: 1, backgroundColor: "#FFFFFF", border: "0.4vw solid #000000", boxShadow: "0.8vw 0.8vw 0vw #000000", padding: "3vw", display: "flex", flexDirection: "column" }}>
            <h2 style={{ fontSize: "5vw", fontWeight: 900, margin: "0 0 2vh 0", textTransform: "uppercase", lineHeight: 1 }}>
              <span style={{ display: "block" }}>THE</span>
              <span style={{ display: "block", color: "#FFFFFF", WebkitTextStroke: "0.15vw #000000" }}>WORLD</span>
            </h2>
            <div style={{ width: "100%", height: "0.4vw", backgroundColor: "#000000", marginBottom: "3vh" }} />
            <p style={{ fontSize: "1.5vw", lineHeight: 1.6, fontWeight: 500, margin: "0 0 2vh 0" }}>
              Endless terrain generated as you walk: hills, trees, water, snow, and ore.
            </p>
            <p style={{ fontSize: "1.5vw", lineHeight: 1.6, fontWeight: 500, margin: 0 }}>
              Break blocks. Place blocks. 7 block types ready in your hotbar.
            </p>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2vw" }}>
            <div style={{ backgroundColor: "#FF3B00", border: "0.4vw solid #000000", boxShadow: "0.8vw 0.8vw 0vw #000000", padding: "2vw", color: "#FFFFFF" }}>
              <h3 style={{ fontFamily: "'DM Mono', monospace", fontSize: "1.8vw", margin: "0 0 1vh 0" }}>{">"} BUILD</h3>
              <p style={{ fontSize: "1.2vw", margin: 0 }}>Houses, roads, and drivable cars scattered across the map.</p>
            </div>
            <div style={{ backgroundColor: "#D9D9D9", border: "0.4vw solid #000000", boxShadow: "0.8vw 0.8vw 0vw #000000", padding: "2vw", color: "#000000" }}>
              <h3 style={{ fontFamily: "'DM Mono', monospace", fontSize: "1.8vw", margin: "0 0 1vh 0" }}>{">"} SURVIVE</h3>
              <p style={{ fontSize: "1.2vw", margin: 0 }}>Zombies roam the world and hunt you down when you get close.</p>
            </div>
            <div style={{ backgroundColor: "#000000", border: "0.4vw solid #000000", boxShadow: "0.8vw 0.8vw 0vw #FF3B00", padding: "2vw", color: "#FFFFFF" }}>
              <h3 style={{ fontFamily: "'DM Mono', monospace", fontSize: "1.8vw", margin: "0 0 1vh 0", color: "#FF3B00" }}>{">"} CONTROL</h3>
              <p style={{ fontSize: "1.2vw", margin: 0 }}>Play with mouse + keyboard or full touch controls on mobile.</p>
            </div>
          </div>

          <div style={{ position: "absolute", bottom: "1vw", right: "2vw", fontFamily: "'DM Mono', monospace", fontSize: "1.5vw", fontWeight: "bold", backgroundColor: "#FFFFFF", padding: "0.5vw 1vw", border: "0.2vw solid #000" }}>
            PAGE 02 / 05
          </div>
        </div>
      </div>
    </div>
  );
}
