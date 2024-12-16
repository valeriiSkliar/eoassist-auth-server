import localFont from 'next/font/local';

export const acariSans = localFont({
  src: [
    {
      path: './acari-sans/AcariSans-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: './acari-sans/AcariSans-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-acari',
  display: 'swap',
});

export const nevermind = localFont({
  src: [
    {
      path: './nevermind_contrast/Medium/NeverMindSerifMedium-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: './nevermind_contrast/Medium/NeverMindSerifMedium-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-nevermind',
  display: 'swap',
});
