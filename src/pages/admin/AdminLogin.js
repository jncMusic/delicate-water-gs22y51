import { useState } from "react";
import { AlertCircle, Lock } from "lucide-react";
import { Button, Card, Container, Field, Input, PageHeader } from "../../components/ui";

export default function AdminLogin({ signIn, mode }) {
  const demo = mode === "demo";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await signIn(email.trim(), password);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title="관리자 로그인" breadcrumb={["관리자"]} />
      <Container>
        <Card className="mx-auto max-w-md">
          <div className="mb-6 flex flex-col items-center text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-700">
              <Lock size={22} />
            </span>
            <h2 className="mt-3 font-serif text-lg font-bold text-brand-900">사무국 전용</h2>
            <p className="mt-1 text-sm text-slate-500">
              {demo
                ? "데모 모드입니다. 통과 코드만 입력하면 화면을 둘러볼 수 있습니다."
                : "협회 관리자 계정으로 로그인해 주세요."}
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {!demo && (
              <Field label="이메일" required>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  placeholder="admin@example.or.kr"
                />
              </Field>
            )}
            <Field
              label={demo ? "통과 코드" : "비밀번호"}
              required
              hint={demo ? "기본값은 admin 입니다." : undefined}
            >
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </Field>

            {error && (
              <p className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
                <AlertCircle size={15} className="shrink-0" />
                {error}
              </p>
            )}

            <Button type="submit" disabled={busy} className="w-full">
              {busy ? "확인 중..." : "로그인"}
            </Button>
          </form>
        </Card>
      </Container>
    </>
  );
}
