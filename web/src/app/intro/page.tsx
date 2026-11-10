import Link from "next/link"

export default function IntroPage() {
    return (
        <>
            <h1 className="text-display">배드민턴 올인원 서비스<span className="sr-only"> 간편 로그인 또는 게스트로 시작하기</span></h1>

            <div className="flex flex-col gap-2 mt-4">
                <button className="btn">
                    <span>카카오로 계속하기</span>
                </button>
                <button className="btn">
                    <span>카카오로 계속하기</span>
                </button>
                <button className="btn">
                    <span>카카오로 계속하기</span>
                </button>
                <Link href={"/guest"} className="btn">게스트로 진행하기</Link>
            </div>
        </>
    )
}