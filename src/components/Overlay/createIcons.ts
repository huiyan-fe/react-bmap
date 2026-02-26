const DEFAULT_ICON_URL =
  (typeof window !== 'undefined' && (window as any).Huiyan_Makers_IMG) ||
  '//huiyan.baidu.com/cms/react-bmap/markers_new2x_fbb9e99.png';

export function createIcons(B: any): Record<string, any> {
  const icons: Record<string, any> = {
    simple_red: new B.Icon(DEFAULT_ICON_URL, new B.Size(42 / 2, 66 / 2), {
      imageOffset: new B.Size(-454 / 2, -378 / 2),
      anchor: new B.Size(42 / 2 / 2, 66 / 2),
      imageSize: new B.Size(600 / 2, 600 / 2),
    }),
    simple_blue: new B.Icon(DEFAULT_ICON_URL, new B.Size(42 / 2, 66 / 2), {
      imageOffset: new B.Size(-454 / 2, -450 / 2),
      anchor: new B.Size(42 / 2 / 2, 66 / 2),
      imageSize: new B.Size(600 / 2, 600 / 2),
    }),
    loc_red: new B.Icon(DEFAULT_ICON_URL, new B.Size(46 / 2, 70 / 2), {
      imageOffset: new B.Size(-400 / 2, -378 / 2),
      anchor: new B.Size(46 / 2 / 2, 70 / 2),
      imageSize: new B.Size(600 / 2, 600 / 2),
    }),
    loc_blue: new B.Icon(DEFAULT_ICON_URL, new B.Size(46 / 2, 70 / 2), {
      imageOffset: new B.Size(-400 / 2, -450 / 2),
      anchor: new B.Size(46 / 2 / 2, 70 / 2),
      imageSize: new B.Size(600 / 2, 600 / 2),
    }),
    start: new B.Icon(DEFAULT_ICON_URL, new B.Size(50 / 2, 80 / 2), {
      imageOffset: new B.Size(-400 / 2, -278 / 2),
      anchor: new B.Size(50 / 2 / 2, 80 / 2),
      imageSize: new B.Size(600 / 2, 600 / 2),
    }),
    end: new B.Icon(DEFAULT_ICON_URL, new B.Size(50 / 2, 80 / 2), {
      imageOffset: new B.Size(-450 / 2, -278 / 2),
      anchor: new B.Size(50 / 2 / 2, 80 / 2),
      imageSize: new B.Size(600 / 2, 600 / 2),
    }),
    location: new B.Icon(DEFAULT_ICON_URL, new B.Size(28 / 2, 40 / 2), {
      imageOffset: new B.Size(-248 / 2, -466 / 2),
      anchor: new B.Size(28 / 2 / 2, 40 / 2),
      imageSize: new B.Size(600 / 2, 600 / 2),
    }),
  };

  for (let i = 1; i <= 10; i++) {
    icons['red' + i] = new B.Icon(DEFAULT_ICON_URL, new B.Size(42 / 2, 66 / 2), {
      imageOffset: new B.Size(0 - (42 / 2) * (i - 1), 0),
      anchor: new B.Size(42 / 2 / 2, 66 / 2),
      imageSize: new B.Size(600 / 2, 600 / 2),
    });
  }
  for (let i = 1; i <= 10; i++) {
    icons['blue' + i] = new B.Icon(DEFAULT_ICON_URL, new B.Size(42 / 2, 66 / 2), {
      imageOffset: new B.Size(0 - (42 / 2) * (i - 1), -132 / 2),
      anchor: new B.Size(42 / 2 / 2, 66 / 2),
      imageSize: new B.Size(600 / 2, 600 / 2),
    });
  }

  return icons;
}
