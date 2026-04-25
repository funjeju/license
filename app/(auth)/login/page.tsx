'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch {
      setError('이메일 또는 비밀번호를 다시 확인해주세요.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push('/dashboard');
    } catch {
      setError('구글 로그인 중 문제가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-lg border border-neutral-200 p-8">
        <div className="mb-8">
          <h1 className="text-h2 text-neutral-900 mb-1">로그인</h1>
          <p className="text-body text-neutral-500">IP-Assist에 오신 것을 환영합니다.</p>
        </div>

        <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-label text-neutral-700">이메일</label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-label text-neutral-700">비밀번호</label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호 입력"
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="text-caption text-danger">{error}</p>
          )}

          <Button type="submit" disabled={loading} className="w-full bg-royal text-white hover:bg-royal-600">
            {loading ? '로그인 중...' : '로그인'}
          </Button>
        </form>

        <div className="relative my-5">
          <hr className="border-neutral-200" />
          <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-white px-2 text-caption text-neutral-500">또는</span>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full border-neutral-200 text-neutral-700"
        >
          Google로 계속하기
        </Button>

        <p className="text-center text-caption text-neutral-500 mt-6">
          계정이 없으신가요?{' '}
          <Link href="/signup" className="text-royal hover:underline">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}
