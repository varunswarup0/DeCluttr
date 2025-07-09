Every photo action grants or subtracts XP. The totals are persisted in `store/store.ts` and leveling occurs every 100 XP.

UI components read from the store to display current XP and level. Modify `XP_CONFIG` in the store file to change reward values.
