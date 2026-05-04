import ReactDOM from "react-dom/client";
import { initMercadoPago } from "@mercadopago/sdk-react";
import App from "./App";
import "./index.css";

// Inicializa o SDK do Mercado Pago o mais cedo possível para que o script
// externo carregue antes do usuário chegar ao checkout.
// StrictMode removido: Bricks do MP não são compatíveis com double-invocation.
const mpPublicKey = import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY;
if (mpPublicKey) {
  initMercadoPago(mpPublicKey, { locale: "pt-BR" });
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
