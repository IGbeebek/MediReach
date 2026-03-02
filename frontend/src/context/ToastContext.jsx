import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success", meta = null) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, meta }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = { addToast, dismissToast, toasts };
  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-3 max-w-sm w-full">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`rounded-xl shadow-card-hover animate-fade-up overflow-hidden ${
            t.type === "error"
              ? "bg-soft-red/10 border border-soft-red/30"
              : t.type === "cart"
                ? "bg-white border border-primary/30"
                : "bg-primary/10 border border-primary/30"
          }`}
        >
          {t.type === "cart" && t.meta ? (
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xl">🛒</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-charcoal">Added to Cart!</p>
                  <p className="text-sm text-charcoal/70 truncate mt-0.5">{t.meta.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-charcoal/50">Qty: {t.meta.qty}</span>
                    <span className="text-xs font-medium text-primary">Rs. {(t.meta.price * t.meta.qty).toLocaleString()}</span>
                  </div>
                </div>
                <button type="button" onClick={() => onDismiss(t.id)} className="text-charcoal/40 hover:text-charcoal text-lg leading-none">×</button>
              </div>
              <a
                href="/customer/cart"
                onClick={() => onDismiss(t.id)}
                className="mt-3 block w-full rounded-lg bg-primary py-2 text-center text-xs font-medium text-white hover:bg-primary-dark transition-colors"
              >
                View Cart & Checkout
              </a>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-4 py-3">
              {t.type === "error" ? (
                <span className="text-lg">⚠️</span>
              ) : (
                <span className="text-lg">✓</span>
              )}
              <span className={`font-sans text-sm flex-1 ${t.type === 'error' ? 'text-soft-red' : 'text-primary'}`}>{t.message}</span>
              <button type="button" onClick={() => onDismiss(t.id)} className="text-charcoal/40 hover:text-charcoal text-lg leading-none ml-2">×</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
