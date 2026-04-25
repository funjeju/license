'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  type User,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

async function setSessionCookie(user: User) {
  const token = await user.getIdToken();
  document.cookie = `session=${token}; path=/; max-age=3600; SameSite=Lax`;
}

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(user, { displayName: name });
      await setDoc(doc(db, 'users', user.uid), {
        displayName: name,
        email: user.email,
        createdAt: serverTimestamp(),
        preferences: { defaultLanguage: 'ko', notificationsEnabled: true },
      });
      await setSessionCookie(user);
      router.push('/dashboard');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'code' in err && err.code === 'auth/email-already-in-use') {
        setError('이미 사용 중인 이메일입니다.');
      } else if (err && typeof err === 'object' && 'code' in err && err.code === 'auth/weak-password') {
        setError('비밀번호는 6자 이상이어야 합니다.');
      } else {
        setError('회원가입 중 문제가 발생했습니다. 다시 시도해주세요.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignup() {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(auth, provider);
      await setDoc(doc(db, 'users', user.uid), {
        displayName: user.displayName ?? '',
        email: user.email ?? '',
        photoURL: user.photoURL ?? '',
        createdAt: serverTimestamp(),
        preferences: { defaultLanguage: 'ko', notificationsEnabled: true },
      }, { merge: true });
      await setSessionCookie(user);
      router.push('/dashboard');
    } catch {
      setError('구글 회원가입 중 문제가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-lg border border-neutral-200 p-8">
        <div className="mb-8">
          <h1 className="text-h2 text-neutral-900 mb-1">회원가입</h1>
          <p className="text-body text-neutral-500">AI가 서류를 만들고, 사용자는 권리를 지킵니다.</p>
        </div>

        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-label text-neutral-700">이름</label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="홍길동"
              required
              autoComplete="name"
            />
          </div>

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
              placeholder="6자 이상"
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          {error && (
            <p className="text-caption text-danger">{error}</p>
          )}

          <Button type="submit" disabled={loading} className="w-full bg-royal !text-white hover:bg-royal-600">
            {loading ? '가입 중...' : '가입하기'}
          </Button>
        </form>

        <div className="relative my-5">
          <hr className="border-neutral-200" />
          <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-white px-2 text-caption text-neutral-500">또는</span>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleSignup}
          disabled={loading}
          className="w-full border-neutral-200 text-neutral-700"
        >
          Google로 계속하기
        </Button>

        <p className="text-center text-caption text-neutral-500 mt-6">
          이미 계정이 있으신가요?{' '}
          <Link href="/login" className="text-royal hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
