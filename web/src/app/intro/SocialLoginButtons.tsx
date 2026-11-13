// type SocialLoginButtonsProps = {
  // onKakaoLogin: () => void
  // onGoogleLogin: () => void
  // onAppleLogin: () => void
// }

export default function SocialLoginButtons({
  // onKakaoLogin,
  // onGoogleLogin,
  // onAppleLogin,
}) {
  const buttonClass =
    'relative flex h-[46px] w-full items-center justify-center rounded-lg border text-sm font-semibold ' +
    'transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ' +
    'active:brightness-95'

  return (
    <div className="flex w-full flex-col gap-2">
      <button
        type="button"
        // onClick={onKakaoLogin}
        className={`${buttonClass} border-[#FEE500] bg-[#FEE500] px-4 text-black hover:bg-[#FADA0A]`}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="absolute left-3 size-5 fill-current"
        >
          <path d="M12 3C6.48 3 2 6.45 2 10.7c0 2.74 1.86 5.15 4.66 6.51l-.95 3.54c-.08.3.26.52.5.35l4.2-2.79c.52.06 1.05.09 1.59.09 5.52 0 10-3.45 10-7.7S17.52 3 12 3Z" />
        </svg>
        카카오로 계속하기
      </button>

      <button
        type="button"
        // onClick={onGoogleLogin}
        className={`${buttonClass} border-[#747775] bg-white px-4 text-[#1F1F1F] hover:bg-[#F8FAFC]`}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 256 262"
          className="absolute left-3 size-5 shrink-0"
        >
          <path
            fill="#4285F4"
            d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
          />
          <path
            fill="#34A853"
            d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
          />
          <path
            fill="#FBBC05"
            d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z"
          />
          <path
            fill="#EA4335"
            d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
          />
        </svg>
        Google로 계속하기
      </button>

      <button
        type="button"
        // onClick={onAppleLogin}
        className={`${buttonClass} border-[#767676] bg-white px-4 text-black hover:bg-[#F5F5F7]`}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="absolute left-3 size-5 shrink-0 fill-current"
        >
          <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04c-2.04.027-3.91 1.183-4.961 3.014c-2.117 3.675-.546 9.103 1.519 12.09c1.013 1.454 2.208 3.09 3.792 3.039c1.52-.065 2.09-.987 3.935-.987c1.831 0 2.35.987 3.96.948c1.637-.026 2.676-1.48 3.676-2.948c1.156-1.688 1.636-3.325 1.662-3.415c-.039-.013-3.182-1.221-3.22-4.857c-.026-3.04 2.48-4.494 2.597-4.559c-1.429-2.09-3.623-2.324-4.39-2.376c-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83c-1.207.052-2.662.805-3.532 1.818c-.78.896-1.454 2.338-1.273 3.714c1.338.104 2.715-.688 3.559-1.701" />
        </svg>
        Apple로 계속하기
      </button>
    </div>
  )
}
