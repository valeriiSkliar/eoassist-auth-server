// import logo from '@assets/logo/eoassist_logo.png';
// import { getLocale, getTranslations } from 'next-intl/server';
import Link from 'next/link';

// import LocaleSwitcher from '@/components/LocaleSwitcher';
// import AnimatedTelegramIcon from '@/components/ui/svg/AnimatedTelegramIcon';
// import TooltipWrapper from '@/components/ui/tooltip-wrapper';

const AuthAppLayoutComponent =  ({ children }: { children: React.ReactNode }) => {
  // const locale = await getLocale();
  // const t = await getTranslations({
  //   locale,
  //   namespace: 'Main',
  // });

  // const user = await auth();

  return (
    <div className="flex min-h-screen w-full flex-col items-stretch">
      <header
        className="sticky top-0 z-50 flex h-16 items-center justify-end gap-4 border-b bg-background px-4 md:px-6"
        role="banner"
      >
        <nav
          className="w-1/4 flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:items-end lg:gap-6"
          role="navigation"
          aria-label="Main Navigation"
        >
          <Link
            href={'/'}
            className="flex items-center gap-2 text-lg font-semibold md:text-base"
            aria-label="Home"
            tabIndex={0}
          >
            {/* <Image
              width={150}
              height={50}
              src={logo}
              alt="EOAssist Logo"
              className="object-contain"
            /> */}
          </Link>
        </nav>

        <div className="flex w-3/4 items-center justify-end gap-4 md:ml-auto md:gap-2 lg:gap-4">
          <Link
            aria-label="Telegram"
            href="/telegram"
            className="mr-auto hidden gap-3 md:flex"
            tabIndex={0}
          >

          </Link>
          <Link
            aria-label="Oils"
            href="/oils?type=single"
            className="hidden  text-primary underline-offset-4 transition-colors hover:text-foreground hover:underline md:block"
            tabIndex={0}
          >
            {('header.main_link_oils')}
          </Link>
          <Link
            aria-label="Diseases"
            href="/diseases"
            className="hidden text-muted-foreground transition-colors hover:text-foreground md:block"
            tabIndex={0}
          >
            {('header.main_link_diseases')}
          </Link>
        </div>
      </header>

      <main
        className="flex flex-1 items-center justify-center bg-muted/40 p-4 md:gap-8 md:p-10 md:pt-2"
        role="main"
      >
        {children}
      </main>

      {/* <Footer />
  <Toaster /> */}

    </div>
  );
};

export default AuthAppLayoutComponent;
