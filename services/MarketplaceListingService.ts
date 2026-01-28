/**
 * MarketplaceListingService.ts
 * Firebase CRUD operations for product listings
 * Handles create, read, update, delete for "Chợ" marketplace
 */

import {
    collection,
    doc,
    addDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    serverTimestamp,
    Timestamp,
    Unsubscribe,
} from 'firebase/firestore';
import {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject,
} from 'firebase/storage';
import { db } from '../firebase';
import { ProductListing, ProductCategory, ListingStatus, ListingFormData } from '../types/MarketplaceTypes';
import { watermarkImage } from './ImageWatermarkService';

// Firebase Storage - we'll need to add this to firebase.ts
// For now, mock the storage reference
let storage: any = null;
try {
    // Dynamically import storage if available
    import('firebase/storage').then(module => {
        // Storage will be initialized in firebase.ts
    });
} catch (e) {
    console.warn('Firebase Storage not initialized');
}

const COLLECTION_NAME = 'product_listings';
const STORAGE_PATH = 'listings';
const TTL_HOURS = 48;

/**
 * Calculate distance between two GPS coordinates (Haversine formula)
 */
const calculateDistance = (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
): number => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

/**
 * Create a new product listing
 */
export const createListing = async (
    farmerId: string,
    farmerName: string,
    farmerPhone: string,
    formData: ListingFormData,
    location: { lat: number; lng: number; address?: string }
): Promise<string> => {
    try {
        // Process and upload images
        const imageUrls: string[] = [];
        const originalImageUrls: string[] = [];

        // For now, create mock URLs since storage isn't fully configured
        // In production, this would upload to Firebase Storage
        for (let i = 0; i < formData.images.length; i++) {
            const file = formData.images[i];

            // Create watermarked version
            const watermarkedBlob = await watermarkImage(file);

            // Mock URLs for demo - replace with actual storage upload
            const mockOriginalUrl = URL.createObjectURL(file);
            const mockWatermarkedUrl = URL.createObjectURL(watermarkedBlob);

            originalImageUrls.push(mockOriginalUrl);
            imageUrls.push(mockWatermarkedUrl);
        }

        // Calculate expiry time (48 hours from now)
        const now = new Date();
        const expiresAt = new Date(now.getTime() + TTL_HOURS * 60 * 60 * 1000);

        // Generate title from category
        const categoryLabels: Record<ProductCategory, string> = {
            'COFFEE_HUSK': 'Vỏ cà phê',
            'FERTILIZER': 'Phân bón',
            'COMPOST': 'Phân hữu cơ',
            'WOOD': 'Cành/Củi',
            'OTHER': 'Phụ phẩm khác',
        };

        const weightDisplay = formData.weightUnit === 'tan'
            ? `${formData.estimatedWeight} tấn`
            : `${formData.estimatedWeight} kg`;

        const title = `${categoryLabels[formData.category]} (${weightDisplay})`;

        // Create listing document
        const listingData = {
            farmerId,
            farmerName,
            farmerPhone,
            category: formData.category,
            title,
            estimatedWeight: formData.estimatedWeight,
            weightUnit: formData.weightUnit,
            pricePerUnit: formData.pricePerUnit || null,
            negotiable: formData.negotiable,
            images: imageUrls,
            originalImages: originalImageUrls,
            location,
            status: 'APPROVED' as ListingStatus, // Auto-approve for Phase 1
            createdAt: serverTimestamp(),
            expiresAt: Timestamp.fromDate(expiresAt),
            viewCount: 0,
            contactCount: 0,
        };

        const docRef = await addDoc(collection(db, COLLECTION_NAME), listingData);
        return docRef.id;
    } catch (error) {
        console.error('Error creating listing:', error);
        throw error;
    }
};

/**
 * Get listings near a location (within radius km)
 */
export const getListingsNearby = async (
    userLat: number,
    userLng: number,
    radiusKm: number = 50,
    category?: ProductCategory
): Promise<ProductListing[]> => {
    try {
        let q = query(
            collection(db, COLLECTION_NAME),
            where('status', '==', 'APPROVED'),
            orderBy('createdAt', 'desc'),
            limit(50)
        );

        if (category) {
            q = query(
                collection(db, COLLECTION_NAME),
                where('status', '==', 'APPROVED'),
                where('category', '==', category),
                orderBy('createdAt', 'desc'),
                limit(50)
            );
        }

        const snapshot = await getDocs(q);
        const listings: ProductListing[] = [];

        snapshot.forEach((doc) => {
            const data = doc.data();
            const distance = calculateDistance(
                userLat,
                userLng,
                data.location.lat,
                data.location.lng
            );

            // Filter by radius
            if (distance <= radiusKm) {
                listings.push({
                    id: doc.id,
                    ...data,
                    location: {
                        ...data.location,
                        distanceKm: Math.round(distance * 10) / 10,
                    },
                } as ProductListing);
            }
        });

        // Sort by distance
        listings.sort((a, b) => (a.location.distanceKm || 0) - (b.location.distanceKm || 0));

        return listings;
    } catch (error) {
        console.error('Error fetching nearby listings:', error);
        return [];
    }
};

