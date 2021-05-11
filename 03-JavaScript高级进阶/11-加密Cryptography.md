# 11-加密 Cryptography

## 一 Web Cryptography API

Web Cryptography API 描述了一套密码学工具，规范了 JavaScript 如何以安全和符合惯例的方式实现加密。这些工具包括生成、使用和应用加密密钥对，加密和解密消息，以及可靠地生成随机数。

## 二 随机数

在需要生成随机值时，很多人会使用 Math.random()。这个方法在浏览器中是以伪随机数生成器（ PRNG， PseudoRandom Number Generator）方式实现的。所谓“伪”指的是生成值的过程不是真的随机。

PRNG 生成的值只是模拟了随机的特性。浏览器的 PRNG 并未使用真正的随机源，只是对一个内部状态应用了固定的算法。每次调用 Math.random()，这个内部状态都会被一个算法修改，而结果会被转换为一个新的随机值。例如， V8 引擎使用了一个名为 xorshift128+的算法来执行这种修改。

由于算法本身是固定的，其输入只是之前的状态，因此随机数顺序也是确定的。 xorshift128+使用 128 位内部状态，而算法的设计让任何初始状态在重复自身之前都会产生 2128–1 个伪随机值。这种循环被称为置换循环（ permutation cycle），而这个循环的长度被称为一个周期（ period）。很明显，如果攻击者知道 PRNG 的内部状态，就可以预测后续生成的伪随机值。如果开发者无意中使用 PRNG 生成了私有密钥用于加密，则攻击者就可以利用 PRNG 的这个特性算出私有密钥。

伪随机数生成器主要用于快速计算出看起来随机的值。不过并不适合用于加密计算。为解决这个问题， 密码学安全伪随机数生成器（ CSPRNG， Cryptographically Secure PseudoRandom Number Generator）额外增加了一个熵作为输入，例如测试硬件时间或其他无法预计行为的系统特性。这样一来，计算速度明显比常规 PRNG 慢很多，但 CSPRNG 生成的值就很难预测，可以用于加密了。

Web Cryptography API 的 CSPRNG 可以通过 crypto.getRandomValues()在全局 Crypto 对象上访问。与 Math.random()返回一个介于 0 和 1 之间的浮点数不同， getRandomValues()会把随机值写入作为参数传给它的定型数组。定型数组的类不重要，因为底层缓冲区会被随机的二进制位填充。

生成 5 个 8 位随机值示例：

```js
const array = new Uint8Array(1)
for (let i = 0; i < 5; ++i) {
    console.log(crypto.getRandomValues(array))
}
// Uint8Array [41]
// Uint8Array [250]
// Uint8Array [51]
// Uint8Array [129]
// Uint8Array [35]
```

要使用 CSPRNG 重新实现 Math.random()，可以通过生成一个随机的 32 位数值，然后用它去除最大的可能值 0xFFFFFFFF。这样就会得到一个介于 0 和 1 之间的值：

```js
function randomFloat() {
    // 生成 32 位随机值
    const fooArray = new Uint32Array(1)
    // 最大值是 2^32 –1
    const maxUint32 = 0xffffffff
    // 用最大可能的值来除
    return crypto.getRandomValues(fooArray)[0] / maxUint32
}
console.log(randomFloat()) // 0.5033651619458955
```

## 三 密码学

### 3.1 生成密码学摘要

计算数据的密码学摘要算法有四种：SHA-1、SHA-2（包括 3 种方式：SHA-256、 SHA-384 和 SHA-512）。

SubtleCrypto.digest()方法用于生成消息摘要：

```js
;(async function () {
    const textEncoder = new TextEncoder()
    const message = textEncoder.encode('foo')
    const messageDigest = await crypto.subtle.digest('SHA-256', message)
    console.log(new Uint32Array(messageDigest))
})()
// Uint32Array(8) [1806968364, 2412183400, 1011194873, 876687389,
// 1882014227, 2696905572, 2287897337, 2934400610]
```

通常，在使用时，二进制的消息摘要会转换为十六进制字符串格式。通过将二进制数据按 8 位进行分割，然后再调用 toString(16)就可以把任何数组缓冲区转换为十六进制字符串：

```js
;(async function () {
    const textEncoder = new TextEncoder()
    const message = textEncoder.encode('foo')
    const messageDigest = await crypto.subtle.digest('SHA-256', message)
    const hexDigest = Array.from(new Uint8Array(messageDigest))
        .map(x => x.toString(16).padStart(2, '0'))
        .join('')
    console.log(hexDigest)
})()
// 2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae
```

