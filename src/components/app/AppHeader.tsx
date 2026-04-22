import Image from 'next/image';

export function AppHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 py-2 pt-[max(0.5rem,env(safe-area-inset-top))]">
      <div className="mx-auto flex max-w-lg items-center justify-center">
        <Image
          src="/samvaya-logo-red.png"
          alt="Samvaya"
          width={100}
          height={26}
          priority
          className=""
        />
      </div>
    </header>
  );
}
