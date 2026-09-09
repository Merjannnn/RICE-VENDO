# 🌾 Bigasan Rice Vending System

An automated rice vending machine system with a customer-facing kiosk and operator control panel.

## System Overview

### Components

1. **Customer Kiosk** (`bigasan.html`)
   - Customer interface for purchasing rice
   - Shows available rice varieties
   - Accepts payment (coins and bills)
   - Dispenses exact weight using motor control
   - Voice guidance throughout the process

2. **Operator Control Panel** (`rice-vending-control-panel.html`)
   - Admin interface for managing the vending machine
   - Monitor inventory levels (silo status)
   - View sales transactions and analytics
   - Check system alerts
   - Requires login (default: Admin / Admin@1234)

3. **Home/Launcher** (`index.html`)
   - Quick navigation to both applications
   - System status overview

4. **Shared Data Module** (`shared-data.js`)
   - Handles data synchronization between kiosk and control panel
   - Uses browser localStorage for persistent storage
   - Supports real-time updates across tabs

## Quick Start

1. Open `index.html` in your browser
2. Choose either the **Customer Kiosk** or **Operator Panel**
3. For best experience, open both in separate tabs

### Using the Customer Kiosk

1. Tap "Tap to start" on the idle screen
2. Select your preferred rice variety
3. Choose amount to pay (₱20-₱2,000)
4. Insert coins or bills (simulated with keyboard input)
5. Place your container when prompted
6. Wait for dispensing to complete
7. Retrieve your rice and receipt

### Using the Operator Panel

1. Enter credentials: **Admin** / **Admin@1234**
2. Navigate between tabs:
   - **Transactions**: View all sales and record new ones
   - **System Status**: Check rice container levels and capacity
   - **Alerts**: Review low stock and critical alerts

## Data Synchronization

### How It Works

- Each transaction completed on the kiosk is automatically saved to browser storage
- The control panel reads these transactions when it loads
- When viewing the Transactions tab, the panel shows both manual entries and kiosk transactions
- Real-time updates: If the control panel is open in another tab, new kiosk transactions appear automatically

### Storage

- **Kiosk Transactions**: Stored in `localStorage['bigasan_kiosk_transactions']`
- **Panel State**: Stored in `localStorage['bigasan_control_panel_state']`
- **Session Auth**: Stored in `sessionStorage` (clears on browser close)

## Features

### Kiosk Features

- ✅ Multi-variety rice selection
- ✅ Voice-guided customer experience
- ✅ Real-time payment detection
- ✅ Precise weight measurement (gram-level accuracy)
- ✅ Motor control simulation
- ✅ Transaction receipt display
- ✅ Mute button for voice guidance

### Control Panel Features

- ✅ User authentication with attempt limiting
- ✅ Real-time inventory monitoring
- ✅ Sales analytics and reporting
- ✅ Transaction management (view, edit, delete)
- ✅ Printable reports
- ✅ System alerts for low stock
- ✅ Status indicators (OK, Low, Critical)

## Technical Details

### Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires localStorage enabled
- Web Speech API for voice guidance (optional)

### Files Structure

```
FRONTEND/
├── index.html                      # Home/launcher page
├── bigasan.html                    # Customer kiosk interface
├── rice-vending-control-panel.html # Operator control panel
└── shared-data.js                  # Shared data synchronization module
```

### Data Flow

```
Kiosk (bigasan.html)
    ↓
    saves transaction
    ↓
localStorage (bigasan_kiosk_transactions)
    ↓
Control Panel (rice-vending-control-panel.html)
    ↓
    reads & syncs transactions
```

## API Reference

### SHARED_DATA Object

#### Methods

- `saveKioskTransaction(transaction)` - Save a transaction from the kiosk
- `getKioskTransactions()` - Retrieve all kiosk transactions
- `clearKioskTransactions()` - Clear all stored kiosk transactions
- `onKioskTransaction(callback)` - Listen for new transactions
- `syncKioskTransactionsToPanel(state)` - Merge kiosk transactions into panel state

#### Transaction Object

```javascript
{
  id: "kiosk_timestamp_random",
  variety: "Jasmine",           // Rice type
  kilos: 2.5,                   // Weight in kilograms
  pricePerKilo: 55,             // Unit price
  paymentMethod: "Cash",        // Payment type
  total: 137.50,                // Total amount paid
  timestamp: 1693472400000,     // Unix timestamp
  source: "kiosk",              // Data source
  syncedAt: 1693472402000       // When it was synced
}
```

## Customization

### Rice Varieties

Edit the `RICE` object in `bigasan.html`:

```javascript
const RICE = {
  jasmine: {
    name: "Jasmine",
    price: 55,
    stock: 10,
    stockPercent: 72,
    color: "var(--jasmine)",
    dot: "#EDE3CC",
  },
  // Add more varieties...
};
```

### Default Containers

Edit the `defaultState()` function in `rice-vending-control-panel.html` to modify:

- Rice varieties available in the system
- Capacity and stock levels
- Price per kilogram
- Low stock thresholds

### Authentication

Change credentials in `rice-vending-control-panel.html`:

```javascript
const VALID_USERNAME = "Admin";
const VALID_PASSWORD = "Admin@1234";
```

## Troubleshooting

### Transactions Not Appearing

1. Ensure both files are in the same directory
2. Check browser console for errors (F12)
3. Verify localStorage is enabled
4. Clear browser cache and reload

### Voice Not Working

1. Ensure speakers are enabled
2. Check browser volume settings
3. Verify Web Speech API is supported in your browser
4. Click the mute button (🔊) to toggle voice

### Login Issues

1. Default username: `Admin`
2. Default password: `Admin@1234`
3. After 3 failed attempts, account locks for 60 seconds
4. Use `sessionStorage.clear()` in console to reset

## Notes

- This is a simulation/demo version
- Payment inputs are simulated with keyboard controls
- Motor and sensor operations are simulated
- All data is stored locally in the browser

## License

© 2024 Bigasan Rice Vending System
