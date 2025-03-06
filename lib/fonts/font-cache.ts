import { Raleway, Roboto } from 'next/font/google';

const roboto = Roboto({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '700'],
  variable: '--font-roboto',
});

const raleway = Raleway({
  subsets: ['latin', 'cyrillic'],
  style: ['normal', 'italic'],
  weight: ['400', '700'],
  variable: '--font-raleway',
});

const Fonts = { roboto, raleway };
export default Fonts;
