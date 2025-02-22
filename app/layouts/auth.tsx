import { Outlet } from "react-router";

export default function AuthLayout() {
  return (
    <>
      <div className="absolute inset-0 size-full bg-sky-50">
        {/* Source: https://codepen.io/juliamitchelmore/pen/qBBOLer */}
        {/* Back Waves */}
        <div className="fixed bottom-[50px] left-0 z-10 h-1/2 w-full">
          <div className="absolute bottom-[-100px] left-0 h-[100px] w-full bg-[#ffff42] opacity-40" />
          <svg className="absolute bottom-0 left-0" viewBox="0 24 150 28">
            <defs>
              <path
                id="gentle-wave"
                d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"
              />
            </defs>
            <use
              xlinkHref="#gentle-wave"
              x="48"
              y="5"
              className="animate-lemonwave-1 fill-[#ffff42] opacity-30"
            />
            <use
              xlinkHref="#gentle-wave"
              x="48"
              y="7"
              className="animate-lemonwave-2 fill-[#ffff42] opacity-30"
            />
          </svg>
        </div>

        {/* Lemon */}
        <img
          src="./lemon.webp"
          className="animate-lemonfloat fixed bottom-[50px] left-[10vw] z-20 inline-block w-[200px] origin-bottom"
        />

        {/* Ice */}
        <img
          src="./ice.webp"
          className="animate-icefloat-1 fixed bottom-[50px] left-[40vw] z-20 hidden w-[100px] origin-bottom sm:inline-block"
        />
        <img
          src="./ice.webp"
          className="animate-icefloat-2 fixed bottom-[50px] left-[60vw] z-20 inline-block w-[100px] origin-bottom"
        />
        <img
          src="./ice.webp"
          className="animate-icefloat-3 fixed bottom-[50px] left-[80vw] z-20 hidden w-[100px] origin-bottom sm:inline-block"
        />

        {/* Front Waves */}
        <div className="fixed bottom-[50px] left-0 z-30 h-1/2 w-full">
          <div className="absolute bottom-[-100px] left-0 h-[100px] w-full bg-[#ffff42] opacity-40"></div>
          <svg className="absolute bottom-0 left-0" viewBox="0 24 150 28">
            <defs>
              <path
                id="gentle-wave-front"
                d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"
              />
            </defs>
            <use
              xlinkHref="#gentle-wave-front"
              x="48"
              y="0"
              className="animate-lemonwave-1 dark:dark-mode-wave fill-[#ffff42] opacity-30"
            />
            <use
              xlinkHref="#gentle-wave-front"
              x="48"
              y="3"
              className="animate-lemonwave-4 dark:dark-mode-wave fill-[#ffff42] opacity-30"
            />
          </svg>
        </div>
      </div>
      <div className="absolute inset-0 z-50 size-full items-center justify-center">
        <Outlet />
      </div>
    </>
  );
}
