/**
 * Shared Data Module for Rice Vending System
 * Manages transaction data storage and synchronization between kiosk and control panel
 */

const SHARED_DATA = {
  // Storage keys
  KIOSK_TRANSACTIONS_KEY: "bigasan_kiosk_transactions",
  CONTROL_PANEL_STATE_KEY: "bigasan_control_panel_state",
  RICE_INVENTORY_KEY: "bigasan_rice_inventory",

  getDefaultRiceInventory() {
    return {
      jasmine: {
        name: "Jasmine",
        price: 55,
        stock: 10,
        stockPercent: 72,
        color: "var(--jasmine)",
        dot: "#EDE3CC",
      },
      sinandomeng: {
        name: "Sinandomeng",
        price: 48,
        stock: 10,
        stockPercent: 72,
        color: "var(--sinandomeng)",
        dot: "#D9A94C",
      },
      brown: {
        name: "Brown Rice",
        price: 60,
        stock: 0,
        stockPercent: 0,
        color: "var(--brown-rice)",
        dot: "#7A5230",
      },
    };
  },

  getRiceInventory() {
    try {
      const raw = localStorage.getItem(this.RICE_INVENTORY_KEY);
      const base = this.getDefaultRiceInventory();
      if (!raw) {
        localStorage.setItem(this.RICE_INVENTORY_KEY, JSON.stringify(base));
        return base;
      }
      const parsed = JSON.parse(raw);
      return { ...base, ...parsed };
    } catch (e) {
      console.error("Failed to load rice inventory:", e);
      return this.getDefaultRiceInventory();
    }
  },

  saveRiceInventory(inventory) {
    try {
      const safe = this.getDefaultRiceInventory();
      const next = { ...safe, ...(inventory || {}) };
      Object.keys(next).forEach((key) => {
        if (next[key] && typeof next[key].stock === "number") {
          if (
            !Number.isFinite(next[key].stockPercent) ||
            next[key].stockPercent === undefined
          ) {
            next[key].stockPercent = safe[key]?.stockPercent ?? 0;
          }
          next[key].stockPercent = Math.max(
            0,
            Math.min(100, Number(next[key].stockPercent) || 0),
          );
        }
      });
      localStorage.setItem(this.RICE_INVENTORY_KEY, JSON.stringify(next));
      window.dispatchEvent(
        new CustomEvent("bigasan_inventory_updated", { detail: next }),
      );
      return next;
    } catch (e) {
      console.error("Failed to save rice inventory:", e);
      return this.getDefaultRiceInventory();
    }
  },

  onInventoryUpdate(callback) {
    const fire = (detail) => {
      if (detail) callback(detail);
    };

    window.addEventListener("bigasan_inventory_updated", (e) => {
      fire(e.detail);
    });

    window.addEventListener("storage", (e) => {
      if (e.key === this.RICE_INVENTORY_KEY && e.newValue) {
        try {
          fire(JSON.parse(e.newValue));
        } catch (err) {
          console.error("Failed to process shared inventory update:", err);
        }
      }
    });
  },

  syncPanelInventoryToKiosk(panelState) {
    const base = this.getDefaultRiceInventory();
    const panelContainers = Array.isArray(panelState?.containers)
      ? panelState.containers
      : [];
    const mapped = { ...base };

    panelContainers.forEach((container) => {
      const name = String(container.name || "").toLowerCase();
      const stock = Number(container.stock ?? 0);
      const capacity = Number(container.capacity || 100);
      const price = Number(container.price ?? 0);
      const pct =
        capacity > 0
          ? Math.max(0, Math.min(100, Math.round((stock / capacity) * 100)))
          : 0;

      if (name.includes("jasmine") && !name.includes("sinandomeng")) {
        mapped.jasmine = {
          ...mapped.jasmine,
          price: price || mapped.jasmine.price,
          stock: stock,
          stockPercent: pct,
        };
      } else if (name.includes("sinandomeng")) {
        mapped.sinandomeng = {
          ...mapped.sinandomeng,
          price: price || mapped.sinandomeng.price,
          stock: stock,
          stockPercent: pct,
        };
      } else if (name.includes("brown") && !name.includes("rice")) {
        // noop; Brown Rice handled by the exact match below
      } else if (name.includes("brown") || name.includes("pinawa")) {
        mapped.brown = {
          ...mapped.brown,
          price: price || mapped.brown.price,
          stock: stock,
          stockPercent: pct,
        };
      }
    });

    const brownMatch = panelContainers.find((container) => {
      const name = String(container.name || "").toLowerCase();
      return name.includes("brown") || name.includes("pinawa");
    });
    if (brownMatch) {
      const stock = Number(brownMatch.stock ?? 0);
      const capacity = Number(brownMatch.capacity || 80);
      const price = Number(brownMatch.price ?? 60);
      mapped.brown = {
        ...mapped.brown,
        price: price || mapped.brown.price,
        stock: stock,
        stockPercent:
          capacity > 0
            ? Math.max(0, Math.min(100, Math.round((stock / capacity) * 100)))
            : 0,
      };
    }

    return this.saveRiceInventory(mapped);
  },

  /**
   * Save a kiosk transaction to shared storage
   * @param {Object} transaction - Transaction data from kiosk
   */
  saveKioskTransaction(transaction) {
    try {
      const existing = this.getKioskTransactions();
      existing.push({
        ...transaction,
        source: "kiosk",
        syncedAt: Date.now(),
      });
      localStorage.setItem(
        this.KIOSK_TRANSACTIONS_KEY,
        JSON.stringify(existing),
      );

      // Notify other tabs/windows
      window.dispatchEvent(
        new CustomEvent("bigasan_transaction_saved", { detail: transaction }),
      );

      return true;
    } catch (e) {
      console.error("Failed to save kiosk transaction:", e);
      return false;
    }
  },

  /**
   * Get all kiosk transactions
   */
  getKioskTransactions() {
    try {
      const raw = localStorage.getItem(this.KIOSK_TRANSACTIONS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error("Failed to load kiosk transactions:", e);
      return [];
    }
  },

  /**
   * Clear all kiosk transactions
   */
  clearKioskTransactions() {
    localStorage.removeItem(this.KIOSK_TRANSACTIONS_KEY);
  },

  /**
   * Listen for transaction updates from kiosk
   * @param {Function} callback - Called when a new transaction is saved
   */
  onKioskTransaction(callback) {
    window.addEventListener("bigasan_transaction_saved", (e) => {
      callback(e.detail);
    });
  },

  /**
   * Sync kiosk transactions into control panel state
   * @param {Object} controlPanelState - The control panel state object
   */
  syncKioskTransactionsToPanel(controlPanelState) {
    const kioskTransactions = this.getKioskTransactions();

    if (!controlPanelState.transactions) {
      controlPanelState.transactions = [];
    }

    // Add any kiosk transactions that aren't already in the panel
    kioskTransactions.forEach((kt) => {
      const exists = controlPanelState.transactions.some(
        (pt) => pt.id === kt.id,
      );
      if (!exists) {
        controlPanelState.transactions.push(kt);
      }
    });

    return controlPanelState;
  },
};

// Export for use in both applications
if (typeof module !== "undefined" && module.exports) {
  module.exports = SHARED_DATA;
}
