import {
  fetchAllPhotoAssets,
  fetchPhotoAssetsWithPagination,
  getAssetInfo,
  PhotoAsset,
} from './mediaLibrary';

export type Orientation = 'portrait' | 'landscape' | 'square';

export interface PhotoAnalysisResult {
  byOrientation: Record<Orientation, PhotoAsset[]>;
  duplicates: PhotoAsset[][];
  screenshots: PhotoAsset[];
  selfies: PhotoAsset[];
  oldPhotos: PhotoAsset[];
  lowRes: PhotoAsset[];
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
  const screenshots: PhotoAsset[] = [];
  const selfies: PhotoAsset[] = [];
  const oldPhotos: PhotoAsset[] = [];
  const lowRes: PhotoAsset[] = [];

  const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;
  const now = Date.now();

  // Fetch detailed info for all assets concurrently for faster scanning
  const infos = await Promise.all(assets.map((asset) => getAssetInfo(asset.id)));

  infos.forEach((info, idx) => {
    if (!info) return;
    const asset = assets[idx];
    const orientation: Orientation =
      info.width > info.height ? 'landscape' : info.width < info.height ? 'portrait' : 'square';
    byOrientation[orientation].push(asset);

    if (info.width < 800 || info.height < 800) {
      lowRes.push(asset);
    }
    if (info.creationTime && now - info.creationTime > ONE_YEAR_MS) {
      oldPhotos.push(asset);
    }

    if (info.mediaSubtypes?.includes('screenshot') || /screenshot/i.test(info.filename)) {
      screenshots.push(asset);
    } else if (/img_|pxl_|selfie/i.test(info.filename) && orientation === 'portrait') {
      selfies.push(asset);
    }

    const fileSize = (info as any).size ?? 0;
    const key = `${info.width}x${info.height}_${fileSize}`;
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

  return {
    byOrientation,
    duplicates,
    screenshots,
    selfies,
    oldPhotos,
    lowRes,
  };
}

/**
 * Analyze photos with progress updates. Calls onProgress after each batch
 * of assets is processed so the UI can show a progress indicator.
 * @param onProgress optional callback receiving processed count and total
 */
export async function analyzePhotosWithProgress(
  onProgress?: (processed: number, total: number) => void,
  batchSize: number = 20
): Promise<PhotoAnalysisResult> {
  let cursor: string | undefined = undefined;
  let hasNext = true;
  let processed = 0;
  let total = 0;
  const byOrientation: Record<Orientation, PhotoAsset[]> = {
    portrait: [],
    landscape: [],
    square: [],
  };
  const dupMap: Record<string, PhotoAsset[]> = {};
  const screenshots: PhotoAsset[] = [];
  const selfies: PhotoAsset[] = [];
  const oldPhotos: PhotoAsset[] = [];
  const lowRes: PhotoAsset[] = [];

  const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;
  const now = Date.now();

  while (hasNext) {
    const page = await fetchPhotoAssetsWithPagination(cursor, batchSize);
    const batch = page.assets;
    if (total === 0) total = page.totalCount;
    const infos = await Promise.all(batch.map((a) => getAssetInfo(a.id)));
    infos.forEach((info, idx) => {
      if (!info) return;
      const asset = batch[idx];
      const orientation: Orientation =
        info.width > info.height ? 'landscape' : info.width < info.height ? 'portrait' : 'square';
      byOrientation[orientation].push(asset);

      if (info.width < 800 || info.height < 800) {
        lowRes.push(asset);
      }
      if (info.creationTime && now - info.creationTime > ONE_YEAR_MS) {
        oldPhotos.push(asset);
      }

      if (info.mediaSubtypes?.includes('screenshot') || /screenshot/i.test(info.filename)) {
        screenshots.push(asset);
      } else if (/img_|pxl_|selfie/i.test(info.filename) && orientation === 'portrait') {
        selfies.push(asset);
      }

      const fileSize = (info as any).size ?? 0;
      const key = `${info.width}x${info.height}_${fileSize}`;
      if (!dupMap[key]) {
        dupMap[key] = [];
      }
      dupMap[key].push(asset);
    });

    processed += batch.length;
    onProgress?.(Math.min(processed, total), total);

    cursor = page.endCursor;
    hasNext = page.hasNextPage;
  }

  const duplicates: PhotoAsset[][] = [];
  Object.values(dupMap).forEach((group) => {
    if (group.length > 1) {
      duplicates.push(group);
    }
  });

  return {
    byOrientation,
    duplicates,
    screenshots,
    selfies,
    oldPhotos,
    lowRes,
  };
}

export interface DeletionOptions {
  screenshots?: boolean;
  duplicates?: boolean;
  oldPhotos?: boolean;
  lowRes?: boolean;
  selfies?: boolean;
}

/**
 * Determine which photos are good candidates for deletion based on the
 * analysis result. Duplicate groups return all but the first photo in each
 * group so at least one copy is preserved.
 */
export function getDeletionCandidates(
  result: PhotoAnalysisResult,
  options: DeletionOptions = {}
): PhotoAsset[] {
  const {
    screenshots = true,
    duplicates = true,
    oldPhotos = true,
    lowRes = true,
    selfies = false,
  } = options;

  const map = new Map<string, PhotoAsset>();

  if (screenshots) {
    result.screenshots.forEach((a) => map.set(a.id, a));
  }

  if (duplicates) {
    result.duplicates.forEach((group) => {
      group.slice(1).forEach((a) => map.set(a.id, a));
    });
  }

  if (oldPhotos) {
    result.oldPhotos.forEach((a) => map.set(a.id, a));
  }

  if (lowRes) {
    result.lowRes.forEach((a) => map.set(a.id, a));
  }

  if (selfies) {
    result.selfies.forEach((a) => map.set(a.id, a));
  }

  return Array.from(map.values());
}