### 3.2 CryptoKey 与算法

SubtleCrypto 对象使用 CryptoKey 类的实例来生成密钥。 CryptoKey 类支持多种加密算法，允许控制密钥抽取和使用：

```txt
RSA（ Rivest-Shamir-Adleman）：公钥密码系统，使用两个大素数获得一对公钥和私钥，可用于签名/验证或加密/解密消息。 RSA 的陷门函数被称为分解难题（ factoring problem）。

ECC（ Elliptic-Curve Cryptography）：公钥密码系统，使用一个素数和一个椭圆曲线获得一对公钥和私钥，可用于签名/验证消息。 ECC 的陷门函数被称为椭圆曲线离散对数问题（ elliptic curvediscrete logarithm problem）。 ECC 被认为优于 RSA。虽然 RSA 和 ECC 在密码学意义上都很强，但 ECC 密钥比 RSA 密钥短，而且 ECC 密码学操作比 RSA 操作快。

AES（ Advanced Encryption Standard）：对称密钥密码系统，使用派生自置换组合网络的分组密码加密和解密数据。 AES 在不同模式下使用，不同模式算法的特性也不同。
```

### 3.3 生成 CryptoKey

window.crypto.subtle 对象包含一组方法，用于执行常见的密码学功能，如加密、散列、签名和生成密钥。因为所有密码学操作都在原始二进制数据上执行，所以 SubtleCrypto 的每个方法都要用到 ArrayBuffer 和 ArrayBufferView 类型 。

使用 SubtleCrypto.generateKey()方法可以生成随机 CryptoKey，这个方法返回一个期约，解决为一个或多个 CryptoKey 实例。使用时需要给这个方法传入一个指定目标算法的参数对象、一个表示密钥是否可以从 CryptoKey 对象中提取出来的布尔值，以及一个表示这个密钥可以与哪个 SubtleCrypto 方法一起使用的字符串数组（ keyUsages）。

生成一个对称密钥：

```js
;(async function () {
    const params = {
        name: 'AES-CTR',
        length: 128,
    }
    const keyUsages = ['encrypt', 'decrypt']
    const key = await crypto.subtle.generateKey(params, false, keyUsages)
    console.log(key)
    // CryptoKey {type: "secret", extractable: true, algorithm: {...}, usages: Array(2)}
})()
```

生成一个非对称密钥：

```js
;(async function () {
    const params = {
        name: 'ECDSA',
        namedCurve: 'P-256',
    }
    const keyUsages = ['sign', 'verify']
    const { publicKey, privateKey } = await crypto.subtle.generateKey(params, true, keyUsages)
    console.log(publicKey)
    // CryptoKey {type: "public", extractable: true, algorithm: {...}, usages: Array(1)}
    console.log(privateKey)
    // CryptoKey {type: "private", extractable: true, algorithm: {...}, usages: Array(1)}
})()
```

### 3.4 导出和导入密钥

如果密钥是可提取的，那么就可以在 CryptoKey 对象内部暴露密钥原始的二进制内容。使用 exportKey()方法并指定目标格式（ "raw"、 "pkcs8"、 "spki"或"jwk"）就可以取得密钥。这个方法返回一个期约，解决后的 ArrayBuffer 中包含密钥：

```js
;(async function () {
    const params = {
        name: 'AES-CTR',
        length: 128,
    }
    const keyUsages = ['encrypt', 'decrypt']
    const key = await crypto.subtle.generateKey(params, true, keyUsages)
    const rawKey = await crypto.subtle.exportKey('raw', key)
    console.log(new Uint8Array(rawKey))
    // Uint8Array[93, 122, 66, 135, 144, 182, 119, 196, 234, 73, 84, 7, 139, 43, 238,
    // 110]
})()
```

与 exportKey()相反的操作要使用 importKey()方法实现。 importKey()方法的签名实际上是 generateKey()和 exportKey()的组合。下面的方法会生成密钥、导出密钥，然后再导入密钥：

```js
;(async function () {
    const params = {
        name: 'AES-CTR',
        length: 128,
    }
    const keyUsages = ['encrypt', 'decrypt']
    const keyFormat = 'raw'
    const isExtractable = true
    const key = await crypto.subtle.generateKey(params, isExtractable, keyUsages)
    const rawKey = await crypto.subtle.exportKey(keyFormat, key)
    const importedKey = await crypto.subtle.importKey(keyFormat, rawKey, params.name, isExtractable, keyUsages)
    console.log(importedKey)
    // CryptoKey {type: "secret", extractable: true, algorithm: {...}, usages: Array(2)}
})()
```

