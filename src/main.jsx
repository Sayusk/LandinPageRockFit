import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// StrictMode removido: o SDK do Mercado Pago (Bricks) não é compatível com
// double-invocation de effects do StrictMode — causa "Card token service not found".
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
