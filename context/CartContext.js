"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const CartContext = createContext();

// How long to wait after the last cart change before writing it to the
// server. A burst of clicks becomes a single request.
const SAVE_DEBOUNCE_MS = 400;

// localStorage can throw (private mode, disabled storage) and can hold
// corrupt JSON, so every access is defensive.
function readGuestCart() {
  try {
    const raw = localStorage.getItem("guestCart");
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeGuestCart(items) {
  try {
    localStorage.setItem("guestCart", JSON.stringify(items));
  } catch {
    /* storage unavailable: cart stays in memory for this session */
  }
}

function normaliseServerCart(data) {
  return (data.cart?.cartItem || [])
    // product is populated; skip rows whose product was deleted.
    .filter((item) => item.product)
    .map((item) => ({
      _id: String(item.product._id),
      title: item.product.title,
      price: item.product.price,
      image: item.product.image,
      quantity: item.quantity,
    }));
}

/**
 * `initialUser` comes from the root layout, which reads the auth cookie on
 * the server. That removes a full network round trip from every page load:
 * the cart fetch can start immediately instead of waiting for /api/current-user.
 */
export function CartProvider({ children, initialUser = null }) {
  const [cartItem, setCartItem] = useState([]);
  const [user, setUser] = useState(initialUser);
  // Guards the save-effect so we never write back a cart we just read,
  // and never persist the initial empty state over a real saved cart.
  const hydrated = useRef(false);
  const saveTimer = useRef(null);

  // Still available for the login form, which needs to refresh the user
  // without a full page reload.
  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/current-user");
      if (!res.ok) {
        setUser(null);
        return;
      }
      const data = await res.json();
      setUser(data.user);
    } catch {
      setUser(null);
    }
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/logout", { method: "POST" });
    setUser(null);
    hydrated.current = false;
    setCartItem([]);
  }, []);

  // Load the cart whenever the signed-in user changes: merge any guest cart
  // into the server cart first, then read back the authoritative version.
  useEffect(() => {
    let cancelled = false;

    const loadCart = async () => {
      hydrated.current = false;

      if (!user) {
        setCartItem(readGuestCart());
        hydrated.current = true;
        return;
      }

      try {
        const guestCart = readGuestCart();
        let res;

        if (guestCart.length > 0) {
          // One request does both the merge and the read-back.
          res = await fetch("/api/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: guestCart, merge: true }),
          });
          if (res.ok) localStorage.removeItem("guestCart");
        } else {
          res = await fetch("/api/cart");
        }

        if (cancelled) return;
        if (!res.ok) {
          console.warn("Cart fetch failed with status", res.status);
          return;
        }

        const data = await res.json();
        if (!cancelled) setCartItem(normaliseServerCart(data));
      } catch (err) {
        console.error("Error fetching cart:", err);
      } finally {
        if (!cancelled) hydrated.current = true;
      }
    };

    loadCart();
    return () => {
      cancelled = true;
    };
  }, [user]);

  // Persist changes. Guest carts write to localStorage immediately; server
  // carts are debounced so rapid clicks collapse into one request.
  useEffect(() => {
    if (!hydrated.current) return;

    if (!user) {
      writeGuestCart(cartItem);
      return;
    }

    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItem.map((item) => ({
            _id: item._id,
            quantity: item.quantity,
          })),
        }),
      }).catch((err) => console.error("Error saving cart:", err));
    }, SAVE_DEBOUNCE_MS);

    return () => clearTimeout(saveTimer.current);
  }, [cartItem, user]);

  const addToCart = useCallback((product, quantity = 1) => {
    const qty = Math.max(1, Math.min(100, Number(quantity) || 1));
    setCartItem((prev) => {
      const exists = prev.find((item) => item._id === product._id);
      return exists
        ? prev.map((item) =>
            item._id === product._id
              ? { ...item, quantity: Math.min(100, item.quantity + qty) }
              : item
          )
        : [
            ...prev,
            {
              _id: product._id,
              title: product.title,
              price: product.price,
              image: product.image,
              quantity: qty,
            },
          ];
    });
  }, []);

  // Set an exact quantity; 0 or less removes the line.
  const updateQuantity = useCallback((id, quantity) => {
    const qty = Math.min(100, Number(quantity) || 0);
    setCartItem((prev) =>
      qty <= 0
        ? prev.filter((item) => item._id !== id)
        : prev.map((item) => (item._id === id ? { ...item, quantity: qty } : item))
    );
  }, []);

  const removeFromCart = useCallback((id) => {
    setCartItem((prev) => prev.filter((item) => item._id !== id));
  }, []);

  const clearCart = useCallback(() => setCartItem([]), []);

  const totalItem = useMemo(
    () => cartItem.reduce((sum, item) => sum + item.quantity, 0),
    [cartItem]
  );

  // Memoised so consumers only re-render when something they use changes.
  const value = useMemo(
    () => ({
      cartItem,
      logout,
      user,
      setUser,
      refreshUser: fetchUser,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      totalItem,
      setCartItem,
    }),
    [cartItem, logout, user, fetchUser, addToCart, updateQuantity, removeFromCart, clearCart, totalItem]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
