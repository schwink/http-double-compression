
# Double compression in HTTP Content-Encoding

The [Content-Encoding header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Encoding) allows multiple encodings to be specified, like `Content-Encoding: br, gzip`.

I never encountered this until recently. Does it really work? Answer: Partially

| Content-Encodign | Chrome | Safari                   |
| :---             | :---   | :---                     |
| `br`             | Yes    | Yes (HTTPS only)         |
| `gz`             | Yes    | Yes                      |
| `br, gz`         | Yes    | No (`Invalid character`) |
