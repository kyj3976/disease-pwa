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
  console.log("🧠 App loaded");

  const [data, setData] = useState(() => {
    const saved = localStorage.getItem("diseaseData");
    return saved ? JSON.parse(saved) : defaultData;
  });

  const [newDisease, setNewDisease] = useState("");
  const [newSymptoms, setNewSymptoms] = useState("");
  const [item, setItem] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [editDisease, setEditDisease] = useState(null);
  const [expandedDiseases, setExpandedDiseases] = useState([]);
  const [view, setView] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [visibleView, setVisibleView] = useState("home");
  const [fade, setFade] = useState(false);
  const [quizFade, setQuizFade] = useState(false);

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

  const startQuiz = () => {
    setQuizFade(true);
    setTimeout(() => {
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
      setQuizFade(false);
    }, 300);
  };

  const addOrUpdateDisease = () => {
    if (!newDisease || !newSymptoms) return;
    const symptoms = newSymptoms.split(",").map(s => s.trim()).filter(Boolean);
    setData(prev => ({ ...prev, [newDisease]: symptoms }));
    setNewDisease("");
    setNewSymptoms("");
    setEditDisease(null);
  };

  const handleEdit = (disease) => {
    setNewDisease(disease);
    setNewSymptoms(data[disease].join(", "));
    setEditDisease(disease);
    changeView("edit");
    setMenuOpen(false);
  };

  const handleDelete = (disease) => {
    const newData = { ...data };
    delete newData[disease];
    setData(newData);
  };

  const toggleExpand = (disease) => {
    setExpandedDiseases(prev =>
      prev.includes(disease) ? prev.filter(d => d !== disease) : [...prev, disease]
    );
  };

  const navMenu = () => {
    const menuItems = [
      { label: "📋 보기", target: "view" },
      { label: "➕ 추가/수정", target: "edit" },
    ].filter(item => item.target !== view);

    return (
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2rem" }}>
        <button onClick={() => changeView("home")} style={{ padding: "3rem 6rem", fontSize: "32px" }}>🏠 홈</button>
        <div style={{ position: "relative" }}>
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ padding: "3rem 6rem", fontSize: "32px" }}>📂 메뉴</button>
          {menuOpen && (
            <div style={{ position: "absolute", right: 0, marginTop: "1rem", background: "white", border: "1px solid #ccc", borderRadius: "8px", boxShadow: "0 4px 10px rgba(0,0,0,0.2)" }}>
              {menuItems.map(({ label, target }) => (
                <button
                  key={target}
                  onClick={() => {
                    changeView(target);
                    setMenuOpen(false);
                  }}
                  style={{ display: "block", width: "100%", padding: "3rem 6rem", border: "none", background: "none", textAlign: "left", fontSize: "32px", cursor: "pointer" }}
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
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto", fontFamily: "sans-serif", color: "#333" }}>
      <h1 style={{ fontSize: "32px", fontWeight: "bold", textAlign: "center", marginBottom: "2rem" }}>🩺 질병-증상 암기장</h1>

      {navMenu()}

      <div style={{ opacity: fade ? 0 : 1, transition: "opacity 0.5s ease-in-out" }}>
        {visibleView === "home" && (
          <div style={{ textAlign: "center" }}>
            <button onClick={startQuiz} style={{ padding: "3rem 6rem", fontSize: "32px", borderRadius: "16px", background: "#007bff", color: "white", border: "none" }}>🎲 랜덤 카드 뽑기</button>
            {item && (
              <div style={{ marginTop: "2rem", border: "1px solid #ccc", padding: "2rem", borderRadius: "8px", backgroundColor: "#f9f9f9", minHeight: "60vh" }}>
                <p style={{ fontSize: "24px", fontWeight: "bold", opacity: quizFade ? 0 : 1, transition: "opacity 0.3s ease-in-out" }}>{item.type}: {item.question}</p>
                {revealed ? (
                  <ul style={{ marginTop: "1rem", paddingLeft: "1rem", fontSize: "20px" }}>
                    {Array.isArray(item.answer) ? (
                      item.answer.map((ans, idx) => (
                        <li key={idx}>{ans}</li>
                      ))
                    ) : (
                      <li>{item.answer}</li>
                    )}
                  </ul>
                ) : (
                  <button onClick={() => setRevealed(true)} style={{ marginTop: "1rem", padding: "1.5rem 3rem", fontSize: "24px" }}>정답 보기</button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
