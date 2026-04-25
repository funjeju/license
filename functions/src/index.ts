/**
 * Firebase Cloud Functions — 이미지 처리 파이프라인
 *
 * 배포: firebase deploy --only functions
 * 로컬 에뮬레이터: firebase emulators:start --only functions,storage
 *
 * 의존성 (functions/package.json):
 *   "firebase-admin": "^13",
 *   "firebase-functions": "^6",
 *   "sharp": "^0.33"
 */

// NOTE: 이 파일은 Cloud Functions 전용입니다. Next.js 빌드에 포함되지 않습니다.
// 실제 배포 전 `npm install` 및 `firebase deploy --only functions` 필요.

import * as admin from 'firebase-admin';
import { onObjectFinalized } from 'firebase-functions/v2/storage';
import * as path from 'path';

// sharp는 Cloud Functions 환경에서만 설치됩니다
// import * as sharp from 'sharp';

const DEFAULT_BUCKET = process.env.STORAGE_BUCKET ?? '';
const DEFAULT_REGION = 'asia-northeast3';

admin.initializeApp();
const db = admin.firestore();
const storage = admin.storage();

/**
 * Storage 업로드 트리거: /uploads/ 경로 파일 → 자동 가공
 *
 * 처리 흐름:
 *   1. 원본 다운로드
 *   2. normalized: Sharp 리사이즈 + DPI 300 + PNG 변환
 *   3. grayscale:  Sharp 흑백 변환
 *   4. nobg:       rembg Python 서브프로세스 (또는 Vertex AI)
 *   5. sheet:      Sharp composite (도안 시트 템플릿 위에 합성)
 *   6. Firestore /assets 레코드 업데이트
 */
export const onImageUpload = onObjectFinalized(
  {
    region: DEFAULT_REGION,
    bucket: DEFAULT_BUCKET,
    memory: '1GiB',
    timeoutSeconds: 540,
  },
  async (event) => {
    const filePath = event.data.name;
    if (!filePath || !filePath.startsWith('uploads/')) return;

    const bucket = storage.bucket(event.data.bucket);
    const fileName = path.basename(filePath);
    const dir = path.dirname(filePath);

    // registrationId는 경로에서 추출: uploads/{registrationId}/...
    const parts = filePath.split('/');
    const registrationId = parts[1];
    if (!registrationId) return;

    // 원본 파일 다운로드
    const tempPath = `/tmp/${fileName}`;
    await bucket.file(filePath).download({ destination: tempPath });

    const processedPaths: { kind: string; storagePath: string }[] = [];

    /*
    // ── normalized (Sharp) ──────────────────────────────────────────────
    const normalizedPath = `processed/${registrationId}/normalized_${fileName}`;
    await sharp(tempPath)
      .resize({ width: 2480, height: 3508, fit: 'inside', withoutEnlargement: true })
      .withMetadata({ density: 300 })
      .png()
      .toFile(`/tmp/normalized_${fileName}`);
    await bucket.upload(`/tmp/normalized_${fileName}`, { destination: normalizedPath });
    processedPaths.push({ kind: 'normalized', storagePath: normalizedPath });

    // ── grayscale (Sharp) ────────────────────────────────────────────────
    const grayscalePath = `processed/${registrationId}/grayscale_${fileName}`;
    await sharp(tempPath)
      .grayscale()
      .png()
      .toFile(`/tmp/grayscale_${fileName}`);
    await bucket.upload(`/tmp/grayscale_${fileName}`, { destination: grayscalePath });
    processedPaths.push({ kind: 'grayscale', storagePath: grayscalePath });

    // ── sheet (Sharp composite with template) ───────────────────────────
    // TODO: 도안 시트 템플릿 합성
    */

    // Firestore에 처리 완료 기록
    const now = admin.firestore.FieldValue.serverTimestamp();
    const batch = db.batch();
    for (const { kind, storagePath: sp } of processedPaths) {
      const assetRef = db.collection('assets').doc();
      batch.set(assetRef, {
        registrationId,
        kind,
        storagePath: sp,
        downloadURL: '', // getDownloadURL after upload
        sourceAssetId: null,
        createdAt: now,
      });
    }
    await batch.commit();

    console.log(`Processed ${processedPaths.length} variants for ${filePath}`);
  }
);
