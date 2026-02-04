import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Play, BookOpen, MoreHorizontal } from 'lucide-react';

interface FeedItem {
    id: string;
    authorName: string;
    authorAvatar: string;
    type: 'video' | 'image';
    mediaUrl: string;
    content: string;
    likes: number;
    comments: number;
    isLiked: boolean;
    category: 'TIP' | 'SHOWCASE' | 'WARNING';
    timestamp: string;
}

const MOCK_FEED: FeedItem[] = [
    {
        id: '1',
        authorName: 'Bác Hùng (Trưởng trạm)',
        authorAvatar: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=150&auto=format&fit=crop&q=80',
        type: 'video',
        mediaUrl: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&auto=format&fit=crop&q=80', // Placeholder for video thumb
        content: 'Mẹo ghép chồi cà phê mới, 10 ngày là nảy mầm liền bà con ơi! 🌱',
        likes: 124,
        comments: 18,
        isLiked: true,
        category: 'TIP',
        timestamp: '2 giờ trước'
    },
    {
        id: '2',
        authorName: 'Cô Lan (Ia Grai)',
        authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        type: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1599586120429-48285b6a799f?w=600&auto=format&fit=crop&q=80',
        content: 'Cà phê năm nay trái to đều quá, nhờ dùng phân vi sinh ủ hôm bữa.',
        likes: 89,
        comments: 32,
        isLiked: false,
        category: 'SHOWCASE',
        timestamp: '5 giờ trước'
    },
    {
        id: '3',
        authorName: 'Anh Minh (Kỹ thuật)',
        authorAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
        type: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=600&auto=format&fit=crop&q=80',
        content: '⚠️ Cảnh báo: Đang có đợt rệp sáp bùng phát ở khu vực Chư Păh, mọi người ra vườn kiểm tra gấp nhé!',
        likes: 256,
        comments: 45,
        isLiked: true,
        category: 'WARNING',
        timestamp: '1 ngày trước'
    }
];

const AgriTokFeed: React.FC = () => {
    const [feed, setFeed] = useState(MOCK_FEED);

    const handleLike = (id: string) => {
        setFeed(prev => prev.map(item => {
            if (item.id === id) {
                return {
                    ...item,
                    likes: item.isLiked ? item.likes - 1 : item.likes + 1,
                    isLiked: !item.isLiked
                };
            }
            return item;
        }));
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-1 mb-2">
                <h3 className="text-gray-900 font-black text-lg flex items-center gap-2">
                    <span className="text-2xl">📹</span> Bảng Tin Làng Xóm
                </h3>
                <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                    LIVE
                </span>
            </div>

            <div className="space-y-6">
                {feed.map((item) => (
                    <div key={item.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                                <img src={item.authorAvatar} alt={item.authorName} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                                <div>
                                    <h4 className="font-bold text-gray-900 text-sm">{item.authorName}</h4>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500">{item.timestamp}</span>
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${item.category === 'TIP' ? 'text-blue-500 border-blue-200 bg-blue-50' :
                                                item.category === 'WARNING' ? 'text-red-500 border-red-200 bg-red-50' :
                                                    'text-green-500 border-green-200 bg-green-50'
                                            }`}>
                                            {item.category === 'TIP' ? 'Mẹo Hay' : item.category === 'WARNING' ? 'Cảnh Báo' : 'Khoe Vườn'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button className="text-gray-400">
                                <MoreHorizontal className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Media Content */}
                        <div className="relative aspect-[4/5] bg-gray-900">
                            <img src={item.mediaUrl} alt="Content" className="w-full h-full object-cover" />
                            {item.type === 'video' && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                    <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                        <Play className="w-6 h-6 text-white ml-1" fill="white" />
                                    </div>
                                </div>
                            )}
                            {/* Overlay Gradient */}
                            <div className="absolute inset- x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />

                            {/* Content Text Overlay */}
                            <div className="absolute bottom-4 left-4 right-4">
                                <p className="text-white text-sm font-medium leading-relaxed line-clamp-2">
                                    {item.content}
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="px-4 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <button onClick={() => handleLike(item.id)} className="flex flex-col items-center gap-1 group">
                                    <Heart className={`w-6 h-6 transition-colors ${item.isLiked ? 'text-red-500 fill-red-500' : 'text-gray-600 group-hover:text-red-500'}`} />
                                    <span className="text-xs text-gray-500 font-medium">{item.likes}</span>
                                </button>
                                <button className="flex flex-col items-center gap-1 group">
                                    <MessageCircle className="w-6 h-6 text-gray-600 group-hover:text-blue-500 transition-colors" />
                                    <span className="text-xs text-gray-500 font-medium">{item.comments}</span>
                                </button>
                                <button className="flex flex-col items-center gap-1 group">
                                    <Share2 className="w-6 h-6 text-gray-600 group-hover:text-green-500 transition-colors" />
                                    <span className="text-xs text-gray-500 font-medium">Chia sẻ</span>
                                </button>
                            </div>

                            {item.category === 'TIP' && (
                                <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-bold active:scale-95 transition-transform">
                                    <BookOpen className="w-4 h-4" />
                                    Học ngay
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AgriTokFeed;
