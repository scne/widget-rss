var jsonRSS = {
  type: 'rss 2.0',
  title: 'Example RSS 2.0',
  link: 'http://www.example.org',
  description: 'Example RSS 2.0 -  Test description',
  language: 'en-us',
  pubdate: 'Tue, 10 Jun 2003 04:00:00 GMT',
  lastbuilddate: 'Tue, 10 Jun 2003 09:41:01 GMT',
  docs: 'http://example.com/rss',
  generator: 'Weblog Editor 2.0',
  managingeditor: 'editor@example.com',
  webmaster: 'webmaster@example.com',
  items:  [
    {
      title: 'RSS 2.0 &ndash; Entry 1 title',
      link: 'http://example.com/test.php',
      description: 'Item 1 &ndash; Sample description',
      pubdate: 'Tue, 03 Jun 2003 09:39:21 GMT',
      guid: 'http://example.com/rss2.html#example1',
      author: 'Mr. X1',
      'media:content': {
        url: 'http://image.test1',
        type: 'image/jpeg'
      },
    },
    {
      title: 'RSS 2.0 &ndash; Entry 2 title',
      link: 'http://example.com/test.php',
      description: 'Item 2 &ndash; Sample description',
      pubdate: 'Fri, 30 May 2003 11:06:42 GMT',
      guid: 'http://example.com/rss2.html#example2',
      author: 'Mr. X2',
      'media:content': {
        url: 'http://image.test2',
        type: 'image/jpeg'
      },
    },
    {
      title: 'RSS 2.0 &ndash; Entry 3 title',
      link: 'http://example.com/test.php',
      description: 'Item 3 &ndash; Sample description',
      pubdate: 'Tue, 27 May 2003 08:37:32 GMT',
      guid: 'http://example.com/rss2.html#example3',
      author: 'Mr. X3',
      'media:content': {
        url: 'http://image.test3',
        type: 'image/jpeg'
      },
    },
    {
      title: 'RSS 2.0 &ndash; Entry 4 title',
      link: 'http://example.com/test.php',
      description: 'Item 4 &ndash; Sample description',
      pubdate: 'Tue, 20 May 2003 08:56:02 GMT',
      guid: 'http://example.com/rss2.html#example4',
      author: 'Mr. X4',
      'media:content': {
        url: 'http://image.test4',
        type: 'image/jpeg'
      },
    }
  ]
};
