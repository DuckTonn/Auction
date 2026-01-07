// Helper function tính % rating
export function calculateRatingRatio(score, count) {
  if (!count || count === 0) return 0;
  const pos = (score + count) / 2;
  return (pos / count * 100).toFixed(1);
}

// Hàm mask tên
export const maskName = (name) => {
  if (!name || typeof name !== 'string') return 'u***r'; 

  // Lọc bỏ phần trong ngoặc () và khoảng trắng thừa
  const cleanName = name.split('(')[0].trim();
  
  if (!cleanName) return 'u***r';

  const chars = Array.from(cleanName);
  const len = chars.length;

  if (len === 1) {
      return `${chars[0]}***${chars[0]}`;
  }

  // CÔNG THỨC EBAY: Ký tự đầu + *** + Ký tự cuối
  const first = chars[0];
  const last = chars[len - 1];
  const middleLength = Math.min(len - 2, 6); 
  const middle = "*".repeat(middleLength);
  
  return `${first}${middle}${last}`;
};

export const avatar = (name, size = 10) => {
  if (!name || typeof name !== 'string') name = '?';
  return (
    <div className="relative">
      <img 
        src={`https://ui-avatars.com/api/?name=${name}&background=random&color=fff`} 
        alt="Avatar" 
        className={`w-${size} h-${size} rounded-full object-cover shadow-sm`}
      />
    </div>
  )
};

export const formatPrice = (price) => !price || isNaN(price) ? '0' : new Intl.NumberFormat('vi-VN').format(price);

export const formatDate = (dateString) => new Date(dateString).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });

export const formatDateTime = (dateString) => {
  try {
    return new Date(dateString).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch {
    return dateString;
  }
};

export const isEndingSoon = (auctionEndTime) => (new Date(auctionEndTime) - new Date()) < (3 * 24 * 60 * 60 * 1000);

export const isAuctionActive = (product) => new Date(product.auction_end_time) > new Date() && product.auction_status === 'active';
