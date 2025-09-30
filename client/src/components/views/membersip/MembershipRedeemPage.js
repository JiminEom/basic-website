import React, { useState } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { auth } from '../../../_actions/user_action';

function MembershipRedeemPage() {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('idle');    // 'idle' | 'loading' | 'success' | 'error'
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState(null);    // 'success' | 'error' | null
  const dispatch = useDispatch();

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      setMsg('코드를 입력하세요');
      setMsgType('error');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setMsg('');
    setMsgType(null);

    try {
      const { data } = await axios.post(
        '/api/membership/redeem',
        { code: code.trim().toUpperCase() },
        { withCredentials: true }
      );

      if (data.success) {
        setMsg(`✅ 멤버십 적용 성공! ( ${data.oldRole} → ${data.newRole} )`);
        setMsgType('success');
        setStatus('success');
        setCode('');
        dispatch(auth());
      } else {
        setMsg(`❌ ${data.message || '적용 실패'}`);
        setMsgType('error');
        setStatus('error');
      }
    } catch (err) {
      const apiMsg = err.response?.data?.message;
      setMsg(`❌ ${apiMsg || '네트워크/서버 오류'}`);
      setMsgType('error');
      setStatus('error');
    }
  };

  // 버튼 라벨/비활성
  const btnLabel =
    status === 'loading' ? '적용 중…' :
    status === 'success' ? '적용 완료' :
    '코드 적용';

  const disabled = status === 'loading'; // ← 로딩때만 막기

  return (
    <div style={{ maxWidth: 480, margin: '40px auto', padding: 24, border: '1px solid #e5e7eb', borderRadius: 12 }}>
      <h2 style={{ marginTop: 0 }}>멤버십 코드 적용</h2>

      <form onSubmit={onSubmit}>
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>코드</label>
        <input
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            if (status !== 'loading') { setStatus('idle'); setMsg(''); setMsgType(null); }
          }}
          placeholder="예: TESTMEMBER"
          style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', outline: 'none' }}
        />

        <button
          type="submit"
          disabled={disabled}
          style={{
            marginTop: 12, width: '100%', padding: '10px 12px',
            border: 0, borderRadius: 8, background: '#2563eb',
            color: '#fff', cursor: disabled ? 'not-allowed' : 'pointer'
          }}
        >
          {btnLabel}
        </button>
      </form>

      {msg && (
        <div
          style={{
            marginTop: 12, padding: '10px', borderRadius: 8,
            background: msgType === 'success' ? '#d1fae5' : '#fee2e2',
            color: msgType === 'success' ? '#065f46' : '#991b1b'
          }}
        >
          {msg}
        </div>
      )}
    </div>
  );
}

export default MembershipRedeemPage;
