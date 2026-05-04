import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// SDK do Mercado Pago carregado diretamente no index.html para máxima
// compatibilidade. StrictMode removido: Bricks MP não suportam double-invoke.
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
