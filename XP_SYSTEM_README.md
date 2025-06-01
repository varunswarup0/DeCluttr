# XP System Implementation

## 🎯 Overview

The XP (Experience Points) system gamifies the photo decluttering process by rewarding users for taking actions to clean up their photo gallery.

## ⭐ XP Earning Actions

| Action               | XP Reward       | Description                                    |
| -------------------- | --------------- | ---------------------------------------------- |
| **Delete Photo**     | +10 XP          | When user swipes left to delete a photo        |
| **Permanent Delete** | +5 XP           | When user permanently deletes from recycle bin |
| **Clear All**        | +2 XP per photo | When user clears entire recycle bin            |
| **Restore Photo**    | -5 XP           | When user restores a photo from recycle bin    |

## 🎮 Level System

- **Level Calculation**: `Math.floor(totalXP / 100) + 1`
- **XP per Level**: 100 XP required to reach next level
- **Progress Tracking**: Shows current level progress and XP needed for next level

## 🏗️ Technical Implementation

### 1. **AsyncStorage Persistence**

```typescript
// XP is automatically saved to AsyncStorage on every change
const saveXPToStorage = async (xp: number): Promise<void> => {
  await AsyncStorage.setItem('@decluttr_xp', xp.toString());
};
```

### 2. **Zustand Store Integration**

```typescript
export interface RecycleBinState {
  xp: number;
  isXpLoaded: boolean;
  loadXP: () => Promise<void>;
  addXP: (amount: number) => Promise<void>;
  subtractXP: (amount: number) => Promise<void>;
  // ...other methods
}
```

### 3. **Automatic XP Updates**

- XP is automatically updated when photos are deleted/restored
- No manual XP management required in components
- Prevents negative XP (minimum 0)

## 📱 UI Integration

### 1. **Header XP Display**

- Shows current XP in all tab screens
- Real-time updates via Zustand store
- Yellow badge design with star icon

### 2. **Stats Screen**

- Detailed XP level information
- Progress bar for current level
- XP earning guide for users
- Level calculation display

### 3. **Feedback Messages**

- Alerts show XP gained/lost for actions
- Photo deletion: "+10 XP"
- Photo restoration: "-5 XP"
- Permanent deletion: "+5 XP"
- Clear all: "+X XP" (based on photo count)

## 🚀 Features

### ✅ **Implemented**

- [x] Persistent XP storage with AsyncStorage
- [x] Real-time XP updates in UI
- [x] Level system with progress tracking
- [x] XP feedback in action alerts
- [x] Comprehensive stats display
- [x] Integration with all photo actions

### 🔮 **Future Enhancements**

- [ ] Achievement system for milestones
- [ ] XP multipliers for streaks
- [ ] Leaderboard functionality
- [ ] XP rewards for daily usage
- [ ] Custom XP goals and challenges

## 🎯 Usage Examples

### For Users:

1. **Delete photos** to earn 10 XP each
2. **Check your level** in the header XP display
3. **View detailed stats** in the Statistics screen
4. **Permanently delete** for bonus 5 XP per photo
5. **Be careful restoring** as it costs 5 XP

### For Developers:

```typescript
// Access XP in any component
const { xp, addXP, subtractXP } = useRecycleBinStore();

// XP is automatically managed by photo actions
// Manual XP updates (if needed):
await addXP(10); // Add 10 XP
await subtractXP(5); // Remove 5 XP
```

## 📊 XP Analytics

The system tracks all XP transactions through the Zustand store, making it easy to add analytics or additional features in the future.

## 🔧 Configuration

XP values can be easily modified in the `XP_CONFIG` constant in `store/store.ts`:

```typescript
export const XP_CONFIG = {
  DELETE_PHOTO: 10,
  RESTORE_PHOTO: -5,
  PERMANENT_DELETE: 5,
  CLEAR_ALL: 2,
} as const;
```
