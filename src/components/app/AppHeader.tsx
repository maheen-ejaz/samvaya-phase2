import Image from 'next/image';

export function AppHeader() {
  return (
    <header className="border-b border-gray-200 bg-white px-4 py-3">
      <div className="mx-auto flex max-w-lg items-center justify-center">
        <Image
          src="/samvaya-logo-red.png"
          alt="Samvaya"
          width={120}
          height={32}
          priority
        />
      </div>
    </header>
  );
}
