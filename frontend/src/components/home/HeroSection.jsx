import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function HeroSection() {
  const { user } = useAuth();

  return (
    <div style={{
      background: 'linear-gradient(135deg, var(--color-primary) 0%, #284b63 100%)',
      color: 'white',
      padding: '60px 40px',
      borderRadius: '15px',
      marginBottom: '40px',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '20px', fontWeight: 'bold' }}>Chào mừng đến với AuctionHub</h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '30px', opacity: '0.9' }}>
        Nền tảng đấu giá trực tuyến hàng đầu - Nơi bạn tìm thấy những sản phẩm độc đáo với giá tốt nhất
      </p>
      {!user && <Link to="/signup"><button style={{
        backgroundColor: 'var(--color-accent)',
        color: 'white',
        border: 'none',
        borderRadius: '25px',
        cursor: 'pointer',
        fontSize: '18px',
        padding: '15px 40px',
        fontWeight: '600',
        transition: 'all 0.3s ease'
      }}
        onMouseEnter={(e) => e.target.style.backgroundColor = '#d2694d'}
        onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-accent)'}>Bắt đầu đấu giá ngay</button></Link>}
    </div>
  );
}