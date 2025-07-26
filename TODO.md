# Goals

## Short Term
 - Clarify delete behaviour: photos are always permanently removed.
- ~~Add advanced folder selection including WhatsApp media scanning.~~ Done: Albums tab lets you browse any album, including WhatsApp folders.
- Provide multi-select delete and bulk removal by month or album.
- Improve selection workflow:
  - Change default swipe actions to navigation.
  - Optionally move the image strip to the bottom.
  - ~~Button to open the current photo in the system gallery.~~ Added open button in `PhotoGallery`.
- ~~Add video review support.~~ Videos tab uses `PhotoGallery` with `mediaType="video"`.
- ~~Investigate occasional failures opening assets via `Linking.openURL`~~

## Long Term
- ~~Mark images as favourites or move/copy them to another album.~~ Done: photos can now be moved to any album via the new folder button.
- Exclude or include specific albums during review.
- Detect and remove duplicate images.
- Share images without captions or as documents.
- Compress or resize photos and offer basic editing tools.
- AI-based sorting into categories like selfies or pets.
- ~~Optimize memory usage when analyzing large photo libraries~~ Implemented batched scanning
- [ ] Update Jest configuration to remove `ts-jest` deprecation warnings
- [ ] Replace `react-test-renderer` usage in tests to avoid deprecation notices
- [ ] Investigate using the React Native Jest preset for cleaner imports in tests
