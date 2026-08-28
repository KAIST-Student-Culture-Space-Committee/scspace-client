import PageTemplete from "@scspace-client/Components/molecules/page/PageTemplete";
import SSOLogin from "@scspace-client/Components/pages/Login";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <PageTemplete
      title="개인정보처리방침"
      subtitle="Privacy Policy"
    >
      <Suspense fallback={null}>
        <SSOLogin />
      </Suspense>
    </PageTemplete>
  );
}
