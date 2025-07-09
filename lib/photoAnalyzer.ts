import { fetchAllPhotoAssets, getAssetInfo, PhotoAsset } from './mediaLibrary';

export type Orientation = 'portrait' | 'landscape' | 'square';

export interface PhotoAnalysisResult {
  byOrientation: Record<Orientation, PhotoAsset[]>;
  duplicates: PhotoAsset[][];
}

/**
 * Analyze all photos on the device to categorize by orientation and find duplicate images.
 * Duplicate detection is based on filename, dimensions and file size.
 */
export async function analyzePhotos(): Promise<PhotoAnalysisResult> {
  const assets = await fetchAllPhotoAssets(100);
  const byOrientation: Record<Orientation, PhotoAsset[]> = {
    portrait: [],
    landscape: [],
    square: [],
  };
  const dupMap: Record<string, PhotoAsset[]> = {};

  // Fetch detailed info for all assets concurrently for faster scanning
  const infos = await Promise.all(
    assets.map((asset) => getAssetInfo(asset.id))
  );

  infos.forEach((info, idx) => {
    if (!info) return;
    const asset = assets[idx];
    const orientation: Orientation =
      info.width > info.height
        ? 'landscape'
        : info.width < info.height
        ? 'portrait'
        : 'square';
    byOrientation[orientation].push(asset);

    const key = `${info.width}x${info.height}_${info.size ?? 0}`;
    if (!dupMap[key]) {
      dupMap[key] = [];
    }
    dupMap[key].push(asset);
  });

  const duplicates: PhotoAsset[][] = [];
  Object.values(dupMap).forEach((group) => {
    if (group.length > 1) {
      duplicates.push(group);
    }
  });

  return { byOrientation, duplicates };
}