### 3.5 从主密钥派生密钥

使用 SubtleCrypto 对象可以通过可配置的属性从已有密钥获得新密钥。 SubtleCrypto 支持一个 deriveKey()方法和一个 deriveBits()方法，前者返回一个解决为 CryptoKey 的期约，后者返回一个解决为 ArrayBuffer 的期约。

deriveBits()方法接收一个算法参数对象、主密钥和输出的位长作为参数。当两个人分别拥有自己的密钥对，但希望获得共享的加密密钥时可以使用这个方法。下面的例子使用 ECDH 算法基于两个密钥对生成了对等密钥，并确保它们派生相同的密钥位：

```js
;(async function () {
    const ellipticCurve = 'P-256'
    const algoIdentifier = 'ECDH'
    const derivedKeySize = 128
    const params = {
        name: algoIdentifier,
        namedCurve: ellipticCurve,
    }
    const keyUsages = ['deriveBits']
    const keyPairA = await crypto.subtle.generateKey(params, true, keyUsages)
    const keyPairB = await crypto.subtle.generateKey(params, true, keyUsages)
    // 从 A 的公钥和 B 的私钥派生密钥位
    const derivedBitsAB = await crypto.subtle.deriveBits(
        Object.assign({ public: keyPairA.publicKey }, params),
        keyPairB.privateKey,
        derivedKeySize
    )
    // 从 B 的公钥和 A 的私钥派生密钥位
    const derivedBitsBA = await crypto.subtle.deriveBits(
        Object.assign({ public: keyPairB.publicKey }, params),
        keyPairA.privateKey,
        derivedKeySize
    )
    const arrayAB = new Uint32Array(derivedBitsAB)
    const arrayBA = new Uint32Array(derivedBitsBA)
    // 确保密钥数组相等
    console.log(arrayAB.length === arrayBA.length && arrayAB.every((val, i) => val === arrayBA[i])) // true
})()
```

deriveKey()方法是类似的，只不过返回的是 CryptoKey 的实例而不是 ArrayBuffer。下面的例子基于一个原始字符串，应用 PBKDF2 算法将其导入一个原始主密钥，然后派生了一个 AES-GCM 格式的新密钥：

```js
;(async function () {
    const password = 'foobar'
    const salt = crypto.getRandomValues(new Uint8Array(16))
    const algoIdentifier = 'PBKDF2'
    const keyFormat = 'raw'
    const isExtractable = false
    const params = { name: algoIdentifier }
    const masterKey = await window.crypto.subtle.importKey(
        keyFormat,
        new TextEncoder().encode(password),
        params,
        isExtractable,
        ['deriveKey']
    )
    const deriveParams = {
        name: 'AES-GCM',
        length: 128,
    }
    const derivedKey = await window.crypto.subtle.deriveKey(
        Object.assign({ salt, iterations: 1e5, hash: 'SHA-256' }, params),
        masterKey,
        deriveParams,
        isExtractable,
        ['encrypt']
    )
    console.log(derivedKey)
    // CryptoKey {type: "secret", extractable: false, algorithm: {...}, usages: Array(1)}
})()
```

### 3.6 使用非对称密钥签名和验证消息

通过 SubtleCrypto 对象可以使用公钥算法用私钥生成签名，或者用公钥验证签名。这两种操作分别通过 SubtleCrypto.sign()和 SubtleCrypto.verify()方法完成。

签名消息需要传入参数对象以指定算法和必要的值、 CryptoKey 和要签名的 ArrayBuffer 或 ArrayBufferView。下面的例子会生成一个椭圆曲线密钥对，并使用私钥签名消息：

```js
;(async function () {
    const keyParams = {
        name: 'ECDSA',
        namedCurve: 'P-256',
    }
    const keyUsages = ['sign', 'verify']
    const { publicKey, privateKey } = await crypto.subtle.generateKey(keyParams, true, keyUsages)
    const message = new TextEncoder().encode('I am Satoshi Nakamoto')
    const signParams = {
        name: 'ECDSA',
        hash: 'SHA-256',
    }
    const signature = await crypto.subtle.sign(signParams, privateKey, message)
    console.log(new Uint32Array(signature))
    // Uint32Array(16) [2202267297, 698413658, 1501924384, 691450316, 778757775, ... ]
})()
```

