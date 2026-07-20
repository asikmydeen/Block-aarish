const base = import.meta.env.BASE_URL;

export default function TitleSlide() {
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
          <div>C:\SYSTEM\CRAFTWORLD\INDEX.HTML</div>
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
            HTTP://WWW.CRAFTWORLD.GAME/2026
          </div>
        </div>

        <div
          style={{
            flex: 1,
            position: "relative",
            overflow: "hidden",
            display: "grid",
            gridTemplateColumns: "1fr 2fr 1fr",
            gridTemplateRows: "1fr 1fr",
          }}
        >
          <div
            style={{
              borderRight: "0.3vw solid #000000",
              gridRow: "1 / 3",
              padding: "2vw",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              backgroundColor: "#FFFFFF",
            }}
          >
            <div>
              <div style={{ border: "0.3vw solid #000000", display: "inline-block", padding: "1vw", backgroundColor: "#FF3B00", color: "#FFFFFF", fontWeight: 900, fontSize: "1.8vw", transform: "rotate(-5deg)" }}>
                craftworld
              </div>
            </div>

            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "1vw", lineHeight: 1.5, borderTop: "0.3vw solid #000", paddingTop: "1vh" }}>
              <div style={{ fontWeight: "bold", marginBottom: "1vh" }}>SYSTEM STATUS:</div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>YEAR</span><span>2026</span></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>MODE</span><span>SANDBOX</span></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>BUILD</span><span>LIVE</span></div>
            </div>
          </div>

          <div
            style={{
              gridColumn: "2 / 4",
              gridRow: "1 / 3",
              position: "relative",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "3vw",
            }}
          >
            <img
              src={`${base}hero.png`}
              crossOrigin="anonymous"
              alt="Blocky voxel landscape with trees, water, and snowy mountains"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            />

            <div style={{ backgroundColor: "#FFFFFF", padding: "2.5vw", border: "0.4vw solid #000000", boxShadow: "0.8vw 0.8vw 0vw #000000", position: "relative", zIndex: 10, maxWidth: "42vw" }}>
              <h1
                style={{
                  fontSize: "7.5vw",
                  fontWeight: 900,
                  margin: 0,
                  lineHeight: 0.9,
                  textTransform: "uppercase",
                  letterSpacing: "-0.05em",
                }}
              >
                <span style={{ display: "block" }}>CRAFT</span>
                <span style={{ display: "block", color: "#FFFFFF", WebkitTextStroke: "0.2vw #000000" }}>WORLD</span>
              </h1>

              <div style={{ marginTop: "3vh", backgroundColor: "#FF3B00", padding: "1.2vw", border: "0.2vw solid #000000", color: "#FFFFFF" }}>
                <p
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: "1.4vw",
                    fontWeight: 700,
                    margin: 0,
                    lineHeight: 1.4,
                  }}
                >
                  {">"} A blocky 3D world you can break, build, and explore — made on Replit. _
                </p>
              </div>
            </div>

            <div style={{ position: "absolute", bottom: "2.5vw", right: "6vw", border: "0.3vw solid #000", padding: "0.5vw 2vw", backgroundColor: "#D9D9D9", fontFamily: "'DM Mono', monospace", fontSize: "1.2vw", fontWeight: "bold", transform: "rotate(8deg)", zIndex: 10 }}>
              PRESS PLAY
            </div>

            <div style={{ position: "absolute", right: 0, top: 0, width: "3vw", height: "100%", borderLeft: "0.3vw solid #000", backgroundColor: "#D9D9D9", display: "flex", flexDirection: "column", zIndex: 10 }}>
              <div style={{ height: "3vw", borderBottom: "0.3vw solid #000", display: "flex", justifyContent: "center", alignItems: "center" }}>▲</div>
              <div style={{ flex: 1, padding: "0.3vw" }}>
                <div style={{ width: "100%", height: "20%", backgroundColor: "#000" }} />
              </div>
              <div style={{ height: "3vw", borderTop: "0.3vw solid #000", display: "flex", justifyContent: "center", alignItems: "center" }}>▼</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
