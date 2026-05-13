import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Provider } from "./components/ui/provider.tsx";
import { AuthProvider } from "./context/AuthProvider.tsx";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "./lib/queryClient";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <Provider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </Provider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
