
import { useState } from 'react';
import EXIF from 'exif-js';
import { getDistanceFromLatLonInMeters } from '../utils/geoUtils';

// --- TYPES ---
export type TrustTier = 'GOLD' | 'SILVER' | 'BRONZE' | 'FAIL';

export interface VerificationResult {
  tier: TrustTier;
  score: number;
  message: string;
  evidenceData?: {
    capturedAt: string; // ISO String
    location?: { lat: number; lng: number };
    distance?: number;
  };
}

interface FarmLocation {
  lat: number;
  lng: number;
}

interface TimeWindow {
  start: Date;
  end: Date;
}

// --- HELPER: CONVERT EXIF GPS TO DECIMAL ---
const convertDMSToDD = (degrees: number[], ref: string): number => {
  let dd = degrees[0] + degrees[1] / 60 + degrees[2] / 3600;
  if (ref === "S" || ref === "W") {
    dd = dd * -1;
  }
  return dd;
};

// --- HELPER: PARSE EXIF DATE ---
// Format: "2024:05:20 14:30:00" -> Date Object
const parseExifDate = (dateString: string): Date | null => {
  if (!dateString) return null;
  const [datePart, timePart] = dateString.split(" ");
  const [year, month, day] = datePart.split(":").map(Number);
  const [hour, minute, second] = timePart.split(":").map(Number);
  return new Date(year, month - 1, day, hour, minute, second);
};

export const useTaskVerification = () => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);

  const verifyEvidence = async (
    file: File,
    farmLocation: FarmLocation | undefined,
    taskWindow: TimeWindow
  ): Promise<VerificationResult> => {
    setIsVerifying(true);
    setResult(null);

    return new Promise((resolve) => {
      // 1. Check if user has Farm Location set up
      if (!farmLocation) {
        const res: VerificationResult = {
          tier: 'BRONZE',
          score: 2,
          message: 'Chưa định vị vườn. Chỉ đạt hạng Đồng.',
          evidenceData: { capturedAt: new Date().toISOString() }
        };
        setResult(res);
        setIsVerifying(false);
        resolve(res);
        return;
      }

      // 2. Read EXIF Data
      EXIF.getData(file as any, function(this: any) {
        const exifData = this;
        
        // A. Extract Date
        const dateOriginal = EXIF.getTag(this, "DateTimeOriginal");
        const capturedDate = dateOriginal ? parseExifDate(dateOriginal) : new Date(file.lastModified);
        
        // B. Extract GPS
        const gpsLat = EXIF.getTag(this, "GPSLatitude");
        const gpsLatRef = EXIF.getTag(this, "GPSLatitudeRef");
        const gpsLng = EXIF.getTag(this, "GPSLongitude");
        const gpsLngRef = EXIF.getTag(this, "GPSLongitudeRef");

        let imgLat: number | null = null;
        let imgLng: number | null = null;

        if (gpsLat && gpsLatRef && gpsLng && gpsLngRef) {
          imgLat = convertDMSToDD(gpsLat, gpsLatRef);
          imgLng = convertDMSToDD(gpsLng, gpsLngRef);
        }

        // --- LOGIC ENGINE ---
        
        // Step 1: Time Check
        // Allow strict window or just generally "recent" relative to task
        // For simplicity: Check if capturedDate is AFTER task start
        const isTimeValid = capturedDate && capturedDate >= taskWindow.start; 
        
        // Step 2: Location Check (Geofencing)
        let isLocationValid = false;
        let distance = 0;

        if (imgLat && imgLng) {
          distance = getDistanceFromLatLonInMeters(
            imgLat,
            imgLng,
            farmLocation.lat,
            farmLocation.lng
          );
          // 500m radius tolerance
          if (distance <= 500) {
            isLocationValid = true;
          }
        }

        // Step 3: Scoring
        let tier: TrustTier = 'FAIL';
        let score = 0;
        let message = '';

        if (!isTimeValid) {
            tier = 'FAIL';
            score = 0;
            message = 'Ảnh quá cũ hoặc chụp trước khi bắt đầu mùa vụ.';
        } else if (isLocationValid) {
            tier = 'GOLD';
            score = 10;
            message = 'Tuyệt vời! Ảnh chụp tại vườn & đúng thời gian.';
        } else if (imgLat === null) {
            // Valid Time but No GPS (Silver)
            tier = 'SILVER';
            score = 8;
            message = 'Ảnh hợp lệ nhưng thiếu GPS. Đạt hạng Bạc.';
        } else {
            // Has GPS but too far
            tier = 'FAIL';
            score = 0;
            message = `Ảnh chụp cách vườn ${Math.round(distance)}m (quá xa).`;
        }

        // Fallback for Manual/Bronze (e.g. valid time but suspicious meta)
        if (tier === 'SILVER' && !dateOriginal) {
             // If we had to rely on file.lastModified, downgrade to Bronze
             tier = 'BRONZE';
             score = 5;
             message = 'Ảnh thiếu thông tin gốc. Đạt hạng Đồng.';
        }

        const finalResult: VerificationResult = {
          tier,
          score,
          message,
          evidenceData: {
            capturedAt: capturedDate ? capturedDate.toISOString() : new Date().toISOString(),
            location: imgLat && imgLng ? { lat: imgLat, lng: imgLng } : undefined,
            distance
          }
        };

        setResult(finalResult);
        setIsVerifying(false);
        resolve(finalResult);
      });
    });
  };

  return { verifyEvidence, isVerifying, result };
};