希望通过这个签名验证消息的人可以使用公钥和 SubtleCrypto.verify()方法。这个方法的签名几乎与 sign()相同，只是必须提供公钥以及签名。下面的例子通过验证生成的签名扩展了前面的例子：

```js
;(async function () {
    const keyParams = {
        name: 'ECDSA',
        namedCurve: 'P-256',
    }
    const keyUsages = ['sign', 'verify']
    const { publicKey, privateKey } = await crypto.subtle.generateKey(keyParams, true, keyUsages)
    const message = new TextEncoder().encode('I am Satoshi Nakamoto')
    const signParams = {
        name: 'ECDSA',
        hash: 'SHA-256',
    }
    const signature = await crypto.subtle.sign(signParams, privateKey, message)
    const verified = await crypto.subtle.verify(signParams, publicKey, signature, message)
    console.log(verified) // true
})()
```

### 3.7 使用对称密钥加密和解密

SubtleCrypto 对象支持使用公钥和对称算法加密和解密消息。这两种操作分别通过 SubtleCrypto.encrypt()和 SubtleCrypto.decrypt()方法完成。

密消息需要传入参数对象以指定算法和必要的值、加密密钥和要加密的数据。下面的例子会生成对称 AES-CBC 密钥，用它加密消息，最后解密消息：

```js
;(async function () {
    const algoIdentifier = 'AES-CBC'
    const keyParams = {
        name: algoIdentifier,
        length: 256,
    }
    const keyUsages = ['encrypt', 'decrypt']
    const key = await crypto.subtle.generateKey(keyParams, true, keyUsages)
    const originalPlaintext = new TextEncoder().encode('I am Satoshi Nakamoto')
    const encryptDecryptParams = {
        name: algoIdentifier,
        iv: crypto.getRandomValues(new Uint8Array(16)),
    }
    const ciphertext = await crypto.subtle.encrypt(encryptDecryptParams, key, originalPlaintext)
    console.log(ciphertext)
    // ArrayBuffer(32) {}
    const decryptedPlaintext = await crypto.subtle.decrypt(encryptDecryptParams, key, ciphertext)
    console.log(new TextDecoder().decode(decryptedPlaintext))
    // I am Satoshi Nakamoto
})()
```

### 3.8 包装和解包密钥

SubtleCrypto 对象支持包装和解包密钥，以便在非信任渠道传输。这两种操作分别通过 SubtleCrypto.wrapKey()和 SubtleCrypto.unwrapKey()方法完成。

包装密钥需要传入一个格式字符串、要包装的 CryptoKey 实例、要执行包装的 CryptoKey，以及一个参数对象用于指定算法和必要的值。下面的例子生成了一个对称 AES-GCM 密钥，用 AES-KW 来包装这个密钥，最后又将包装的密钥解包：

```js
;(async function () {
    const keyFormat = 'raw'
    const extractable = true
    const wrappingKeyAlgoIdentifier = 'AES-KW'
    const wrappingKeyUsages = ['wrapKey', 'unwrapKey']
    const wrappingKeyParams = {
        name: wrappingKeyAlgoIdentifier,
        length: 256,
    }
    const keyAlgoIdentifier = 'AES-GCM'
    const keyUsages = ['encrypt']
    const keyParams = {
        name: keyAlgoIdentifier,
        length: 256,
    }
    const wrappingKey = await crypto.subtle.generateKey(wrappingKeyParams, extractable, wrappingKeyUsages)
    console.log(wrappingKey)
    // CryptoKey {type: "secret", extractable: true, algorithm: {...}, usages: Array(2)}
    const key = await crypto.subtle.generateKey(keyParams, extractable, keyUsages)
    console.log(key)
    // CryptoKey {type: "secret", extractable: true, algorithm: {...}, usages: Array(1)}
    const wrappedKey = await crypto.subtle.wrapKey(keyFormat, key, wrappingKey, wrappingKeyAlgoIdentifier)
    console.log(wrappedKey)
    // ArrayBuffer(40) {}
    const unwrappedKey = await crypto.subtle.unwrapKey(
        keyFormat,
        wrappedKey,
        wrappingKey,
        wrappingKeyParams,
        keyParams,
        extractable,
        keyUsages
    )
    console.log(unwrappedKey)
    // CryptoKey {type: "secret", extractable: true, algorithm: {...}, usages: Array(1)}
})()
```
