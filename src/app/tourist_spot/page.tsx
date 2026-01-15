'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';

export default function TouristSpotPage() {
  const [touristData, setTouristData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('観光地')
        .select('*')
        .order('spot_id', { ascending: true }); // ID順に並べる

      if (!error) {
        setTouristData(data || []);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>読み込み中...</div>;

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '40px 20px', fontFamily: '"Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        <header style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ color: '#0f172a', fontSize: '32px', fontWeight: 'bold', marginBottom: '10px' }}>
            🏞️ 香美市 観光ガイド
          </h1>
          <p style={{ color: '#64748b' }}>香美市の魅力的なスポットをご紹介します</p>
        </header>

        <div style={{ display: 'grid', gap: '25px' }}>
          {touristData.map((spot) => (
            <div key={spot.spot_id} style={{ 
              backgroundColor: 'white', 
              borderRadius: '20px', 
              overflow: 'hidden',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ padding: '30px' }}>
                <h2 style={{ fontSize: '24px', color: '#1e293b', marginBottom: '15px', borderBottom: '2px solid #38bdf8', display: 'inline-block' }}>
                  {spot.name}
                </h2>
                
                <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '20px', whiteSpace: 'pre-wrap' }}>
                  {spot.description}
                </p>

                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                  gap: '15px',
                  backgroundColor: '#f1f5f9',
                  padding: '20px',
                  borderRadius: '12px',
                  fontSize: '14px'
                }}>
                  <div>
                    <span style={{ color: '#64748b', display: 'block' }}>📍 住所</span>
                    <strong>{spot.address || '情報なし'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block' }}>⏰ 営業時間</span>
                    <strong>{spot.business_hours}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block' }}>📅 定休日</span>
                    <strong>{spot.regular_holiday}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block' }}>💰 料金</span>
                    <strong>{spot.fee}</strong>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <footer style={{ textAlign: 'center', marginTop: '50px' }}>
          <Link href="/" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 'bold', fontSize: '18px' }}>
            ← トップページへ戻る
          </Link>
        </footer>
      </div>
    </div>
  );
}