/**
 * Get listings by farmer ID
 */
export const getMyListings = async (farmerId: string): Promise<ProductListing[]> => {
    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            where('farmerId', '==', farmerId),
            orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(q);
        const listings: ProductListing[] = [];

        snapshot.forEach((doc) => {
            listings.push({
                id: doc.id,
                ...doc.data(),
            } as ProductListing);
        });

        return listings;
    } catch (error) {
        console.error('Error fetching my listings:', error);
        return [];
    }
};

/**
 * Subscribe to listings in real-time
 */
export const subscribeToListings = (
    userLat: number,
    userLng: number,
    radiusKm: number,
    callback: (listings: ProductListing[]) => void
): Unsubscribe => {
    const q = query(
        collection(db, COLLECTION_NAME),
        where('status', '==', 'APPROVED'),
        orderBy('createdAt', 'desc'),
        limit(50)
    );

    return onSnapshot(q, (snapshot) => {
        const listings: ProductListing[] = [];

        snapshot.forEach((doc) => {
            const data = doc.data();
            const distance = calculateDistance(
                userLat,
                userLng,
                data.location.lat,
                data.location.lng
            );

            if (distance <= radiusKm) {
                listings.push({
                    id: doc.id,
                    ...data,
                    location: {
                        ...data.location,
                        distanceKm: Math.round(distance * 10) / 10,
                    },
                } as ProductListing);
            }
        });

        listings.sort((a, b) => (a.location.distanceKm || 0) - (b.location.distanceKm || 0));
        callback(listings);
    });
};

/**
 * Mark listing as sold
 */
export const markAsSold = async (listingId: string): Promise<void> => {
    try {
        await updateDoc(doc(db, COLLECTION_NAME, listingId), {
            status: 'SOLD',
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Error marking as sold:', error);
        throw error;
    }
};

/**
 * Renew listing (extend TTL by 48 hours)
 */
export const renewListing = async (listingId: string): Promise<void> => {
    try {
        const now = new Date();
        const newExpiresAt = new Date(now.getTime() + TTL_HOURS * 60 * 60 * 1000);

        await updateDoc(doc(db, COLLECTION_NAME, listingId), {
            status: 'APPROVED',
            expiresAt: Timestamp.fromDate(newExpiresAt),
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Error renewing listing:', error);
        throw error;
    }
};

/**
 * Delete listing
 */
export const deleteListing = async (listingId: string): Promise<void> => {
    try {
        await deleteDoc(doc(db, COLLECTION_NAME, listingId));
    } catch (error) {
        console.error('Error deleting listing:', error);
        throw error;
    }
};

/**
 * Increment contact count (when user clicks "Gọi điện")
 */
export const incrementContactCount = async (listingId: string): Promise<void> => {
    try {
        const listingRef = doc(db, COLLECTION_NAME, listingId);
        const listingSnap = await getDoc(listingRef);

        if (listingSnap.exists()) {
            const currentCount = listingSnap.data().contactCount || 0;
            await updateDoc(listingRef, {
                contactCount: currentCount + 1,
            });
        }
    } catch (error) {
        console.error('Error incrementing contact count:', error);
    }
};

/**
 * Get seller stats for "Góc Của Tôi"
 */
export const getSellerStats = async (farmerId: string): Promise<{
    totalListings: number;
    soldListings: number;
    activeListings: number;
}> => {
    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            where('farmerId', '==', farmerId)
        );

        const snapshot = await getDocs(q);
        let totalListings = 0;
        let soldListings = 0;
        let activeListings = 0;

        snapshot.forEach((doc) => {
            const data = doc.data();
            totalListings++;
            if (data.status === 'SOLD') soldListings++;
            if (data.status === 'APPROVED') activeListings++;
        });

        return { totalListings, soldListings, activeListings };
    } catch (error) {
        console.error('Error fetching seller stats:', error);
        return { totalListings: 0, soldListings: 0, activeListings: 0 };
    }
};
