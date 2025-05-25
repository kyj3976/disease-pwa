import { useState, useEffect } from "react";

const defaultData = {
  "Pnuemonic manheimiosis": [
    "manheimia hemolytica",
    "급성",
    "상부호흡기 병변",
    "응고성 괴사",
    "하부호흡기 병변",
    "Fibrinous bronchopneumonia",
  ],
  "Hemorrhagic septicemia": [
    "Pasteurella multocida",
    "septicemic pneumonia",
    "하부호흡기 병변",
    "전신",
    "흡인 감염",
    "소화기 감염",
  ],
  "Respiratory Histophilosis": [
    "Histophilosis somni",
    "Bronhopneumonia",
    "전신",
    "흡인 감염",
  ],
};

const invertData = (data) => {
  const result = {};
  Object.entries(data).forEach(([disease, symptoms]) => {
    symptoms.forEach((symptom) => {
      if (!result[symptom]) result[symptom] = [];
      if (!result[symptom].includes(disease)) {
        result[symptom].push(disease);
      }
    });
  });
  return result;
};

function App() {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem("diseaseData");
    return saved ? JSON.parse(saved) : defaultData;
  });

  const [item, setItem] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [fade, setFade] = useState(false);
  const [quizFade, setQuizFade] = useState(false);
  const [view, setView] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [visibleView, setVisibleView] = useState("home");

  useEffect(() => {
    localStorage.setItem("diseaseData", JSON.stringify(data));
  }, [data]);

  const changeView = (newView) => {
    setFade(true);
    setTimeout(() => {
      setVisibleView(newView);
      setFade(false);
    }, 500);
    setView(newView);
  };

  // 문제 출제 함수
  const nextQuiz = () => {
    if (!revealed) {
      // 정답이 안 보여진 상태면 정답 표시
      setRevealed(true);
    } else {
      // 정답이 이미 보여진 상태면 다음 문제 출제
      const inverted = invertData(data);
      const mode = Math.random() < 0.5 ? "disease" : "symptom";

      if (mode === "disease") {
        const diseases = Object.keys(data);
        const randomDisease = diseases[Math.floor(Math.random() * diseases.length)];
        setItem({ type: "질병", question: randomDisease, answer: data[randomDisease] });
      } else {
        const symptoms = Object.keys(inverted);
        const randomSymptom = symptoms[Math.floor(Math.random() * symptoms.length)];
        setItem({ type: "증상", question: randomSymptom, answer: inverted[randomSymptom] });
      }
      setRevealed(false);
    }
  };

  // 앱 시작 시 첫 문제 자동 출제
  useEffect(() => {
    nextQuiz();
  }, []);

  const navMenu = () => {
    const menuItems = [
      { label: "📋 보기", target: "view" },
      { label: "➕ 추가/수정", target: "edit" },
    ].filter(item => item.target !== view);

    return (
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2rem" }}>
        <button
          onClick={() => changeView("home")}
          style={{ padding: "1rem 2rem", fontSize: "20px" }}
        >
          🏠 홈
        </button>
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ padding: "1rem 2rem", fontSize: "20px" }}
          >
            📂 메뉴
          </button>
          {menuOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                marginTop: "1rem",
                background: "white",
                border: "1px solid #ccc",
                borderRadius: "8px",
                boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                zIndex: 100,
              }}
            >
              {menuItems.map(({ label, target }) => (
                <button
                  key={target}
                  onClick={() => {
                    changeView(target);
                    setMenuOpen(false);
                  }}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "1rem 2rem",
                    border: "none",
                    background: "none",
                    textAlign: "left",
                    fontSize: "20px",
                    cursor: "pointer",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        padding: "1rem",
        maxWidth: "800px",
        margin: "0 auto",
        fontFamily: "sans-serif",
        color: "#333",
      }}
    >
      <h1
        style={{
          fontSize: "28px",
          fontWeight: "bold",
          textAlign: "center",
          marginBottom: "1rem",
        }}
      >
        🩺 질병-증상 암기장
      </h1>

      {navMenu()}

      <div
        style={{
          opacity: fade ? 0 : 1,
          transition: "opacity 0.5s ease-in-out",
        }}
      >
        {visibleView === "home" && item && (
          <div
            onClick={nextQuiz} // 카드 클릭 시 정답 보이거나 다음 문제로 넘어감
            style={{
              marginTop: "1rem",
              border: "1px solid #ccc",
              padding: "1rem",
              borderRadius: "8px",
              backgroundColor: "#f9f9f9",
              minHeight: "40vh",
              maxHeight: "60vh",
              overflowY: "auto",
              cursor: "pointer",
              userSelect: "none",
            }}
            title="터치하면 정답 표시 및 다음 문제로 넘어갑니다"
          >
            <p
              style={{
                fontSize: "22px",
                fontWeight: "bold",
                opacity: quizFade ? 0 : 1,
                transition: "opacity 0.3s ease-in-out",
                marginBottom: "1rem",
              }}
            >
              {item.type}: {item.question}
            </p>
            {revealed && (
              <ul style={{ paddingLeft: "1rem", fontSize: "18px" }}>
                {Array.isArray(item.answer) ? (
                  item.answer.map((ans, idx) => <li key={idx}>{ans}</li>)
                ) : (
                  <li>{item.answer}</li>
                )}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
