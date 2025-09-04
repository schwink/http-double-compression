# Double compression in HTTP Content-Encoding

The HTTP [Content-Encoding header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Encoding) allows multiple compression schemes to be used in the same response.

> // Multiple, in the order in which they were applied  
> Content-Encoding: deflate, gzip

I had never encountered this until recently. Does it really work?

[Try it yourself here](https://aws.vpc.schwink.net/http-double-compression/)

| Content-Encoding | Chrome 139.0.7258.155 | Safari 18.6 | Firefox 142.0.1
| :---             | :---                  | :---        | :---
| `br`             | Yes                   | Yes         | Yes
| `gzip`           | Yes                   | Yes         | Yes
| `br, gzip`       | Yes                   | No          | Yes

Unsurprisingly, compressing an already-compressed stream does not tend to further reduce its size.

| Content-Encoding | length
| :---             | ---:
| Uncompressed     | 100,320
| `br`             | 23,932
| `gzip`           | 27,084
| `br, gzip`       | 23,960
